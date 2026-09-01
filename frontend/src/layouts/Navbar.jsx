import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('health_portal_lang', newLang);
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        HealthAI<span>Portal</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated && user && user.role === 'patient' && (
          <div className="lang-switcher">
            <select 
              value={i18n.language} 
              onChange={handleLangChange}
              className="navbar-lang-select"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        )}

        {isAuthenticated && user && (
          <div className="navbar-user-section" style={{ gap: '12px' }}>
            <span className="navbar-role-tag">{user.role}</span>
            <span className="navbar-username">{user.name}</span>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              {t('sign_out')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
