import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 right-0 left-60 h-14 bg-obsidian-900/80 backdrop-blur-sm border-b border-obsidian-700 flex items-center justify-between px-6 z-30">
      <h2 className="font-display font-semibold text-white text-lg">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-obsidian-500 flex items-center justify-center">
            <span className="text-white text-xs font-display font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-gray-300 font-body text-sm hidden sm:block">{user?.fullName}</span>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="btn-secondary flex items-center gap-1.5 text-xs py-1.5"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
