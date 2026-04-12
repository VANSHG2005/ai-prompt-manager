import { useState } from 'react';
import { Copy, Plus, CheckCheck, Sparkles, Code2, Pen, Image,
         Video, TrendingUp, Globe, Bot, Brain, Briefcase,
         GraduationCap, Megaphone, Lightbulb, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { promptService } from '../services/promptService';

const STARTER_PROMPTS = [
  /* ── Coding (8) ── */
  { category:'Coding',    aiTool:'ChatGPT',   title:'Code Reviewer',          tags:['code-review','best-practices'],   promptText:'You are a senior software engineer. Review this code for: bugs, performance bottlenecks, security vulnerabilities, and best-practice violations. Give specific, actionable feedback with examples.\n\nCode:\n[PASTE CODE HERE]' },
  { category:'Coding',    aiTool:'Claude',    title:'Explain Like I\'m 5',    tags:['learning','explanation'],          promptText:'Explain {{TOPIC}} in the simplest way possible — as if you\'re teaching a complete beginner. Use an everyday analogy, a step-by-step breakdown, avoid jargon, and finish with a concrete example.' },
  { category:'Coding',    aiTool:'ChatGPT',   title:'Unit Test Generator',    tags:['testing','tdd','jest'],            promptText:'Generate comprehensive unit tests for the following code using {{FRAMEWORK: Jest/Pytest/etc}}. Cover: happy path, edge cases, error conditions, and boundary values. Include setup/teardown where needed.\n\nCode:\n[PASTE CODE]' },
  { category:'Coding',    aiTool:'Claude',    title:'SQL Query Builder',       tags:['sql','database','query'],          promptText:'Write an optimized SQL query for the following requirement: {{REQUIREMENT}}. Include: proper indexing suggestions, explanation of each clause, and an alternative approach if one exists. Database: {{DATABASE: PostgreSQL/MySQL/SQLite}}.' },
  { category:'Coding',    aiTool:'ChatGPT',   title:'Regex Wizard',           tags:['regex','parsing','validation'],    promptText:'Write a regular expression that matches: {{PATTERN DESCRIPTION}}. Provide: the regex itself, a plain-English explanation of each part, 5 test cases it should match, and 3 that it should NOT match.' },
  { category:'Coding',    aiTool:'Claude',    title:'API Documentation',       tags:['api','docs','openapi'],            promptText:'Write complete API documentation for the following endpoint. Include: description, parameters table with types and required flags, request/response examples in JSON, error codes table, and a curl example.\n\nEndpoint details:\n[DESCRIBE ENDPOINT]' },
  { category:'Coding',    aiTool:'ChatGPT',   title:'Refactor to Clean Code',  tags:['refactoring','clean-code'],       promptText:'Refactor the following code to follow SOLID principles and clean code guidelines. Explain each change you make and why it improves the code. Preserve all existing functionality.\n\nOriginal code:\n[PASTE CODE]' },
  { category:'Coding',    aiTool:'Gemini',    title:'Architecture Advisor',    tags:['architecture','system-design'],   promptText:'I\'m building {{SYSTEM DESCRIPTION}}. Recommend: the best architecture pattern for this use case, technology choices with justification, potential scaling bottlenecks, and a high-level component diagram in ASCII art.' },

  /* ── Writing (6) ── */
  { category:'Writing',   aiTool:'ChatGPT',   title:'Blog Post Generator',     tags:['blog','content','seo'],           promptText:'Write a comprehensive blog post about {{TOPIC}}. Structure: compelling headline, hook intro, 4-5 sections with subheadings, practical examples, and a CTA conclusion. Tone: {{TONE}}. Audience: {{AUDIENCE}}. ~1200 words.' },
  { category:'Writing',   aiTool:'Claude',    title:'Email Rewriter',          tags:['email','communication'],          promptText:'Rewrite this email to be more {{TONE: professional/concise/persuasive}}. Improve clarity, cut filler words, strengthen the CTA, and add a subject line.\n\nOriginal:\n[PASTE EMAIL]' },
  { category:'Writing',   aiTool:'Claude',    title:'Cold Outreach DM',        tags:['outreach','sales','linkedin'],    promptText:'Write a cold {{PLATFORM: LinkedIn/Email/Twitter}} message to {{TARGET ROLE}} at {{COMPANY TYPE}}. Goal: {{OBJECTIVE}}. Keep it under 150 words, lead with their pain point, and make the ask small and specific.' },
  { category:'Writing',   aiTool:'ChatGPT',   title:'Press Release',           tags:['pr','announcement','media'],      promptText:'Write a professional press release announcing: {{ANNOUNCEMENT}}. Include: dateline, strong headline, subheading, two-paragraph lead, supporting quote from executive, boilerplate company description, and media contact info.' },
  { category:'Writing',   aiTool:'Claude',    title:'Technical Documentation', tags:['docs','technical-writing'],       promptText:'Write clear technical documentation for {{FEATURE/SYSTEM}}. Include: overview (1 paragraph), prerequisites, step-by-step setup guide, configuration reference table, troubleshooting section, and FAQ (5 Q&As).' },
  { category:'Writing',   aiTool:'ChatGPT',   title:'Product Description',     tags:['ecommerce','copywriting'],        promptText:'Write a compelling product description for {{PRODUCT NAME}}. Features: {{FEATURES}}. Target customer: {{CUSTOMER}}. Include: benefit-led headline, 3-bullet feature list, sensory/emotional language, and a urgency-driven CTA.' },

  /* ── Image (5) ── */
  { category:'Image',     aiTool:'Midjourney',title:'Portrait Photography',    tags:['portrait','photography'],         promptText:'Portrait of {{SUBJECT}}, studio lighting with soft key and rim light, shallow depth of field, Canon 85mm f/1.4, ultra-detailed skin texture, editorial magazine style --ar 4:5 --stylize 200' },
  { category:'Image',     aiTool:'DALL-E',    title:'Product Mockup',          tags:['product','mockup','commercial'],  promptText:'{{PRODUCT}} product photography on clean white background, professional studio lighting, photorealistic, 4k commercial style, {{DESCRIBE PRODUCT IN DETAIL}}, soft natural shadows, no props' },
  { category:'Image',     aiTool:'Midjourney',title:'Concept Art Scene',       tags:['concept-art','illustration'],     promptText:'{{SCENE DESCRIPTION}}, epic concept art, cinematic lighting, detailed environment, {{MOOD: dystopian/utopian/medieval/futuristic}}, ArtStation trending, rendered by Unreal Engine 5 --ar 16:9 --q 2' },
  { category:'Image',     aiTool:'Stable Diffusion', title:'Logo Design',      tags:['logo','branding','design'],       promptText:'Minimalist logo for {{COMPANY NAME}}, a {{INDUSTRY}} company. Style: {{STYLE: geometric/wordmark/lettermark}}, {{COLOR PALETTE}}, clean vector art, white background, professional brand identity, simple and memorable' },
  { category:'Image',     aiTool:'DALL-E',    title:'Infographic Elements',    tags:['infographic','icons','ui'],       promptText:'Flat design icon set for {{TOPIC}}, 6 icons, minimal line style, {{COLOR}} accent on white, consistent stroke weight 2px, professional UI kit aesthetic, SVG-ready clean shapes' },

  /* ── Video (4) ── */
  { category:'Video',     aiTool:'ChatGPT',   title:'YouTube Script',          tags:['youtube','script','video'],       promptText:'Write a YouTube script for a {{LENGTH}}-minute video about {{TOPIC}}. Include: hook (first 15s), what they\'ll learn, 3-5 main segments with B-roll notes, mid-video engagement prompt, and CTA outro. Add timestamps.' },
  { category:'Video',     aiTool:'Claude',    title:'TikTok Hook Generator',   tags:['tiktok','hooks','short-form'],    promptText:'Generate 10 attention-grabbing TikTok opening hooks for a video about {{TOPIC}}. Each hook must: start mid-action or with a bold claim, be under 10 words, create curiosity or shock, target {{AUDIENCE}}.' },
  { category:'Video',     aiTool:'ChatGPT',   title:'Video Ad Script',         tags:['advertising','video-ad','ugc'],   promptText:'Write a {{DURATION}}-second video ad script for {{PRODUCT}}. Format: [HOOK 0-3s], [PROBLEM 3-8s], [SOLUTION 8-20s], [PROOF 20-25s], [CTA 25-30s]. Style: {{STYLE: ugc/polished/testimonial}}. Target: {{AUDIENCE}}.' },
  { category:'Video',     aiTool:'ChatGPT',   title:'Podcast Episode Outline', tags:['podcast','outline','interview'],  promptText:'Create a detailed episode outline for a podcast about {{TOPIC}} with guest {{GUEST TYPE}}. Include: episode title, 3-sentence description, 8-10 discussion questions, 2 rapid-fire questions, and suggested timestamps for a {{LENGTH}}-minute episode.' },

  /* ── Marketing (5) ── */
  { category:'Marketing', aiTool:'ChatGPT',   title:'Ad Copy Generator',       tags:['ads','copywriting','conversion'], promptText:'Write 3 ad copy variations for {{PRODUCT/SERVICE}} targeting {{AUDIENCE}}. Each: headline (under 40 chars), body (under 125 chars), CTA. Angles: pain-point, aspiration, social proof. Platform: {{PLATFORM: Facebook/Google/LinkedIn}}.' },
  { category:'Marketing', aiTool:'Claude',    title:'Social Media Calendar',   tags:['social-media','content-calendar'],promptText:'Create a 1-week social media calendar for {{BRAND}} targeting {{AUDIENCE}}. For each day: platform, post type, hook/headline, caption with emojis, 5 hashtags, best posting time. Theme: {{CAMPAIGN}}. Tone: {{BRAND TONE}}.' },
  { category:'Marketing', aiTool:'ChatGPT',   title:'SEO Meta Generator',      tags:['seo','meta','on-page'],           promptText:'Write SEO-optimized meta title and description for a page about {{TOPIC}} targeting keyword "{{PRIMARY KEYWORD}}". Title: 50-60 chars, include keyword naturally. Description: 150-160 chars, include keyword + CTA + benefit. Write 3 variations.' },
  { category:'Marketing', aiTool:'Claude',    title:'Competitor Analysis',      tags:['research','competitive','strategy'],promptText:'Analyze {{COMPETITOR}} vs {{OUR PRODUCT}} across: features, pricing, target market, messaging, strengths, and weaknesses. Format as a comparison table. End with 3 actionable opportunities we can exploit based on gaps you identified.' },
  { category:'Marketing', aiTool:'ChatGPT',   title:'Launch Announcement',     tags:['launch','announcement','email'],  promptText:'Write a product launch email for {{PRODUCT NAME}} launching on {{DATE}}. Include: subject line (A/B test 2 versions), preview text, excitement-building body (150 words), 3 key benefits as bullets, launch offer details, and clear CTA button text.' },

  /* ── Other (2) ── */
  { category:'Other',     aiTool:'ChatGPT',   title:'Study Plan Maker',        tags:['study','learning','productivity'],promptText:'Create a detailed study plan for learning {{SUBJECT}} in {{TIMEFRAME}}. I am {{LEVEL: beginner/intermediate/advanced}} with {{HOURS/WEEK}} hours/week. Include: week-by-week breakdown, resources, practice exercises, milestones, and common pitfalls.' },
  { category:'Other',     aiTool:'ChatGPT',   title:'Meeting Agenda Builder',  tags:['productivity','meetings','team'], promptText:'Create a structured agenda for a {{DURATION}}-minute {{MEETING TYPE}} meeting for {{TEAM SIZE}} people. Goal: {{MEETING GOAL}}. Include: pre-read materials list, timed agenda items with owners, decision points to resolve, parking lot section, and follow-up action template.' },
];

const catIcons = { Coding:Code2, Writing:Pen, Image, Video, Marketing:TrendingUp, Other:Globe };
const catColors = { Coding:'#3B72D4', Writing:'#2A9148', Image:'#8040C8', Video:'#C85C1E', Marketing:'#C42E72', Other:'#857E78' };

const Explore = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(new Set());
  const [copiedTitle, setCopiedTitle] = useState(null);

  const categories = ['All', ...Object.keys(catIcons)];
  const filtered = STARTER_PROMPTS.filter(p => {
    const matchCat = activeFilter === 'All' || p.category === activeFilter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase())) || p.promptText.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopy = async p => {
    await navigator.clipboard.writeText(p.promptText);
    setCopiedTitle(p.title); toast.success('Copied to clipboard');
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const handleSave = async p => {
    setSaving(p.title);
    try { await promptService.create(p); setSaved(s => new Set([...s, p.title])); toast.success(`"${p.title}" saved`); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(null); }
  };

  return (
    <>
      {/* Header */}
      <div className="card-pv" style={{ padding: 22, marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), #e8a87c, var(--sage))' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}><Sparkles size={16} color="var(--amber)" /><h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Starter Templates</h2></div>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>{STARTER_PROMPTS.length} expert-crafted prompts across {Object.keys(catIcons).length} categories. Save any to your library.</p>
          </div>
          <div style={{ position: 'relative', width: 240 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} className="search-input-pv" placeholder="Search templates…" style={{ paddingLeft: 34 }} />
            <Sparkles size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {categories.map(cat => {
          const Icon = catIcons[cat];
          const isActive = activeFilter === cat;
          const count = cat === 'All' ? STARTER_PROMPTS.length : STARTER_PROMPTS.filter(p => p.category === cat).length;
          return (
            <button key={cat} onClick={() => setActiveFilter(cat)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: 13, fontFamily: 'var(--f-sans)', fontWeight: isActive ? 500 : 400, cursor: 'pointer', background: isActive ? catColors[cat] || 'var(--accent)' : 'var(--bg-surface)', color: isActive ? '#fff' : 'var(--text-secondary)', border: `1px solid ${isActive ? catColors[cat] || 'var(--accent)' : 'var(--border)'}`, transition: 'all .15s' }}>
              {Icon && <Icon size={13} />} {cat}
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, padding: '1px 5px', borderRadius: 3, background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)', color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-tertiary)' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {search && <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state-pv">
          <div className="empty-icon-pv"><Sparkles size={22} /></div>
          <div className="empty-title-pv">No templates found</div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Try a different search or category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {filtered.map(prompt => {
            const isSaved  = saved.has(prompt.title);
            const isSaving = saving === prompt.title;
            const isCopied = copiedTitle === prompt.title;
            return (
              <div key={prompt.title} className="card-pv" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 6 }}>{prompt.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`cat-pill-pv cat-${prompt.category}`}><span className="cat-dot-pv" />{prompt.category}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>{prompt.aiTool}</span>
                    </div>
                  </div>
                  {isSaved && <span className="tag-pv" style={{ flexShrink: 0, color: 'var(--sage)', borderColor: 'rgba(26,92,82,0.3)', background: 'var(--sage-subtle)' }}>✓ Saved</span>}
                </div>
                <div className="prompt-preview-pv" style={{ WebkitLineClamp: 4 }}>{prompt.promptText}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{prompt.tags.map(t => <span key={t} className="tag-pv">#{t}</span>)}</div>
                <div style={{ display: 'flex', gap: 7, marginTop: 'auto' }}>
                  <button onClick={() => handleCopy(prompt)} className="btn-pv" style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
                    {isCopied ? <><CheckCheck size={13} color="var(--sage)" /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                  <button onClick={() => !isSaved && handleSave(prompt)} disabled={isSaved || isSaving} className={isSaved ? 'btn-pv' : 'btn-pv btn-primary-pv'} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, ...(isSaved ? { background: 'var(--sage-subtle)', color: 'var(--sage)', borderColor: 'rgba(26,92,82,0.3)', cursor: 'default' } : {}) }}>
                    {isSaving ? <span className="mini-spinner-pv" /> : <Plus size={13} />}
                    {isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save to library'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Explore;
