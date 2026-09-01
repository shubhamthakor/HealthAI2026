import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

// Import subcomponents
import DoctorOverview from '../../components/doctor/DoctorOverview';
import AppointmentManager from '../../components/doctor/AppointmentManager';
import LeaveManager from '../../components/doctor/LeaveManager';
import QueueConsultation from '../../components/doctor/QueueConsultation';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read active tab from URL queries, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Profile and appointment states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const fetchData = async () => {
    if (!user?.email) return;
    try {
      // 1. Fetch Doctor Profile
      const profileRes = await api.get('/doctors');
      if (profileRes.data && profileRes.data.success) {
        const profile = profileRes.data.data.find((doc) => doc.email === user.email);
        setDoctorProfile(profile);
      }

      // 2. Fetch Assigned Appointments
      const appointmentsRes = await api.get('/appointments');
      if (appointmentsRes.data && appointmentsRes.data.success) {
        // Map patientName and doctorName defensively to prevent downstream crashes
        const mapped = appointmentsRes.data.data.map((app) => ({
          ...app,
          patientName: app.patientId?.name || app.patientName || 'Anonymous',
          doctorName: app.doctorId?.name || app.doctorName || 'Doctor'
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error('Error fetching clinician data:', err);
      toast.error('Failed to retrieve dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Loading clinician dashboard...</p>
      </div>
    );
  }

  return (
    <div className="patient-portal-wrapper">
      {/* Left Sidebar Navigation */}
      <aside className="portal-sidebar">
        <div className="sidebar-brand-meta">
          <span className="user-icon">🩺</span>
          <div>
            <h4>Dr. {doctorProfile?.name?.split(' ').pop() || user?.name}</h4>
            <p className="role-sub">{doctorProfile?.specialization || 'Medical Specialist'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📝 Appointments
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            ⏳ Queue Console
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >
            📅 Leave Calendar
          </button>
        </nav>

        <div className="sidebar-footer-note">
          <p>🔒 Secure Clinician Session</p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="portal-workspace">
        {/* Render Tab Contents */}
        {activeTab === 'overview' && (
          <DoctorOverview 
            appointments={appointments} 
            doctorProfile={doctorProfile} 
            setActiveTab={setActiveTab} 
            onRefresh={fetchData} 
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentManager 
            appointments={appointments} 
            onRefresh={fetchData} 
          />
        )}

        {activeTab === 'queue' && (
          <QueueConsultation 
            doctorProfile={doctorProfile} 
          />
        )}

        {activeTab === 'leave' && (
          <LeaveManager 
            doctorProfile={doctorProfile} 
            onRefresh={fetchData} 
          />
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
