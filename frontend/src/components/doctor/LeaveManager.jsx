import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';

const LeaveManager = ({ doctorProfile, onRefresh }) => {
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leavesList, setLeavesList] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);

  const doctorId = doctorProfile?._id || doctorProfile?.id;

  const fetchUpcomingLeaves = async () => {
    if (!doctorId) return;
    try {
      setLoadingLeaves(true);
      const response = await api.get(`/appointments/availability?doctorId=${doctorId}`);
      if (response.data && response.data.success) {
        setLeavesList(response.data.data.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      toast.error('Failed to load upcoming leaves.');
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchUpcomingLeaves();
  }, [doctorId]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason.trim()) {
      toast.error('Please select a date and enter a reason.');
      return;
    }

    const selectedDate = new Date(leaveDate);
    selectedDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Cannot schedule leave on past dates.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/appointments/leave', {
        leaveDate,
        leaveReason: leaveReason.trim(),
      });

      if (response.data && response.data.success) {
        toast.success('Leave scheduled successfully! Affected appointments have been cancelled.');
        setLeaveDate('');
        setLeaveReason('');
        fetchUpcomingLeaves(); // reload list
        if (onRefresh) onRefresh(); // refresh main appointments state
      }
    } catch (err) {
      console.error('Error submitting leave:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit leave request.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="leave-manager-container">
      <Card className="filter-controls-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Clinician Leave Management</h3>
        <p className="filter-subtitle" style={{ margin: '4px 0 0 0' }}>Schedule leaves to close availability. Doing so will automatically cancel all affected patient reservations on the selected date.</p>
      </Card>

      <div className="overview-sections-grid">
        {/* Left Side: Submit Leave Form */}
        <Card title="Register New Leave Date" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
            <FormField
              id="leave-date-picker"
              label="Leave Date"
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <FormField
              id="leave-reason-text"
              label="Reason for Leave"
              type="textarea"
              rows={4}
              placeholder="e.g. Attending Medical Conference, Personal Emergency, Hospital Maintenance..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" isLoading={submitting}>
              Confirm & Schedule Leave
            </Button>
          </form>
        </Card>

        {/* Right Side: Upcoming Leaves List */}
        <Card 
          title="Scheduled Leaves Registry" 
          headerActions={
            <span className="badge-available" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              {leavesList.length} Scheduled
            </span>
          }
          style={{ padding: '24px' }}
        >
          {loadingLeaves ? (
            <Card style={{ padding: '40px 0', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size="md" label="Retrieving scheduled leave dates..." />
            </Card>
          ) : leavesList.length === 0 ? (
            <EmptyState
              icon="✓"
              title="Calendar Open"
              message="No active scheduled leaves. Your clinical calendar is fully open."
              style={{ padding: '40px 20px' }}
            />
          ) : (
            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leavesList.map((leave, idx) => (
                <div key={idx} className="history-list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div className="history-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="history-disease" style={{ fontWeight: 700, color: 'var(--text-main)' }}>📅 {formatDate(leave.date)}</span>
                    <span className="history-doctor" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Reason: {leave.reason}</span>
                  </div>
                  <div className="history-right" style={{ alignSelf: 'center' }}>
                    <span className="status-badge cancelled" style={{ textTransform: 'uppercase', fontSize: '0.72rem', padding: '4px 8px' }}>Closed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LeaveManager;
