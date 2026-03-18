import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Sparkles, Heart, User, LogOut, BarChart2, FolderOpen, Compass, Zap } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/prompts',     icon: Sparkles,        label: 'Prompts' },
      { to: '/favorites',   icon: Heart,           label: 'Favorites' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/collections', icon: FolderOpen, label: 'Collections' },
      { to: '/explore',     icon: Compass,    label: 'Explore' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', icon: BarChart2, label: 'Analytics' },
      { to: '/profile',   icon: User,      label: 'Profile' },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.fullName
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <aside className="sidebar-pv">
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--sidebar-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-icon-pv">
              <Zap size={14} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: '17px', color: 'var(--sidebar-text-active)', letterSpacing: '-0.01em', lineHeight: 1 }}>
                PromptVault
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '9.5px', color: 'var(--sidebar-text)', letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: '2px', opacity: 0.6 }}>
                AI Manager
              </div>
            </div>
          </div>
          {/* Theme toggle lives in sidebar header */}
          <ThemeToggle />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px 0', overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <div key={group.label} style={{ marginTop: gi > 0 ? '6px' : '2px' }}>
            <span className="nav-section-label-pv">{group.label}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item-pv ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--sidebar-divider)' }}>
        <NavLink to="/profile" style={{ textDecoration: 'none' }}>
          <div className="user-chip-pv">
            <div className="avatar-pv" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: 'var(--sidebar-text-active)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="nav-item-pv"
          style={{ color: 'rgba(224,88,40,0.65)', marginTop: '1px', cursor: 'pointer' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
