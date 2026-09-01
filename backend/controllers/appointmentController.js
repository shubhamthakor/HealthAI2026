const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const DoctorLeave = require('../models/DoctorLeave');
const User = require('../models/User');
const { AppError } = require('../moddleware/errorMiddleware');
const { sendAppointmentStatusEmail } = require('../services/emailService');
const queueService = require('../services/queueService');
const socketService = require('../services/socketService');

// Helper to convert time HH:MM to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// @desc    Book a dynamic queue-based appointment
// @route   POST /api/v1/appointments/book
// @access  Private (Patient only)
const bookAppointment = async (req, res, next) => {
  const { doctorId, appointmentDate, disease } = req.body;
  const patientId = req.user._id;

  try {
    // 1. Confirm date validity
    const bookingDate = new Date(appointmentDate);
    if (isNaN(bookingDate.getTime())) {
      return next(new AppError('Invalid appointment date format.', 400, 'BAD_REQUEST'));
    }

    // Set to UTC Midnight for exact date matching
    bookingDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return next(new AppError('Cannot book appointments on past dates.', 400, 'BAD_REQUEST'));
    }

    // 2. Fetch Doctor Profile
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new AppError('Doctor not found.', 404, 'NOT_FOUND'));
    }

    // 3. Check weekly availability (e.g. is doctor active on Monday)
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    if (!doctor.availability.includes(dayOfWeek)) {
      return next(new AppError(`Doctor is not available on ${dayOfWeek}s.`, 400, 'DOCTOR_UNAVAILABLE'));
    }

    // 4. Check if Doctor is on scheduled leave on this date
    const leaveExists = await DoctorLeave.findOne({ doctorId, leaveDate: bookingDate });
    if (leaveExists) {
      return next(new AppError('Doctor is unavailable on this date due to scheduled leave.', 400, 'DOCTOR_UNAVAILABLE'));
    }

    // 5. Check duplicate patient bookings for this doctor (no more than one active appointment)
    const duplicate = await Appointment.findOne({
      patientId,
      doctorId,
      status: { $in: ['pending', 'approved', 'in-progress'] }
    });
    if (duplicate) {
      return next(new AppError('You already have an active appointment booked with this doctor.', 400, 'BAD_REQUEST'));
    }

    // 6. Calculate Queue Position
    const existingAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate: bookingDate,
      status: { $in: ['pending', 'approved'] }
    });

    const queueNumber = existingAppointmentsCount + 1;

    // 7. Calculate Shift Limits & Work Duration
    const morningStart = parseTimeToMinutes(doctor.timings.morningShift.startTime);
    const morningEnd = parseTimeToMinutes(doctor.timings.morningShift.endTime);
    const lunchStart = parseTimeToMinutes(doctor.timings.lunchBreak.startTime);
    const lunchEnd = parseTimeToMinutes(doctor.timings.lunchBreak.endTime);
    const eveningStart = parseTimeToMinutes(doctor.timings.eveningShift.startTime);
    const eveningEnd = parseTimeToMinutes(doctor.timings.eveningShift.endTime);

    const morningDuration = morningEnd - morningStart;
    const eveningDuration = eveningEnd - eveningStart;
    const totalWorkMinutes = morningDuration + eveningDuration;

    // Check if queue size exceeds doctor's work shift capacity
    const requiredMinutes = queueNumber * doctor.consultationDuration;
    if (requiredMinutes > totalWorkMinutes) {
      return next(new AppError('Doctor scheduling queue is full for this date. Please try another day.', 400, 'QUEUE_FULL'));
    }

    // 8. Calculate Estimated Wait Time in minutes (incorporating the lunch break gap)
    let estimatedWaitTime = (queueNumber - 1) * doctor.consultationDuration;
    if (estimatedWaitTime >= morningDuration) {
      const lunchDuration = eveningStart - morningEnd;
      estimatedWaitTime += lunchDuration;
    }

    // 9. Store Appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      disease,
      queueNumber,
      estimatedWaitTime,
      appointmentDate: bookingDate,
      status: 'pending'
    });

    // Recalculate downstream and broadcast realtime updates
    await queueService.updateQueueProgression(doctorId, bookingDate);

    res.status(201).json({
      success: true,
      message: 'Appointment created. Queue details assigned.',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Retrieve list of appointments based on role context (patient, doctor, admin)
// @route   GET /api/v1/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Find Doctor profile linking to this User account email
      const doctorProfile = await Doctor.findOne({ email: req.user.email });
      if (!doctorProfile) {
        return next(new AppError('Doctor profile not found for this user.', 404, 'NOT_FOUND'));
      }
      query.doctorId = doctorProfile._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization hospital city')
      .sort({ appointmentDate: 1, queueNumber: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed doctor scheduling and availability
// @route   GET /api/v1/appointments/availability
// @access  Private
const getDoctorAvailability = async (req, res, next) => {
  const { doctorId } = req.query;

  try {
    if (!doctorId) {
      return next(new AppError('Doctor ID is required as query parameter.', 400, 'BAD_REQUEST'));
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new AppError('Doctor not found.', 404, 'NOT_FOUND'));
    }

    // Fetch scheduled leaves from today onwards
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const leaves = await DoctorLeave.find({
      doctorId,
      leaveDate: { $gte: today }
    }).select('leaveDate leaveReason');

    res.status(200).json({
      success: true,
      data: {
        timings: doctor.timings,
        consultationDuration: doctor.consultationDuration,
        availability: doctor.availability,
        leaves: leaves.map(l => ({
          date: l.leaveDate,
          reason: l.leaveReason
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status (Doctor action: approve, reject, cancel)
// @route   PATCH /api/v1/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;

  const validStatuses = ['approved', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status update. Allowed: ${validStatuses.join(', ')}`, 400, 'BAD_REQUEST'));
  }

  try {
    // Find doctor profile
    const doctorProfile = await Doctor.findOne({ email: req.user.email });
    if (!doctorProfile) {
      return next(new AppError('Doctor profile not found.', 404, 'NOT_FOUND'));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError(`Appointment with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    // Verify ownership
    if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return next(new AppError('Access forbidden. You are not assigned to this appointment.', 403, 'FORBIDDEN'));
    }

    // Update status
    appointment.status = status;
    if (status === 'rejected' || status === 'cancelled') {
      appointment.cancellationReason = cancellationReason || 'Cancelled by Doctor';
    }
    await appointment.save();

    // Recalculate downstream and broadcast realtime updates
    await queueService.updateQueueProgression(appointment.doctorId, appointment.appointmentDate);

    // Fetch patient info for email notification
    const patientUser = await User.findById(appointment.patientId);
    if (patientUser) {
      await sendAppointmentStatusEmail(
        patientUser.email,
        patientUser.name,
        doctorProfile.name,
        status,
        {
          date: appointment.appointmentDate,
          queueNumber: appointment.queueNumber,
          waitTime: appointment.estimatedWaitTime,
          reason: appointment.cancellationReason
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete consultation, prescribe medicines and upload notes
// @route   POST /api/v1/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = async (req, res, next) => {
  const { id } = req.params;
  const { medicines, notes } = req.body;

  try {
    // Find doctor profile
    const doctorProfile = await Doctor.findOne({ email: req.user.email });
    if (!doctorProfile) {
      return next(new AppError('Doctor profile not found.', 404, 'NOT_FOUND'));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError(`Appointment with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    // Verify ownership
    if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return next(new AppError('Access forbidden. You are not assigned to this appointment.', 403, 'FORBIDDEN'));
    }

    appointment.status = 'completed';
    appointment.prescription = {
      medicines: medicines || [],
      notes: notes || '',
      issuedAt: new Date()
    };

    await appointment.save();

    // Recalculate downstream and broadcast realtime updates
    await queueService.updateQueueProgression(appointment.doctorId, appointment.appointmentDate);
    socketService.emitAppointmentCompleted(appointment.doctorId, appointment._id, appointment.prescription);

    // Send completed email summary
    const patientUser = await User.findById(appointment.patientId);
    if (patientUser) {
      await sendAppointmentStatusEmail(
        patientUser.email,
        patientUser.name,
        doctorProfile.name,
        'completed',
        {
          date: appointment.appointmentDate,
          prescriptionNotes: notes
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Prescription issued. Appointment completed successfully.',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Doctor submits a leave date (Auto-cancels affected bookings and notifies patients)
// @route   POST /api/v1/appointments/leave
// @access  Private (Doctor only)
const submitLeave = async (req, res, next) => {
  const { leaveDate, leaveReason } = req.body;

  try {
    // 1. Confirm date validity
    const date = new Date(leaveDate);
    if (isNaN(date.getTime())) {
      return next(new AppError('Invalid leave date format.', 400, 'BAD_REQUEST'));
    }

    // Set to UTC Midnight for exact matching
    date.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) {
      return next(new AppError('Cannot schedule leave on past dates.', 400, 'BAD_REQUEST'));
    }

    // 2. Fetch Doctor profile
    const doctorProfile = await Doctor.findOne({ email: req.user.email });
    if (!doctorProfile) {
      return next(new AppError('Doctor profile not found.', 404, 'NOT_FOUND'));
    }

    // Check if leave already scheduled
    const existingLeave = await DoctorLeave.findOne({ doctorId: doctorProfile._id, leaveDate: date });
    if (existingLeave) {
      return next(new AppError('Leave is already registered for this date.', 400, 'BAD_REQUEST'));
    }

    // 3. Store leave log
    await DoctorLeave.create({
      doctorId: doctorProfile._id,
      leaveDate: date,
      leaveReason
    });

    // 4. Auto-cancel all appointments booked for that doctor on that date
    const affectedAppointments = await Appointment.find({
      doctorId: doctorProfile._id,
      appointmentDate: date,
      status: { $in: ['pending', 'approved'] }
    });

    const cancellationReason = `Doctor unavailable on leave: ${leaveReason}`;

    for (const appt of affectedAppointments) {
      appt.status = 'cancelled';
      appt.cancellationReason = cancellationReason;
      await appt.save();

      // Notify patient via email
      const patientUser = await User.findById(appt.patientId);
      if (patientUser) {
        await sendAppointmentStatusEmail(
          patientUser.email,
          patientUser.name,
          doctorProfile.name,
          'cancelled',
          {
            date: date,
            reason: cancellationReason
          }
        );
      }
    }

    // Recalculate downstream and broadcast realtime updates
    await queueService.updateQueueProgression(doctorProfile._id, date);

    res.status(200).json({
      success: true,
      message: `Leave logged successfully. Cancelled ${affectedAppointments.length} pending appointment(s).`,
      count: affectedAppointments.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Patient cancels their own booked appointment
// @route   PATCH /api/v1/appointments/:id/cancel
// @access  Private (Patient only)
const cancelAppointmentByPatient = async (req, res, next) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError(`Appointment with ID ${id} not found.`, 404, 'NOT_FOUND'));
    }

    // Verify ownership
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access forbidden. You do not own this appointment.', 403, 'FORBIDDEN'));
    }

    // Ensure status is either pending or approved
    if (appointment.status !== 'pending' && appointment.status !== 'approved') {
      return next(new AppError('Only pending or approved appointments can be cancelled.', 400, 'BAD_REQUEST'));
    }

    // Update status
    appointment.status = 'cancelled';
    appointment.cancellationReason = 'Cancelled by Patient';
    await appointment.save();

    // Fetch doctor profile for name and to update queue
    const doctorProfile = await Doctor.findById(appointment.doctorId);
    if (doctorProfile) {
      // Recalculate downstream and broadcast realtime updates
      await queueService.updateQueueProgression(appointment.doctorId, appointment.appointmentDate);
    }

    // Fetch patient info for email notification
    const patientUser = await User.findById(appointment.patientId);
    if (patientUser && doctorProfile) {
      await sendAppointmentStatusEmail(
        patientUser.email,
        patientUser.name,
        doctorProfile.name,
        'cancelled',
        {
          date: appointment.appointmentDate,
          queueNumber: appointment.queueNumber,
          waitTime: appointment.estimatedWaitTime,
          reason: appointment.cancellationReason
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getDoctorAvailability,
  updateAppointmentStatus,
  completeAppointment,
  submitLeave,
  cancelAppointmentByPatient
};
