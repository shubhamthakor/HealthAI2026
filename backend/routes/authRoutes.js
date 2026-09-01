const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../moddleware/authMiddleware');
const { AppError } = require('../moddleware/errorMiddleware');

const router = express.Router();

// Rate limiter specifically for login/registration attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs for login/register (generous for developer/user flow)
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation formatting middleware
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

// Register endpoint
router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one symbol')
  ],
  validate,
  register
);

// Unified login endpoint
router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  login
);

// Token rotation endpoint
router.post('/refresh', refresh);

// Session clearance endpoint
router.post('/logout', logout);

// Session check metadata endpoint
router.get('/me', protect, getMe);

module.exports = router;
