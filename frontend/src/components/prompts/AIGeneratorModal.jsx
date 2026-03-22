import { useState } from 'react';
import { X, Wand2, RefreshCw, Copy, CheckCheck, Lightbulb, Zap, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';
import { generatePrompt, improvePrompt, generateVariations, suggestTags, generateTitle } from '../../services/aiGeneratorService';
import toast from 'react-hot-toast';
import { LoadingDots, MiniSpinner } from '../common/Spinner';

const TONES = ['Professional', 'Casual', 'Creative', 'Technical', 'Friendly', 'Authoritative'];
const LENGTHS = ['Short', 'Medium', 'Detailed', 'Comprehensive'];

const ResultBlock = ({ text, onRegenerate, onCopy, copied, onUse }) => (
  <div className="animate-slide-up">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span className="section-eyebrow-pv" style={{ marginBottom: 0 }}>Generated prompt</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {onRegenerate && (
          <button className="btn-pv" style={{ padding: '5px 10px', fontSize: '12px', gap: '5px' }} onClick={onRegenerate}>
            <RefreshCw size={12} /> Regenerate
          </button>
        )}
        <button className="btn-pv" style={{ padding: '5px 10px', fontSize: '12px', gap: '5px' }} onClick={onCopy}>
          {copied ? <><CheckCheck size={12} style={{ color: 'var(--sage)' }} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
    </div>
    <div className="prompt-mono-block-pv" style={{ marginBottom: '12px', maxHeight: '180px', overflowY: 'auto' }}>
      {text}
    </div>
    <button
      className="btn-pv btn-primary-pv"
      onClick={onUse}
      style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '6px' }}
    >
      Use this prompt <ArrowRight size={14} />
    </button>
  </div>
);

