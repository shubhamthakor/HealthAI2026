import { useState, useMemo } from 'react';

const UserManager = ({ appointments, doctors }) => {
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' or 'doctors'
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique patients catalog from appointments
  const patientsList = useMemo(() => {
    const patientsMap = {};
    appointments.forEach((app) => {
      if (app.patientId && (app.patientId._id || app.patientId)) {
        const id = app.patientId._id || app.patientId;
        // Build patient record
        if (!patientsMap[id]) {
          patientsMap[id] = {
            id: id,
            name: app.patientName || app.patientId.name || 'Anonymous Patient',
            email: app.patientId.email || 'N/A',
            lastVisit: app.appointmentDate,
            totalBookings: 1
          };
        } else {
          patientsMap[id].totalBookings += 1;
          // Maintain latest date
          if (new Date(app.appointmentDate) > new Date(patientsMap[id].lastVisit)) {
            patientsMap[id].lastVisit = app.appointmentDate;
          }
        }
      }
    });
    return Object.values(patientsMap);
  }, [appointments]);

  // Filter patients based on query search
  const filteredPatients = useMemo(() => {
    return patientsList.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patientsList, searchTerm]);

  // Filter doctors based on query search
  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="doctors-directory-container fade-in">
      {/* Search Header control */}
      <div className="filter-controls-card">
        <h3>User Management Directory</h3>
        <p className="filter-subtitle">Track patient details and clinician directory scopes registered within the portal.</p>

        {/* Tab Swapper */}
        <div className="tab-toggle-container" style={{ alignSelf: 'flex-start', marginBottom: '24px' }}>
          <button
            className={`tab-toggle-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => { setActiveTab('patients'); setSearchTerm(''); }}
          >
            👥 Registered Patients ({patientsList.length})
          </button>
          <button
            className={`tab-toggle-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('doctors'); setSearchTerm(''); }}
          >
            👨‍⚕️ Clinicians ({doctors.length})
          </button>
        </div>

        <div className="filters-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="filter-field">
            <label className="form-label" htmlFor="user-search">Filter Catalog</label>
            <input
              id="user-search"
              className="form-input"
              type="text"
              placeholder={`Search by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Tab Output */}
      {activeTab === 'patients' ? (
        <div className="table-card-container fade-in">
          {filteredPatients.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <span className="empty-icon">👥</span>
              <p>No registered patients found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email Address</th>
                    <th>Total Reservations</th>
                    <th>Last Active Visit Date</th>
                    <th>Verification Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="table-row-hover">
                      <td style={{ fontWeight: '700' }}>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.totalBookings} checkups</td>
                      <td>{formatDate(p.lastVisit)}</td>
                      <td>
                        <span className="status-badge approved" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          Patient User
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card-container fade-in">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <span className="empty-icon">👨‍⚕️</span>
              <p>No doctors found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Clinic Hospital Location</th>
                    <th>Work Email</th>
                    <th>Status Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((d) => (
                    <tr key={d._id || d.id} className="table-row-hover">
                      <td style={{ fontWeight: '700' }}>{d.name}</td>
                      <td>
                        <span className="specialization-tag" style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.74rem' }}>
                          {d.specialization}
                        </span>
                      </td>
                      <td>{d.hospital} ({d.city})</td>
                      <td>{d.email}</td>
                      <td>
                        <span className="status-badge in-progress" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          Clinician
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManager;
