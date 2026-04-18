import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Sparkles, Heart, Search, Copy, Tag, Shield, ArrowRight, Star, Code2, Pen, Image, Video, TrendingUp, Globe, Bot, Layers, Clock, Menu, X } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const features = [
  { icon: Sparkles,   title: 'Smart organisation',    desc: 'Categorise by Coding, Writing, Image, Video, Marketing. Find anything instantly with real-time search.' },
  { icon: Copy,       title: 'One-click copy',         desc: 'Copy any prompt to clipboard instantly. No more hunting through docs or scattered chat histories.' },
  { icon: Heart,      title: 'Favourites & ratings',   desc: 'Star your best prompts. Rate them 1–5 stars. Build a shortlist of your highest-performing templates.' },
  { icon: Tag,        title: 'Flexible tagging',        desc: 'Unlimited custom tags. Build your own taxonomy for rapid discovery across any project.' },
  { icon: Layers,     title: 'Duplicate & remix',       desc: 'Clone any prompt as a starting point. Iterate fast without losing the original version.' },
  { icon: Shield,     title: 'Private & secure',        desc: 'JWT auth, bcrypt hashing. Your prompts are yours alone — per-account, never shared.' },
  { icon: Bot,        title: 'Multi-AI support',        desc: 'Tag prompts for ChatGPT, Claude, Gemini, Midjourney, DALL·E, Stable Diffusion and more.' },
  { icon: TrendingUp, title: 'Usage analytics',         desc: 'Dashboard stats: prompt count, favourites, category breakdowns, activity heatmaps.' },
  { icon: Search,     title: 'AI generation',           desc: "Generate, improve, and remix prompts using Groq's free Llama 3.3 API — right inside the app." },
];

const testimonials = [
  { name: 'Sarah Chen',   role: 'AI Product Designer', avatar: 'SC', rating: 5, text: 'PromptVault changed my workflow. 200+ prompts organised perfectly. The one-click copy saves me 30 minutes every day.' },
  { name: 'Marcus Webb',  role: 'Full-Stack Developer', avatar: 'MW', rating: 5, text: 'Finally a tool built for serious prompt engineers. The tagging and search are exactly what I needed for my workflow.' },
  { name: 'Priya Sharma', role: 'Content Strategist',   avatar: 'PS', rating: 5, text: 'I use different AI tools for different tasks. Having everything organised by tool and category is a complete game changer.' },
];

const aiTools = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL·E', 'Stable Diffusion'];

