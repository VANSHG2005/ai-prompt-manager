import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Heart, Hash, ArrowRight, Clock, Command, X } from 'lucide-react';
import { promptService } from '../../services/promptService';

const RECENT_KEY = 'pv_recent_searches';

const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};
const pushRecent = (q) => {
  if (!q.trim()) return;
  const prev = getRecent().filter(r => r !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
};

const Highlight = ({ text = '', query = '' }) => {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', padding: '0 1px', borderRadius: '2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
};

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState(getRecent);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelected(0);
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await promptService.getAll({ search: q });
      setResults(data.prompts?.slice(0, 8) || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const items = query
    ? results
    : recent.map(r => ({ _isRecent: true, title: r, _id: r }));

  const goTo = (item) => {
    if (item._isRecent) { setQuery(item.title); return; }
    pushRecent(query);
    setRecent(getRecent());
    onClose();
    navigate('/prompts');
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && items[selected]) goTo(items[selected]);
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selected];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  if (!isOpen) return null;

  const catColors = { Coding:'#3B72D4', Writing:'#2A9148', Image:'#8040C8', Video:'#C85C1E', Marketing:'#C42E72', Other:'#857E78' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh', background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '600px', margin: '0 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', overflow: 'hidden', animation: 'slideUp 0.18s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          {loading
            ? <div className="mini-spinner-dark-pv" style={{ flexShrink: 0 }} />
            : <Search size={18} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Search prompts by title, tag, category…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--f-sans)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="icon-btn-pv" style={{ flexShrink: 0 }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'var(--f-mono)', color: 'var(--text-tertiary)', flexShrink: 0 }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
          {!query && recent.length > 0 && (
            <div style={{ padding: '6px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent searches</span>
              <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }} style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-sans)' }}>Clear</button>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
              No prompts found for <strong style={{ color: 'var(--text-secondary)' }}>"{query}"</strong>
            </div>
          )}

          {items.map((item, i) => (
            <button
              key={item._id}
              onClick={() => goTo(item)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
                background: i === selected ? 'var(--bg-muted)' : 'transparent',
                transition: 'background 0.1s', textAlign: 'left',
              }}
              onMouseEnter={() => setSelected(i)}
            >
              {item._isRecent
                ? <Clock size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                : (
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-sm)', background: `${catColors[item.category] || '#807d78'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={14} color={catColors[item.category] || '#807d78'} />
                  </div>
                )
              }

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item._isRecent ? item.title : <Highlight text={item.title} query={query} />}
                </div>
                {!item._isRecent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.category}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>·</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.promptText?.slice(0, 60)}…
                    </span>
                  </div>
                )}
              </div>

              {!item._isRecent && item.isFavorite && <Heart size={12} fill="var(--accent)" color="var(--accent)" style={{ flexShrink: 0 }} />}
              {!item._isRecent && item.tags?.slice(0, 2).map(t => (
                <span key={t} style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', color: 'var(--text-tertiary)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>#{t}</span>
              ))}
              {i === selected && <ArrowRight size={13} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-base)' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', fontSize: '11px', fontFamily: 'var(--f-mono)', color: 'var(--text-secondary)' }}>{key}</kbd>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--f-mono)' }}>{label}</span>
            </div>
          ))}
          {query && results.length > 0 && (
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to wire Cmd+K / Ctrl+K globally
export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
};

export default CommandPalette;
