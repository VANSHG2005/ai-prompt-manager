// Navbar.jsx — Mobile-optimized
// Changes:
// - Touch-friendly minimum 44px targets
// - Hamburger always visible on mobile
// - Compact layout with icon-only search on mobile
// - Fluid title sizing
// - Safe area padding support

import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';

const Navbar = ({ title = 'Dashboard', onOpenSearch, onOpenMenu }) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header
      className="topbar-pv"
      role="banner"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {/* Hamburger — touch target >= 44px */}
        <button
          onClick={onOpenMenu}
          className="hamburger-pv"
          aria-label="Open navigation menu"
          aria-expanded={false}
          aria-controls="sidebar-nav"
          style={{ flexShrink: 0 }}
        >
          <Menu size={16} aria-hidden="true" />
        </button>

        {/* Page title — hidden on mobile, shown on tablet+ */}
        <h1
          className="topbar-title topbar-title-page"
          style={{
            fontSize: 'var(--text-xl)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>

        {/* App name — shown on mobile only */}
        <span
          className="topbar-title topbar-title-app"
          style={{
            fontSize: 'var(--text-xl)',
            fontFamily: 'var(--f-serif)',
            letterSpacing: '-0.02em',
          }}
          aria-hidden="true"
        >
          PromptVault
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Full search bar — tablet+ only */}
        <button
          onClick={onOpenSearch}
          className="topbar-search-full"
          aria-label="Search prompts"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontFamily: 'var(--f-sans)',
            fontSize: 13,
            transition: 'all .15s',
            minWidth: 180,
            minHeight: 'var(--touch-target)',
          }}
        >
          <Search size={13} aria-hidden="true" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search prompts…</span>
          <kbd
            aria-label={`Keyboard shortcut: ${isMac ? 'Command' : 'Control'} K`}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: 10,
              fontFamily: 'var(--f-mono)',
              color: 'var(--text-tertiary)',
            }}
          >
            {isMac ? '⌘' : 'Ctrl'}&thinsp;K
          </kbd>
        </button>

        {/* Icon-only search — mobile only */}
        <button
          onClick={onOpenSearch}
          className="topbar-search-icon icon-btn-pv"
          aria-label="Search prompts"
          style={{ display: 'none' }}
        >
          <Search size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
