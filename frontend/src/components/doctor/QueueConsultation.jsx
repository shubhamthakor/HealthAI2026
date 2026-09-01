import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Table from '../common/Table';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const QueueConsultation = ({ doctorProfile }) => {
  const [queueState, setQueueState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Consultation Duration adjustment state
  const [currentDuration, setCurrentDuration] = useState(doctorProfile?.consultationDuration || 15);
  const [updatingDuration, setUpdatingDuration] = useState(false);

  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [completing, setCompleting] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  const doctorId = doctorProfile?._id || doctorProfile?.id;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync duration state with loaded doctorProfile
  useEffect(() => {
    if (doctorProfile?.consultationDuration) {
      setCurrentDuration(doctorProfile.consultationDuration);
    }
  }, [doctorProfile]);

  // Handler to update checking duration
  const handleUpdateDuration = async () => {
    if (!currentDuration || currentDuration <= 0) {
      toast.error('Please enter a valid positive duration.');
      return;
    }
    try {
      setUpdatingDuration(true);
      const response = await api.patch('/doctors/self/duration', {
        consultationDuration: currentDuration,
        date: selectedDate
      });
      if (response.data && response.data.success) {
        toast.success('Consultation duration updated successfully!');
        fetchQueueData(); // Refresh queue waiting times
      }
    } catch (err) {
      console.error('Error updating consultation duration:', err);
      toast.error(err.response?.data?.message || 'Failed to update consultation duration.');
    } finally {
      setUpdatingDuration(false);
    }
  };

  // Fetch queue state via REST API
  const fetchQueueData = async () => {
    if (!doctorId) return;
    try {
      const response = await api.get(`/queue/active?doctorId=${doctorId}&date=${selectedDate}`);
      if (response.data && response.data.success) {
        setQueueState(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching queue status:', err);
      toast.error('Failed to load active queue.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial REST fetch on mount or doctorId / selectedDate change
  useEffect(() => {
    fetchQueueData();
  }, [doctorId, selectedDate]);

  // 2. Socket.IO Realtime Connection
  useEffect(() => {
    if (!doctorId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`Doctor socket connected. ID: ${socket.id}`);
      setSocketConnected(true);
      socket.emit('join_room', { doctorId });
    });

    socket.on('disconnect', () => {
      console.log('Doctor socket disconnected.');
      setSocketConnected(false);
    });

    // Listen to live queue updates
    socket.on('queueUpdated', (data) => {
      console.log('Socket queueUpdated event received in consultation:', data);
      if (data && data.doctorId === doctorId) {
        setQueueState(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [doctorId]);

  // Helper to add/remove medicine rows
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...medicines];
    updated.splice(index, 1);
    setMedicines(updated);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Extract In-Progress and Next patient
  const inProgressPatient = queueState?.queue?.find((p) => p.status === 'in-progress');
  const nextPatient = queueState?.queue?.find((p) => p.status === 'approved' || p.status === 'pending');

  // Submit Prescription Complete
  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!inProgressPatient) return;

    const appointmentId = inProgressPatient.appointmentId;
    
    // Filter out empty medicines
    const filteredMedicines = medicines.filter(med => med.name.trim() !== '');

    try {
      setCompleting(true);
      const response = await api.post(`/appointments/${appointmentId}/complete`, {
        medicines: filteredMedicines,
        notes: notes.trim()
      });

      if (response.data && response.data.success) {
        toast.success('Consultation completed and prescription released successfully!');
        setNotes('');
        setMedicines([{ name: '', dosage: '', duration: '' }]);
        fetchQueueData(); // Refresh queue locally
      }
    } catch (err) {
      console.error('Error completing consultation:', err);
      toast.error(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setCompleting(false);
    }
  };

  // Call Next Patient
  const handleCallNextPatient = async () => {
    try {
      setCallingNext(true);
      const response = await api.post('/queue/next', { date: selectedDate });
      if (response.data && response.data.success) {
        toast.success('Called the next patient in line!');
        fetchQueueData(); // Refresh queue state
      }
    } catch (err) {
      console.error('Error calling next patient:', err);
      toast.error(err.response?.data?.message || 'Failed to advance queue.');
    } finally {
      setCallingNext(false);
    }
  };

  return (
    <div className="queue-tracker-container">
      {/* Top Banner Control Card */}
      <Card className="filter-controls-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Consultation Queue Console</h3>
            <p className="filter-subtitle" style={{ margin: '4px 0 0 0' }}>Track today's live patient sessions and write digital prescriptions in real time.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Queue Date Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>Queue Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.88rem', color: '#1e293b', background: '#ffffff', cursor: 'pointer' }}
              />
            </div>

            {/* Consultation Duration Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>Checkup Time:</span>
              <input
                type="number"
                min="1"
                max="120"
                value={currentDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentDuration(isNaN(val) ? '' : val);
                }}
                style={{ width: '60px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.88rem', textAlign: 'center', color: '#1e293b', background: '#ffffff' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>min</span>
              <Button
                variant="primary"
                size="xs"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={handleUpdateDuration}
                isLoading={updatingDuration}
              >
                Update
              </Button>
            </div>

            <div className="realtime-status-pill" style={{ background: socketConnected ? '#dcfce7' : '#fee2e2', color: socketConnected ? '#15803d' : '#b91c1c' }}>
              <span className="pulse-indicator" style={{ background: socketConnected ? '#22c55e' : '#ef4444' }}></span>
              {socketConnected ? 'Live Connection Active' : 'Offline / Reconnecting'}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card style={{ padding: '60px 0', alignItems: 'center', justifyContent: 'center' }}>
          <Loader size="md" label="Synchronizing daily queue registry..." />
        </Card>
      ) : (
        <div className="queue-workspace-grid">
          {/* Left Panel: Active Checkup Room Workspace */}
          <div className="queue-tracker-display">
            {inProgressPatient ? (
              <Card className="prescription-card fade-in" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', padding: '28px' }}>
                <div className="prescription-header" style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="rx-logo" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem' }}>Rx</div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Active Consultation</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
                      Patient: <strong>{inProgressPatient.patientName}</strong> • Queue Position: <strong>#{inProgressPatient.queueNumber}</strong>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCompleteConsultation} className="prescription-body" style={{ paddingTop: '24px' }}>
                  {/* Diagnosis Brief */}
                  <div style={{ padding: '12px 16px', background: 'var(--primary-light)', color: 'var(--primary-hover)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.92rem', fontWeight: 600 }}>
                    🔍 Initial Diagnosis Reference: {inProgressPatient.patientName} was referred for <strong>{inProgressPatient.disease || 'Unspecified'}</strong>.
                  </div>

                  {/* Consultation Duration / Checkup Time Adjustment */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed var(--border)' }}>
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Adjust Session Duration</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>If the patient condition requires more/less time, update checking minutes.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={currentDuration}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setCurrentDuration(isNaN(val) ? '' : val);
                        }}
                        style={{ width: '60px', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center', color: '#1e293b', background: '#ffffff' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>min</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        style={{ padding: '6px 12px' }}
                        onClick={handleUpdateDuration}
                        isLoading={updatingDuration}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Clinical Diagnosis Notes */}
                  <FormField
                    label="Clinical Examination Notes"
                    id="clinical-notes"
                    type="textarea"
                    rows={3}
                    placeholder="Enter examination notes, vital signs, recommendations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />

                  {/* Medicines Prescription List */}
                  <div className="prescription-section" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Prescribed Medications</h4>
                      <Button variant="outline" size="xs" onClick={handleAddMedicine}>
                        ➕ Add Medicine
                      </Button>
                    </div>

                    <Table
                      headers={['Medicine Name', 'Dosage / Frequency', 'Duration', '']}
                      style={{ border: '1px solid var(--border)' }}
                    >
                      {medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '8px 12px', fontSize: '0.9rem', width: '100%' }}
                              placeholder="e.g. Paracetamol 650mg"
                              value={med.name}
                              onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                              required={idx === 0}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '8px 12px', fontSize: '0.9rem', width: '100%' }}
                              placeholder="e.g. 1-0-1 after meals"
                              value={med.dosage}
                              onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                              required={idx === 0}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '8px 12px', fontSize: '0.9rem', width: '100%' }}
                              placeholder="e.g. 5 days"
                              value={med.duration}
                              onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                              required={idx === 0}
                            />
                          </td>
                          <td>
                            {medicines.length > 1 && (
                              <button
                                type="button"
                                className="close-x-btn"
                                style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                                onClick={() => handleRemoveMedicine(idx)}
                              >
                                &times;
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </div>

                  {/* Actions footer */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '30px', borderTop: '1px dashed var(--border)', paddingTop: '20px' }}>
                    <Button type="submit" variant="primary" style={{ flexGrow: 2 }} isLoading={completing}>
                      💾 Complete Checkup & Release Rx
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              /* EMPTY STATE CHECKUP ROOM */
              <EmptyState
                icon="🩺"
                title="Checkup Room Empty"
                message="There is no patient currently inside the consultation room. Progress the queue sequence to invite the next waiting candidate."
                actionButton={nextPatient ? (
                  <Button 
                    variant="primary" 
                    style={{ width: 'auto', minWidth: '240px', padding: '14px 28px' }} 
                    onClick={handleCallNextPatient} 
                    isLoading={callingNext}
                  >
                    Call Next Patient (#{nextPatient.queueNumber})
                  </Button>
                ) : (
                  <div style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 600, display: 'inline-block' }}>
                    📅 All scheduled checkups finished for today.
                  </div>
                )}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 40px', boxShadow: 'var(--shadow-sm)' }}
              />
            )}
          </div>

          {/* Right Panel: Daily Queue list sequence tracker */}
          <Card className="queue-sidebar-controls" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Today's Waiting Line</h4>
              <span className="badge-available" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px' }}>
                {queueState?.activeCount || 0} Waiting
              </span>
            </div>

            {/* Quick advance button if checkup room is active */}
            {inProgressPatient && nextPatient && (
              <Button
                variant="outline"
                size="sm"
                style={{ width: '100%', marginBottom: '18px', fontWeight: 700 }}
                onClick={handleCallNextPatient}
                isLoading={callingNext}
              >
                ⏭️ Call Next Patient (Auto-completes Active)
              </Button>
            )}

            <div className="queue-visualizer" style={{ border: 'none', padding: 0 }}>
              <div className="visualizer-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {queueState && queueState.queue && queueState.queue.length > 0 ? (
                  queueState.queue.map((item) => {
                    const isActive = item.status === 'in-progress';
                    return (
                      <div
                        key={item.appointmentId}
                        className={`viz-item ${isActive ? 'in-progress' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          border: '1.5px solid',
                          borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                          borderRadius: '8px',
                          background: isActive ? 'var(--primary-light)' : 'var(--surface)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isActive ? 'var(--primary)' : 'var(--border)',
                            color: isActive ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            #{item.position}
                          </span>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                              {item.patientName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Wait time: {item.estimatedWaitTime} min
                            </span>
                          </div>
                        </div>
                        <span className={`status-badge ${item.status}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', padding: '3px 8px' }}>
                          {item.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    icon="📅"
                    title="No Waiting Patients"
                    message="No pending patients scheduled in queue."
                    style={{ padding: '20px 0' }}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QueueConsultation;
