import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Copy, Plus, CheckCheck, Sparkles, Code2, Pen, Image, Video, TrendingUp, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { promptService } from '../services/promptService';

const STARTER_PROMPTS = [
  {
    category: 'Coding', aiTool: 'ChatGPT', title: 'Code Reviewer',
    tags: ['code-review', 'best-practices'],
    promptText: 'You are a senior software engineer conducting a thorough code review. Analyse the following code for: 1) Bugs and logic errors 2) Performance bottlenecks 3) Security vulnerabilities 4) Code style and best practices 5) Suggestions for refactoring. Provide specific, actionable feedback with examples.\n\nCode to review:\n[PASTE CODE HERE]',
  },
  {
    category: 'Coding', aiTool: 'Claude', title: "Explain Like I'm 5",
    tags: ['learning', 'explanation'],
    promptText: "Explain [TOPIC] in the simplest way possible, as if you're explaining to a complete beginner. Use an analogy from everyday life, a step-by-step breakdown, and avoid jargon. Finish with one simple example.",
  },
  {
    category: 'Writing', aiTool: 'ChatGPT', title: 'Blog Post Generator',
    tags: ['blog', 'content', 'seo'],
    promptText: 'Write a comprehensive blog post about [TOPIC]. Structure: 1) Compelling headline 2) Engaging intro that hooks the reader 3) 4-5 main sections with subheadings 4) Practical examples and data where relevant 5) Strong conclusion with a CTA. Tone: professional but conversational. Target audience: [AUDIENCE]. Word count: ~1200 words.',
  },
  {
    category: 'Writing', aiTool: 'Claude', title: 'Email Rewriter',
    tags: ['email', 'communication', 'professional'],
    promptText: 'Rewrite the following email to be more [TONE: professional/friendly/concise/persuasive]. Maintain the core message but improve clarity, eliminate filler words, and make it more impactful. Add a clear subject line.\n\nOriginal email:\n[PASTE EMAIL]',
  },
  {
    category: 'Image', aiTool: 'Midjourney', title: 'Portrait Photography',
    tags: ['portrait', 'photography', 'realistic'],
    promptText: 'Portrait of [SUBJECT DESCRIPTION], studio lighting with soft key light and subtle rim light, shallow depth of field, Canon 85mm f/1.4, ultra-detailed skin texture, professional photography, editorial magazine style, 8k resolution --ar 4:5 --stylize 200',
  },
  {
    category: 'Image', aiTool: 'DALL-E', title: 'Product Mockup',
    tags: ['product', 'mockup', 'commercial'],
    promptText: '[PRODUCT TYPE] product photography, clean white background, professional studio lighting, photorealistic, 4k, commercial photography style, the product is [DESCRIBE PRODUCT IN DETAIL], shadows are soft and natural',
  },
  {
    category: 'Marketing', aiTool: 'ChatGPT', title: 'Ad Copy Generator',
    tags: ['ads', 'copywriting', 'conversion'],
    promptText: 'Write 3 variations of ad copy for [PRODUCT/SERVICE]. Each variation should: target [TARGET AUDIENCE], highlight the key benefit [MAIN BENEFIT], include a clear CTA, be under 150 characters for the headline and 300 for the body. Style: [urgent/friendly/authoritative]. Focus on solving the pain point: [PAIN POINT].',
  },
  {
    category: 'Marketing', aiTool: 'Claude', title: 'Social Media Calendar',
    tags: ['social-media', 'content-calendar', 'strategy'],
    promptText: 'Create a 1-week social media content calendar for [BRAND/PRODUCT] targeting [AUDIENCE]. For each day (Mon-Sun), provide: Platform, Post type, Hook/headline, Caption (with emojis), 5 hashtags, Best posting time. Theme: [THEME/CAMPAIGN]. Tone: [BRAND TONE].',
  },
  {
    category: 'Video', aiTool: 'ChatGPT', title: 'YouTube Script Writer',
    tags: ['youtube', 'script', 'video'],
    promptText: 'Write a YouTube video script about [TOPIC] for a [LENGTH]-minute video. Include: 1) Hook (first 15 seconds) 2) Introduction of what they will learn 3) Main content in 3-5 segments with B-roll notes 4) Engagement prompt 5) Strong ending with CTA. Include timestamps.',
  },
  {
    category: 'Other', aiTool: 'ChatGPT', title: 'Study Plan Maker',
    tags: ['study', 'learning', 'productivity'],
    promptText: 'Create a detailed study plan for learning [SUBJECT/SKILL] in [TIMEFRAME]. I am a [BEGINNER/INTERMEDIATE/ADVANCED] learner with [X hours/week] available. Include: Week-by-week breakdown, Resources (books, videos, courses), Practice exercises, Milestones to track progress, Common pitfalls to avoid.',
  },
];

