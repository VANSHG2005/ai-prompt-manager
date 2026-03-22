import { useState, useEffect } from 'react';
import { X, Plus, Wand2, Sparkles } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';
import { improvePrompt, suggestTags, generateTitle } from '../../services/aiGeneratorService';
import toast from 'react-hot-toast';
import { MiniSpinner } from '../common/Spinner';

const PromptForm = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState({
    title: '', promptText: '', category: 'Coding', aiTool: 'ChatGPT', tags: [], isFavorite: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [aiLoading, setAiLoading] = useState({ improve: false, tags: false, title: false });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        promptText: initialData.promptText || '',
        category: initialData.category || 'Coding',
        aiTool: initialData.aiTool || 'ChatGPT',
        tags: initialData.tags || [],
        isFavorite: initialData.isFavorite || false,
      });
    } else {
      setForm({ title: '', promptText: '', category: 'Coding', aiTool: 'ChatGPT', tags: [], isFavorite: false });
    }
    setErrors({});
    setTagInput('');
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.promptText.trim()) errs.promptText = 'Prompt text is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handleAIImprove = async () => {
    if (!form.promptText.trim()) return toast.error('Enter prompt text first');
    setAiLoading(l => ({ ...l, improve: true }));
    try {
      const improved = await improvePrompt({ promptText: form.promptText });
      setForm(f => ({ ...f, promptText: improved }));
      toast.success('Prompt improved');
    } catch { toast.error('Improvement failed'); }
    finally { setAiLoading(l => ({ ...l, improve: false })); }
  };

  const handleAISuggestTags = async () => {
    if (!form.promptText.trim()) return toast.error('Enter prompt text first');
    setAiLoading(l => ({ ...l, tags: true }));
    try {
      const suggested = await suggestTags({ promptText: form.promptText, category: form.category });
      setForm(f => ({ ...f, tags: [...new Set([...f.tags, ...suggested])] }));
      toast.success(`${suggested.length} tags suggested`);
    } catch { toast.error('Tag suggestion failed'); }
    finally { setAiLoading(l => ({ ...l, tags: false })); }
  };

  const handleAIGenerateTitle = async () => {
    if (!form.promptText.trim()) return toast.error('Enter prompt text first');
    setAiLoading(l => ({ ...l, title: true }));
    try {
      const title = await generateTitle({ promptText: form.promptText });
      setForm(f => ({ ...f, title }));
      toast.success('Title generated');
    } catch { toast.error('Title generation failed'); }
    finally { setAiLoading(l => ({ ...l, title: false })); }
  };

  if (!isOpen) return null;

  const isEditing = !!initialData?.title;

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-pv">
          <h2 className="modal-title-pv">{isEditing ? 'Edit prompt' : 'New prompt'}</h2>
          <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body-pv" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label className="form-label-pv">Title <span style={{ color: 'var(--accent)' }}>*</span></label>
                <button
                  type="button"
                  onClick={handleAIGenerateTitle}
                  disabled={aiLoading.title}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-sans)' }}
                >
                  {aiLoading.title ? <MiniSpinner dark /> : <Sparkles size={11} />}
                  Generate title
                </button>
              </div>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-pv"
                placeholder="Give your prompt a descriptive name…"
                style={{ borderColor: errors.title ? 'var(--accent)' : undefined }}
              />
              {errors.title && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>{errors.title}</p>}
            </div>

            {/* Category + AI Tool */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label-pv">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select-pv" style={{ width: '100%' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label-pv">AI Tool</label>
                <select value={form.aiTool} onChange={e => setForm(f => ({ ...f, aiTool: e.target.value }))} className="select-pv" style={{ width: '100%' }}>
                  {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Prompt Text */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label className="form-label-pv">Prompt text <span style={{ color: 'var(--accent)' }}>*</span></label>
                <button
                  type="button"
                  onClick={handleAIImprove}
                  disabled={aiLoading.improve}
                  className="btn-ai-pv"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {aiLoading.improve ? <MiniSpinner dark /> : <Wand2 size={11} />}
                  {aiLoading.improve ? 'Improving…' : 'AI improve'}
                </button>
              </div>
              <textarea
                value={form.promptText}
                onChange={e => setForm(f => ({ ...f, promptText: e.target.value }))}
                rows={7}
                className="textarea-pv"
                placeholder="Write or paste your prompt here…"
                style={{ fontFamily: 'var(--f-mono)', fontSize: '13px', borderColor: errors.promptText ? 'var(--accent)' : undefined }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.promptText
                  ? <p style={{ fontSize: '12px', color: 'var(--accent)' }}>{errors.promptText}</p>
                  : <span />
                }
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {form.promptText.length}/10000
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label className="form-label-pv">Tags</label>
                <button
                  type="button"
                  onClick={handleAISuggestTags}
                  disabled={aiLoading.tags}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-sans)' }}
                >
                  {aiLoading.tags ? <MiniSpinner dark /> : <Sparkles size={11} />}
                  Suggest tags
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="input-pv"
                  placeholder="Add tag — press Enter or comma"
                />
                <button type="button" onClick={addTag} className="btn-pv" style={{ flexShrink: 0 }}>
                  <Plus size={14} />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                  {form.tags.map(tag => (
                    <span
                      key={tag}
                      className="tag-pv"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', padding: '0 1px', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer-pv">
            <button type="button" className="btn-pv" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-pv btn-primary-pv"
              disabled={loading}
              style={{ minWidth: '120px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {loading ? <MiniSpinner /> : null}
              {loading ? 'Saving…' : isEditing ? 'Update prompt' : 'Create prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptForm;
