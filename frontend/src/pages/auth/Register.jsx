import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const role = user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Verifying secure session...</p>
      </div>
    );
  }

  const validateName = (val) => {
    if (!val || val.trim() === '') {
      setNameError('Full name is required.');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (val) => {
    if (!val) {
      setEmailError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val) => {
    if (!val) {
      setPasswordError('Password is required.');
      return false;
    }
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(val)) {
      setPasswordError('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
      setPasswordError('Password must contain at least one symbol (!@#$%^&* etc).');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val, passVal) => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password.');
      return false;
    }
    if (val !== passVal) {
      setConfirmPasswordError('Passwords do not match.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword, password);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      toast.error('Please resolve all validation errors.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h1 className="auth-card-title">Create Account</h1>
        <p className="auth-card-subtitle">
          Register a secure patient profile to access medical services.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name input */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              className={`form-input ${nameError ? 'input-error' : ''}`}
              id="register-name"
              type="text"
              placeholder="e.g. Arjun Patel"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) validateName(e.target.value); }}
              onBlur={() => validateName(name)}
              disabled={isSubmitting}
              required
            />
            {nameError && <span className="validation-error-msg">{nameError}</span>}
          </div>

          {/* Email input */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              className={`form-input ${emailError ? 'input-error' : ''}`}
              id="register-email"
              type="email"
              placeholder="e.g. arjun.patel@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={() => validateEmail(email)}
              disabled={isSubmitting}
              required
            />
            {emailError && <span className="validation-error-msg">{emailError}</span>}
          </div>

          {/* Password input */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <input
                className={`form-input ${passwordError ? 'input-error' : ''}`}
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose secure password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) validatePassword(e.target.value); }}
                onBlur={() => validatePassword(password)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError ? (
              <span className="validation-error-msg">{passwordError}</span>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Must be at least 8 characters, contain an uppercase letter and a symbol.
              </span>
            )}
          </div>

          {/* Confirm Password input */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <input
              className={`form-input ${confirmPasswordError ? 'input-error' : ''}`}
              id="register-confirm"
              type="password"
              placeholder="Confirm secure password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (confirmPasswordError) validateConfirmPassword(e.target.value, password); }}
              onBlur={() => validateConfirmPassword(confirmPassword, password)}
              disabled={isSubmitting}
              required
            />
            {confirmPasswordError && <span className="validation-error-msg">{confirmPasswordError}</span>}
          </div>

          {/* Submit button */}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
