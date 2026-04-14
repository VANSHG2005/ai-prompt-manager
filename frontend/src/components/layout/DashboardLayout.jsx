import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette, { useCommandPalette } from '../common/CommandPalette';

const titles = {
  '/dashboard':   'Dashboard',
  '/prompts':     'Prompts',
  '/favorites':   'Favorites',
  '/collections': 'Collections',
  '/explore':     'Explore',
  '/analytics':   'Analytics',
  '/profile':     'Profile Settings',
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || '';
  const { open, setOpen } = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay-pv ${sidebarOpen ? 'open-pv' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar — gets open-pv class on mobile */}
      <Sidebar
        onClose={closeSidebar}
        className={`sidebar-pv ${sidebarOpen ? 'open-pv' : ''}`}
      />

      {/* Main content */}
      <div className="main-pv" style={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title={title}
          onOpenSearch={() => setOpen(true)}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <main>
          <div style={{ padding: '28px', maxWidth: '1200px' }} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
