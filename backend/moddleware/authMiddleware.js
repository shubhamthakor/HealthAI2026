const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { AppError } = require('./errorMiddleware');

// Authenticated session validation
const protect = async (req, res, next) => {
  let token;

  // 1. Read token from HttpOnly cookies or Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route. Token is missing.', 401, 'UNAUTHORIZED'));
  }

  try {
    // 3. Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_key');

    // 4. Retrieve user/admin based on role
    let sessionUser;
    if (decoded.role === 'admin') {
      sessionUser = await Admin.findById(decoded.id).select('-password');
    } else {
      sessionUser = await User.findById(decoded.id).select('-password');
    }

    if (!sessionUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401, 'UNAUTHORIZED'));
    }

    // 5. Expose user information to request
    req.user = sessionUser;
    req.user.role = decoded.role; // Ensure role is explicitly set on user object
    next();
  } catch (error) {
    return next(new AppError('Not authorized. Token is invalid or expired.', 401, 'UNAUTHORIZED'));
  }
};

// Role authorization checks
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`,
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