const catIcons = { Coding: Code2, Writing: Pen, Image, Video, Marketing: TrendingUp, Other: Globe };

const Explore = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(new Set());
  const [copiedTitle, setCopiedTitle] = useState(null);

  const categories = ['All', ...Object.keys(catIcons)];
  const filtered = activeFilter === 'All' ? STARTER_PROMPTS : STARTER_PROMPTS.filter(p => p.category === activeFilter);

  const handleCopy = async (prompt) => {
    await navigator.clipboard.writeText(prompt.promptText);
    setCopiedTitle(prompt.title);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const handleSave = async (prompt) => {
    setSaving(prompt.title);
    try {
      await promptService.create(prompt);
      setSaved(s => new Set([...s, prompt.title]));
      toast.success(`"${prompt.title}" saved to library`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(null); }
  };

  return (
    <DashboardLayout title="Explore">
      {/* Header */}
      <div className="card-pv" style={{ padding: '22px', marginBottom: '22px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent), #e8a87c, var(--sage))' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Sparkles size={16} color="var(--amber)" />
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Starter templates</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
          10 expertly crafted prompts across every category. Save any to your library with one click.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        {categories.map(cat => {
          const Icon = catIcons[cat];
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '13px',
                fontFamily: 'var(--f-sans)', fontWeight: isActive ? 500 : 400, cursor: 'pointer',
                background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all .15s',
              }}
            >
              {Icon && <Icon size={13} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
        {filtered.map(prompt => {
          const isSaved   = saved.has(prompt.title);
          const isSaving  = saving === prompt.title;
          const isCopied  = copiedTitle === prompt.title;

          return (
            <div key={prompt.title} className="card-pv" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>{prompt.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`cat-pill-pv cat-${prompt.category}`}><span className="cat-dot-pv" />{prompt.category}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{prompt.aiTool}</span>
                  </div>
                </div>
                {isSaved && (
                  <span className="tag-pv" style={{ flexShrink: 0, color: 'var(--sage)', borderColor: 'rgba(26,92,82,0.3)', background: 'var(--sage-subtle)' }}>
                    ✓ Saved
                  </span>
                )}
              </div>

              <div className="prompt-preview-pv" style={{ WebkitLineClamp: 4 }}>
                {prompt.promptText}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {prompt.tags.map(t => <span key={t} className="tag-pv">#{t}</span>)}
              </div>

              <div style={{ display: 'flex', gap: '7px', marginTop: 'auto' }}>
                <button
                  onClick={() => handleCopy(prompt)}
                  className="btn-pv"
                  style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                >
                  {isCopied ? <><CheckCheck size={13} color="var(--sage)" /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
                <button
                  onClick={() => !isSaved && handleSave(prompt)}
                  disabled={isSaved || isSaving}
                  className={isSaved ? 'btn-pv' : 'btn-pv btn-primary-pv'}
                  style={{
                    flex: 1, justifyContent: 'center', gap: '6px', display: 'flex', alignItems: 'center',
                    ...(isSaved ? { background: 'var(--sage-subtle)', color: 'var(--sage)', borderColor: 'rgba(26,92,82,0.3)', cursor: 'default' } : {}),
                  }}
                >
                  {isSaving
                    ? <span className="mini-spinner-pv" />
                    : <Plus size={13} />
                  }
                  {isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save to library'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Explore;
