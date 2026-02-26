import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Sparkles, Heart, User, LogOut, Zap } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/prompts', icon: Sparkles, label: 'Prompts' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-obsidian-900 border-r border-obsidian-700 flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-obsidian-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">PromptVault</h1>
            <p className="text-gray-500 text-xs font-mono mt-0.5">AI Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-obsidian-700 space-y-1">
        <div className="px-3 py-2 mb-1">
          <p className="text-white font-body text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-gray-500 text-xs truncate font-mono">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
