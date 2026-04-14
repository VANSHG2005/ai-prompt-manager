import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import {
  LayoutDashboard, Sparkles, Heart, User, LogOut, BarChart2,
  FolderOpen, Compass, Zap, X, FlaskConical, Link2,
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const AVATAR_COLORS = {
  terracotta: '#C4441A',
  midnight: '#2A3A5C',
  forest: '#3A6B5A',
  plum: '#6a2a5c',
  slate: '#3a4a5c',
  amber: '#c8811a',
  teal: '#1a5c52',
  rose: '#c7336e',
};

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/prompts',   icon: Sparkles,        label: 'Prompts' },
      { to: '/favorites', icon: Heart,           label: 'Favorites' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/collections', icon: FolderOpen,   label: 'Collections' },
      { to: '/explore',     icon: Compass,      label: 'Explore' },
      { to: '/playground',  icon: FlaskConical, label: 'Playground' },
      { to: '/chains',      icon: Link2,        label: 'Chains' },
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

const Sidebar = ({ onClose, className = 'sidebar-pv' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarUser, setSidebarUser] = useState(user);

  useEffect(() => {
    setSidebarUser(user);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    userService
      .getProfile()
      .then(({ user: profileUser }) => {
        if (!mounted || !profileUser) return;
        setSidebarUser(prev => ({ ...prev, ...profileUser }));
      })
      .catch(() => {
        // Keep auth context data when profile fetch fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Sidebar should follow profile page identity order.
  const displayName =
    sidebarUser?.username ||
    sidebarUser?.fullName ||
    sidebarUser?.email?.split('@')[0] ||
    'My Account';

  const initials = useMemo(() => {
    const source = sidebarUser?.username || sidebarUser?.fullName || sidebarUser?.email || '';
    if (!source) return '…';

    const cleaned = source.replace(/@/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  }, [sidebarUser]);

  const avatarColor = AVATAR_COLORS[sidebarUser?.avatarColor] || AVATAR_COLORS.terracotta;

  return (
    <aside className={className}>

      {/* ── Logo row ────────────────────────────────────── */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--sidebar-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-icon-pv"><Zap size={14} color="white" /></div>
            <div>
              <div style={{
                fontFamily: 'var(--f-serif)', fontSize: 17,
                color: 'var(--sidebar-text-active)', letterSpacing: '-0.01em', lineHeight: 1,
              }}>
                PromptVault
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--sidebar-text)',
                letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: 2, opacity: 0.6,
              }}>
                AI Manager
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ThemeToggle />
            {onClose && (
              <button
                onClick={onClose}
                className="hamburger-pv"
                aria-label="Close menu"
                style={{ border: 'none', background: 'rgba(240,236,230,0.08)', color: 'var(--sidebar-text)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav links ────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 10px 0', overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <div key={group.label} style={{ marginTop: gi > 0 ? 6 : 2 }}>
            <span className="nav-section-label-pv">{group.label}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
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

      {/* ── Footer: user chip + logout ───────────────────── */}
      <div style={{ padding: 10, borderTop: '1px solid var(--sidebar-divider)' }}>
        <NavLink to="/profile" onClick={onClose} style={{ textDecoration: 'none' }}>
          <div className="user-chip-pv">

            {/* Avatar circle with real initials — never "?" */}
            <div
              className="avatar-pv"
              style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0, background: avatarColor }}
            >
              {initials}
            </div>

            {/* Name + email stacked */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--sidebar-text-active)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}>
                {displayName}
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10.5,
                color: 'var(--sidebar-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
                lineHeight: 1.2,
              }}>
                {sidebarUser?.email}
              </div>
            </div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="nav-item-pv"
          style={{ color: 'rgba(224,88,40,0.65)', marginTop: 1, cursor: 'pointer' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
