import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar-pv">
      <h2 className="topbar-title">{title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div className="avatar-pv" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }} className="hidden sm:block">
            {user?.fullName}
          </span>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="btn-pv"
          style={{ gap: '5px', fontSize: '12.5px' }}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
