import { useState, useEffect } from 'react';
import { X, Plus, Tag, Wand2, Sparkles } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';
import { improvePrompt, suggestTags, generateTitle } from '../../services/aiGeneratorService';
import toast from 'react-hot-toast';

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

  // AI inline helpers
  const handleAIImprove = async () => {
    if (!form.promptText.trim()) return toast.error('Enter a prompt first to improve it');
    setAiLoading(l => ({ ...l, improve: true }));
    try {
      const improved = await improvePrompt({ promptText: form.promptText });
      setForm(f => ({ ...f, promptText: improved }));
      toast.success('Prompt improved by AI!', { icon: '⚡' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI improvement failed');
    } finally {
      setAiLoading(l => ({ ...l, improve: false }));
    }
  };

  const handleAISuggestTags = async () => {
    if (!form.promptText.trim()) return toast.error('Enter a prompt first');
    setAiLoading(l => ({ ...l, tags: true }));
    try {
      const suggested = await suggestTags({ promptText: form.promptText, category: form.category });
      const newTags = [...new Set([...form.tags, ...suggested])];
      setForm(f => ({ ...f, tags: newTags }));
      toast.success(`Added ${suggested.length} AI-suggested tags!`, { icon: '🏷️' });
    } catch {
      toast.error('Failed to suggest tags');
    } finally {
      setAiLoading(l => ({ ...l, tags: false }));
    }
  };

  const handleAIGenerateTitle = async () => {
    if (!form.promptText.trim()) return toast.error('Enter a prompt first');
    setAiLoading(l => ({ ...l, title: true }));
    try {
      const title = await generateTitle({ promptText: form.promptText });
      setForm(f => ({ ...f, title }));
      toast.success('Title generated!', { icon: '✨' });
    } catch {
      toast.error('Failed to generate title');
    } finally {
      setAiLoading(l => ({ ...l, title: false }));
    }
  };

  const MiniSpinner = () => (
    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-obsidian-800 border border-obsidian-600 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-700">
          <h2 className="font-display font-bold text-white text-lg">
            {initialData?.promptText ? (initialData.title ? 'Edit Prompt' : 'New Prompt from AI') : initialData ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-obsidian-700 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-400 text-xs font-body">Title <span className="text-red-400">*</span></label>
              <button
                type="button"
                onClick={handleAIGenerateTitle}
                disabled={aiLoading.title}
                className="flex items-center gap-1 text-xs text-neon-purple hover:text-purple-300 font-body transition-colors disabled:opacity-50"
              >
                {aiLoading.title ? <MiniSpinner /> : <Sparkles size={11} />}
                AI title
              </button>
            </div>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="E.g. React code reviewer..."
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category + AI Tool */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs font-body mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-body mb-1.5">AI Tool</label>
              <select value={form.aiTool} onChange={e => setForm(f => ({ ...f, aiTool: e.target.value }))} className="input-field">
                {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Prompt Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-400 text-xs font-body">Prompt Text <span className="text-red-400">*</span></label>
              <button
                type="button"
                onClick={handleAIImprove}
                disabled={aiLoading.improve}
                className="flex items-center gap-1.5 text-xs bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 px-2.5 py-1 rounded-lg font-body transition-all disabled:opacity-50"
              >
                {aiLoading.improve ? <MiniSpinner /> : <Wand2 size={11} />}
                {aiLoading.improve ? 'Improving...' : 'AI Improve'}
              </button>
            </div>
            <textarea
              value={form.promptText}
              onChange={e => setForm(f => ({ ...f, promptText: e.target.value }))}
              rows={6}
              className={`input-field resize-none font-mono text-xs leading-relaxed ${errors.promptText ? 'border-red-500' : ''}`}
              placeholder="Enter your AI prompt here..."
            />
            <div className="flex justify-between mt-1">
              {errors.promptText ? <p className="text-red-400 text-xs">{errors.promptText}</p> : <span />}
              <span className="text-gray-600 text-xs">{form.promptText.length}/10000</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-400 text-xs font-body">Tags</label>
              <button
                type="button"
                onClick={handleAISuggestTags}
                disabled={aiLoading.tags}
                className="flex items-center gap-1 text-xs text-neon-purple hover:text-purple-300 font-body transition-colors disabled:opacity-50"
              >
                {aiLoading.tags ? <MiniSpinner /> : <Sparkles size={11} />}
                AI suggest tags
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="input-field flex-1"
                placeholder="Add tag (press Enter or comma)"
              />
              <button type="button" onClick={addTag} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
                    <Tag size={10} />#{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-gray-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-obsidian-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary min-w-[100px]">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" />
                Saving...
              </span>
            ) : initialData?.title ? 'Update Prompt' : 'Create Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptForm;
