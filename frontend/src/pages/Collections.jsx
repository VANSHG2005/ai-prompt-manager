import { useState, useEffect } from 'react';
import { promptService } from '../services/promptService';
import { CATEGORIES } from '../utils/constants';
import Spinner from '../components/common/Spinner';
import { FolderOpen, Copy, Heart, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Collections = () => {
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    promptService.getAll({})
      .then(d => setAllPrompts(d.prompts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...CATEGORIES.filter(c => allPrompts.some(p => p.category === c))];

  const filtered = allPrompts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags?.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const grouped = {};
  filtered.forEach(p => { if (!grouped[p.category]) grouped[p.category] = []; grouped[p.category].push(p); });

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '22px' }}>
        Browse your prompts organised by category.
      </p>

      {/* Search + category filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div className="search-wrap-pv" style={{ maxWidth: '480px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input-pv"
            placeholder="Search prompts…"
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.map(cat => {
            const count = cat === 'All' ? allPrompts.length : allPrompts.filter(p => p.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px',
                  fontFamily: 'var(--f-sans)', fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer', transition: 'all .15s',
                  background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {cat !== 'All' && <span className={`cat-dot-pv cat-${cat}`} style={{ background: `var(--cat-${cat.toLowerCase()}-dot)` }} />}
                {cat}
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: '11px',
                  padding: '1px 5px', borderRadius: '3px',
                  background: isActive ? 'rgba(255,255,255,0.18)' : 'var(--bg-subtle)',
                  color: isActive ? 'rgba(255,255,255,0.92)' : 'var(--text-tertiary)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}><Spinner size="lg" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state-pv">
          <div className="empty-icon-pv"><FolderOpen size={22} /></div>
          <div className="empty-title-pv">No prompts found</div>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Try a different search or category</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(grouped).map(([category, prompts]) => {
            const isOpen = expanded === category || activeCategory !== 'All';
            return (
              <div key={category} className="card-pv" style={{ overflow: 'hidden' }}>
                {/* Category header */}
                <button
                  onClick={() => setExpanded(isOpen && expanded === category ? null : category)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`cat-pill-pv cat-${category}`}><span className="cat-dot-pv" />{category}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ChevronRight size={15} color="var(--text-tertiary)" style={{ transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {prompts.map((prompt, i) => (
                      <div
                        key={prompt._id}
                        style={{
                          padding: '12px 18px',
                          borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                          transition: 'background .12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{prompt.title}</p>
                              {prompt.isFavorite && <Heart size={11} fill="var(--accent)" color="var(--accent)" />}
                            </div>
                            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {prompt.promptText}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{prompt.aiTool}</span>
                              {prompt.tags?.slice(0, 3).map(t => <span key={t} className="tag-pv">#{t}</span>)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopy(prompt.promptText)}
                            className="icon-btn-pv"
                            style={{ flexShrink: 0 }}
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Collections;
