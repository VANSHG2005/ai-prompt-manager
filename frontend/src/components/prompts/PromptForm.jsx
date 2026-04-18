// PromptForm.jsx — Mobile-optimized
// Changes:
// - Bottom sheet modal on mobile
// - Proper mobile input types
// - Stacked grid (1-col) on mobile
// - Auto-scroll to first error
// - Larger touch targets for tags
// - iOS keyboard-safe padding

import { useState, useEffect, useRef } from 'react';
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
  const firstErrorRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title:      initialData.title      || '',
        promptText: initialData.promptText || '',
        category:   initialData.category   || 'Coding',
        aiTool:     initialData.aiTool     || 'ChatGPT',
        tags:       initialData.tags       || [],
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
    if (!form.title.trim())      errs.title      = 'Title is required';
    if (!form.promptText.trim()) errs.promptText  = 'Prompt text is required';
    setErrors(errs);

    // Scroll to first error
    if (Object.keys(errs).length > 0) {
      setTimeout(() => {
        const el = formRef.current?.querySelector('[data-error="true"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.querySelector('input, textarea')?.focus();
      }, 50);
    }

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
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
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
    <div className="modal-overlay-pv" onClick={onClose} role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit prompt' : 'New prompt'}>
      <div
        className="modal-pv"
        style={{ maxWidth: '680px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-pv">
          <h2 className="modal-title-pv">{isEditing ? 'Edit prompt' : 'New prompt'}</h2>
          <button
            className="icon-btn-pv"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="modal-body-pv" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Title */}
            <div data-error={!!errors.title ? 'true' : 'false'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap', gap: 6 }}>
                <label className="form-label-pv" htmlFor="prompt-title" style={{ marginBottom: 0 }}>
                  Title <span style={{ color: 'var(--accent)' }} aria-hidden="true">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAIGenerateTitle}
                  disabled={aiLoading.title}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--amber)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--f-sans)',
                    minHeight: 36, padding: '0 4px',
                  }}
                  aria-label="Generate title with AI"
                >
                  {aiLoading.title ? <MiniSpinner dark /> : <Sparkles size={11} aria-hidden="true" />}
                  Generate title
                </button>
              </div>
              <input
                id="prompt-title"
                type="text"
                autoComplete="off"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-pv"
                placeholder="Give your prompt a descriptive name…"
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
                style={{ borderColor: errors.title ? 'var(--accent)' : undefined }}
              />
              {errors.title && (
                <p id="title-error" role="alert" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Category + AI Tool — 2-col on desktop, 1-col on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label className="form-label-pv" htmlFor="prompt-category">Category</label>
                <select
                  id="prompt-category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="select-pv"
                  style={{ width: '100%' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label-pv" htmlFor="prompt-tool">AI Tool</label>
                <select
                  id="prompt-tool"
                  value={form.aiTool}
                  onChange={e => setForm(f => ({ ...f, aiTool: e.target.value }))}
                  className="select-pv"
                  style={{ width: '100%' }}
                >
                  {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Prompt text */}
            <div data-error={!!errors.promptText ? 'true' : 'false'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap', gap: 6 }}>
                <label className="form-label-pv" htmlFor="prompt-text" style={{ marginBottom: 0 }}>
                  Prompt text <span style={{ color: 'var(--accent)' }} aria-hidden="true">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAIImprove}
                  disabled={aiLoading.improve}
                  className="btn-ai-pv"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  aria-label="Improve prompt with AI"
                >
                  {aiLoading.improve ? <MiniSpinner dark /> : <Wand2 size={11} aria-hidden="true" />}
                  {aiLoading.improve ? 'Improving…' : 'AI improve'}
                </button>
              </div>
              <textarea
                id="prompt-text"
                value={form.promptText}
                onChange={e => setForm(f => ({ ...f, promptText: e.target.value }))}
                rows={6}
                className="textarea-pv"
                placeholder="Write or paste your prompt here…"
                aria-required="true"
                aria-invalid={!!errors.promptText}
                aria-describedby={errors.promptText ? 'prompt-error' : 'prompt-count'}
                style={{
                  fontFamily: 'var(--f-mono)',
                  borderColor: errors.promptText ? 'var(--accent)' : undefined,
                  /* Ensure doesn't zoom on iOS */
                  fontSize: '1rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.promptText
                  ? <p id="prompt-error" role="alert" style={{ fontSize: 12, color: 'var(--accent)' }}>{errors.promptText}</p>
                  : <span />
                }
                <span id="prompt-count" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }} aria-live="polite">
                  {form.promptText.length}/10000
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap', gap: 6 }}>
                <label className="form-label-pv" htmlFor="tag-input" style={{ marginBottom: 0 }}>Tags</label>
                <button
                  type="button"
                  onClick={handleAISuggestTags}
                  disabled={aiLoading.tags}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--amber)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--f-sans)',
                    minHeight: 36, padding: '0 4px',
                  }}
                  aria-label="Suggest tags with AI"
                >
                  {aiLoading.tags ? <MiniSpinner dark /> : <Sparkles size={11} aria-hidden="true" />}
                  Suggest tags
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="tag-input"
                  type="text"
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="input-pv"
                  placeholder="Add tag — press Enter or comma"
                  aria-label="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-pv"
                  style={{ flexShrink: 0, minWidth: 44 }}
                  aria-label="Add tag"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Tag chips */}
              {form.tags.length > 0 && (
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}
                  role="list"
                  aria-label="Selected tags"
                >
                  {form.tags.map(tag => (
                    <span
                      key={tag}
                      className="tag-pv"
                      role="listitem"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text-tertiary)', cursor: 'pointer',
                          fontSize: 12, padding: '2px',
                          display: 'flex', alignItems: 'center',
                          /* Ensure touch target */
                          minWidth: 20, minHeight: 20,
                          justifyContent: 'center',
                        }}
                      >
                        <X size={10} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer-pv">
            <button
              type="button"
              className="btn-pv"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pv btn-primary-pv"
              disabled={loading}
              style={{
                minWidth: 120,
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              aria-busy={loading}
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
