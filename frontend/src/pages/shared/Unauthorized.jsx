import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../layouts/Navbar';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="auth-page-wrapper">
        <div className="auth-card unauthorized-card">
          <div className="unauthorized-icon-wrapper">
            <svg className="unauthorized-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="auth-card-title">Access Denied</h1>
          <p className="unauthorized-description">
            You do not have the required permissions to access this page. Please make sure you are logged in with an authorized role.
          </p>
          <button className="btn btn-primary" onClick={handleBack}>
            {user ? 'Go to Dashboard' : 'Go to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
