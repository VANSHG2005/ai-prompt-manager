import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const titles = {
  '/dashboard': 'Dashboard',
  '/prompts': 'Prompts',
  '/favorites': 'Favorites',
  '/collections': 'Collections',
  '/explore': 'Explore',
  '/analytics': 'Analytics',
  '/profile': 'Profile Settings',
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="main-pv">
        <Navbar title={title} />
        <main style={{ minHeight: 'calc(100vh - 52px)' }}>
          <div style={{ padding: '28px', maxWidth: '1200px' }} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