const AnimatedCard = () => {
  const [typed, setTyped] = useState('');
  const text = 'Review this React component for performance issues, unused state, and prop drilling. Suggest refactors using modern hooks and memoisation strategies.';
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { setTyped(text.slice(0, i)); i++; if (i > text.length) clearInterval(t); }, 24);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: 'relative', paddingBottom: '24px', paddingRight: '20px' }}>
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '68%', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', zIndex: 0 }}>
        <div style={{ height: '8px', background: 'var(--border-strong)', borderRadius: '3px', width: '55%', marginBottom: '6px' }} />
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', width: '78%' }} />
      </div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px', boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#f87171','#facc15','#4ade80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cat-pill-pv cat-Coding"><span className="cat-dot-pv" />Coding</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>ChatGPT</span>
          </div>
        </div>
        <h4 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>React Code Reviewer</h4>
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--r-sm)', padding: '12px', borderLeft: '2px solid var(--accent-border)', fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, minHeight: '72px' }}>
          {typed}<span style={{ opacity: typed.length < text.length ? 1 : 0, animation: 'pulse 1s step-end infinite' }}>|</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['react', 'review', 'perf'].map(t => <span key={t} className="tag-pv">#{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="icon-btn-pv" style={{ color: 'var(--accent)' }}><Heart size={13} fill="currentColor" /></button>
            <button className="icon-btn-pv"><Copy size={13} /></button>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: '-10px', right: '8px', background: 'var(--bg-inverse, #1A1814)', color: '#F0ECE6', borderRadius: '100px', padding: '6px 13px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2, boxShadow: 'var(--shadow-md)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
        247 prompts saved
      </div>
      <div style={{ position: 'absolute', bottom: '6px', left: '-12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '100px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2, boxShadow: 'var(--shadow-sm)' }}>
        <Clock size={11} color="var(--accent)" /> Just duplicated
      </div>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      const fn = () => setMobileMenuOpen(false);
      window.addEventListener('scroll', fn, { once: true, passive: true });
    }
  }, [mobileMenuOpen]);

  const handleCTA = () => navigate(user ? '/dashboard' : '/register');

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVIGATION ── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          background: scrolled ? 'var(--bg-base)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.2s',
          /* Critical: never wrap */
          flexWrap: 'nowrap',
          gap: 0,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <div className="logo-icon-pv" style={{ width: 28, height: 28 }}><Zap size={13} color="white" /></div>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: '17px', color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            PromptVault
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="landing-nav-links">
          {[['Features','#features'],['How it works','#how-it-works'],['Reviews','#reviews']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color .13s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <ThemeToggle />

          {/* Desktop auth buttons — hidden on mobile */}
          <div style={{ display: 'flex', gap: '6px' }} className="landing-auth-links">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-pv btn-primary-pv" style={{ fontSize: '13px', padding: '6px 14px', minHeight: 36 }}>
                Dashboard <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-pv btn-ghost-pv" style={{ fontSize: '13px', padding: '6px 12px', minHeight: 36, textDecoration: 'none' }}>Sign in</Link>
                <Link to="/register" className="btn-pv btn-primary-pv" style={{ fontSize: '13px', padding: '6px 14px', minHeight: 36, textDecoration: 'none' }}>Get started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — shows on small screens */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="landing-mobile-menu-btn"
            style={{ display: 'none', width: 36, height: 36, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-surface)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="landing-mobile-dropdown"
          style={{
            position: 'fixed', top: 56, left: 0, right: 0, zIndex: 49,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 16px 20px',
            boxShadow: 'var(--shadow-md)',
            animation: 'slideDown 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '16px' }}>
            {[['Features','#features'],['How it works','#how-it-works'],['Reviews','#reviews']].map(([label, href]) => (
              <a key={label} href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '15px', color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 4px', borderBottom: '1px solid var(--border)' }}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {user ? (
              <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="btn-pv btn-primary-pv" style={{ flex: 1, justifyContent: 'center' }}>
                Dashboard <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-pv" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn-pv btn-primary-pv" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="landing-hero-grid">
          <div>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '16px' }}>
              Your AI prompt library
            </span>
            <h1 className="hero-h1-pv" style={{ marginBottom: '20px' }}>
              Never lose a<br /><em>great prompt</em><br />again.
            </h1>
            <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.72, maxWidth: '420px', marginBottom: '28px' }}>
              Save, organise, and instantly recall your best AI prompts across ChatGPT, Claude, Midjourney, and more.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <button onClick={handleCTA} className="btn-pv btn-primary-pv" style={{ padding: '11px 22px', fontSize: '14.5px', gap: '8px', flex: '1 1 auto', maxWidth: 220, justifyContent: 'center' }}>
                {user ? 'Go to Dashboard' : 'Start for free'} <ArrowRight size={15} />
              </button>
              {!user && (
                <Link to="/login" className="btn-pv" style={{ padding: '11px 18px', fontSize: '14.5px', textDecoration: 'none', flex: '1 1 auto', maxWidth: 120, justifyContent: 'center' }}>
                  Sign in
                </Link>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {[['#C4441A','SC'],['#3A6B5A','MW'],['#3B72D4','PS'],['#8040C8','JD'],['#C42E72','AL']].map(([bg, init], i) => (
                  <div key={init} style={{ width: '28px', height: '28px', borderRadius: '50%', background: bg, border: '2px solid var(--bg-base)', marginLeft: i > 0 ? '-8px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: 'white' }}>{init[0]}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#C4441A" color="#C4441A" />)}
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>Loved by 500+ AI practitioners</p>
              </div>
            </div>
          </div>

          {/* Animated card — hidden on mobile via CSS */}
          <div className="landing-card-anim">
            <AnimatedCard />
          </div>
        </div>
      </section>

      {/* ── TOOLS STRIP ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 20px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Works with every AI tool</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px' }}>
            {aiTools.map(t => (
              <span key={t} style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Bot size={11} color="var(--text-tertiary)" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <span className="section-eyebrow-pv">Everything you need</span>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 'clamp(28px, 5vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.08, maxWidth: '520px' }}>Built for prompt power users</h2>
        </div>
        <div className="features-grid-pv">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-cell-pv">
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-sm)', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Icon size={17} color="var(--text-secondary)" />
              </div>
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.58 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '56px 20px' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-eyebrow-pv">Simple workflow</span>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 'clamp(26px, 5vw, 38px)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Up and running in 60 seconds</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', title: 'Create your account',     desc: 'Sign up in seconds. No credit card. Your data is private and secure with JWT authentication.' },
              { n: '02', title: 'Save your first prompt',  desc: 'Add a title, paste your prompt, pick a category and AI tool. Add tags for easy recall.' },
              { n: '03', title: 'Search & copy instantly', desc: 'Find any prompt in milliseconds. One click copies it directly to your clipboard.' },
              { n: '04', title: 'Build your library',      desc: 'Duplicate and remix. Favourite the best. Watch your collection compound into a real advantage.' },
            ].map(({ n, title, desc }, i, arr) => (
              <div key={n} style={{ display: 'flex', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '28px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '9.5px', fontWeight: 500, color: 'white' }}>{n}</span>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--border)', margin: '4px 0', minHeight: '28px' }} />}
                </div>
                <div style={{ paddingBottom: i < arr.length - 1 ? '26px' : 0 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow-pv">What users say</span>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 'clamp(26px, 5vw, 38px)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Real people, real results</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {testimonials.map(({ name, role, avatar, text, rating }) => (
            <div key={name} className="card-pv" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                {[...Array(rating)].map((_, i) => <Star key={i} size={12} fill="var(--accent)" color="var(--accent)" />)}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.68, marginBottom: '20px', fontStyle: 'italic' }}>"{text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar-pv" style={{ width: '34px', height: '34px', fontSize: '12px' }}>{avatar}</div>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ maxWidth: '700px', margin: '0 auto 64px', padding: '0 20px' }}>
        <div className="card-pv" style={{ padding: 'clamp(32px, 6vw, 56px) clamp(24px, 5vw, 48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent), #E8885A, var(--sage))' }} />
          <span className="section-eyebrow-pv">Get started today</span>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 'clamp(28px, 6vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '14px', lineHeight: 1.08 }}>
            Your prompts deserve<br /><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>a better home.</em>
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Join hundreds of AI practitioners building their prompt library.
          </p>
          <button onClick={handleCTA} className="btn-pv btn-primary-pv" style={{ padding: '12px 28px', fontSize: '15px', gap: '8px', margin: '0 auto' }}>
            {user ? 'Go to Dashboard' : "Get started — it's free"} <ArrowRight size={15} />
          </button>
          {!user && <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '12px' }}>No credit card · No expiry · Always free</p>}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div className="logo-icon-pv" style={{ width: '24px', height: '24px' }}><Zap size={12} color="white" /></div>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>PromptVault</span>
        </div>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>React · Node.js · MongoDB · TailwindCSS</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          {[['Sign in','/login'],['Sign up','/register']].map(([l,to]) => (
            <Link key={l} to={to} style={{ fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color .13s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>{l}</Link>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* Landing nav links hidden on mobile */
        @media (max-width: 767px) {
          .landing-nav-links { display: none !important; }
          .landing-auth-links { display: none !important; }
          .landing-mobile-menu-btn { display: flex !important; }
          .landing-card-anim { display: none !important; }
          .landing-hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) {
          .landing-nav-links { display: flex !important; }
          .landing-auth-links { display: flex !important; }
          .landing-mobile-menu-btn { display: none !important; }
          .landing-mobile-dropdown { display: none !important; }
          .landing-card-anim { display: block !important; }
          .landing-hero-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 48px !important;
            padding: 64px 32px 80px !important;
          }
        }
        @media (min-width: 1024px) {
          .landing-hero-grid {
            gap: 80px !important;
            padding: 72px 48px 96px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
