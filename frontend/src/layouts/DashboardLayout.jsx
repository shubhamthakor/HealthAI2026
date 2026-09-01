import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import AIChatWidget from '../components/patient/AIChatWidget';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="dashboard-content">
        <Outlet />
      </main>
      {user && user.role === 'patient' && <AIChatWidget />}
    </div>
  );
};

export default DashboardLayout;
