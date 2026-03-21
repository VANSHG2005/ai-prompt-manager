import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Sparkles, Heart, User, LogOut, Zap,
  BarChart2, FolderOpen, Compass
} from 'lucide-react';

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
      { to: '/analytics',   icon: BarChart2, label: 'Analytics' },
      { to: '/profile',     icon: User,      label: 'Profile' },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-obsidian-900 border-r border-obsidian-700 flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-obsidian-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">PromptVault</h1>
            <p className="text-gray-500 text-xs font-mono mt-0.5">AI Manager</p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-obsidian-700 space-y-1">
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 border border-obsidian-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-display font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate leading-none">{user?.fullName}</p>
            <p className="text-gray-600 text-[10px] font-mono truncate mt-0.5">{user?.email}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
