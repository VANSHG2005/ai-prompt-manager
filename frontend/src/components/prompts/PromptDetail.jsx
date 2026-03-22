import { useState } from 'react';
import { X, Copy, Edit2, Heart, Tag, Calendar, Copy as Duplicate, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const PromptDetail = ({ prompt, isOpen, onClose, onEdit, onToggleFavorite, onDuplicate }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    toast.success('Prompt copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-pv">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="modal-title-pv">{prompt.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className={`cat-pill-pv cat-${prompt.category}`}>
                <span className="cat-dot-pv" />
                {prompt.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                <Bot size={11} /> {prompt.aiTool}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                <Calendar size={11} />
                {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button className="icon-btn-pv" onClick={onClose} style={{ flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-pv" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Prompt text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="section-eyebrow-pv" style={{ marginBottom: 0 }}>Prompt text</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{prompt.promptText.length} chars</span>
            </div>
            <div className="prompt-mono-block-pv">
              {prompt.promptText}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags?.length > 0 && (
            <div>
              <span className="section-eyebrow-pv">Tags</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {prompt.tags.map(tag => (
                  <span key={tag} className="tag-pv">
                    <Tag size={9} style={{ display: 'inline', marginRight: '3px' }} />#{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer-pv" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-pv"
              onClick={() => onToggleFavorite(prompt._id)}
              style={{ color: prompt.isFavorite ? 'var(--accent)' : undefined, borderColor: prompt.isFavorite ? 'rgba(200,71,26,0.3)' : undefined }}
            >
              <Heart size={13} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
              {prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button
              className="btn-pv"
              onClick={() => { onDuplicate(prompt._id); onClose(); }}
            >
              <Duplicate size={13} /> Duplicate
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-pv" onClick={() => { onEdit(prompt); onClose(); }}>
              <Edit2 size={13} /> Edit
            </button>
            <button
              className="btn-primary-pv btn-pv"
              onClick={handleCopy}
              style={{ background: copied ? 'var(--sage)' : undefined, borderColor: copied ? 'var(--sage)' : undefined }}
            >
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;
