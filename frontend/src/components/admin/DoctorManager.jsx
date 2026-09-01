import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const SPECIALIZATIONS = [
  'Dermatologist',
  'Allergist',
  'Gastroenterologist',
  'Hepatologist',
  'General Physician',
  'Infectious Disease Specialist',
  'Endocrinologist',
  'Pulmonologist',
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Proctologist',
  'Vascular Surgeon',
  'Rheumatologist',
  'ENT Specialist',
  'Urologist'
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorManager = ({ doctors, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals status
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State variables
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [city, setCity] = useState('');
  const [hospital, setHospital] = useState('');
  const [duration, setDuration] = useState(15);
  const [availability, setAvailability] = useState(['Monday', 'Wednesday', 'Friday']);

  // Timings State
  const [morningStart, setMorningStart] = useState('09:00');
  const [morningEnd, setMorningEnd] = useState('13:00');
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchEnd, setLunchEnd] = useState('15:00');
  const [eveningStart, setEveningStart] = useState('15:00');
  const [eveningEnd, setEveningEnd] = useState('18:00');

  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedDoctorId('');
    setName('');
    setEmail('');
    setPassword('');
    setSpecialization(SPECIALIZATIONS[0]);
    setCity('');
    setHospital('');
    setDuration(15);
    setAvailability(['Monday', 'Wednesday', 'Friday']);
    setMorningStart('09:00');
    setMorningEnd('13:00');
    setLunchStart('13:00');
    setLunchEnd('15:00');
    setEveningStart('15:00');
    setEveningEnd('18:00');
  };

  const openAddFlow = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditFlow = (doc) => {
    resetForm();
    setSelectedDoctorId(doc._id || doc.id);
    setName(doc.name || '');
    setEmail(doc.email || '');
    setSpecialization(doc.specialization || SPECIALIZATIONS[0]);
    setCity(doc.city || '');
    setHospital(doc.hospital || '');
    setDuration(doc.consultationDuration || 15);
    setAvailability(doc.availability || []);

    if (doc.timings) {
      setMorningStart(doc.timings.morningShift?.startTime || '09:00');
      setMorningEnd(doc.timings.morningShift?.endTime || '13:00');
      setLunchStart(doc.timings.lunchBreak?.startTime || '13:00');
      setLunchEnd(doc.timings.lunchBreak?.endTime || '15:00');
      setEveningStart(doc.timings.eveningShift?.startTime || '15:00');
      setEveningEnd(doc.timings.eveningShift?.endTime || '18:00');
    }
    setShowEditModal(true);
  };

  const openDeleteFlow = (id) => {
    setSelectedDoctorId(id);
    setShowDeleteModal(true);
  };

  // Checkbox toggle handler
  const handleDayToggle = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter((d) => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  // Timings validation checker
  const validateTimings = () => {
    const timeReg = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeReg.test(morningStart) || !timeReg.test(morningEnd) ||
        !timeReg.test(lunchStart) || !timeReg.test(lunchEnd) ||
        !timeReg.test(eveningStart) || !timeReg.test(eveningEnd)) {
      toast.error('All timings must be in 24-hour HH:MM format.');
      return false;
    }
    return true;
  };

  // 1. Submit Add Doctor
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateTimings()) return;

    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    const docPayload = {
      name: name.trim(),
      email: email.trim(),
      password,
      specialization,
      city: city.trim(),
      hospital: hospital.trim(),
      consultationDuration: Number(duration),
      availability,
      timings: {
        morningShift: { startTime: morningStart, endTime: morningEnd },
        lunchBreak: { startTime: lunchStart, endTime: lunchEnd },
        eveningShift: { startTime: eveningStart, endTime: eveningEnd }
      }
    };

    try {
      setSubmitting(true);
      const res = await api.post('/doctors', docPayload);
      if (res.data && res.data.success) {
        toast.success(`Successfully registered Dr. ${name}!`);
        setShowAddModal(false);
        resetForm();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add doctor profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Update Doctor
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateTimings()) return;

    const docPayload = {
      name: name.trim(),
      email: email.trim(),
      specialization,
      city: city.trim(),
      hospital: hospital.trim(),
      consultationDuration: Number(duration),
      availability,
      timings: {
        morningShift: { startTime: morningStart, endTime: morningEnd },
        lunchBreak: { startTime: lunchStart, endTime: lunchEnd },
        eveningShift: { startTime: eveningStart, endTime: eveningEnd }
      }
    };

    // Only attach password if editing clinician password explicitly
    if (password) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }
      docPayload.password = password;
    }

    try {
      setSubmitting(true);
      const res = await api.patch(`/doctors/${selectedDoctorId}`, docPayload);
      if (res.data && res.data.success) {
        toast.success(`Successfully updated Dr. ${name}'s details.`);
        setShowEditModal(false);
        resetForm();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Submit Delete Doctor
  const handleDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await api.delete(`/doctors/${selectedDoctorId}`);
      if (res.data && res.data.success) {
        toast.success('Doctor profile successfully removed.');
        setShowDeleteModal(false);
        resetForm();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove doctor profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="doctors-directory-container fade-in">
      {/* Filtering Header Desk */}
      <div className="filter-controls-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3>Clinician Registry & Roster</h3>
            <p className="filter-subtitle" style={{ margin: 0 }}>Create, update, and manage doctor specialities, timings, and credentials.</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={openAddFlow}>
            ➕ Add New Doctor
          </button>
        </div>

        <div className="filters-grid" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
          <div className="filter-field">
            <label className="form-label" htmlFor="doctor-search">Search Doctor Catalog</label>
            <input
              id="doctor-search"
              className="form-input"
              type="text"
              placeholder="Filter by name, specialization, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      {filteredDoctors.length === 0 ? (
        <div className="loading-card" style={{ padding: '60px 0' }}>
          <span className="empty-icon" style={{ fontSize: '3rem' }}>👨‍⚕️</span>
          <p style={{ marginTop: '16px' }}>No doctor matches the query search criteria.</p>
        </div>
      ) : (
        <div className="doctors-cards-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc._id || doc.id} className="doctor-profile-card">
              <div className="card-top">
                <div className="doctor-avatar">🩺</div>
                <div className="doctor-headline">
                  <span className="doc-spec-badge">{doc.specialization}</span>
                  <h4>{doc.name}</h4>
                  <span className="doc-experience">📍 {doc.city}</span>
                </div>
              </div>

              <div className="card-body">
                <p className="hospital-detail">🏥 <strong>{doc.hospital}</strong></p>
                <div className="shift-timings-summary">
                  <h5 className="timings-title">Daily Shifts</h5>
                  <div className="timings-grid">
                    <span>🌅 Morning: {doc.timings?.morningShift?.startTime} - {doc.timings?.morningShift?.endTime}</span>
                    <span>🌇 Evening: {doc.timings?.eveningShift?.startTime} - {doc.timings?.eveningShift?.endTime}</span>
                  </div>
                </div>
                <div className="availability-days">
                  <strong>Available:</strong> {doc.availability?.join(', ') || 'None'}
                </div>
              </div>

              <div className="card-footer" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                <button className="btn btn-outline btn-xs" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => openEditFlow(doc)}>
                  Edit Details
                </button>
                <button className="btn btn-outline btn-xs" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => openDeleteFlow(doc._id || doc.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. ADD CLINICIAN MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card fade-in" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Medical Specialist</h3>
              <button className="close-x-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-name">Clinician Name</label>
                  <input id="doc-add-name" className="form-input" type="text" placeholder="e.g. Dr. Kavita Desai" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-email">Work Email</label>
                  <input id="doc-add-email" className="form-input" type="email" placeholder="e.g. kavita.desai@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-pass">Secure Account Password</label>
                  <input id="doc-add-pass" className="form-input" type="password" placeholder="Min 8 characters, Upper, Symbol" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-spec">Specialization Area</label>
                  <select id="doc-add-spec" className="form-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-hospital">Affiliated Hospital / Clinic</label>
                  <input id="doc-add-hospital" className="form-input" type="text" placeholder="Desai Neuro Center" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-add-city">Registered City</label>
                  <input id="doc-add-city" className="form-input" type="text" placeholder="Surat" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-add-duration">Average Checkup Duration (Minutes)</label>
                <input id="doc-add-duration" className="form-input" type="number" min="5" max="60" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>

              {/* Day Availability Grid */}
              <div className="form-group">
                <label className="form-label">Clinic Availability Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                  {WEEKDAYS.map((day) => {
                    const isChecked = availability.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`symptom-chip ${isChecked ? '' : 'symptom-chip-inactive'}`}
                        style={{ border: '1.5px solid var(--border)', cursor: 'pointer', padding: '6px 14px' }}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing Shifts configurations */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>Shift Hours Settings (24-Hour HH:MM Format)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-m-start">Morning Shift Start</label>
                    <input id="doc-add-m-start" className="form-input" style={{ padding: '8px 12px' }} value={morningStart} onChange={(e) => setMorningStart(e.target.value)} placeholder="09:00" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-m-end">Morning Shift End</label>
                    <input id="doc-add-m-end" className="form-input" style={{ padding: '8px 12px' }} value={morningEnd} onChange={(e) => setMorningEnd(e.target.value)} placeholder="13:00" required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-l-start">Lunch Break Start</label>
                    <input id="doc-add-l-start" className="form-input" style={{ padding: '8px 12px' }} value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} placeholder="13:00" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-l-end">Lunch Break End</label>
                    <input id="doc-add-l-end" className="form-input" style={{ padding: '8px 12px' }} value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} placeholder="15:00" required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-e-start">Evening Shift Start</label>
                    <input id="doc-add-e-start" className="form-input" style={{ padding: '8px 12px' }} value={eveningStart} onChange={(e) => setEveningStart(e.target.value)} placeholder="15:00" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-add-e-end">Evening Shift End</label>
                    <input id="doc-add-e-end" className="form-input" style={{ padding: '8px 12px' }} value={eveningEnd} onChange={(e) => setEveningEnd(e.target.value)} placeholder="18:00" required />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="btn-spinner"></span> : 'Submit Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT CLINICIAN MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-card fade-in" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Doctor Profile</h3>
              <button className="close-x-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-name">Clinician Name</label>
                  <input id="doc-edit-name" className="form-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-email">Work Email</label>
                  <input id="doc-edit-email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-pass">Password (Leave blank to keep unchanged)</label>
                  <input id="doc-edit-pass" className="form-input" type="password" placeholder="New secure password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-spec">Specialization Area</label>
                  <select id="doc-edit-spec" className="form-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-hospital">Affiliated Hospital / Clinic</label>
                  <input id="doc-edit-hospital" className="form-input" type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-edit-city">Registered City</label>
                  <input id="doc-edit-city" className="form-input" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-edit-duration">Average Checkup Duration (Minutes)</label>
                <input id="doc-edit-duration" className="form-input" type="number" min="5" max="60" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Clinic Availability Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                  {WEEKDAYS.map((day) => {
                    const isChecked = availability.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`symptom-chip ${isChecked ? '' : 'symptom-chip-inactive'}`}
                        style={{ border: '1.5px solid var(--border)', cursor: 'pointer', padding: '6px 14px' }}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>Shift Hours Settings (24-Hour HH:MM Format)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-m-start">Morning Shift Start</label>
                    <input id="doc-edit-m-start" className="form-input" style={{ padding: '8px 12px' }} value={morningStart} onChange={(e) => setMorningStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-m-end">Morning Shift End</label>
                    <input id="doc-edit-m-end" className="form-input" style={{ padding: '8px 12px' }} value={morningEnd} onChange={(e) => setMorningEnd(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-l-start">Lunch Break Start</label>
                    <input id="doc-edit-l-start" className="form-input" style={{ padding: '8px 12px' }} value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-l-end">Lunch Break End</label>
                    <input id="doc-edit-l-end" className="form-input" style={{ padding: '8px 12px' }} value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-e-start">Evening Shift Start</label>
                    <input id="doc-edit-e-start" className="form-input" style={{ padding: '8px 12px' }} value={eveningStart} onChange={(e) => setEveningStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="doc-edit-e-end">Evening Shift End</label>
                    <input id="doc-edit-e-end" className="form-input" style={{ padding: '8px 12px' }} value={eveningEnd} onChange={(e) => setEveningEnd(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="btn-spinner"></span> : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SAFETY DELETE ALERT */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card fade-in" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Clinician Record</h3>
            </div>
            <p style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              Are you sure you want to delete this doctor? This will permanently erase their details and cancel any future checkups.
            </p>
            <div className="modal-footer-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Go Back</button>
              <button className="btn btn-primary" style={{ background: 'var(--error)' }} onClick={handleDeleteSubmit} disabled={submitting}>
                {submitting ? <span className="btn-spinner"></span> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManager;
