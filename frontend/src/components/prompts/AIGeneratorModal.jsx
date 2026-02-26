import { useState } from 'react';
import {
  X, Sparkles, Wand2, RefreshCw, Copy, CheckCheck,
  ChevronDown, Lightbulb, Zap, RotateCcw, ArrowRight, Tag
} from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';
import {
  generatePrompt, improvePrompt, generateVariations, suggestTags, generateTitle
} from '../../services/aiGeneratorService';
import toast from 'react-hot-toast';

const TONES = ['Professional', 'Casual', 'Creative', 'Technical', 'Friendly', 'Authoritative'];
const LENGTHS = ['Short', 'Medium', 'Detailed', 'Comprehensive'];

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-body rounded-lg transition-all ${
      active
        ? 'bg-neon-blue text-obsidian-950 font-semibold'
        : 'text-gray-400 hover:text-white hover:bg-obsidian-700'
    }`}
  >
    {children}
  </button>
);

const LoadingDots = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

// ── TAB 1: Generate from scratch ──────────────────────────────────────────
const GenerateTab = ({ onUse }) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Coding');
  const [aiTool, setAiTool] = useState('ChatGPT');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const examples = [
    'A React component code reviewer',
    'A blog post about sustainable tech',
    'A photorealistic portrait in studio lighting',
    'A Python script for data analysis',
    'A product launch email campaign',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Please describe what you want to generate');
    setLoading(true);
    setResult('');
    try {
      const text = await generatePrompt({ topic, category, aiTool, tone, length });
      setResult(text);
      toast.success('Prompt generated!', { icon: '✨' });
    } catch (err) {
      toast.error(err.message || 'Generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Topic input */}
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Describe your prompt topic <span className="text-red-400">*</span></label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="E.g. 'A senior developer doing a code review focused on performance and security...'"
        />
        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              className="text-xs text-gray-500 hover:text-neon-blue bg-obsidian-700 hover:bg-obsidian-600 border border-obsidian-500 hover:border-neon-blue/30 rounded-lg px-2.5 py-1 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Config row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">AI Tool</label>
          <select value={aiTool} onChange={e => setAiTool(e.target.value)} className="input-field">
            {AI_TOOLS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)} className="input-field">
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">Length</label>
          <select value={length} onChange={e => setLength(e.target.value)} className="input-field">
            {LENGTHS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <><LoadingDots /><span className="ml-2">Generating...</span></>
        ) : (
          <><Wand2 size={16} /> Generate Prompt</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-400 text-xs">Generated Prompt</label>
            <div className="flex gap-2">
              <button onClick={handleGenerate} className="btn-secondary text-xs py-1 flex items-center gap-1.5">
                <RefreshCw size={12} /> Regenerate
              </button>
              <button onClick={handleCopy} className="btn-secondary text-xs py-1 flex items-center gap-1.5">
                {copied ? <><CheckCheck size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
          <div className="bg-obsidian-900 border border-neon-blue/20 rounded-xl p-4 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
          <button
            onClick={() => onUse({ promptText: result, category, aiTool })}
            className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
          >
            Use this Prompt <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── TAB 2: Improve existing prompt ────────────────────────────────────────
const ImproveTab = ({ onUse }) => {
  const [original, setOriginal] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!original.trim()) return toast.error('Please paste a prompt to improve');
    setLoading(true);
    setResult('');
    try {
      const text = await improvePrompt({ promptText: original, goal });
      setResult(text);
      toast.success('Prompt improved!', { icon: '⚡' });
    } catch (err) {
      toast.error(err.message || 'Improvement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Your existing prompt <span className="text-red-400">*</span></label>
        <textarea
          value={original}
          onChange={e => setOriginal(e.target.value)}
          rows={4}
          className="input-field resize-none font-mono text-xs"
          placeholder="Paste your current prompt here..."
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Improvement goal <span className="text-gray-600">(optional)</span></label>
        <input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          className="input-field"
          placeholder="E.g. 'Make it more specific for senior developers', 'Add output format instructions'..."
        />
      </div>

      <button onClick={handleImprove} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        {loading ? <><LoadingDots /><span className="ml-2">Improving...</span></> : <><Zap size={16} /> Improve Prompt</>}
      </button>

      {result && (
        <div className="animate-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-gray-400 text-xs">Improved Prompt</label>
            <button
              onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="btn-secondary text-xs py-1 flex items-center gap-1.5"
            >
              {copied ? <><CheckCheck size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600 text-xs mb-1.5 font-mono">Original</p>
              <div className="bg-obsidian-900 border border-obsidian-600 rounded-lg p-3 text-xs text-gray-500 font-mono leading-relaxed h-32 overflow-y-auto">
                {original}
              </div>
            </div>
            <div>
              <p className="text-neon-blue text-xs mb-1.5 font-mono">Improved ✨</p>
              <div className="bg-obsidian-900 border border-neon-blue/20 rounded-lg p-3 text-xs text-gray-300 font-mono leading-relaxed h-32 overflow-y-auto">
                {result}
              </div>
            </div>
          </div>
          <button onClick={() => onUse({ promptText: result })} className="btn-primary w-full flex items-center justify-center gap-2">
            Use Improved Version <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── TAB 3: Generate Variations ─────────────────────────────────────────────
const VariationsTab = ({ onUse }) => {
  const [original, setOriginal] = useState('');
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = async () => {
    if (!original.trim()) return toast.error('Please paste a prompt first');
    setLoading(true);
    setVariations([]);
    try {
      const vars = await generateVariations({ promptText: original, count: 3 });
      setVariations(vars);
      toast.success(`${vars.length} variations generated!`, { icon: '🎨' });
    } catch (err) {
      toast.error(err.message || 'Failed to generate variations');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Base prompt <span className="text-red-400">*</span></label>
        <textarea
          value={original}
          onChange={e => setOriginal(e.target.value)}
          rows={3}
          className="input-field resize-none font-mono text-xs"
          placeholder="Enter your base prompt to generate variations..."
        />
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        {loading ? <><LoadingDots /><span className="ml-2">Generating 3 variations...</span></> : <><Lightbulb size={16} /> Generate Variations</>}
      </button>

      {variations.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <p className="text-gray-500 text-xs font-body">Pick the best variation or use all of them</p>
          {variations.map((v, i) => (
            <div key={i} className="bg-obsidian-900 border border-obsidian-600 hover:border-obsidian-400 rounded-xl p-4 transition-colors group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-neon-blue font-mono text-xs">Variation {i + 1}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopy(v, i)} className="btn-secondary text-xs py-1 flex items-center gap-1">
                    {copiedIdx === i ? <CheckCheck size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copiedIdx === i ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={() => onUse({ promptText: v })} className="btn-primary text-xs py-1 flex items-center gap-1">
                    Use <ArrowRight size={11} />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 font-mono text-xs leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── TAB 4: AI Tag & Title Suggester ────────────────────────────────────────
const SmartTagsTab = ({ onUse }) => {
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('Coding');
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!promptText.trim()) return toast.error('Please enter a prompt text');
    setLoading(true);
    setTags([]); setTitle('');
    try {
      const [suggestedTags, suggestedTitle] = await Promise.all([
        suggestTags({ promptText, category }),
        generateTitle({ promptText }),
      ]);
      setTags(suggestedTags);
      setTitle(suggestedTitle);
      toast.success('Tags and title suggested!', { icon: '🏷️' });
    } catch (err) {
      toast.error(err.message || 'Suggestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Prompt text <span className="text-red-400">*</span></label>
        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          rows={4}
          className="input-field resize-none font-mono text-xs"
          placeholder="Paste your prompt to get AI-suggested title and tags..."
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1.5">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <button onClick={handleSuggest} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        {loading ? <><LoadingDots /><span className="ml-2">Analyzing...</span></> : <><Tag size={16} /> Suggest Title & Tags</>}
      </button>

      {(title || tags.length > 0) && (
        <div className="animate-slide-up space-y-3">
          {title && (
            <div className="bg-obsidian-900 border border-neon-blue/20 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-2">Suggested Title</p>
              <p className="text-white font-display font-semibold">{title}</p>
            </div>
          )}
          {tags.length > 0 && (
            <div className="bg-obsidian-900 border border-neon-purple/20 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-3">Suggested Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => onUse({ title, tags, promptText })}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Use These Suggestions <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── MAIN MODAL ─────────────────────────────────────────────────────────────
const AIGeneratorModal = ({ isOpen, onClose, onUse }) => {
  const [activeTab, setActiveTab] = useState('generate');

  if (!isOpen) return null;

  const tabs = [
    { id: 'generate', label: '✨ Generate' },
    { id: 'improve', label: '⚡ Improve' },
    { id: 'variations', label: '🎨 Variations' },
    { id: 'tags', label: '🏷️ Smart Tags' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-obsidian-800 border border-obsidian-600 rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base leading-none">AI Prompt Generator</h2>
              <p className="text-gray-500 font-mono text-xs mt-0.5">Powered by Groq · Llama 3.3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-obsidian-700 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0">
          {tabs.map(t => (
            <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'generate' && <GenerateTab onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'improve' && <ImproveTab onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'variations' && <VariationsTab onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'tags' && <SmartTagsTab onUse={(data) => { onUse(data); onClose(); }} />}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-obsidian-700 bg-obsidian-900/50 rounded-b-2xl">
          <p className="text-gray-600 font-mono text-xs text-center">
            ⚡ Powered by Groq (Free) · Llama 3.3 70B · Get your key at console.groq.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
