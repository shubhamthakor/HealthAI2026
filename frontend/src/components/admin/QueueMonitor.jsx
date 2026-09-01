import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const QueueMonitor = ({ doctors }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?._id || doctors[0]?.id || '');
  const [queueState, setQueueState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Override State variables
  const [selectedAppId, setSelectedAppId] = useState('');
  const [targetPosition, setTargetPosition] = useState(1);
  const [overriding, setOverriding] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch active queue via REST API
  const fetchQueueData = async (docId) => {
    if (!docId) return;
    try {
      setLoading(true);
      const response = await api.get(`/queue/active?doctorId=${docId}&date=${todayStr}`);
      if (response.data && response.data.success) {
        setQueueState(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching active queue stats:', err);
      toast.error('Failed to load active queue.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when doctor selection shifts
  useEffect(() => {
    if (selectedDoctorId) {
      fetchQueueData(selectedDoctorId);
      setSelectedAppId('');
      setTargetPosition(1);
    }
  }, [selectedDoctorId]);

  // Connect to Socket.IO
  useEffect(() => {
    if (!selectedDoctorId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`Admin queue monitor socket connected. ID: ${socket.id}`);
      setSocketConnected(true);
      socket.emit('join_room', { doctorId: selectedDoctorId });
    });

    socket.on('disconnect', () => {
      console.log('Admin queue monitor socket disconnected.');
      setSocketConnected(false);
    });

    // Listen to live queue updates
    socket.on('queueUpdated', (data) => {
      console.log('Socket queueUpdated event received in admin monitor:', data);
      if (data && data.doctorId === selectedDoctorId) {
        setQueueState(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedDoctorId]);

  // Handle Emergency Position Swap
  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedAppId || targetPosition === undefined) {
      toast.error('Please select an appointment and target position.');
      return;
    }

    try {
      setOverriding(true);
      const response = await api.patch('/queue/override', {
        doctorId: selectedDoctorId,
        date: todayStr,
        appointmentId: selectedAppId,
        targetPosition: Number(targetPosition)
      });

      if (response.data && response.data.success) {
        toast.success('Emergency queue override executed successfully!');
        setSelectedAppId('');
        setTargetPosition(1);
        fetchQueueData(selectedDoctorId); // reload local state
      }
    } catch (err) {
      console.error('Error submitting override:', err);
      toast.error(err.response?.data?.message || 'Failed to execute emergency override.');
    } finally {
      setOverriding(false);
    }
  };

  const selectedDoctor = doctors.find((d) => (d._id || d.id) === selectedDoctorId);

  // Candidates in queue that can be reordered (excludes completed or cancelled)
  const waitingPatients = queueState?.queue?.filter((p) => ['pending', 'approved', 'in-progress'].includes(p.status)) || [];

  return (
    <div className="queue-tracker-container fade-in">
      {/* Top Banner Controls */}
      <Card className="filter-controls-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Live Queue Audit Console</h3>
            <p className="filter-subtitle" style={{ margin: '4px 0 0 0' }}>Monitor patient flow in real time. Administrators have access tools to override wait sequences if necessary.</p>
          </div>
          <div className="realtime-status-pill" style={{ background: socketConnected ? '#dcfce7' : '#fee2e2', color: socketConnected ? '#15803d' : '#b91c1c' }}>
            <span className="pulse-indicator" style={{ background: socketConnected ? '#22c55e' : '#ef4444' }}></span>
            {socketConnected ? 'Live Connection Active' : 'Offline / Reconnecting'}
          </div>
        </div>

        <div className="filters-grid" style={{ gridTemplateColumns: '1fr' }}>
          <FormField
            label="Select Doctor Queue to Inspect"
            id="doctor-select"
            type="select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={doctors.map((doc) => ({
              value: doc._id || doc.id,
              label: `Dr. ${doc.name} - ${doc.specialization} (${doc.hospital})`
            }))}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {loading && !queueState ? (
        <Card style={{ padding: '60px 0', alignItems: 'center', justifyContent: 'center' }}>
          <Loader size="md" label="Connecting to clinician queue stream..." />
        </Card>
      ) : (
        <div className="queue-workspace-grid">
          {/* Left Panel: Roster status & Override desk */}
          <div className="queue-sidebar-controls">
            <Card title="Roster Summary" style={{ padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Doctor:</strong> Dr. {selectedDoctor?.name}</p>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Avg Duration:</strong> {selectedDoctor?.consultationDuration} min per patient</p>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Total In Queue:</strong> {waitingPatients.length} active patients</p>
            </Card>

            {/* Emergency Override Tool */}
            <Card 
              title="🚨 Emergency Queue Override" 
              style={{ border: '1.5px solid #fee2e2', background: '#fff', padding: '20px' }}
            >
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                Move any patient appointment slot forward or backward in today's daily schedule loop.
              </p>

              {waitingPatients.length === 0 ? (
                <div style={{ padding: '10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  No active patients in queue to rearrange.
                </div>
              ) : (
                <form onSubmit={handleOverrideSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormField
                    label="Target Patient"
                    id="patient-appt-select"
                    type="select"
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    required
                    options={[
                      { value: '', label: 'Select waiting patient...' },
                      ...waitingPatients.map((p) => ({
                        value: p.appointmentId,
                        label: `#${p.position} - ${p.patientName} (${p.status})`
                      }))
                    ]}
                  />

                  <FormField
                    label="Move to Queue Position #"
                    id="target-override-pos"
                    type="number"
                    min="1"
                    max={waitingPatients.length}
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    style={{ fontWeight: '700' }}
                    isLoading={overriding}
                  >
                    Execute Override
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right Panel: Live waitlist visualization */}
          <div className="queue-tracker-display">
            <div className="queue-tracking-panel">
              <Card title="Daily Queue Roster Line" style={{ padding: '24px' }}>
                <div className="visualizer-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {queueState && queueState.queue && queueState.queue.length > 0 ? (
                    queueState.queue.map((item) => {
                      const isInProgress = item.status === 'in-progress';
                      const isApproved = item.status === 'approved';
                      return (
                        <div
                          key={item.appointmentId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            border: '1.5px solid',
                            borderColor: isInProgress ? 'var(--success)' : isApproved ? 'var(--primary)' : 'var(--border)',
                            borderRadius: '8px',
                            background: isInProgress ? '#f0fdf4' : isApproved ? 'var(--primary-light)' : '#f8fafc',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isInProgress ? 'var(--success)' : isApproved ? 'var(--primary)' : 'var(--text-muted)',
                              color: '#fff',
                              fontSize: '0.82rem',
                              fontWeight: 700
                            }}>
                              #{item.position}
                            </span>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {item.patientName}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Wait Time: {item.estimatedWaitTime} mins
                              </span>
                            </div>
                          </div>

                          <span className={`status-badge ${item.status}`} style={{ fontSize: '0.7rem', padding: '2px 8px', textTransform: 'uppercase' }}>
                            {item.status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState
                      icon="⏳"
                      title="Queue Empty"
                      message="No reservations or queues are active for this doctor today."
                      style={{ padding: '20px 0' }}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueMonitor;
