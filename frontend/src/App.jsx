import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Unauthorized = lazy(() => import('./pages/shared/Unauthorized'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const Landing = lazy(() => import('./pages/shared/Landing'));

// Helper component to redirect root path contextually
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users to their specific dashboard on landing
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="auth-loading-container">
            <div className="auth-loading-spinner"></div>
            <p className="auth-loading-text">Loading secure health portal...</p>
          </div>
        }>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Root Landing page handler */}
            <Route path="/" element={<Landing />} />

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Doctor Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              </Route>
            </Route>

            {/* Patient Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
              </Route>
            </Route>

            {/* Fallback to root redirect for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      {/* Toast Alert Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.92rem',
            borderRadius: '10px',
            background: '#334155',
            color: '#fff',
            padding: '12px 18px',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
