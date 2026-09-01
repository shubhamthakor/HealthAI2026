import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const DoctorOverview = ({ appointments, doctorProfile, setActiveTab, onRefresh }) => {
  // Filter appointments for today
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayAppointments = appointments.filter(
    (app) => app.appointmentDate && app.appointmentDate.split('T')[0] === todayStr
  );

  const pendingRequests = appointments.filter((app) => app.status === 'pending');
  const activeQueue = todayAppointments.filter((app) =>
    ['approved', 'in-progress'].includes(app.status)
  );

  // Quick accept/reject handlers
  const handleUpdateStatus = async (id, status) => {
    try {
      const payload = { status };
      if (status === 'rejected') {
        payload.cancellationReason = 'Rejected by Doctor';
      }
      
      const response = await api.patch(`/appointments/${id}/status`, payload);
      if (response.data && response.data.success) {
        toast.success(`Appointment successfully ${status}!`);
        onRefresh(); // refresh the master state
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update appointment status.');
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="overview-container">
      {/* Clinician Profile Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome, Dr. {doctorProfile?.name || 'Doctor'}!</h1>
          <p>
            Specialization: <strong>{doctorProfile?.specialization}</strong> • Clinic: <strong>{doctorProfile?.hospital}</strong>
          </p>
        </div>
        <div className="welcome-badge">
          🏥 Clinician Portal
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('queue')}>
          <div className="stat-icon queue-color">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{activeQueue.length}</span>
            <span className="stat-label">Active Queue Today</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('appointments')}>
          <div className="stat-icon ai-color">📝</div>
          <div className="stat-info">
            <span className="stat-value">{pendingRequests.length}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('appointments')}>
          <div className="stat-icon doc-color">📅</div>
          <div className="stat-info">
            <span className="stat-value">{todayAppointments.length}</span>
            <span className="stat-label">Today's Total Visits</span>
          </div>
        </div>
      </div>

      <div className="overview-sections-grid">
        {/* Left Card: Pending Requests */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Incoming Consultation Requests</h3>
            <span className="badge-available">{pendingRequests.length} Pending</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <p>All incoming requests have been reviewed.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {pendingRequests.map((app) => (
                <div key={app.appointmentId || app._id} className="appointment-list-item">
                  <div className="item-details">
                    <span className="item-doctor">{app.patientName}</span>
                    <span className="item-disease">Diagnostics: {app.disease}</span>
                    <span className="item-date">📅 Date: {formatDate(app.appointmentDate)}</span>
                  </div>
                  <div className="item-meta" style={{ flexDirection: 'row', gap: '8px', alignSelf: 'center' }}>
                    <button 
                      className="btn btn-primary btn-xs"
                      onClick={() => handleUpdateStatus(app.appointmentId || app._id, 'approved')}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-outline btn-xs"
                      style={{ color: 'var(--error)', borderColor: 'var(--border)' }}
                      onClick={() => handleUpdateStatus(app.appointmentId || app._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Card: Today's Active Schedule overview */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Today's Queue List</h3>
            <button className="text-btn" onClick={() => setActiveTab('queue')}>Go to Console</button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>No consultations scheduled for today.</p>
            </div>
          ) : (
            <div className="history-list">
              {todayAppointments.map((app) => (
                <div key={app.appointmentId || app._id} className="history-list-item">
                  <div className="history-left">
                    <span className="history-disease">Patient: {app.patientName}</span>
                    <span className="history-doctor">Reason: {app.disease}</span>
                    <span className="history-date">Queue Position: #{app.queueNumber}</span>
                  </div>
                  <div className="history-right" style={{ alignSelf: 'center' }}>
                    <span className={`status-badge ${app.status}`}>
                      {app.status}
                    </span>
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

export default DoctorOverview;
