import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Search, Menu } from 'lucide-react';

const Navbar = ({ title = 'Dashboard', onOpenSearch, onOpenMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="topbar-pv">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onOpenMenu} className="hamburger-pv" aria-label="Open navigation menu">
          <Menu size={16} />
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Full search bar — hidden on mobile */}
        <button
          onClick={onOpenSearch}
          className="topbar-search-full"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: 'var(--bg-subtle)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            fontFamily: 'var(--f-sans)', fontSize: 13,
            transition: 'all .15s', minWidth: 180,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search prompts…</span>
          <kbd style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--text-tertiary)' }}>
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>

        {/* Icon-only search — mobile only */}
        <button onClick={onOpenSearch} className="topbar-search-icon icon-btn-pv" aria-label="Search" style={{ display: 'none' }}>
          <Search size={16} />
        </button>

      </div>
    </header>
  );
};

export default Navbar;
