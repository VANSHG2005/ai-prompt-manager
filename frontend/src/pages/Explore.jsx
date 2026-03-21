import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Wand2, Copy, Plus, Star, ChevronRight, Sparkles, Code2, Pen, Image, Video, TrendingUp, Globe } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';
import { promptService } from '../services/promptService';

// Curated starter prompt templates
const STARTER_PROMPTS = [
  {
    category: 'Coding', aiTool: 'ChatGPT', title: 'Code Reviewer',
    tags: ['code-review', 'best-practices'],
    promptText: 'You are a senior software engineer conducting a thorough code review. Analyze the following code for: 1) Bugs and logic errors 2) Performance bottlenecks 3) Security vulnerabilities 4) Code style and best practices 5) Suggestions for refactoring. Provide specific, actionable feedback with examples.\n\nCode to review:\n[PASTE CODE HERE]',
  },
  {
    category: 'Coding', aiTool: 'Claude', title: 'Explain Like I\'m 5',
    tags: ['learning', 'explanation'],
    promptText: 'Explain [TOPIC] in the simplest way possible, as if you\'re explaining to a complete beginner. Use an analogy from everyday life, a step-by-step breakdown, and avoid jargon. Finish with one simple example.',
  },
  {
    category: 'Writing', aiTool: 'ChatGPT', title: 'Blog Post Generator',
    tags: ['blog', 'content', 'seo'],
    promptText: 'Write a comprehensive blog post about [TOPIC]. Structure: 1) Compelling headline 2) Engaging intro that hooks the reader 3) 4-5 main sections with subheadings 4) Practical examples and data where relevant 5) Strong conclusion with a CTA. Tone: professional but conversational. Target audience: [AUDIENCE]. Word count: ~1200 words.',
  },
  {
    category: 'Writing', aiTool: 'Claude', title: 'Email Rewriter',
    tags: ['email', 'communication', 'professional'],
    promptText: 'Rewrite the following email to be more [TONE: professional/friendly/concise/persuasive]. Maintain the core message but improve clarity, eliminate filler words, and make it more impactful. If it\'s a request, make it compelling. Add a clear subject line.\n\nOriginal email:\n[PASTE EMAIL]',
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
    promptText: 'Create a 1-week social media content calendar for [BRAND/PRODUCT] targeting [AUDIENCE]. For each day (Mon-Sun), provide: Platform, Post type (reel/carousel/story/post), Hook/headline, Caption (with emojis), 5 hashtags, Best posting time. Theme: [THEME/CAMPAIGN]. Tone: [BRAND TONE].',
  },
  {
    category: 'Video', aiTool: 'ChatGPT', title: 'YouTube Script Writer',
    tags: ['youtube', 'script', 'video'],
    promptText: 'Write a YouTube video script about [TOPIC] for a [LENGTH]-minute video. Include: 1) Hook (first 15 seconds that grabs attention) 2) Introduction of what they\'ll learn 3) Main content in 3-5 segments with transitions 4) Engagement prompt (like/comment/subscribe) 5) Strong ending with clear CTA. Style: [educational/entertaining/documentary]. Channel niche: [NICHE].',
  },
  {
    category: 'Other', aiTool: 'ChatGPT', title: 'Study Plan Maker',
    tags: ['study', 'learning', 'productivity'],
    promptText: 'Create a detailed study plan for learning [SUBJECT/SKILL] in [TIMEFRAME]. I\'m a [BEGINNER/INTERMEDIATE/ADVANCED] learner with [X hours/week] available. Include: Week-by-week breakdown, Resources (books, videos, courses), Practice exercises, Milestones to track progress, Common pitfalls to avoid.',
  },
];

const categoryIcons = { Coding: Code2, Writing: Pen, Image: Image, Video: Video, Marketing: TrendingUp, Other: Globe };

const Explore = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(new Set());

  const categories = ['All', ...Object.keys(categoryIcons)];
  const filtered = activeFilter === 'All' ? STARTER_PROMPTS : STARTER_PROMPTS.filter(p => p.category === activeFilter);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { icon: '📋' });
  };

  const handleSave = async (prompt) => {
    setSaving(prompt.title);
    try {
      await promptService.create(prompt);
      setSaved(s => new Set([...s, prompt.title]));
      toast.success(`"${prompt.title}" saved to your library!`, { icon: '✅' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(null); }
  };

  return (
    <DashboardLayout title="Explore">
      {/* Header */}
      <div className="relative overflow-hidden card p-6 mb-6 border-obsidian-600">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-transparent to-neon-blue/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-neon-purple" />
            <h2 className="font-display font-bold text-white text-xl">Starter Templates</h2>
          </div>
          <p className="text-gray-400 font-body text-sm">
            10 expertly crafted prompts across every category. Save any to your library with one click.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const colors = CATEGORY_COLORS[cat] || {};
          const Icon = categoryIcons[cat];
          return (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${
                activeFilter === cat
                  ? cat === 'All' ? 'bg-obsidian-600 border-obsidian-400 text-white' : `${colors.bg} ${colors.text} ${colors.border}`
                  : 'bg-obsidian-800 border-obsidian-600 text-gray-500 hover:text-gray-300'
              }`}>
              {Icon && <Icon size={13} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(prompt => {
          const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
          const isSaved = saved.has(prompt.title);
          const isSaving = saving === prompt.title;
          return (
            <div key={prompt.title} className="card-hover p-5 flex flex-col gap-3 group">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">{prompt.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${catColors.bg} ${catColors.text} ${catColors.border} border text-xs`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${catColors.dot} mr-1.5`} />
                      {prompt.category}
                    </span>
                    <span className="text-gray-500 font-mono text-xs">{prompt.aiTool}</span>
                  </div>
                </div>
                {isSaved && (
                  <span className="badge bg-green-500/10 text-green-400 border border-green-500/30 text-xs shrink-0">✓ Saved</span>
                )}
              </div>

              {/* Prompt preview */}
              <div className="bg-obsidian-900 border border-obsidian-700 rounded-lg p-3 font-mono text-xs text-gray-400 leading-relaxed line-clamp-4 flex-1">
                {prompt.promptText}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map(t => (
                  <span key={t} className="badge bg-obsidian-700 text-gray-500 text-xs">#{t}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => handleCopy(prompt.promptText)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2">
                  <Copy size={13} /> Copy
                </button>
                <button onClick={() => !isSaved && handleSave(prompt)} disabled={isSaved || isSaving}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-body font-semibold transition-all ${
                    isSaved
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 cursor-default'
                      : 'btn-primary'
                  }`}>
                  {isSaving ? (
                    <span className="w-3 h-3 border border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" />
                  ) : (
                    <Plus size={13} />
                  )}
                  {isSaved ? 'Saved' : isSaving ? 'Saving...' : 'Save to Library'}
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
