import { useState, useMemo } from 'react';
import { X, Copy, CheckCheck, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Extracts all {{variable}} tokens from text, deduplicated, ordered
const extractVars = (text) => {
  const matches = [...text.matchAll(/\{\{([^}]+)\}\}/g)];
  const seen = new Set();
  return matches
    .map(m => m[1].trim())
    .filter(v => { if (seen.has(v)) return false; seen.add(v); return true; });
};

// Replaces {{var}} with filled values, highlights unfilled ones
const buildPreview = (text, values, highlight = false) => {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const val = values[key.trim()];
    if (val) return val;
    return highlight ? `【${key.trim()}】` : match;
  });
};

const TemplateVariableModal = ({ isOpen, onClose, prompt }) => {
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);

  const vars = useMemo(() => extractVars(prompt?.promptText || ''), [prompt?.promptText]);

  const preview = useMemo(
    () => buildPreview(prompt?.promptText || '', values, true),
    [prompt?.promptText, values]
  );

  const isComplete = vars.every(v => values[v]?.trim());
  const filledCount = vars.filter(v => values[v]?.trim()).length;

  const handleCopy = async () => {
    const final = buildPreview(prompt.promptText, values);
    await navigator.clipboard.writeText(final);
    setCopied(true);
    toast.success('Filled prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => setValues({});

  if (!isOpen || !prompt) return null;

  const hasVars = vars.length > 0;

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div
        className="modal-pv"
        style={{ maxWidth: '720px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-pv">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--sage-subtle)', border: '1px solid var(--sage-border)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="var(--sage)" />
            </div>
            <div>
              <h2 className="modal-title-pv" style={{ fontSize: '17px' }}>Use Template</h2>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                {prompt.title}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {vars.length > 0 && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: isComplete ? 'var(--sage)' : 'var(--text-tertiary)', background: isComplete ? 'var(--sage-subtle)' : 'var(--bg-subtle)', border: `1px solid ${isComplete ? 'var(--sage-border)' : 'var(--border)'}`, borderRadius: '100px', padding: '3px 10px' }}>
                {filledCount}/{vars.length} filled
              </span>
            )}
            <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body-pv" style={{ display: 'grid', gridTemplateColumns: hasVars ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {/* Left: variable inputs */}
          {hasVars && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Fill in variables
                </span>
                {Object.keys(values).length > 0 && (
                  <button onClick={handleReset} className="btn-pv btn-ghost-pv" style={{ gap: '5px', fontSize: '12px', padding: '4px 8px' }}>
                    <RefreshCw size={11} /> Reset
                  </button>
                )}
              </div>

              {vars.map(v => (
                <div key={v}>
                  <label className="form-label-pv" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', background: 'var(--accent-subtle)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '3px', border: '1px solid var(--accent-border)' }}>
                      {'{{'}{v}{'}}'}
                    </span>
                    {values[v]?.trim() && <CheckCheck size={11} color="var(--sage)" />}
                  </label>
                  <textarea
                    value={values[v] || ''}
                    onChange={e => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                    className="textarea-pv"
                    rows={2}
                    placeholder={`Enter ${v}…`}
                    style={{ fontFamily: 'var(--f-sans)', fontSize: '13px', resize: 'vertical', borderColor: values[v]?.trim() ? 'var(--sage-border)' : undefined }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Right: live preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {hasVars ? 'Live preview' : 'Prompt text'}
            </span>
            <div style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent-border)',
              borderRadius: 'var(--r-sm)', padding: '14px 16px',
              fontFamily: 'var(--f-mono)', fontSize: '12.5px',
              color: 'var(--text-secondary)', lineHeight: 1.7,
              whiteSpace: 'pre-wrap', overflowY: 'auto',
              flex: 1, minHeight: hasVars ? '0' : '200px', maxHeight: '360px',
            }}>
              {preview.split(/【([^】]+)】/).map((part, i) =>
                i % 2 === 1
                  ? <span key={i} style={{ background: 'var(--amber-subtle)', color: 'var(--amber)', border: '1px dashed var(--amber-border)', borderRadius: '3px', padding: '0 3px', fontWeight: 500 }}>{`{{${part}}}`}</span>
                  : <span key={i}>{part}</span>
              )}
            </div>

            {!hasVars && (
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                This prompt has no <code style={{ background: 'var(--bg-muted)', padding: '1px 4px', borderRadius: '3px' }}>{'{{'+'variable'+'}}'}</code> placeholders. Copy it directly.
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer-pv">
          <button className="btn-pv btn-ghost-pv" onClick={onClose}>Cancel</button>
          <button
            onClick={handleCopy}
            className="btn-pv btn-primary-pv"
            style={{ gap: '6px', minWidth: '160px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
          >
            {copied
              ? <><CheckCheck size={13} /> Copied!</>
              : <><Copy size={13} /> {isComplete || !hasVars ? 'Copy filled prompt' : 'Copy as-is'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateVariableModal;
