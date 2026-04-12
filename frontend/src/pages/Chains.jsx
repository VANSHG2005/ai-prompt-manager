import { useState, useEffect } from 'react';
import { promptService } from '../services/promptService';
import {
  Link2, Plus, Play, ChevronRight, ChevronDown,
  Copy, CheckCheck, AlertCircle, ArrowDown, Save,
  RefreshCw, Clock, X, Trash2, Settings2, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────
   HELPER — replace {{variable}} tokens in prompt text
───────────────────────────────────────────────────── */
const interpolate = (text, vars) =>
  text.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] ?? `{{${key.trim()}}}`);

/* ─────────────────────────────────────────────────────
   STEP CARD  — individual step in a chain
───────────────────────────────────────────────────── */
const StepCard = ({ step, index, total, onUpdate, onRemove, prompts }) => {
  const [expanded, setExpanded] = useState(index === 0);

  const statusColor = step.done
    ? 'var(--sage)'
    : step.running
    ? 'var(--accent)'
    : 'var(--border-strong)';

  const statusBg = step.done
    ? 'var(--sage)'
    : step.running
    ? 'var(--accent)'
    : 'var(--bg-muted)';

  return (
    <div className="card-pv" style={{ overflow: 'hidden' }}>

      {/* Step header — click to expand/collapse */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', cursor: 'pointer',
          background: step.running
            ? 'var(--sage-subtle)'
            : step.done
            ? 'var(--bg-subtle)'
            : 'transparent',
          transition: 'background .15s',
        }}
      >
        {/* Step number / status icon */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: statusBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${statusColor}`,
          transition: 'all .2s',
        }}>
          {step.done ? (
            <CheckCheck size={12} color="white" />
          ) : step.running ? (
            <span className="mini-spinner-pv" style={{ width: 10, height: 10 }} />
          ) : (
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 10,
              fontWeight: 600, color: 'var(--text-tertiary)',
            }}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Step title (inline editable) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={step.title}
            onChange={e => { e.stopPropagation(); onUpdate({ ...step, title: e.target.value }); }}
            onClick={e => e.stopPropagation()}
            className="input-pv"
            placeholder={`Step ${index + 1} title…`}
            style={{
              height: 28, fontSize: 13, fontWeight: 600,
              border: 'none', background: 'transparent',
              padding: 0, outline: 'none', boxShadow: 'none',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Right controls */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {step.elapsed && (
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 10,
              color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <Clock size={9} />{step.elapsed}s
            </span>
          )}
          {step.output && (
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 9,
              background: 'var(--sage-subtle)', color: 'var(--sage)',
              border: '1px solid var(--sage-border)',
              borderRadius: 3, padding: '1px 5px',
            }}>
              done
            </span>
          )}
          <button
            onClick={() => onRemove(step.id)}
            className="icon-btn-pv"
            style={{ color: 'var(--accent)' }}
            disabled={total <= 1}
            title="Remove step"
          >
            <X size={13} />
          </button>
          {expanded
            ? <ChevronDown size={14} color="var(--text-tertiary)" />
            : <ChevronRight size={14} color="var(--text-tertiary)" />
          }
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>

          {/* Library picker */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)',
              marginBottom: 5, fontFamily: 'var(--f-mono)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <BookOpen size={10} /> Load from library
            </label>
            <select
              value={step.promptId || ''}
              onChange={e => {
                const p = prompts.find(x => x._id === e.target.value);
                onUpdate({ ...step, promptId: e.target.value, prompt: p?.promptText || step.prompt });
              }}
              className="select-pv"
              style={{ width: '100%' }}
            >
              <option value="">— Choose a saved prompt to pre-fill —</option>
              {prompts.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Prompt textarea */}
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 500,
            color: 'var(--text-tertiary)', marginBottom: 5,
            fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Prompt text
          </label>
          <textarea
            value={step.prompt}
            onChange={e => onUpdate({ ...step, prompt: e.target.value })}
            rows={5}
            className="textarea-pv"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 12, resize: 'vertical' }}
            placeholder={
              index === 0
                ? 'Write your prompt. Use {{user_input}} to reference initial user context.'
                : `Use {{prev_output}} to reference the output from step ${index}. Use {{user_input}} for the original input.`
            }
          />

          {/* Variable hint */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            marginTop: 6, alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>
              Available variables:
            </span>
            <code style={{ fontFamily: 'var(--f-mono)', fontSize: 10, background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, color: 'var(--accent)' }}>
              {'{{user_input}}'}
            </code>
            {index > 0 && (
              <code style={{ fontFamily: 'var(--f-mono)', fontSize: 10, background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 3, color: 'var(--sage)' }}>
                {'{{prev_output}}'}
              </code>
            )}
          </div>

          {/* Step output (shown after execution) */}
          {step.output && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{
                  fontSize: 11, fontWeight: 500, color: 'var(--sage)',
                  fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  Step output
                </label>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(step.output);
                    toast.success('Step output copied');
                  }}
                  className="btn-pv"
                  style={{ padding: '3px 8px', fontSize: 11, gap: 4 }}
                >
                  <Copy size={10} /> Copy
                </button>
              </div>
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--sage)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 12px',
                fontFamily: 'var(--f-mono)', fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.65, whiteSpace: 'pre-wrap',
                maxHeight: 220, overflowY: 'auto',
              }}>
                {step.output}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arrow connector between steps */}
      {index < total - 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '6px 0', background: 'var(--bg-base)',
        }}>
          <ArrowDown size={16} color="var(--text-tertiary)" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   SAVED CHAINS LIST
───────────────────────────────────────────────────── */
const SavedChainsPanel = ({ savedChains, onLoad, onDelete }) => {
  if (!savedChains.length) return (
    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>
      No saved chains yet. Build a chain and save it to see it here.
    </p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {savedChains.map(c => (
        <div
          key={c.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
          }}
        >
          <Link2 size={12} color="var(--text-tertiary)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.name}
            </p>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>
              {c.steps.length} step{c.steps.length !== 1 ? 's' : ''} · {new Date(c.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => onLoad(c)}
            className="btn-pv"
            style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
          >
            Load
          </button>
          <button
            onClick={() => onDelete(c.id)}
            className="icon-btn-pv"
            style={{ color: 'var(--accent)', flexShrink: 0 }}
            title="Delete saved chain"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   MAIN CHAINS PAGE
───────────────────────────────────────────────────── */
const Chains = () => {
  const [prompts, setPrompts] = useState([]);
  const [chainName, setChainName] = useState('My Chain');
  const [userInput, setUserInput] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [steps, setSteps] = useState([
    {
      id: crypto.randomUUID(),
      title: 'Step 1',
      prompt: '',
      promptId: '',
      output: '',
      running: false,
      done: false,
      elapsed: null,
    },
  ]);
  const [running, setRunning] = useState(false);
  const [finalOutput, setFinalOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedChains, setSavedChains] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pv_chains') || '[]'); }
    catch { return []; }
  });

  const MODELS = [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recommended)' },
    { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B (Fastest)' },
    { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B (Long context)' },
    { id: 'gemma2-9b-it',            label: 'Gemma 2 9B' },
  ];

  useEffect(() => {
    promptService.getAll({})
      .then(d => setPrompts(d.prompts || []))
      .catch(console.error);
  }, []);

  /* ── Step management ── */
  const addStep = () => setSteps(s => [
    ...s,
    {
      id: crypto.randomUUID(),
      title: `Step ${s.length + 1}`,
      prompt: '', promptId: '',
      output: '', running: false, done: false, elapsed: null,
    },
  ]);

  const updateStep = updated => setSteps(s => s.map(x => x.id === updated.id ? updated : x));
  const removeStep = id => setSteps(s => s.filter(x => x.id !== id));
  const resetSteps = () => setSteps(s => s.map(x => ({
    ...x, output: '', running: false, done: false, elapsed: null,
  })));

  /* ── Run the chain ── */
  const runChain = async () => {
    const key = localStorage.getItem('groq_api_key');
    if (!key) {
      toast.error('Add your Groq API key in Profile → API Keys');
      return;
    }
    if (steps.some(s => !s.prompt.trim())) {
      toast.error('Every step needs a prompt');
      return;
    }

    setRunning(true);
    setFinalOutput('');
    resetSteps();
    let prevOutput = '';

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setSteps(s => s.map(x => x.id === step.id ? { ...x, running: true } : x));
      const start = Date.now();

      try {
        const resolved = interpolate(step.prompt, {
          user_input: userInput,
          prev_output: prevOutput,
        });

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 1500,
            temperature: 0.7,
            messages: [{ role: 'user', content: resolved }],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API error ${res.status}`);
        }

        const data = await res.json();
        const output  = data.choices?.[0]?.message?.content || '';
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        prevOutput = output;

        setSteps(s => s.map(x =>
          x.id === step.id
            ? { ...x, running: false, done: true, output, elapsed }
            : x
        ));
      } catch (err) {
        setSteps(s => s.map(x => x.id === step.id ? { ...x, running: false } : x));
        toast.error(`Step ${i + 1} failed: ${err.message}`);
        setRunning(false);
        return;
      }
    }

    setFinalOutput(prevOutput);
    setRunning(false);
    toast.success('Chain completed successfully!');
  };

  /* ── Save / load / delete chains ── */
  const saveChain = () => {
    const chain = {
      id: crypto.randomUUID(),
      name: chainName,
      model,
      steps: steps.map(({ id, title, prompt, promptId }) => ({ id, title, prompt, promptId })),
      savedAt: new Date().toISOString(),
    };
    const next = [chain, ...savedChains.filter(c => c.name !== chainName)].slice(0, 20);
    setSavedChains(next);
    localStorage.setItem('pv_chains', JSON.stringify(next));
    toast.success(`Chain "${chainName}" saved`);
  };

  const loadChain = chain => {
    setChainName(chain.name);
    setModel(chain.model || 'llama-3.3-70b-versatile');
    setSteps(chain.steps.map(s => ({
      ...s,
      output: '', running: false, done: false, elapsed: null,
    })));
    setFinalOutput('');
    setShowLoad(false);
    toast.success(`Loaded "${chain.name}"`);
  };

  const deleteChain = id => {
    const next = savedChains.filter(c => c.id !== id);
    setSavedChains(next);
    localStorage.setItem('pv_chains', JSON.stringify(next));
    toast.success('Chain deleted');
  };

  const handleCopyFinal = async () => {
    await navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Final output copied');
  };

  const completedCount = steps.filter(s => s.done).length;
  const totalElapsed   = steps.reduce((sum, s) => sum + (parseFloat(s.elapsed) || 0), 0).toFixed(1);

  return (
    <>
      {/* ─── Header card ─────────────────────────────────── */}
      <div className="card-pv" style={{ padding: '20px 22px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), #E8885A, var(--amber))' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Link2 size={16} color="var(--accent)" />
              <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Prompt Chains
              </h2>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', maxWidth: 500 }}>
              Build sequential AI pipelines — each step's output automatically flows into the next.
              Use <code style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 3 }}>{'{{prev_output}}'}</code> to pass results forward.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setShowLoad(s => !s); setShowSettings(false); }}
              className={`btn-pv ${showLoad ? 'btn-sage-pv' : ''}`}
              style={{ gap: 5, fontSize: 12.5 }}
            >
              <RefreshCw size={12} />
              {showLoad ? 'Hide saved' : `Load saved (${savedChains.length})`}
            </button>
            <button
              onClick={() => { setShowSettings(s => !s); setShowLoad(false); }}
              className={`btn-pv ${showSettings ? 'btn-sage-pv' : ''}`}
              style={{ gap: 5, fontSize: 12.5 }}
            >
              <Settings2 size={12} /> Settings
            </button>
            <button
              onClick={saveChain}
              className="btn-pv btn-primary-pv"
              style={{ gap: 5, fontSize: 12.5 }}
            >
              <Save size={12} /> Save chain
            </button>
          </div>
        </div>
      </div>

      {/* ─── Saved chains panel ──────────────────────────── */}
      {showLoad && (
        <div className="card-pv animate-slide-up" style={{ padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Saved chains
          </p>
          <SavedChainsPanel
            savedChains={savedChains}
            onLoad={loadChain}
            onDelete={deleteChain}
          />
        </div>
      )}

      {/* ─── Settings panel ──────────────────────────────── */}
      {showSettings && (
        <div className="card-pv animate-slide-up" style={{ padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Chain settings</p>
          <div>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 6,
            }}>AI Model (applied to all steps)</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="select-pv" style={{ width: '100%', maxWidth: 360 }}>
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ─── Chain name + user input ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{
            display: 'block', fontSize: 11.5, fontWeight: 500,
            color: 'var(--text-secondary)', marginBottom: 5,
          }}>
            Chain name
          </label>
          <input
            value={chainName}
            onChange={e => setChainName(e.target.value)}
            className="input-pv"
            placeholder="My awesome chain…"
          />
        </div>
        <div>
          <label style={{
            display: 'block', fontSize: 11.5, fontWeight: 500,
            color: 'var(--text-secondary)', marginBottom: 5,
          }}>
            User input{' '}
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontFamily: 'var(--f-mono)', fontSize: 10 }}>
              (available as {'{{user_input}}'} in all steps)
            </span>
          </label>
          <input
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            className="input-pv"
            placeholder="A topic, document, code snippet, or any context…"
          />
        </div>
      </div>

      {/* ─── Progress bar (while running) ────────────────── */}
      {running && (
        <div style={{ marginBottom: 16 }} className="animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
              Running chain…
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)' }}>
              {completedCount}/{steps.length} steps complete
            </span>
          </div>
          <div className="bar-track-pv" style={{ height: 6 }}>
            <div className="bar-fill-pv" style={{
              width: `${(completedCount / steps.length) * 100}%`,
              background: 'var(--accent)',
              transition: 'width .4s ease',
            }} />
          </div>
        </div>
      )}

      {/* ─── Steps list ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            total={steps.length}
            onUpdate={updateStep}
            onRemove={removeStep}
            prompts={prompts}
          />
        ))}
      </div>

      {/* ─── Add step + Run buttons ───────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={addStep}
          disabled={running}
          className="btn-pv"
          style={{ gap: 5 }}
        >
          <Plus size={13} /> Add step
        </button>
        <button
          onClick={runChain}
          disabled={running || steps.length === 0}
          className="btn-pv btn-primary-pv"
          style={{ gap: 6, flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}
        >
          {running
            ? <><span className="mini-spinner-pv" /> Running chain ({completedCount}/{steps.length})…</>
            : <><Play size={14} /> Run chain ({steps.length} step{steps.length !== 1 ? 's' : ''})</>
          }
        </button>
      </div>

      {/* ─── Final output ─────────────────────────────────── */}
      {finalOutput && (
        <div className="card-pv animate-slide-up" style={{ padding: 22 }}>
          {/* Output header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 14, fontWeight: 600, color: 'var(--sage)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CheckCheck size={15} /> Final output
              </span>
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 11,
                color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3,
              }}>
                · {steps.length} steps · {totalElapsed}s total
              </span>
            </div>
            <button onClick={handleCopyFinal} className="btn-pv" style={{ padding: '5px 10px', fontSize: 12, gap: 5 }}>
              {copied
                ? <><CheckCheck size={11} color="var(--sage)" /> Copied!</>
                : <><Copy size={11} /> Copy output</>
              }
            </button>
          </div>

          {/* Output content */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--sage)',
            borderRadius: 'var(--r-sm)',
            padding: '14px 16px',
            fontFamily: 'var(--f-mono)', fontSize: 12.5,
            color: 'var(--text-secondary)', lineHeight: 1.7,
            whiteSpace: 'pre-wrap', maxHeight: 450, overflowY: 'auto',
          }}>
            {finalOutput}
          </div>

          {/* Per-step summary */}
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {steps.map((s, i) => s.done && (
              <span key={s.id} style={{
                fontFamily: 'var(--f-mono)', fontSize: 10,
                background: 'var(--sage-subtle)', color: 'var(--sage)',
                border: '1px solid var(--sage-border)',
                borderRadius: 3, padding: '2px 7px',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                Step {i + 1} · {s.elapsed}s
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Chains;
