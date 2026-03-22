import { Heart, Copy, Trash2, Edit2, Copy as Dup } from 'lucide-react';
import toast from 'react-hot-toast';

const PromptListItem = ({ prompt, onEdit, onDelete, onToggleFavorite, onDuplicate, onView }) => {
  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.promptText);
    toast.success('Copied to clipboard');
  };

  return (
    <div
      onClick={() => onView?.(prompt)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      className="animate-slide-up"
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Category dot */}
      <div
        className={`cat-dot-pv cat-${prompt.category}`}
        style={{ width: '8px', height: '8px', flexShrink: 0 }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
          {prompt.title}
        </p>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prompt.promptText.slice(0, 90)}…
        </p>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span className={`cat-pill-pv cat-${prompt.category}`} style={{ display: 'none' }}>
          {prompt.category}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {prompt.aiTool}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          className="icon-btn-pv"
          onClick={e => { e.stopPropagation(); onToggleFavorite(prompt._id); }}
          style={{ color: prompt.isFavorite ? 'var(--accent)' : undefined }}
        >
          <Heart size={13} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-btn-pv" onClick={handleCopy}><Copy size={13} /></button>
        <button className="icon-btn-pv" onClick={e => { e.stopPropagation(); onDuplicate(prompt._id); }}><Dup size={13} /></button>
        <button className="icon-btn-pv" onClick={e => { e.stopPropagation(); onEdit(prompt); }}><Edit2 size={13} /></button>
        <button
          className="icon-btn-pv"
          onClick={e => { e.stopPropagation(); onDelete(prompt._id); }}
          style={{ color: 'var(--accent)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default PromptListItem;
