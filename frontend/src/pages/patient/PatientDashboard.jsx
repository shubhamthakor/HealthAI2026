import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Import subcomponents
import DashboardOverview from '../../components/patient/DashboardOverview';
import SymptomDetector from '../../components/patient/SymptomDetector';
import DoctorsList from '../../components/patient/DoctorsList';
import BookingModal from '../../components/patient/BookingModal';
import QueueTracker from '../../components/patient/QueueTracker';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  
  // Read active tab from URL queries, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDisease, setBookingDisease] = useState(null);

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleOpenBooking = (doctor, preselectedDisease = null) => {
    setBookingDoctor(doctor);
    setBookingDisease(preselectedDisease);
  };

  const handleBookingSuccess = () => {
    // Navigate directly to queue tracking on successful reservation
    setActiveTab('queue');
  };

  return (
    <div className="patient-portal-wrapper">
      {/* Left Sidebar Navigation */}
      <aside className="portal-sidebar">
        <div className="sidebar-brand-meta">
          <span className="user-icon">👤</span>
          <div>
            <h4>{user?.name || 'Patient'}</h4>
            <p className="role-sub">HealthAI Patient</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 {t('tab_overview')}
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'ai-detect' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-detect')}
          >
            🧠 {t('tab_ai_detection')}
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ {t('tab_specialist')}
          </button>
          <button 
            className={`nav-item-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            ⏳ {t('tab_queue')}
          </button>
        </nav>

        <div className="sidebar-footer-note">
          <p>🔒 Secure Sandbox Session</p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="portal-workspace">
        {/* Render Tab Contents */}
        {activeTab === 'overview' && (
          <DashboardOverview setActiveTab={setActiveTab} />
        )}

        {activeTab === 'ai-detect' && (
          <SymptomDetector onBookDoctor={handleOpenBooking} />
        )}

        {activeTab === 'doctors' && (
          <DoctorsList onBookDoctor={handleOpenBooking} />
        )}

        {activeTab === 'queue' && (
          <QueueTracker setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Booking Modal Overlay */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          preSelectedDisease={bookingDisease}
          onClose={() => {
            setBookingDoctor(null);
            setBookingDisease(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
