import { useState } from 'react';

const AppointmentMonitor = ({ appointments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [diseaseFilter, setDiseaseFilter] = useState('All');
  
  // Details Modal overlays
  const [selectedApp, setSelectedApp] = useState(null);

  // Filter distinct disease list for select options
  const diseaseOptions = [...new Set(appointments.map((a) => a.disease))].filter(Boolean);

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesDisease = diseaseFilter === 'All' || app.disease === diseaseFilter;

    return matchesSearch && matchesStatus && matchesDisease;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="doctors-directory-container fade-in">
      {/* Filtering Log Section */}
      <div className="filter-controls-card">
        <h3>System Appointments Registry Log</h3>
        <p className="filter-subtitle">Audit and look up patient reservation details, diagnostic results, and clinician status transitions.</p>

        <div className="filters-grid">
          <div className="filter-field">
            <label className="form-label" htmlFor="appt-search">Search Patient / Doctor</label>
            <input
              id="appt-search"
              className="form-input"
              type="text"
              placeholder="e.g. Arjun or Dr. Kavita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label className="form-label" htmlFor="appt-status-filter">Status Filter</label>
            <select
              id="appt-status-filter"
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-field">
            <label className="form-label" htmlFor="appt-disease-filter">Disease Category</label>
            <select
              id="appt-disease-filter"
              className="form-input"
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
            >
              <option value="All">All Diseases</option>
              {diseaseOptions.map((disease) => (
                <option key={disease} value={disease}>{disease}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Renders Tabular Data */}
      <div className="table-card-container fade-in">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <span className="empty-icon">📅</span>
            <p>No appointments match the filter parameters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Assigned Doctor</th>
                  <th>Reservation Date</th>
                  <th>Disease Key</th>
                  <th>Queue #</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app._id || app.appointmentId} className="table-row-hover" onClick={() => setSelectedApp(app)}>
                    <td style={{ fontWeight: '700' }}>{app.patientName}</td>
                    <td>Dr. {app.doctorName}</td>
                    <td>{formatDate(app.appointmentDate)}</td>
                    <td>
                      <span className="specialization-tag" style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.74rem' }}>
                        {app.disease}
                      </span>
                    </td>
                    <td>#{app.queueNumber}</td>
                    <td>
                      <span className={`status-badge ${app.status}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {app.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="text-btn" onClick={() => setSelectedApp(app)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* METADATA DETAILS OVERLAY MODAL */}
      {selectedApp && (
        <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Appointment Log Verification</h3>
              <button className="close-x-btn" onClick={() => setSelectedApp(null)}>&times;</button>
            </div>

            <div className="modal-doctor-brief">
              <span className="avatar">📅</span>
              <div>
                <h4>Patient: {selectedApp.patientName}</h4>
                <p>Consultant: Dr. {selectedApp.doctorName}</p>
              </div>
            </div>

            <div className="confirmation-stats-box" style={{ padding: '15px', marginBottom: '16px' }}>
              <div className="stat-item">
                <span className="lbl">Queue sequence</span>
                <span className="val">#{selectedApp.queueNumber}</span>
              </div>
              <div className="stat-item">
                <span className="lbl">Status</span>
                <span className={`status-badge ${selectedApp.status}`} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                  {selectedApp.status}
                </span>
              </div>
            </div>

            <div className="confirmation-meta-details" style={{ borderTop: 'none', paddingTop: 0, marginBottom: '12px' }}>
              <p><strong>Appointment Date:</strong> {formatDate(selectedApp.appointmentDate)}</p>
              <p><strong>Disease Key Target:</strong> {selectedApp.disease}</p>
              <p><strong>Estimated Waiting time:</strong> {selectedApp.estimatedWaitTime} minutes</p>
              
              {selectedApp.cancellationReason && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', fontSize: '0.88rem' }}>
                  <strong>Cancellation/Rejection Reason:</strong> {selectedApp.cancellationReason}
                </div>
              )}
            </div>

            {selectedApp.status === 'completed' && selectedApp.prescription && (
              <div className="prescription-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'left' }}>
                <h4 style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Consultation Prescription Released</h4>
                <p style={{ margin: '4px 0', fontSize: '0.86rem' }}><strong>Notes:</strong> {selectedApp.prescription.notes}</p>
                <div style={{ marginTop: '8px' }}>
                  {selectedApp.prescription.medicines?.map((m, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)' }}>
                      💊 {m.name} - {m.dosage} ({m.duration})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer-actions" style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedApp(null)}>Close Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentMonitor;
