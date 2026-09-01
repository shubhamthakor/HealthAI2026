const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const DoctorLeave = require('../models/DoctorLeave');
const User = require('../models/User');
const queueService = require('./queueService');
const { sendAppointmentStatusEmail } = require('./emailService');

// Helper to convert time HH:MM to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Searches for doctors based on specialization, city, or name.
 */
const searchDoctors = async ({ specialization, city, doctorName }) => {
  const query = {};
  if (specialization) {
    query.specialization = new RegExp('^' + specialization.trim() + '$', 'i');
  }
  if (city) {
    query.city = new RegExp('^' + city.trim() + '$', 'i');
  }
  if (doctorName) {
    query.name = new RegExp(doctorName.trim(), 'i');
  }
  return await Doctor.find(query);
};

/**
 * Checks if a doctor is on leave on a given date.
 */
const checkDoctorLeave = async (doctorId, dateObj) => {
  const checkDate = new Date(dateObj);
  checkDate.setUTCHours(0, 0, 0, 0);
  return await DoctorLeave.findOne({ doctorId, leaveDate: checkDate });
};

/**
 * Books an appointment for a patient using the exact backend business rules.
 */
const bookAppointment = async (patientId, { doctorId, appointmentDate, disease }) => {
  const bookingDate = new Date(appointmentDate);
  if (isNaN(bookingDate.getTime())) {
    throw new Error('Invalid appointment date format.');
  }
  bookingDate.setUTCHours(0, 0, 0, 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (bookingDate < today) {
    throw new Error('Cannot book appointments on past dates.');
  }

  // 1. Fetch Doctor Profile
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor profile not found.');
  }

  // 2. Check availability
  const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  if (!doctor.availability.includes(dayOfWeek)) {
    throw new Error(`Doctor is not available on ${dayOfWeek}s.`);
  }

  // 3. Check leave
  const leave = await checkDoctorLeave(doctorId, bookingDate);
  if (leave) {
    throw new Error('Doctor is unavailable on this date due to scheduled leave.');
  }

  // 4. Check duplicate patient bookings
  const duplicate = await Appointment.findOne({
    patientId,
    doctorId,
    status: { $in: ['pending', 'approved', 'in-progress'] }
  });
  if (duplicate) {
    throw new Error('You already have an active appointment booked with this doctor.');
  }

  // 5. Calculate queue position
  const existingAppointmentsCount = await Appointment.countDocuments({
    doctorId,
    appointmentDate: bookingDate,
    status: { $in: ['pending', 'approved'] }
  });
  const queueNumber = existingAppointmentsCount + 1;

  // 6. Calculate Shift Limits & Work Duration
  const morningStart = parseTimeToMinutes(doctor.timings.morningShift.startTime);
  const morningEnd = parseTimeToMinutes(doctor.timings.morningShift.endTime);
  const eveningStart = parseTimeToMinutes(doctor.timings.eveningShift.startTime);
  const eveningEnd = parseTimeToMinutes(doctor.timings.eveningShift.endTime);

  const morningDuration = morningEnd - morningStart;
  const eveningDuration = eveningEnd - eveningStart;
  const totalWorkMinutes = morningDuration + eveningDuration;

  const requiredMinutes = queueNumber * doctor.consultationDuration;
  if (requiredMinutes > totalWorkMinutes) {
    throw new Error('Doctor scheduling queue is full for this date. Please try another day.');
  }

  // 7. Calculate Wait Time
  let estimatedWaitTime = (queueNumber - 1) * doctor.consultationDuration;
  if (estimatedWaitTime >= morningDuration) {
    const lunchDuration = eveningStart - morningEnd;
    estimatedWaitTime += lunchDuration;
  }

  // 8. Create Appointment
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    disease,
    queueNumber,
    estimatedWaitTime,
    appointmentDate: bookingDate,
    status: 'pending'
  });

  // 9. Recalculate downstream and broadcast
  await queueService.updateQueueProgression(doctorId, bookingDate);

  return appointment;
};

/**
 * Patient cancels their appointment.
 */
const cancelAppointment = async (patientId, appointmentId) => {
  let query = { patientId };
  if (!appointmentId || appointmentId === 'latest') {
    // Cancel the most recent pending/approved appointment
    const latest = await Appointment.findOne({
      patientId,
      status: { $in: ['pending', 'approved'] }
    }).sort({ createdAt: -1 });

    if (!latest) {
      throw new Error('No active cancelable appointment found.');
    }
    query._id = latest._id;
  } else {
    query._id = appointmentId;
  }

  const appointment = await Appointment.findOne(query);
  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  if (appointment.status !== 'pending' && appointment.status !== 'approved') {
    throw new Error('Only pending or approved appointments can be cancelled.');
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = 'Cancelled by Patient via AI Assistant';
  await appointment.save();

  // Recalculate wait times
  const doctor = await Doctor.findById(appointment.doctorId);
  if (doctor) {
    await queueService.updateQueueProgression(appointment.doctorId, appointment.appointmentDate);
  }

  // Notify patient via email
  const patientUser = await User.findById(patientId);
  if (patientUser && doctor) {
    try {
      await sendAppointmentStatusEmail(
        patientUser.email,
        patientUser.name,
        doctor.name,
        'cancelled',
        {
          date: appointment.appointmentDate,
          queueNumber: appointment.queueNumber,
          waitTime: appointment.estimatedWaitTime,
          reason: appointment.cancellationReason
        }
      );
    } catch (e) {
      console.error('Failed to send status email:', e.message);
    }
  }

  return appointment;
};

/**
 * Fetches the active queue status for a patient.
 */
const fetchQueueStatus = async (patientId) => {
  const activeAppointments = await Appointment.find({
    patientId,
    status: { $in: ['pending', 'approved', 'in-progress'] }
  })
  .populate('doctorId', 'name specialization hospital city')
  .sort({ appointmentDate: 1, queueNumber: 1 });

  const queueSummaries = [];

  for (const appt of activeAppointments) {
    // Count how many active appointments are ahead of this one
    const aheadCount = await Appointment.countDocuments({
      doctorId: appt.doctorId._id,
      appointmentDate: appt.appointmentDate,
      status: { $in: ['pending', 'approved', 'in-progress'] },
      queueNumber: { $lt: appt.queueNumber }
    });

    const totalActiveInQueue = await Appointment.countDocuments({
      doctorId: appt.doctorId._id,
      appointmentDate: appt.appointmentDate,
      status: { $in: ['pending', 'approved', 'in-progress'] }
    });

    queueSummaries.push({
      appointmentId: appt._id,
      doctorName: appt.doctorId.name,
      specialization: appt.doctorId.specialization,
      hospital: appt.doctorId.hospital,
      city: appt.doctorId.city,
      disease: appt.disease,
      queueNumber: appt.queueNumber,
      estimatedWaitTime: appt.estimatedWaitTime,
      status: appt.status,
      appointmentDate: appt.appointmentDate,
      position: aheadCount + 1,
      totalQueueLength: totalActiveInQueue
    });
  }

  return queueSummaries;
};

/**
 * Fetches appointment history.
 */
const fetchAppointments = async (patientId) => {
  return await Appointment.find({ patientId })
    .populate('doctorId', 'name specialization hospital city')
    .sort({ appointmentDate: -1, queueNumber: -1 });
};

module.exports = {
  searchDoctors,
  checkDoctorLeave,
  bookAppointment,
  cancelAppointment,
  fetchQueueStatus,
  fetchAppointments
};
