const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const socketService = require('./socketService');
const { AppError } = require('../moddleware/errorMiddleware');

// Helper to convert time HH:MM to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Recalculates waiting times and active positions for a doctor's daily queue,
 * updating the documents in MongoDB.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {Date} date - UTC Midnight normalized date
 * @returns {Promise<object>} Current active queue summary
 */
const getDoctorQueue = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new AppError('Doctor profile not found', 404, 'NOT_FOUND');
  }

  // Find all active appointments (pending, approved, or in-progress) sorted by queueNumber
  const appointments = await Appointment.find({
    doctorId,
    appointmentDate: date,
    status: { $in: ['pending', 'approved', 'in-progress'] }
  })
  .populate('patientId', 'name email')
  .sort({ queueNumber: 1 });

  // Calculate work shift minutes & gaps (lunch break) to estimate wait time
  const morningStart = parseTimeToMinutes(doctor.timings.morningShift.startTime);
  const morningEnd = parseTimeToMinutes(doctor.timings.morningShift.endTime);
  const eveningStart = parseTimeToMinutes(doctor.timings.eveningShift.startTime);
  
  const morningDuration = morningEnd - morningStart;
  const lunchDuration = eveningStart - morningEnd;
  const consultationDuration = doctor.consultationDuration || 15;

  const queueData = [];

  for (let idx = 0; idx < appointments.length; idx++) {
    const appt = appointments[idx];
    
    // Position 1 (the current in-progress or next patient) has 0 minutes accumulated wait.
    // Index i has i patients checkups ahead.
    let waitTime = idx * consultationDuration;
    
    // Add lunch break offset if waiting time crosses the morning shift boundary
    if (waitTime >= morningDuration) {
      waitTime += lunchDuration;
    }

    const oldQueueNumber = appt.queueNumber;
    const newQueueNumber = idx + 1;
    const positionChanged = (oldQueueNumber !== newQueueNumber);

    // If wait time or queue number is different from what was previously stored, update database
    if (appt.estimatedWaitTime !== waitTime || appt.queueNumber !== newQueueNumber) {
      appt.estimatedWaitTime = waitTime;
      appt.queueNumber = newQueueNumber;
      await appt.save();
    }

    if (positionChanged) {
      const patientId = appt.patientId && appt.patientId._id ? appt.patientId._id : appt.patientId;
      if (patientId) {
        socketService.emitQueuePositionChanged(patientId.toString(), {
          appointmentId: appt._id,
          oldPosition: oldQueueNumber,
          newPosition: newQueueNumber,
          estimatedWaitTime: appt.estimatedWaitTime
        });
      }
    }

    queueData.push({
      appointmentId: appt._id,
      patientName: appt.patientId ? appt.patientId.name : 'Anonymous',
      queueNumber: appt.queueNumber,
      position: newQueueNumber,
      estimatedWaitTime: appt.estimatedWaitTime,
      status: appt.status
    });
  }

  return {
    doctorId,
    doctorName: doctor.name,
    date: date.toISOString().split('T')[0],
    activeCount: appointments.length,
    queue: queueData
  };
};

/**
 * Triggers queue recalculation and broadcasts the updated state to the doctor's Socket.IO room.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {Date} date - UTC Midnight normalized date
 */
const updateQueueProgression = async (doctorId, date) => {
  const queueSummary = await getDoctorQueue(doctorId, date);
  socketService.emitQueueUpdated(doctorId, queueSummary);
  return queueSummary;
};

/**
 * Advances the doctor's queue:
 * 1. Finds the current 'in-progress' patient (if any) and completes their status.
 * 2. Marks the next 'approved' or 'pending' patient in line as 'in-progress'.
 * 3. Recalculates and broadcasts the new queue state.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {Date} date - UTC Midnight normalized date
 * @returns {Promise<object>} The new queue state summary
 */
const moveToNext = async (doctorId, date) => {
  // 1. Find the current in-progress appointment to get its ID before completing
  const currentInProg = await Appointment.findOne({ doctorId, appointmentDate: date, status: 'in-progress' });
  if (currentInProg) {
    currentInProg.status = 'completed';
    if (!currentInProg.prescription) {
      currentInProg.prescription = { medicines: [], notes: '' };
    }
    currentInProg.prescription.issuedAt = new Date();
    await currentInProg.save();
    
    // Broadcast targeted socket event
    socketService.emitAppointmentCompleted(doctorId, currentInProg._id, currentInProg.prescription);
  } else {
    // Fallback: complete any stray in-progress records
    await Appointment.updateMany(
      { doctorId, appointmentDate: date, status: 'in-progress' },
      { $set: { status: 'completed', 'prescription.issuedAt': new Date() } }
    );
  }

  // 2. Find the next pending or approved patient in line
  const nextAppt = await Appointment.findOne({
    doctorId,
    appointmentDate: date,
    status: { $in: ['pending', 'approved'] }
  }).sort({ queueNumber: 1 });

  if (nextAppt) {
    nextAppt.status = 'in-progress';
    nextAppt.estimatedWaitTime = 0;
    await nextAppt.save();
    
    // Broadcast targeted socket events
    socketService.emitNextPatient(doctorId, nextAppt._id);
  }

  // 3. Recalculate downstream waiting times and sync clients
  return await updateQueueProgression(doctorId, date);
};

/**
 * Admin emergency position override:
 * Moves an appointment to a specific index, re-sequences queueNumbers, and updates wait times.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {Date} date - UTC Midnight normalized date
 * @param {string} appointmentId - The target appointment ID to reorder
 * @param {number} targetPosition - New 1-based queue position (e.g. 1 to override to front)
 */
const emergencyOverride = async (doctorId, date, appointmentId, targetPosition) => {
  const appointments = await Appointment.find({
    doctorId,
    appointmentDate: date,
    status: { $in: ['pending', 'approved', 'in-progress'] }
  }).sort({ queueNumber: 1 });

  const targetApptIndex = appointments.findIndex(a => a._id.toString() === appointmentId);
  if (targetApptIndex === -1) {
    throw new AppError('Active appointment not found in this queue', 404, 'NOT_FOUND');
  }

  const targetAppt = appointments[targetApptIndex];
  
  // Remove from original index
  appointments.splice(targetApptIndex, 1);
  
  // Insert into new 0-based index (constrained between 0 and queue length)
  const insertIndex = Math.max(0, Math.min(targetPosition - 1, appointments.length));
  appointments.splice(insertIndex, 0, targetAppt);

  // Re-sequence queueNumbers in MongoDB
  for (let idx = 0; idx < appointments.length; idx++) {
    const appt = appointments[idx];
    appt.queueNumber = idx + 1;
    await appt.save();
  }

  // Recalculate estimated wait times and broadcast
  return await updateQueueProgression(doctorId, date);
};

module.exports = {
  getDoctorQueue,
  updateQueueProgression,
  moveToNext,
  emergencyOverride
};
