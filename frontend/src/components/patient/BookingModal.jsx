import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormField from '../common/FormField';

const BookingModal = ({ doctor, preSelectedDisease, onClose, onSuccess }) => {
  // Prefill date with tomorrow's date
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTomorrowString());
  const [disease, setDisease] = useState(preSelectedDisease || '');
  const [submitting, setSubmitting] = useState(false);
  
  // Assigned Slot summary state after booking succeeds
  const [confirmationData, setConfirmationData] = useState(null);

  // Auto prefill preSelectedDisease if it changes
  useEffect(() => {
    if (preSelectedDisease) {
      setDisease(preSelectedDisease);
    }
  }, [preSelectedDisease]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a calendar date.');
      return;
    }

    if (!disease.trim()) {
      toast.error('Please specify a predicted disease or reason for visit.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/appointments/book', {
        doctorId: doctor._id,
        appointmentDate: date,
        disease: disease.trim()
      });

      if (response.data && response.data.success) {
        setConfirmationData(response.data.data);
        toast.success('Consultation slot reserved successfully!');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err.response?.data?.error?.message || 'Failed to book slot. This doctor might be unavailable on this day or fully booked.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Schedule Consultation" maxWidth="500px">
      {!confirmationData ? (
        /* BOOKING FORM VIEW */
        <form onSubmit={handleSubmit}>
          <div className="modal-doctor-brief" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span className="avatar" style={{ fontSize: '2rem', background: 'var(--primary-light)', padding: '8px', borderRadius: '50%' }}>👨‍⚕️</span>
            <div>
              <h4 style={{ margin: 0 }}>Dr. {doctor.name}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{doctor.specialization} • {doctor.hospital}</p>
            </div>
          </div>

          {/* Date Input */}
          <FormField
            label="Consultation Date"
            id="consultation-date"
            type="date"
            min={getMinDateString()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
            required
          />

          {/* Reason / Disease Input */}
          <FormField
            label="Diagnostic Reason / Predicted Disease"
            id="diagnostic-reason"
            type="text"
            placeholder="e.g. Typhoid, Fever, or Checkup"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            disabled={submitting || !!preSelectedDisease}
            required
            helpText={preSelectedDisease ? "Prefilled from AI diagnostic report." : ""}
          />

          <div className="modal-timings-note" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem', color: 'var(--text-muted)', borderLeft: '4px solid var(--primary)' }}>
            <p style={{ margin: 0 }}>📌 <strong>Booking Note:</strong> You are reserving a queue number for Dr. {doctor.name}'s daily consultation shift. Queue progression is tracked in real-time on your dashboard. Remaining patients and wait times update instantly.</p>
          </div>

          <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={submitting}
            >
              Reserve Slot
            </Button>
          </div>
        </form>
      ) : (
        /* BOOKING CONFIRMATION SUMMARY VIEW */
        <div className="booking-confirmation-container" style={{ textAlign: 'center', padding: '10px 0' }}>
          <div className="confirmation-icon" style={{ fontSize: '2.5rem', background: '#dcfce7', color: '#15803d', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>✓</div>
          <h3>Slot Confirmed!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your queue credentials have been successfully created on the server.</p>

          <div className="confirmation-stats-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <div className="stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="lbl" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Queue</span>
              <span className="val font-highlight" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>#{confirmationData.queueNumber}</span>
            </div>
            <div className="stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="lbl" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Wait</span>
              <span className="val font-highlight" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{confirmationData.estimatedWaitTime} min</span>
            </div>
          </div>

          <div className="confirmation-meta-details" style={{ textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ margin: '4px 0' }}><strong>Doctor:</strong> Dr. {doctor.name}</p>
            <p style={{ margin: '4px 0' }}><strong>Date:</strong> {date}</p>
            <p style={{ margin: '4px 0' }}><strong>Diagnostics:</strong> {disease}</p>
          </div>

          <Button 
            variant="primary"
            style={{ width: '100%' }}
            onClick={() => {
              onClose();
              onSuccess();
            }}
          >
            Track Realtime Queue Progress
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;

