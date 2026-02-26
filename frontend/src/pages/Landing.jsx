import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Sparkles, Heart, Search, Copy, Tag, Shield, ArrowRight,
  Star, ChevronRight, Code2, Pen, Image, Video, TrendingUp, Globe,
  CheckCircle, Github, Twitter, Menu, X, Bot, Layers, Clock
} from 'lucide-react';

// Animated floating orbs background
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(88,166,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // Draw faint connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(88,166,255,${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const features = [
  { icon: Sparkles, title: 'Smart Organization', desc: 'Categorize prompts by Coding, Writing, Image, Video, Marketing and more. Find the right prompt instantly.', color: 'from-blue-500/20 to-blue-600/10', accent: 'text-blue-400', border: 'border-blue-500/20' },
  { icon: Search, title: 'Instant Search', desc: 'Search across title, tags, and categories in real-time. Filter by AI tool, sort by newest or favorites.', color: 'from-emerald-500/20 to-emerald-600/10', accent: 'text-emerald-400', border: 'border-emerald-500/20' },
  { icon: Copy, title: 'One-Click Copy', desc: 'Copy any prompt to clipboard instantly. No more hunting through docs or chat histories.', color: 'from-purple-500/20 to-purple-600/10', accent: 'text-purple-400', border: 'border-purple-500/20' },
  { icon: Heart, title: 'Favorites System', desc: 'Star your best prompts. Access your favorites library with a dedicated filtered view.', color: 'from-red-500/20 to-red-600/10', accent: 'text-red-400', border: 'border-red-500/20' },
  { icon: Tag, title: 'Flexible Tagging', desc: 'Add unlimited custom tags. Build your own taxonomy for rapid discovery across projects.', color: 'from-orange-500/20 to-orange-600/10', accent: 'text-orange-400', border: 'border-orange-500/20' },
  { icon: Layers, title: 'Duplicate & Remix', desc: 'Clone any prompt as a starting point. Iterate fast without losing the original.', color: 'from-cyan-500/20 to-cyan-600/10', accent: 'text-cyan-400', border: 'border-cyan-500/20' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, bcrypt hashing. Your prompts are yours alone — fully private per account.', color: 'from-yellow-500/20 to-yellow-600/10', accent: 'text-yellow-400', border: 'border-yellow-500/20' },
  { icon: Bot, title: 'Multi-AI Support', desc: 'Tag prompts for ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion and more.', color: 'from-pink-500/20 to-pink-600/10', accent: 'text-pink-400', border: 'border-pink-500/20' },
  { icon: TrendingUp, title: 'Usage Analytics', desc: 'Dashboard stats showing total prompts, favorites count, and category breakdowns at a glance.', color: 'from-violet-500/20 to-violet-600/10', accent: 'text-violet-400', border: 'border-violet-500/20' },
];

const aiTools = [
  { name: 'ChatGPT', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { name: 'Claude', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Gemini', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Midjourney', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'DALL·E', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { name: 'Stable Diffusion', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'AI Product Designer', avatar: 'SC', text: 'PromptVault changed how I work. I have 200+ prompts organized perfectly. The copy button alone saves me 30 min a day.', rating: 5 },
  { name: 'Marcus Webb', role: 'Full-Stack Developer', avatar: 'MW', text: 'Finally a tool built for serious prompt engineers. The tagging and search are exactly what I needed for my workflow.', rating: 5 },
  { name: 'Priya Sharma', role: 'Content Strategist', avatar: 'PS', text: 'I use different AI tools for different tasks. Having everything organized by tool and category is a game changer.', rating: 5 },
];

const categories = [
  { icon: Code2, label: 'Coding', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Pen, label: 'Writing', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Image, label: 'Image', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Video, label: 'Video', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: TrendingUp, label: 'Marketing', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: Globe, label: 'Other', color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

// Fake animated prompt card for hero section
const AnimatedPromptCard = () => {
  const [typed, setTyped] = useState('');
  const text = 'Review this React component for performance issues, unused state, prop drilling, and suggest refactors using modern hooks patterns...';
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(text.slice(0, i));
      i++;
      if (i > text.length) { clearInterval(t); }
    }, 28);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-neon-blue/20 via-neon-purple/10 to-transparent rounded-3xl blur-2xl" />
      <div className="relative bg-obsidian-800 border border-obsidian-500 rounded-2xl p-5 shadow-2xl">
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs">Coding</span>
            <span className="text-emerald-400 font-mono text-xs">ChatGPT</span>
          </div>
        </div>
        <h4 className="font-display font-semibold text-white text-sm mb-2">React Code Reviewer</h4>
        <div className="bg-obsidian-900 rounded-lg p-3 border border-obsidian-700 font-mono text-xs text-gray-400 leading-relaxed min-h-[80px]">
          {typed}<span className="animate-pulse">|</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {['react', 'code-review', 'performance'].map(t => (
              <span key={t} className="badge bg-obsidian-700 text-gray-400 text-xs">#{t}</span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button className="p-1.5 rounded-lg bg-obsidian-700 text-red-400 hover:bg-red-500/20 transition-colors">
              <Heart size={13} className="fill-red-400" />
            </button>
            <button className="p-1.5 rounded-lg bg-obsidian-700 text-gray-400 hover:text-white transition-colors">
              <Copy size={13} />
            </button>
          </div>
        </div>
      </div>
      {/* Floating stat chips */}
      <div className="absolute -top-3 -right-3 bg-obsidian-700 border border-obsidian-500 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <span className="text-white font-display text-xs font-semibold">247 prompts saved</span>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-obsidian-700 border border-obsidian-500 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2" style={{ animation: 'bounce 4s ease-in-out infinite' }}>
        <Clock size={12} className="text-neon-blue" />
        <span className="text-white font-display text-xs font-semibold">Just duplicated</span>
      </div>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => navigate(user ? '/dashboard' : '/register');

  return (
    <div className="min-h-screen bg-obsidian-950 text-white overflow-x-hidden">
      <ParticleField />

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-obsidian-950/90 backdrop-blur-md border-b border-obsidian-700' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/30">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">PromptVault</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white font-body text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white font-body text-sm transition-colors">How it works</a>
            <a href="#testimonials" className="text-gray-400 hover:text-white font-body text-sm transition-colors">Reviews</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2">
                Go to Dashboard <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get started free</Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-obsidian-900 border-b border-obsidian-700 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white font-body text-sm py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white font-body text-sm py-2">How it works</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white font-body text-sm py-2">Reviews</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm">Sign up free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-neon-blue/10 border border-neon-blue/30 rounded-full px-4 py-1.5 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-neon-blue font-body text-sm font-medium">Your AI Prompt Library — Organized</span>
            </div>

            {/* Headline */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="font-display font-black text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                Never Lose a
                <br />
                <span className="text-gradient">Great Prompt</span>
                <br />
                Again.
              </h1>
              <p className="font-body text-gray-400 text-lg leading-relaxed max-w-lg">
                Save, organize, and instantly recall your best AI prompts across ChatGPT, Claude, Midjourney, and more. Built for developers, writers, and creators who take AI seriously.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={handleCTA} className="btn-primary text-base px-7 py-3 flex items-center gap-2 shadow-lg shadow-neon-blue/20">
                {user ? 'Go to Dashboard' : 'Start for free'} <ArrowRight size={18} />
              </button>
              {!user && (
                <Link to="/login" className="btn-secondary text-base px-7 py-3">
                  Sign in
                </Link>
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {['SC', 'MW', 'PS', 'JD', 'AL'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-obsidian-950 bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 flex items-center justify-center">
                    <span className="text-white text-xs font-display font-bold">{initials[0]}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-500 text-xs font-body mt-0.5">Loved by 500+ AI practitioners</p>
              </div>
            </div>
          </div>

          {/* Right — animated card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <AnimatedPromptCard />
          </div>
        </div>
      </section>

      {/* ── AI TOOLS STRIP ──────────────────────────────── */}
      <section className="relative z-10 py-10 border-y border-obsidian-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-600 font-body text-sm text-center mb-6 uppercase tracking-widest">Works with every AI tool</p>
          <div className="flex flex-wrap justify-center gap-3">
            {aiTools.map(tool => (
              <span key={tool.name} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${tool.bg} ${tool.color} font-mono text-sm border border-white/5`}>
                <Bot size={14} />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-white text-3xl mb-2">Organized by Category</h2>
            <p className="text-gray-500 font-body">Every prompt in its place</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`card-hover flex items-center gap-3 px-5 py-3 cursor-pointer`}>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="font-display font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon-blue font-mono text-sm uppercase tracking-widest">Everything you need</span>
            <h2 className="font-display font-black text-white text-4xl mt-3 mb-4">Built for Prompt Power Users</h2>
            <p className="text-gray-400 font-body text-lg max-w-2xl mx-auto">
              Every feature is designed around one goal: making your AI prompts instantly accessible, perfectly organized, and endlessly reusable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, accent, border }) => (
              <div key={title} className={`card p-6 group hover:scale-[1.02] transition-transform duration-200 ${border} hover:border-opacity-50`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={accent} />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-gray-500 font-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-obsidian-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon-purple font-mono text-sm uppercase tracking-widest">Simple workflow</span>
            <h2 className="font-display font-black text-white text-4xl mt-3 mb-4">Up and running in 60 seconds</h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-px h-[calc(100%-96px)] bg-gradient-to-b from-neon-blue/40 via-neon-purple/20 to-transparent" />

            <div className="space-y-12">
              {[
                { step: '01', title: 'Create your account', desc: 'Sign up in seconds. No credit card required. Your data is private and secure with JWT authentication.', icon: Shield, side: 'left' },
                { step: '02', title: 'Save your first prompt', desc: 'Add a title, paste your prompt, pick a category and AI tool. Add tags for easy recall later.', icon: Sparkles, side: 'right' },
                { step: '03', title: 'Search & copy instantly', desc: 'Find any prompt in milliseconds with full-text search. One click copies it to your clipboard.', icon: Copy, side: 'left' },
                { step: '04', title: 'Build your library', desc: 'Duplicate and remix prompts. Favorite the best ones. Watch your collection grow into a superpower.', icon: Layers, side: 'right' },
              ].map(({ step, title, desc, icon: Icon, side }) => (
                <div key={step} className={`flex items-center gap-8 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className={`card p-6 ${side === 'right' ? 'ml-auto' : ''} max-w-sm`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-neon-blue text-xs opacity-60">{step}</span>
                        <Icon size={16} className="text-neon-blue" />
                      </div>
                      <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                      <p className="text-gray-500 font-body text-sm">{desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-6 h-6 rounded-full bg-neon-blue border-4 border-obsidian-950 shrink-0 shadow-lg shadow-neon-blue/40" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section id="testimonials" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon-green font-mono text-sm uppercase tracking-widest">What users say</span>
            <h2 className="font-display font-black text-white text-4xl mt-3">Real people, real results</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="card-hover p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 font-body text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-obsidian-500 flex items-center justify-center">
                    <span className="text-white text-xs font-display font-bold">{avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-display font-semibold text-sm">{name}</p>
                    <p className="text-gray-500 font-body text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden card p-12 text-center border-obsidian-600">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-neon-blue/5" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-neon-blue/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <h2 className="font-display font-black text-white text-4xl lg:text-5xl mb-4">
                Your prompts deserve
                <br />
                a <span className="text-gradient">better home.</span>
              </h2>
              <p className="text-gray-400 font-body text-lg mb-8">
                Join hundreds of AI practitioners building their prompt library today.
              </p>
              <button onClick={handleCTA} className="btn-primary text-base px-10 py-4 shadow-xl shadow-neon-blue/20 flex items-center gap-2 mx-auto">
                {user ? 'Go to Dashboard' : 'Get started — it\'s free'} <ArrowRight size={18} />
              </button>
              {!user && (
                <p className="text-gray-600 text-sm font-body mt-4">No credit card · No expiry · Always free</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-obsidian-700 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">PromptVault</span>
          </div>
          <p className="text-gray-600 font-body text-sm">
            Built with React, Node.js, MongoDB & TailwindCSS
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-500 hover:text-white font-body text-sm transition-colors">Sign in</Link>
            <Link to="/register" className="text-gray-500 hover:text-white font-body text-sm transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
