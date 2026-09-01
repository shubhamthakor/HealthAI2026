const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  bookAppointment,
  getAppointments,
  getDoctorAvailability,
  updateAppointmentStatus,
  completeAppointment,
  submitLeave,
  cancelAppointmentByPatient
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../moddleware/authMiddleware');
const { AppError } = require('../moddleware/errorMiddleware');

const router = express.Router();

// Validation checker middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path,
      issue: err.msg
    }));
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
  }
  next();
};

// 1. Unified Listing (Patient views own, Doctor views assigned, Admin views all)
router.get('/', protect, getAppointments);

// 2. Fetch Doctor Availability (Protected)
router.get(
  '/availability',
  [
    protect,
    query('doctorId')
      .isMongoId()
      .withMessage('Valid Doctor ID is required in query parameter')
  ],
  validate,
  getDoctorAvailability
);

// 3. Book an Appointment (Patient Only)
router.post(
  '/book',
  [
    protect,
    authorizeRoles('patient'),
    body('doctorId')
      .isMongoId()
      .withMessage('Valid Doctor ID is required'),
    body('appointmentDate')
      .isISO8601()
      .toDate()
      .withMessage('Appointment date must be a valid ISO8601 date (YYYY-MM-DD)'),
    body('disease')
      .trim()
      .notEmpty()
      .withMessage('Predicted disease key is required')
  ],
  validate,
  bookAppointment
);

// 4. Update Status (Doctor Only: approve, reject, cancel)
router.patch(
  '/:id/status',
  [
    protect,
    authorizeRoles('doctor'),
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID format'),
    body('status')
      .isIn(['approved', 'rejected', 'cancelled'])
      .withMessage('Status must be either approved, rejected, or cancelled'),
    body('cancellationReason')
      .optional()
      .trim()
      .isString()
      .withMessage('Cancellation reason must be a string')
  ],
  validate,
  updateAppointmentStatus
);

// Cancel Appointment (Patient Only)
router.patch(
  '/:id/cancel',
  [
    protect,
    authorizeRoles('patient'),
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID format')
  ],
  validate,
  cancelAppointmentByPatient
);

// 5. Complete Appointment (Doctor Only)
router.post(
  '/:id/complete',
  [
    protect,
    authorizeRoles('doctor'),
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID format'),
    body('medicines')
      .optional()
      .isArray()
      .withMessage('Medicines must be an array'),
    body('medicines.*.name')
      .notEmpty()
      .withMessage('Medicine name is required'),
    body('medicines.*.dosage')
      .notEmpty()
      .withMessage('Medicine dosage is required'),
    body('medicines.*.duration')
      .notEmpty()
      .withMessage('Medicine duration is required'),
    body('notes')
      .optional()
      .trim()
      .isString()
      .withMessage('Notes must be a string')
  ],
  validate,
  completeAppointment
);

// 6. Submit Doctor Leave (Doctor Only)
router.post(
  '/leave',
  [
    protect,
    authorizeRoles('doctor'),
    body('leaveDate')
      .isISO8601()
      .toDate()
      .withMessage('Leave date must be a valid ISO8601 date (YYYY-MM-DD)'),
    body('leaveReason')
      .trim()
      .notEmpty()
      .withMessage('Leave reason is required')
  ],
  validate,
  submitLeave
);

module.exports = router;
