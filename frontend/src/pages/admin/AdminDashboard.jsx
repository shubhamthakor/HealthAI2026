import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

// Import subcomponents
import AdminOverview from '../../components/admin/AdminOverview';
import DoctorManager from '../../components/admin/DoctorManager';
import UserManager from '../../components/admin/UserManager';
import AppointmentMonitor from '../../components/admin/AppointmentMonitor';
import QueueMonitor from '../../components/admin/QueueMonitor';
import AIAnalytics from '../../components/admin/AIAnalytics';
import NotificationMonitor from '../../components/admin/NotificationMonitor';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read active tab from URL queries, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Global registry states
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const fetchSystemData = async () => {
    try {
      // 1. Fetch All Doctors
      const doctorsRes = await api.get('/doctors');
      if (doctorsRes.data && doctorsRes.data.success) {
        setDoctors(doctorsRes.data.data);
      }

      // 2. Fetch All Appointments
      const appointmentsRes = await api.get('/appointments');
      if (appointmentsRes.data && appointmentsRes.data.success) {
        // Map patientName and doctorName defensively
        const mapped = appointmentsRes.data.data.map((app) => ({
          ...app,
          patientName: app.patientId?.name || app.patientName || 'Anonymous',
          doctorName: app.doctorId?.name || app.doctorName || 'Doctor'
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error('Error fetching system administration metadata:', err);
      toast.error('Failed to load system directory logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Loading admin control room...</p>
      </div>
    );
  }

  return (
    <div className="patient-portal-wrapper">
      {/* Left Sidebar Menu Navigation */}
      <aside className="portal-sidebar" style={{ width: '290px' }}>
        <div className="sidebar-brand-meta">
          <span className="user-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>⚙️</span>
          <div>
            <h4>Admin Room</h4>
            <p className="role-sub">HealthAI System Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 System Overview
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Doctors Registry
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Directory
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📝 Audit Bookings
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'queues' ? 'active' : ''}`}
            onClick={() => setActiveTab('queues')}
          >
            ⏳ Active Queues
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 AI Analytics
          </button>
          <button
            className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            ✉️ Dispatch Logs
          </button>
        </nav>

        <div className="sidebar-footer-note">
          <p>🔒 Secure Administrator Node</p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="portal-workspace">
        {/* Render Tab Contents */}
        {activeTab === 'overview' && (
          <AdminOverview
            appointments={appointments}
            doctors={doctors}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorManager
            doctors={doctors}
            onRefresh={fetchSystemData}
          />
        )}

        {activeTab === 'users' && (
          <UserManager
            appointments={appointments}
            doctors={doctors}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentMonitor
            appointments={appointments}
          />
        )}

        {activeTab === 'queues' && (
          <QueueMonitor
            doctors={doctors}
          />
        )}

        {activeTab === 'analytics' && (
          <AIAnalytics
            appointments={appointments}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationMonitor
            appointments={appointments}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
