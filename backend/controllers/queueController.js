const Doctor = require('../models/Doctor');
const queueService = require('../services/queueService');
const { AppError } = require('../moddleware/errorMiddleware');

/**
 * Normalizes input date strings into a UTC Midnight Date object.
 */
const getMidnightDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD.', 400, 'BAD_REQUEST');
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * @desc    Get active daily queue details and waiting times for a doctor
 * @route   GET /api/v1/queue/active
 * @access  Private (Patients, Doctors, Admins)
 */
const getActiveQueue = async (req, res, next) => {
  const { doctorId, date } = req.query;

  try {
    if (!doctorId) {
      return next(new AppError('Doctor ID query parameter is required.', 400, 'BAD_REQUEST'));
    }

    const midnightDate = getMidnightDate(date);
    const queueState = await queueService.getDoctorQueue(doctorId, midnightDate);

    res.status(200).json({
      success: true,
      data: queueState
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Advance queue to next patient (closes current checkup, starts next)
 * @route   POST /api/v1/queue/next
 * @access  Private (Doctor only)
 */
const advanceQueue = async (req, res, next) => {
  const { date } = req.body;

  try {
    // 1. Retrieve the doctor profile linked to the logged-in user account
    const doctorProfile = await Doctor.findOne({ email: req.user.email });
    if (!doctorProfile) {
      return next(new AppError('Doctor profile not found for this account.', 404, 'NOT_FOUND'));
    }

    const midnightDate = getMidnightDate(date);
    const updatedQueue = await queueService.moveToNext(doctorProfile._id, midnightDate);

    res.status(200).json({
      success: true,
      message: 'Queue progressed successfully. Next patient is now in-progress.',
      data: updatedQueue
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Emergency override to rearrange queue position (Admin only)
 * @route   PATCH /api/v1/queue/override
 * @access  Private (Admin only)
 */
const adminOverrideQueue = async (req, res, next) => {
  const { doctorId, date, appointmentId, targetPosition } = req.body;

  try {
    if (!doctorId || !appointmentId || targetPosition === undefined) {
      return next(new AppError('doctorId, appointmentId, and targetPosition are required fields.', 400, 'BAD_REQUEST'));
    }

    const positionNumber = Number(targetPosition);
    if (isNaN(positionNumber) || positionNumber < 1) {
      return next(new AppError('targetPosition must be a positive integer greater than or equal to 1.', 400, 'BAD_REQUEST'));
    }

    const midnightDate = getMidnightDate(date);
    const updatedQueue = await queueService.emergencyOverride(doctorId, midnightDate, appointmentId, positionNumber);

    res.status(200).json({
      success: true,
      message: 'Emergency queue override executed successfully.',
      data: updatedQueue
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveQueue,
  advanceQueue,
  adminOverrideQueue
};
