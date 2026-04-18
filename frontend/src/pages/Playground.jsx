import { useState, useRef, useEffect } from 'react';
import { promptService } from '../services/promptService';
import { Play, Copy, RefreshCw, ChevronDown, Zap, Clock, Hash,
         CheckCheck, AlertCircle, Sparkles, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', tag: 'Recommended' },
  { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',  tag: 'Fast' },
  { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B',  tag: 'Long context' },
  { id: 'gemma2-9b-it',            label: 'Gemma 2 9B',    tag: '' },
];

const Playground = () => {
  const [prompts, setPrompts]     = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [promptText, setPromptText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [model, setModel]         = useState(MODELS[0].id);
  const [temp, setTemp]           = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [output, setOutput]       = useState('');
  const [running, setRunning]     = useState(false);
  const [error, setError]         = useState('');
  const [elapsed, setElapsed]     = useState(null);
  const [tokenCount, setTokenCount] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied]       = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    promptService.getAll({}).then(d => setPrompts(d.prompts || [])).catch(console.error);
  }, []);

  const handleSelectPrompt = id => {
    setSelectedId(id);
    const p = prompts.find(x => x._id === id);
    if (p) setPromptText(p.promptText);
    setOutput(''); setError(''); setElapsed(null); setTokenCount(null);
  };

  const run = async () => {
    const key = localStorage.getItem('groq_api_key');
    if (!key) {
      setError('No Groq API key found. Add one in Profile → API Keys.');
      return;
    }
    if (!promptText.trim()) { toast.error('Enter a prompt first'); return; }

    setRunning(true); setOutput(''); setError(''); setElapsed(null); setTokenCount(null);
    const start = Date.now();

    const finalPrompt = userInput.trim()
      ? `${promptText}\n\n---\nUser input: ${userInput}`
      : promptText;

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model,
          temperature: temp,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: finalPrompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      setOutput(text);
      setElapsed(((Date.now() - start) / 1000).toFixed(2));
      setTokenCount(data.usage?.total_tokens);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Output copied');
  };

  const hasVars = /\{\{[^}]+\}\}/.test(promptText);

  return (
    <>
      {/* Header */}
      <div className="card-pv" style={{ padding: '20px 22px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--sage), var(--accent), var(--amber))' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Sparkles size={16} color="var(--sage)" />
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Prompt Playground</h2>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)' }}>
          Test any prompt live against Groq AI. Tweak temperature and model without leaving the app.
        </p>
      </div>

      <div className="playground-grid-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left: Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Prompt picker */}
          <div className="card-pv" style={{ padding: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Load from library (optional)
            </label>
            <select value={selectedId} onChange={e => handleSelectPrompt(e.target.value)}
              className="select-pv" style={{ width: '100%' }}>
              <option value="">— Choose a saved prompt —</option>
              {prompts.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>

          {/* Prompt text */}
          <div className="card-pv" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Prompt</label>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>{promptText.length} chars</span>
            </div>
            <textarea value={promptText} onChange={e => setPromptText(e.target.value)}
              rows={8} className="textarea-pv"
              style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5, resize: 'vertical' }}
              placeholder="Type or paste your prompt here…" />
            {hasVars && (
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--sage)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} /> Template variables detected
              </p>
            )}
          </div>

          {/* User input (optional) */}
          <div className="card-pv" style={{ padding: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Additional input <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(appended after prompt)</span>
            </label>
            <textarea value={userInput} onChange={e => setUserInput(e.target.value)}
              rows={3} className="textarea-pv" style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5 }}
              placeholder="Paste code, a document excerpt, or any context…" />
          </div>

          {/* Model + settings */}
          <div className="card-pv" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Model</label>
              <button onClick={() => setShowSettings(s => !s)} className="btn-pv btn-ghost-pv" style={{ padding: '4px 8px', fontSize: 12, gap: 4 }}>
                <Settings2 size={11} /> {showSettings ? 'Hide' : 'Settings'}
              </button>
            </div>
            <select value={model} onChange={e => setModel(e.target.value)} className="select-pv" style={{ width: '100%' }}>
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}{m.tag ? ` (${m.tag})` : ''}</option>)}
            </select>

            {showSettings && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-slide-up">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Temperature</label>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--accent)' }}>{temp}</span>
                  </div>
                  <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(parseFloat(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>Precise</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>Creative</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Max tokens</label>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--accent)' }}>{maxTokens}</span>
                  </div>
                  <input type="range" min={50} max={4000} step={50} value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Run button */}
          <button onClick={run} disabled={running} className="btn-pv btn-primary-pv"
            style={{ justifyContent: 'center', display: 'flex', gap: 8, padding: '12px', fontSize: 14 }}>
            {running ? <><span className="mini-spinner-pv" /> Running…</> : <><Play size={14} /> Run prompt</>}
          </button>
        </div>

        {/* Right: Output panel */}
        <div className="card-pv" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
          {/* Output header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Output</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {elapsed && (
                <>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {elapsed}s
                  </span>
                  {tokenCount && (
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Hash size={10} /> {tokenCount} tokens
                    </span>
                  )}
                </>
              )}
              {output && (
                <button onClick={handleCopy} className="btn-pv" style={{ padding: '4px 8px', fontSize: 12, gap: 4 }}>
                  {copied ? <><CheckCheck size={11} color="var(--sage)" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              )}
            </div>
          </div>

          {/* Output body */}
          <div style={{ flex: 1, padding: 18, overflowY: 'auto' }}>
            {running && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="loading-dot-pv" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>Thinking…</p>
              </div>
            )}
            {error && !running && (
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-md)' }}>
                <AlertCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: 'var(--accent)', lineHeight: 1.55 }}>{error}</p>
              </div>
            )}
            {output && !running && (
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }} className="animate-slide-up">
                {output}
              </div>
            )}
            {!output && !running && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, gap: 10 }}>
                <Play size={28} color="var(--text-tertiary)" strokeWidth={1.5} />
                <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)' }}>Hit Run to see output here</p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>Requires Groq API key in Profile → API Keys</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Playground;