const GenerateTab = ({ onUse }) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Coding');
  const [aiTool, setAiTool] = useState('ChatGPT');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const examples = ['A React component reviewer', 'Blog post about sustainable tech', 'Product launch email', 'Python data analysis script'];

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Describe what you want to generate');
    setLoading(true); setResult('');
    try {
      const text = await generatePrompt({ topic, category, aiTool, tone, length });
      setResult(text);
    } catch { toast.error('Generation failed — check API key'); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label-pv">Describe your prompt <span style={{ color: 'var(--accent)' }}>*</span></label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          rows={3}
          className="textarea-pv"
          placeholder="A senior developer reviewing React code for performance and security…"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '3px 8px', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[['Category', 'category', CATEGORIES], ['AI Tool', 'aiTool', AI_TOOLS]].map(([label, key, opts]) => (
          <div key={key}>
            <label className="form-label-pv">{label}</label>
            <select value={key === 'category' ? category : aiTool} onChange={e => key === 'category' ? setCategory(e.target.value) : setAiTool(e.target.value)} className="select-pv" style={{ width: '100%' }}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {[['Tone', 'tone', TONES, tone, setTone], ['Length', 'length', LENGTHS, length, setLength]].map(([label, key, opts, val, setter]) => (
          <div key={key}>
            <label className="form-label-pv">{label}</label>
            <select value={val} onChange={e => setter(e.target.value)} className="select-pv" style={{ width: '100%' }}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-pv btn-primary-pv"
        style={{ justifyContent: 'center', display: 'flex', gap: '8px', padding: '10px' }}
      >
        {loading ? <><LoadingDots /> <span style={{ marginLeft: '8px' }}>Generating…</span></> : <><Wand2 size={14} /> Generate prompt</>}
      </button>

      {result && (
        <ResultBlock text={result} onRegenerate={handleGenerate} onCopy={handleCopy} copied={copied} onUse={() => onUse({ promptText: result, category, aiTool })} />
      )}
    </div>
  );
};

const ImproveTab = ({ onUse }) => {
  const [original, setOriginal] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!original.trim()) return toast.error('Paste a prompt to improve');
    setLoading(true); setResult('');
    try { const text = await improvePrompt({ promptText: original, goal }); setResult(text); }
    catch { toast.error('Improvement failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label className="form-label-pv">Existing prompt <span style={{ color: 'var(--accent)' }}>*</span></label>
        <textarea value={original} onChange={e => setOriginal(e.target.value)} rows={4} className="textarea-pv" placeholder="Paste your current prompt…" style={{ fontFamily: 'var(--f-mono)', fontSize: '13px' }} />
      </div>
      <div>
        <label className="form-label-pv">Improvement goal <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
        <input value={goal} onChange={e => setGoal(e.target.value)} className="input-pv" placeholder="Make it more specific for senior developers…" />
      </div>
      <button onClick={handleImprove} disabled={loading} className="btn-pv btn-ai-pv" style={{ justifyContent: 'center', display: 'flex', gap: '8px', padding: '10px' }}>
        {loading ? <><LoadingDots /><span style={{ marginLeft: '8px' }}>Improving…</span></> : <><Zap size={14} /> Improve prompt</>}
      </button>
      {result && (
        <ResultBlock text={result} onCopy={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} copied={copied} onUse={() => onUse({ promptText: result })} />
      )}
    </div>
  );
};

const VariationsTab = ({ onUse }) => {
  const [original, setOriginal] = useState('');
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = async () => {
    if (!original.trim()) return toast.error('Paste a prompt first');
    setLoading(true); setVariations([]);
    try { const vars = await generateVariations({ promptText: original, count: 3 }); setVariations(vars); }
    catch { toast.error('Generation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label className="form-label-pv">Base prompt <span style={{ color: 'var(--accent)' }}>*</span></label>
        <textarea value={original} onChange={e => setOriginal(e.target.value)} rows={3} className="textarea-pv" placeholder="Enter your base prompt…" style={{ fontFamily: 'var(--f-mono)', fontSize: '13px' }} />
      </div>
      <button onClick={handleGenerate} disabled={loading} className="btn-pv btn-primary-pv" style={{ justifyContent: 'center', display: 'flex', gap: '8px', padding: '10px' }}>
        {loading ? <><LoadingDots /><span style={{ marginLeft: '8px' }}>Generating 3 variations…</span></> : <><Lightbulb size={14} /> Generate variations</>}
      </button>
      {variations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-slide-up">
          {variations.map((v, i) => (
            <div key={i} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>Variation {i + 1}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-pv" style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }} onClick={async () => { await navigator.clipboard.writeText(v); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 2000); }}>
                    {copiedIdx === i ? <CheckCheck size={11} color="var(--sage)" /> : <Copy size={11} />}
                  </button>
                  <button className="btn-pv btn-primary-pv" style={{ padding: '4px 10px', fontSize: '12px', gap: '4px' }} onClick={() => onUse({ promptText: v })}>
                    Use <ArrowRight size={11} />
                  </button>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SmartTagsTab = ({ onUse }) => {
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('Coding');
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!promptText.trim()) return toast.error('Enter prompt text first');
    setLoading(true); setTags([]); setTitle('');
    try {
      const [suggestedTags, suggestedTitle] = await Promise.all([suggestTags({ promptText, category }), generateTitle({ promptText })]);
      setTags(suggestedTags); setTitle(suggestedTitle);
    } catch { toast.error('Suggestion failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label className="form-label-pv">Prompt text <span style={{ color: 'var(--accent)' }}>*</span></label>
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={4} className="textarea-pv" placeholder="Paste your prompt to get title and tag suggestions…" style={{ fontFamily: 'var(--f-mono)', fontSize: '13px' }} />
      </div>
      <div>
        <label className="form-label-pv">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="select-pv" style={{ width: '100%' }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button onClick={handleSuggest} disabled={loading} className="btn-pv btn-ai-pv" style={{ justifyContent: 'center', display: 'flex', gap: '8px', padding: '10px' }}>
        {loading ? <><LoadingDots /><span style={{ marginLeft: '8px' }}>Analyzing…</span></> : <><Tag size={14} /> Suggest title & tags</>}
      </button>
      {(title || tags.length > 0) && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {title && (
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <span className="section-eyebrow-pv" style={{ marginBottom: '6px' }}>Suggested title</span>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
            </div>
          )}
          {tags.length > 0 && (
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <span className="section-eyebrow-pv" style={{ marginBottom: '8px' }}>Suggested tags</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {tags.map(tag => <span key={tag} className="tag-pv">#{tag}</span>)}
              </div>
            </div>
          )}
          <button className="btn-pv btn-primary-pv" onClick={() => onUse({ title, tags, promptText })} style={{ justifyContent: 'center', display: 'flex', gap: '6px' }}>
            Use these suggestions <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const AIGeneratorModal = ({ isOpen, onClose, onUse }) => {
  const [activeTab, setActiveTab] = useState('generate');

  if (!isOpen) return null;

  const tabs = [
    { id: 'generate', label: 'Generate' },
    { id: 'improve',  label: 'Improve' },
    { id: 'variations', label: 'Variations' },
    { id: 'tags',     label: 'Smart tags' },
  ];

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-pv">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--amber-subtle)', border: '1px solid rgba(138,106,26,0.2)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="var(--amber)" />
            </div>
            <div>
              <div className="modal-title-pv" style={{ fontSize: '17px' }}>AI Prompt Generator</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '1px' }}>Powered by Groq · Llama 3.3</div>
            </div>
          </div>
          <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: '12px 24px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '2px' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`ai-tab-pv ${activeTab === t.id ? 'active' : ''}`}
              style={{ paddingBottom: '12px', borderRadius: '0', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent', background: 'none' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body-pv">
          {activeTab === 'generate'   && <GenerateTab onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'improve'    && <ImproveTab  onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'variations' && <VariationsTab onUse={(data) => { onUse(data); onClose(); }} />}
          {activeTab === 'tags'       && <SmartTagsTab onUse={(data) => { onUse(data); onClose(); }} />}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Free API via Groq — get your key at console.groq.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
