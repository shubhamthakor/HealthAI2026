import { useMemo } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

const AdminOverview = ({ appointments, doctors, setActiveTab }) => {
  // 1. Calculate Metrics
  const metrics = useMemo(() => {
    const totalDocs = doctors.length;
    const totalAppts = appointments.length;

    // Get unique patients count
    const uniquePatients = new Set(appointments.map((a) => a.patientId?._id || a.patientId)).size;

    // Active queues (doctors with pending, approved, or in-progress appointments today)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(
      (a) => a.appointmentDate && a.appointmentDate.split('T')[0] === todayStr
    );
    const activeQueueDoctors = new Set(
      todayAppts
        .filter((a) => ['pending', 'approved', 'in-progress'].includes(a.status))
        .map((a) => a.doctorId?._id || a.doctorId)
    ).size;

    return {
      totalDoctors: totalDocs,
      totalAppointments: totalAppts,
      totalPatients: uniquePatients,
      activeQueues: activeQueueDoctors
    };
  }, [appointments, doctors]);

  // 2. Calculate Disease Analytics
  const diseaseChartData = useMemo(() => {
    const counts = {};
    appointments.forEach((a) => {
      if (a.disease) {
        counts[a.disease] = (counts[a.disease] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 diseases

    const max = sorted.length > 0 ? Math.max(...sorted.map((d) => d.value)) : 1;

    return sorted.map((d) => ({
      ...d,
      percentage: (d.value / max) * 100
    }));
  }, [appointments]);

  // 3. Recent Activity Feed
  const recentActivities = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [appointments]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="overview-container fade-in">
      {/* Banner */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="welcome-content">
          <h1>System Administration Control Room</h1>
          <p>
            Oversee clinic directories, dynamic schedules, active doctor queues, and ML prediction statistics.
          </p>
        </div>
        <div className="welcome-badge" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
          ⚙️ Admin Mode
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card hoverEffect={true} onClick={() => setActiveTab('users')} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-icon ai-color" style={{ background: '#f0fdf4', color: '#166534', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem' }}>👥</div>
            <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics.totalPatients}</span>
              <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Patients</span>
            </div>
          </div>
        </Card>
        <Card hoverEffect={true} onClick={() => setActiveTab('doctors')} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-icon doc-color" style={{ background: '#eef2ff', color: '#4f46e5', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem' }}>👨‍⚕️</div>
            <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics.totalDoctors}</span>
              <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Doctors</span>
            </div>
          </div>
        </Card>
        <Card hoverEffect={true} onClick={() => setActiveTab('appointments')} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-icon queue-color" style={{ background: '#fdf2f8', color: '#db2777', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem' }}>📅</div>
            <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics.totalAppointments}</span>
              <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All Reservations</span>
            </div>
          </div>
        </Card>
        <Card hoverEffect={true} onClick={() => setActiveTab('queues')} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-icon queue-color" style={{ background: '#e0f2fe', color: '#0369a1', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem' }}>⏳</div>
            <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics.activeQueues}</span>
              <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Running Queues</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="overview-sections-grid">
        {/* Left Side: Disease Frequency Chart */}
        <Card 
          title="Top Predicted Diseases" 
          headerActions={
            <Button variant="text" size="sm" onClick={() => setActiveTab('analytics')}>Full Analytics</Button>
          }
          style={{ padding: '24px' }}
        >
          {diseaseChartData.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No Analytics"
              message="No diagnosis analytics data available yet."
              style={{ padding: '20px' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '10px 0' }}>
              {diseaseChartData.map((disease) => (
                <div key={disease.name} style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    <span>{disease.name}</span>
                    <span style={{ color: 'var(--primary)' }}>{disease.value} predictions</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'var(--primary)',
                        width: `${disease.percentage}%`,
                        borderRadius: '4px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Side: Recent Activity Feed */}
        <Card 
          title="Recent System Activity" 
          headerActions={
            <Button variant="text" size="sm" onClick={() => setActiveTab('appointments')}>All Log Details</Button>
          }
          style={{ padding: '24px' }}
        >
          {recentActivities.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="No Activity"
              message="No recent activity logged in the system."
              style={{ padding: '20px' }}
            />
          ) : (
            <div className="history-list" style={{ maxHeight: '310px', overflowY: 'auto' }}>
              {recentActivities.map((app) => (
                <div key={app._id || app.appointmentId} className="history-list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div className="history-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="history-disease" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {app.patientName} booked appointment
                    </span>
                    <span className="history-doctor" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Doctor: Dr. {app.doctorName} • Target: {app.disease}
                    </span>
                    <span className="history-date" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {formatDate(app.createdAt)}
                    </span>
                  </div>
                  <div className="history-right" style={{ alignSelf: 'center' }}>
                    <span className={`status-badge ${app.status}`} style={{ fontSize: '0.68rem', padding: '2px 8px', textTransform: 'uppercase' }}>
                      {app.status}
                    </span>
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

export default AdminOverview;
