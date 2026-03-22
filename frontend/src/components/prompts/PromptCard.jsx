import { useState } from 'react';
import { Heart, Copy, Trash2, Edit2, Copy as Duplicate, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../../utils/constants';

const PromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite, onDuplicate, onView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const handleCopy = async (e) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(prompt.promptText);
    toast.success('Copied to clipboard');
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    setFavLoading(true);
    await onToggleFavorite(prompt._id);
    setFavLoading(false);
  };

  const truncate = (text, max = 120) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  return (
    <div
      className="prompt-card-pv animate-slide-up"
      onClick={() => onView?.(prompt)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`cat-pill-pv cat-${prompt.category}`}>
            <span className="cat-dot-pv" />
            {prompt.category}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            {prompt.aiTool}
          </span>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className={`icon-btn-pv ${prompt.isFavorite ? '' : ''}`}
            onClick={handleFavorite}
            disabled={favLoading}
            title={prompt.isFavorite ? 'Remove favorite' : 'Add favorite'}
            style={{ color: prompt.isFavorite ? 'var(--accent)' : undefined }}
          >
            <Heart size={14} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn-pv"
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: '32px', zIndex: 20,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: '4px', minWidth: '160px',
                  boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.15s ease',
                }}>
                  {[
                    { label: 'Edit', icon: Edit2, action: () => { onEdit(prompt); setShowMenu(false); } },
                    { label: 'Duplicate', icon: Duplicate, action: () => { onDuplicate(prompt._id); setShowMenu(false); } },
                    { label: 'Copy text', icon: Copy, action: (e) => { handleCopy(); setShowMenu(false); } },
                  ].map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '8px 10px', background: 'none', border: 'none',
                        borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--f-sans)',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Icon size={13} color="var(--text-tertiary)" />
                      {label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { onDelete(prompt._id); setShowMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '8px 10px', background: 'none', border: 'none',
                      borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--accent)',
                      cursor: 'pointer', fontFamily: 'var(--f-sans)',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
        {prompt.title}
      </div>

      {/* Text preview */}
      <div className="prompt-preview-pv">
        {truncate(prompt.promptText)}
      </div>

      {/* Tags */}
      {prompt.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {prompt.tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag-pv">#{tag}</span>
          ))}
          {prompt.tags.length > 4 && (
            <span className="tag-pv">+{prompt.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          className="icon-btn-pv"
          onClick={e => { e.stopPropagation(); handleCopy(); }}
          title="Copy prompt"
        >
          <Copy size={13} />
        </button>
      </div>
    </div>
  );
};

export default PromptCard;
