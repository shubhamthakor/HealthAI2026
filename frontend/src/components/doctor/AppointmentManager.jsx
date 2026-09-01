import { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AppointmentManager = ({ appointments, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Detail overlay states
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState(null);

  // Status update execution handler
  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      const payload = { status };
      if (reason) {
        payload.cancellationReason = reason;
      }
      
      const response = await api.patch(`/appointments/${id}/status`, payload);
      if (response.data && response.data.success) {
        toast.success(`Appointment status updated to ${status}!`);
        setShowCancelModal(false);
        setCancelReason('');
        setCancelTargetId(null);
        if (selectedApp && (selectedApp.appointmentId || selectedApp._id) === id) {
          setSelectedApp(null); // Close detail modal if updated
        }
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to change appointment status.');
    }
  };

  const openCancelWorkflow = (id) => {
    setCancelTargetId(id);
    setShowCancelModal(true);
  };

  // Filters logic
  const filtered = appointments.filter((app) => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.disease.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="doctors-directory-container">
      {/* Filtering Desk */}
      <div className="filter-controls-card">
        <h3>Consultation Appointments Registry</h3>
        <p className="filter-subtitle">Search, accept, cancel, or look up past diagnostic details of patient visits.</p>

        <div className="filters-grid">
          <div className="filter-field">
            <label className="form-label">Search Patient / Disease</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Arjun or Malaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label className="form-label">Status Filter</label>
            <select
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="table-card-container fade-in">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>No appointments match your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Appointment Date</th>
                  <th>Queue #</th>
                  <th>Estimated Wait</th>
                  <th>Disease Key</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const id = app.appointmentId || app._id;
                  return (
                    <tr key={id} className="table-row-hover" onClick={() => setSelectedApp(app)}>
                      <td style={{ fontWeight: '700' }}>{app.patientName}</td>
                      <td>{formatDate(app.appointmentDate)}</td>
                      <td>#{app.queueNumber}</td>
                      <td>{app.estimatedWaitTime} mins</td>
                      <td><span className="specialization-tag" style={{ background: '#e0f2fe', color: '#0284c7' }}>{app.disease}</span></td>
                      <td>
                        <span className={`status-badge ${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {app.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-primary btn-xs"
                                onClick={() => handleUpdateStatus(id, 'approved')}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn btn-outline btn-xs"
                                style={{ color: 'var(--error)' }}
                                onClick={() => handleUpdateStatus(id, 'rejected', 'Rejected by Doctor')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <button 
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--error)' }}
                              onClick={() => openCancelWorkflow(id)}
                            >
                              Cancel
                            </button>
                          )}
                          {app.status === 'completed' && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>Checked Out</span>
                          )}
                          {(app.status === 'cancelled' || app.status === 'rejected') && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inactive</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Appointment Metadata Log</h3>
              <button className="close-x-btn" onClick={() => setSelectedApp(null)}>&times;</button>
            </div>
            
            <div className="modal-doctor-brief">
              <span className="avatar">👤</span>
              <div>
                <h4>{selectedApp.patientName}</h4>
                <p>Visit Status: <span className={`status-badge ${selectedApp.status}`}>{selectedApp.status}</span></p>
              </div>
            </div>

            <div className="confirmation-stats-box" style={{ padding: '15px' }}>
              <div className="stat-item">
                <span className="lbl">Queue sequence</span>
                <span className="val">#{selectedApp.queueNumber}</span>
              </div>
              <div className="stat-item">
                <span className="lbl">Diagnostic Key</span>
                <span className="val" style={{ fontSize: '1.25rem', marginTop: '6px' }}>{selectedApp.disease}</span>
              </div>
            </div>

            <div className="confirmation-meta-details">
              <p><strong>Appointment Date:</strong> {formatDate(selectedApp.appointmentDate)}</p>
              <p><strong>Estimated Waiting:</strong> {selectedApp.estimatedWaitTime} mins</p>
              
              {selectedApp.cancellationReason && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c' }}>
                  <strong>Cancellation Reason:</strong> {selectedApp.cancellationReason}
                </div>
              )}
            </div>

            {selectedApp.status === 'completed' && selectedApp.prescription && (
              <div className="prescription-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Released Prescription</h4>
                <p style={{ margin: '4px 0', fontSize: '0.88rem' }}><strong>Notes:</strong> {selectedApp.prescription.notes}</p>
                <div style={{ marginTop: '10px' }}>
                  {selectedApp.prescription.medicines?.map((m, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)' }}>
                      💊 {m.name} - {m.dosage} ({m.duration})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer-actions" style={{ marginTop: '20px' }}>
              {selectedApp.status === 'approved' && (
                <button 
                  className="btn btn-outline"
                  style={{ color: 'var(--error)' }}
                  onClick={() => openCancelWorkflow(selectedApp.appointmentId || selectedApp._id)}
                >
                  Cancel Appointment
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setSelectedApp(null)}>Close Log</button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION DIALOG MODAL */}
      {showCancelModal && (
        <div className="modal-backdrop">
          <div className="modal-card fade-in" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="e.g. Schedule conflicts, emergency leave date..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
              >
                Go Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--error)' }}
                onClick={() => handleUpdateStatus(cancelTargetId, 'cancelled', cancelReason)}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
