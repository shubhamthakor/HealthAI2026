const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { AppError } = require('../moddleware/errorMiddleware');

// Helpers for signing tokens
const signAccessToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_access_key',
    { expiresIn: '15m' }
  );
};

const signRefreshToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
    { expiresIn: '7d' }
  );
};

// Helpers for cookie config
const getCookieOptions = (maxAgeMs) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: maxAgeMs
  };
};

// @desc    Register a new patient
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400, 'BAD_REQUEST'));
    }

    // Patients register with patient role
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unified login for patients, doctors, and admins
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400, 'BAD_REQUEST'));
  }

  try {
    let account = null;
    let role = 'patient';

    // 1. Search in User collection
    let user = await User.findOne({ email });
    if (user) {
      account = user;
      role = user.role; // patient or doctor
    } else {
      // 2. Search in Admin collection
      const admin = await Admin.findOne({ email });
      if (admin) {
        account = admin;
        role = 'admin';
      }
    }

    // Check if credentials match
    if (!account || !(await account.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401, 'UNAUTHORIZED'));
    }

    // 3. Generate tokens
    const accessToken = signAccessToken(account._id, role);
    const refreshToken = signRefreshToken(account._id, role);

    // Save refresh token back to db
    account.refreshToken = refreshToken;
    await account.save();

    // 4. Set HttpOnly cookies
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: account._id,
          name: role === 'admin' ? 'Administrator' : account.name,
          email: account.email,
          role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh session and rotate access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token is missing from request.', 401, 'UNAUTHORIZED'));
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key');

    let account;
    if (decoded.role === 'admin') {
      account = await Admin.findById(decoded.id);
    } else {
      account = await User.findById(decoded.id);
    }

    // Verify token matches the database copy (prevent token reuse after compromised)
    if (!account || account.refreshToken !== refreshToken) {
      return next(new AppError('Refresh token is invalid or has been revoked.', 401, 'UNAUTHORIZED'));
    }

    // Generate new tokens
    const newAccessToken = signAccessToken(account._id, decoded.role);
    const newRefreshToken = signRefreshToken(account._id, decoded.role);

    // Rotate refresh token in database
    account.refreshToken = newRefreshToken;
    await account.save();

    // Reset cookies
    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      success: true,
      message: 'Access token refreshed.'
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token.', 401, 'UNAUTHORIZED'));
  }
};

// @desc    Logout user and clear session cookies
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      // Clear refresh token from User or Admin collection
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key');
        if (decoded.role === 'admin') {
          await Admin.findByIdAndUpdate(decoded.id, { refreshToken: null });
        } else {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch (err) {
        // Continue logout even if token verification fails during database cleanup
      }
    }

    // Clear cookies on response
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current session metadata
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.role === 'admin' ? 'Administrator' : req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe
};
