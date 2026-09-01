const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  updateSelfDuration
} = require('../controllers/doctorController');
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

// Validates 24-hour time format HH:MM
const isTimeFormat = (value) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (value && !regex.test(value)) {
    throw new Error('Must be in valid HH:MM 24-hour format');
  }
  return true;
};

// 1. Get all doctors (Protected)
router.get('/', protect, getDoctors);

// 2. Get single doctor (Protected)
router.get(
  '/:id',
  [
    protect,
    param('id').isMongoId().withMessage('Invalid Doctor ID format')
  ],
  validate,
  getDoctorById
);

// 3. Create a Doctor (Admin Only)
router.post(
  '/',
  [
    protect,
    authorizeRoles('admin'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one symbol'),
    body('specialization')
      .trim()
      .notEmpty()
      .withMessage('Specialization is required'),
    body('city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('hospital')
      .trim()
      .notEmpty()
      .withMessage('Hospital is required'),
    body('consultationDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Consultation duration must be a positive integer'),
    body('availability')
      .optional()
      .isArray()
      .withMessage('Availability must be an array of day strings'),
    body('timings.morningShift.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.morningShift.endTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.lunchBreak.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.lunchBreak.endTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.eveningShift.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.eveningShift.endTime')
      .optional()
      .custom(isTimeFormat)
  ],
  validate,
  createDoctor
);

// Update own consultation duration (Doctor only)
router.patch(
  '/self/duration',
  [
    protect,
    authorizeRoles('doctor'),
    body('consultationDuration')
      .isInt({ min: 1 })
      .withMessage('Consultation duration must be a positive integer')
  ],
  validate,
  updateSelfDuration
);

// 4. Update Doctor profile (Admin Only)
router.patch(
  '/:id',
  [
    protect,
    authorizeRoles('admin'),
    param('id')
      .isMongoId()
      .withMessage('Invalid Doctor ID format'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Valid email address is required'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one symbol'),
    body('specialization')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Specialization cannot be empty'),
    body('city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City cannot be empty'),
    body('hospital')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Hospital cannot be empty'),
    body('consultationDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Consultation duration must be a positive integer'),
    body('availability')
      .optional()
      .isArray()
      .withMessage('Availability must be an array of day strings'),
    body('timings.morningShift.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.morningShift.endTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.lunchBreak.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.lunchBreak.endTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.eveningShift.startTime')
      .optional()
      .custom(isTimeFormat),
    body('timings.eveningShift.endTime')
      .optional()
      .custom(isTimeFormat)
  ],
  validate,
  updateDoctor
);

// 5. Delete Doctor profile (Admin Only)
router.delete(
  '/:id',
  [
    protect,
    authorizeRoles('admin'),
    param('id')
      .isMongoId()
      .withMessage('Invalid Doctor ID format')
  ],
  validate,
  deleteDoctor
);

module.exports = router;
