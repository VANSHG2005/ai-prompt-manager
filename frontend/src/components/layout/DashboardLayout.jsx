// frontend/src/components/layout/DashboardLayout.jsx
// KEY CHANGES:
// - Sidebar drawer on mobile with swipe-to-open/close
// - Escape key closes sidebar
// - Body scroll locks when drawer is open
// - Skip-to-content for accessibility
// - Route change auto-closes drawer

import { useState, useCallback, useEffect, useRef } from 'react';
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
  '/playground':  'Playground',
  '/chains':      'Chains',
  '/profile':     'Profile Settings',
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'PromptVault';
  const { open, setOpen } = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar  = useCallback(() => setSidebarOpen(true), []);

  // Auto-close on route change
  useEffect(() => { closeSidebar(); }, [pathname, closeSidebar]);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && sidebarOpen) closeSidebar(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sidebarOpen, closeSidebar]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Swipe gestures
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only trigger if clearly horizontal
    if (Math.abs(dx) < dy * 0.75) return;
    if (dx > 55 && touchStartX.current < 28 && !sidebarOpen) openSidebar();
    if (dx < -55 && sidebarOpen) closeSidebar();
    touchStartX.current = null;
    touchStartY.current = null;
  }, [sidebarOpen, openSidebar, closeSidebar]);

  return (
    <div
      style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: '-100%', left: 16, zIndex: 9999,
          background: 'var(--accent)', color: '#fff', padding: '8px 16px',
          borderRadius: '0 0 8px 8px', fontWeight: 600, textDecoration: 'none',
          transition: 'top .15s',
        }}
        onFocus={e => { e.currentTarget.style.top = '0'; }}
        onBlur={e => { e.currentTarget.style.top = '-100%'; }}
      >
        Skip to main content
      </a>

      {/* Overlay backdrop */}
      <div
        className={`sidebar-overlay-pv ${sidebarOpen ? 'open-pv' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar
        onClose={closeSidebar}
        className={`sidebar-pv ${sidebarOpen ? 'open-pv' : ''}`}
      />

      {/* Main */}
      <div className="main-pv" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Navbar
          title={title}
          onOpenSearch={() => setOpen(true)}
          onOpenMenu={openSidebar}
        />
        <main id="main-content" style={{ flex: 1 }}>
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
