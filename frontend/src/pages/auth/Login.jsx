import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

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
    // Client-side email validation check
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      validateEmail(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      toast.error('Please correct the email format.');
      return;
    }

    if (!password) {
      toast.error('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.data.user.name}!`);

      // Role-based redirects
      const role = data.data.user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h1 className="auth-card-title">Portal Login</h1>
        <p className="auth-card-subtitle">
          Sign in to manage your appointments, queues, or diagnostics.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              className={`form-input ${emailError ? 'input-error' : ''}`}
              id="login-email"
              type="email"
              placeholder="e.g. arjun.patel@gmail.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              disabled={isSubmitting}
              required
            />
            {emailError && <span className="validation-error-msg">{emailError}</span>}
          </div>

          {/* Password input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                className="form-input"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Submit button */}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Need a patient account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
