import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const DashboardOverview = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { t } = useTranslation();

  // Fetch patient appointments
  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data && response.data.success) {
        const mapped = response.data.data.map(app => ({
          ...app,
          doctorName: app.doctorName || app.doctorId?.name || 'Doctor',
          patientName: app.patientName || app.patientId?.name || 'Patient'
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Cancel an appointment
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(apptId);
      const response = await api.patch(`/appointments/${apptId}/cancel`);
      if (response.data && response.data.success) {
        toast.success('Appointment cancelled successfully!');
        await fetchAppointments();
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter appointments
  const upcoming = appointments.filter(
    (app) => ['pending', 'approved', 'in-progress'].includes(app.status)
  );
  
  const completed = appointments.filter((app) => app.status === 'completed');

  // Format date helper
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="overview-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>{t('welcome_back', { name: user?.name || 'Patient' })}</h1>
          <p>{t('patient_portal_subtitle')}</p>
        </div>
        <div className="welcome-badge">
          <span className="shield-icon">🛡️</span> Secure Patient Portal
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('queue')}>
          <div className="stat-icon queue-color">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{upcoming.length}</span>
            <span className="stat-label">{t('tab_queue')}</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('ai-detect')}>
          <div className="stat-icon ai-color">🧠</div>
          <div className="stat-info">
            <span className="stat-value">AI</span>
            <span className="stat-label">{t('tab_ai_detection')}</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('doctors')}>
          <div className="stat-icon doc-color">👨‍⚕️</div>
          <div className="stat-info">
            <span className="stat-value">{t('book_consult')}</span>
            <span className="stat-label">{t('tab_specialist')}</span>
          </div>
        </div>
      </div>

      <div className="overview-sections-grid">
        {/* Left Side: Upcoming Appointments */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>{t('upcoming_appointments')}</h3>
            <button className="text-btn" onClick={() => setActiveTab('doctors')}>+ {t('book_consult')}</button>
          </div>

          {loading ? (
            <div className="mini-loader-container">
              <div className="mini-spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>{t('no_upcoming_msg')}</p>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('ai-detect')}>
                {t('diagnose_symptoms')}
              </button>
            </div>
          ) : (
            <div className="appointment-list">
              {upcoming.map((app) => (
                <div key={app.appointmentId || app._id} className="appointment-list-item">
                  <div className="item-details">
                    <span className="item-doctor">Dr. {app.doctorName || 'General Physician'}</span>
                    <span className="item-disease">Reason: {app.disease}</span>
                    <span className="item-date">📅 {formatDate(app.appointmentDate)}</span>
                  </div>
                  <div className="item-meta">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                      {['pending', 'approved'].includes(app.status) && (
                        <button
                          className="btn-danger-outline"
                          onClick={() => handleCancelAppointment(app.appointmentId || app._id)}
                          disabled={cancellingId === (app.appointmentId || app._id)}
                        >
                          {cancellingId === (app.appointmentId || app._id) ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                    <span className="queue-position-info">
                      Queue #{app.queueNumber} ({app.estimatedWaitTime} min wait)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Recent Medical Diagnostics */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>{t('completed_prescriptions')}</h3>
          </div>

          {loading ? (
            <div className="mini-loader-container">
              <div className="mini-spinner"></div>
            </div>
          ) : completed.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔬</span>
              <p>{t('no_prescriptions_msg')}</p>
            </div>
          ) : (
            <div className="history-list">
              {completed.map((app) => (
                <div key={app.appointmentId || app._id} className="history-list-item">
                  <div className="history-left">
                    <span className="history-disease">{app.disease}</span>
                    <span className="history-doctor">Consulted: Dr. {app.doctorName}</span>
                    <span className="history-date">📅 {formatDate(app.appointmentDate)}</span>
                  </div>
                  <div className="history-right">
                    <span className="status-badge completed">Completed</span>
                    {app.prescription && (
                      <button 
                        className="btn btn-outline btn-xs btn-view-prescription" 
                        onClick={() => {
                          setSearchParams({ tab: 'queue', appointmentId: app.appointmentId || app._id });
                          toast.success('Viewing prescription in live queue tracking.');
                        }}
                      >
                        View Rx
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
