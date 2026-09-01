import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Table from '../common/Table';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const QueueTracker = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [queueState, setQueueState] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Realtime prescription completion display
  const [prescription, setPrescription] = useState(null);
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Cancel active appointment handler
  const handleCancelAppointment = async () => {
    if (!activeAppointment) return;
    const apptId = activeAppointment.appointmentId || activeAppointment._id;
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(apptId);
      const response = await api.patch(`/appointments/${apptId}/cancel`);
      if (response.data && response.data.success) {
        toast.success('Appointment cancelled successfully!');
        if (setActiveTab) {
          setActiveTab('overview');
        }
      }
    } catch (err) {
      console.error('Error cancelling appointment from queue tracker:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  // Fetch active appointments on mount
  useEffect(() => {
    const fetchActiveAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        if (response.data && response.data.success) {
          const mapped = response.data.data.map(app => ({
            ...app,
            doctorName: app.doctorName || app.doctorId?.name || 'Doctor',
            patientName: app.patientName || app.patientId?.name || 'Patient'
          }));
          // Allow tracking and display of completed checkups to pull prescriptions
          const active = mapped.filter((app) =>
            ['pending', 'approved', 'in-progress', 'completed'].includes(app.status)
          );
          setAppointments(active);
          
          // Auto-select based on search param or select first active appointment
          const urlAppId = searchParams.get('appointmentId');
          if (urlAppId) {
            const found = active.find((a) => (a.appointmentId || a._id) === urlAppId);
            if (found) {
              setActiveAppointment(found);
              return;
            }
          }
          if (active.length > 0) {
            setActiveAppointment(active[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching active appointments for queue:', err);
        toast.error('Failed to retrieve active queues.');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveAppointments();
  }, [searchParams]);

  // Fetch active queue status details from REST API
  const fetchQueueStatus = async (doctorId, dateStr) => {
    try {
      const dateOnly = dateStr.split('T')[0];
      const response = await api.get(`/queue/active?doctorId=${doctorId}&date=${dateOnly}`);
      if (response.data && response.data.success) {
        setQueueState(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching active queue stats:', err);
    }
  };

  // Trigger initial fetch when active appointment changes
  useEffect(() => {
    if (activeAppointment) {
      if (activeAppointment.status === 'completed') {
        setIsConsultationCompleted(true);
        setIsMyTurn(false);
        setPrescription(activeAppointment.prescription || null);
      } else {
        setIsConsultationCompleted(false);
        setIsMyTurn(false);
        setPrescription(null);
      }
      const docId = activeAppointment.doctorId?._id || activeAppointment.doctorId;
      fetchQueueStatus(docId, activeAppointment.appointmentDate);
    }
  }, [activeAppointment]);

  // Realtime Socket.IO Sync Loop
  useEffect(() => {
    if (!activeAppointment || !user) return;

    const docId = activeAppointment.doctorId._id || activeAppointment.doctorId;
    const patientId = user.id;

    // Establish WebSocket Connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`Connected to Socket server. Socket ID: ${socket.id}`);
      // Join room for this doctor's queue
      socket.emit('join_room', { doctorId: docId });
      // Join personal patient room for position changes
      socket.emit('join_patient_room', { patientId });
    });

    // Listen to queue updates from server (doctor consultation progress)
    socket.on('queueUpdated', (data) => {
      console.log('Socket queueUpdated event received:', data);
      if (data && data.doctorId === docId) {
        setQueueState(data);
      }
    });

    // Listen to targeted position shift events
    socket.on('queuePositionChanged', (data) => {
      console.log('Socket queuePositionChanged received:', data);
      if (data && data.appointmentId === (activeAppointment.appointmentId || activeAppointment._id)) {
        toast.success(`Queue progression alert! Your position is now #${data.newPosition}.`, {
          icon: '⏳',
          duration: 6000
        });
        
        // Update local appointment status queue reference
        setActiveAppointment((prev) => ({
          ...prev,
          queueNumber: data.newPosition,
          estimatedWaitTime: data.estimatedWaitTime
        }));
      }
    });

    // Listen to turn status calls
    socket.on('nextPatient', (data) => {
      console.log('Socket nextPatient received:', data);
      if (data && data.appointmentId === (activeAppointment.appointmentId || activeAppointment._id)) {
        setIsMyTurn(true);
        toast.success("It's your turn! Please step into the consultation room.", {
          icon: '🔔',
          duration: 10000
        });
        // Try playing a gentle notify sound if browser allows
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
          // ignore audio context failures
        }
      }
    });

    // Listen to checkout completion
    socket.on('appointmentCompleted', (data) => {
      console.log('Socket appointmentCompleted received:', data);
      if (data && data.appointmentId === (activeAppointment.appointmentId || activeAppointment._id)) {
        setIsConsultationCompleted(true);
        setIsMyTurn(false);
        setPrescription(data.prescription);
        toast.success('Consultation complete. Prescription issued!', {
          icon: '📄',
          duration: 8000
        });
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting from Socket server.');
      socket.disconnect();
    };
  }, [activeAppointment, user]);

  // Extract patient's specific position metrics from global queue state
  const getMyQueueStats = () => {
    if (!queueState || !activeAppointment) return null;
    const myId = activeAppointment.appointmentId || activeAppointment._id;
    const found = queueState.queue.find((q) => q.appointmentId === myId);
    return found || {
      position: activeAppointment.queueNumber,
      estimatedWaitTime: activeAppointment.estimatedWaitTime,
      status: activeAppointment.status
    };
  };

  const myStats = getMyQueueStats();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="queue-tracker-container">
      {loading ? (
        <Card style={{ padding: '40px 20px', alignItems: 'center', justifyContent: 'center' }}>
          <Loader size="md" label="Checking active schedules..." />
        </Card>
      ) : appointments.length === 0 ? (
        /* NO ACTIVE QUEUES */
        <EmptyState
          icon="⏳"
          title="No Active Queue Sessions"
          message="You do not have any pending appointments for today. Book an appointment from the Clinical Directory to track live queues."
        />
      ) : (
        /* ACTIVE QUEUE TRACKER WORKSPACE */
        <div className="queue-workspace-grid">
          {/* Left panel: Active Selection & Info */}
          <div className="queue-sidebar-controls">
            <FormField
              label="Select Booking to Track"
              id="booking-select"
              type="select"
              value={activeAppointment?.appointmentId || activeAppointment?._id}
              onChange={(e) => {
                const found = appointments.find(
                  (a) => (a.appointmentId || a._id) === e.target.value
                );
                setActiveAppointment(found);
              }}
              options={appointments.map((app) => ({
                value: app.appointmentId || app._id,
                label: `Dr. ${app.doctorName} - ${app.disease}`
              }))}
            />

            <Card className="tracking-summary-card" title="Consultation Details" style={{ padding: '20px', marginBottom: '16px' }}>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Doctor:</strong> Dr. {activeAppointment?.doctorName}</p>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Diagnostics:</strong> {activeAppointment?.disease}</p>
              <p style={{ margin: '6px 0', fontSize: '0.92rem' }}><strong>Date:</strong> {activeAppointment?.appointmentDate ? new Date(activeAppointment.appointmentDate).toLocaleDateString() : ''}</p>
            </Card>
            
            {activeAppointment && ['pending', 'approved'].includes(activeAppointment.status) && (
              <Button
                variant="danger"
                style={{ width: '100%', marginBottom: '16px', fontWeight: 600 }}
                onClick={handleCancelAppointment}
                isLoading={cancellingId === (activeAppointment.appointmentId || activeAppointment._id)}
              >
                ❌ Cancel Appointment
              </Button>
            )}

            <div className="realtime-status-pill">
              <span className="pulse-indicator"></span> Realtime Sync Active
            </div>
          </div>

          {/* Right panel: Live Queue status tracker */}
          <div className="queue-tracker-display">
            {isConsultationCompleted ? (
              /* PRESCRIPTION CARD (ON COMPLETE) */
              <Card className="prescription-card fade-in" style={{ padding: '28px' }}>
                <div className="prescription-header">
                  <div className="rx-logo">Rx</div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Medical Prescription</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Consultant: Dr. {activeAppointment?.doctorName}</p>
                  </div>
                </div>

                <div className="prescription-body" style={{ marginTop: '20px' }}>
                  <p className="prescription-date">
                    <strong>Date Issued:</strong> {prescription?.issuedAt ? new Date(prescription.issuedAt).toLocaleString() : new Date().toLocaleString()}
                  </p>

                  <div className="prescription-section" style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Medicines & Dosage</h4>
                    <Table
                      headers={['Medicine', 'Dosage', 'Duration']}
                      isEmpty={!prescription?.medicines || prescription.medicines.length === 0}
                      emptyMessage="No specific medications listed."
                      emptyIcon="💊"
                    >
                      {prescription?.medicines?.map((med, idx) => (
                        <tr key={idx}>
                          <td>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.duration}</td>
                        </tr>
                      ))}
                    </Table>
                  </div>

                  <div className="prescription-section notes-section" style={{ marginTop: '20px' }}>
                    <h4>Doctor Notes</h4>
                    <p className="rx-notes">{prescription?.notes || 'Get adequate rest and check back if symptoms persist.'}</p>
                  </div>
                </div>

                <div className="prescription-footer no-print" style={{ marginTop: '24px' }}>
                  <Button variant="primary" onClick={handlePrint}>
                    🖨️ Print Prescription
                  </Button>
                </div>
              </Card>
            ) : (
              /* QUEUE STATS AND STEPS PANEL */
              <div className="queue-tracking-panel">
                {isMyTurn && (
                  <div className="turn-alert-banner alert-pulse">
                    <span className="banner-icon">🔔</span>
                    <div>
                      <h4>It's Your Turn!</h4>
                      <p>Dr. {activeAppointment?.doctorName} is ready for you. Please proceed into the checkup room.</p>
                    </div>
                  </div>
                )}

                <div className="queue-status-hero">
                  <div className="status-hero-card">
                    <span className="hero-lbl">Your Position</span>
                    <span className="hero-val">#{myStats?.position || activeAppointment?.queueNumber || '--'}</span>
                    <span className="hero-sub font-highlight">Total in Queue: {queueState?.activeCount || '--'}</span>
                  </div>

                  <div className="status-hero-card">
                    <span className="hero-lbl">Est. Wait Time</span>
                    <span className="hero-val">{myStats?.estimatedWaitTime !== undefined ? `${myStats.estimatedWaitTime} min` : `${activeAppointment?.estimatedWaitTime || '--'} min`}</span>
                    <span className="hero-sub">Subject to dynamic progression</span>
                  </div>
                </div>

                {/* Queue list sequence viz */}
                <div className="queue-visualizer">
                  <h4>Live Queue Progression sequence</h4>
                  <div className="visualizer-list">
                    {queueState && queueState.queue && queueState.queue.length > 0 ? (
                      queueState.queue.map((item) => {
                        const isMe = item.appointmentId === (activeAppointment?.appointmentId || activeAppointment?._id);
                        return (
                          <div 
                            key={item.appointmentId} 
                            className={`viz-item ${isMe ? 'is-me' : ''} ${item.status === 'in-progress' ? 'in-progress' : ''}`}
                          >
                            <span className="viz-pos">#{item.position}</span>
                            <span className="viz-name">{isMe ? 'You (Active)' : 'Patient'}</span>
                            <span className={`viz-status ${item.status}`}>{item.status}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-queue-data">Establishing connection to database queue...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueTracker;
