import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { promptService } from '../services/promptService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { Sparkles, Heart, ArrowRight, Wand2, Plus, BarChart2, Copy, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, color }) => (
  <div className="stat-card-pv" style={{ '--stat-color': color }}>
    <div className="stat-label-pv">{label}</div>
    <div className="stat-val-pv">{value ?? '—'}</div>
  </div>
);

const ActivityBar = ({ activity }) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const found = activity?.find(a => a._id === key);
    days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), count: found?.count || 0 });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '52px' }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div title={`${d.label}: ${d.count}`} style={{ width: '100%', borderRadius: '2px', height: `${Math.max((d.count / max) * 100, 8)}%`, background: d.count > 0 ? `rgba(196,68,26,${0.25 + (d.count / max) * 0.72})` : 'var(--bg-muted)', transition: 'height 0.5s ease' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '9.5px', color: 'var(--text-tertiary)' }}>{d.label[0]}</span>
        </div>
      ))}
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, to, bg, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="quick-action-pv" style={{ background: bg }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      <div style={{ width: '30px', height: '30px', borderRadius: 'var(--r-sm)', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color }}>{label}</p>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: `${color}99`, marginTop: '1px' }}>{desc}</p>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([userService.getStats(), promptService.getAll({ sort: 'newest', page: 1, limit: 6 })])
      .then(([s, p]) => { setStats(s.stats); setRecentPrompts(p.prompts.slice(0, 6)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  const favPct = stats?.total ? Math.round((stats.favorites / stats.total) * 100) : 0;

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '28px', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {greeting}, {user?.fullName?.split(' ')[0]}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
          {stats?.total === 0 ? 'Start building your prompt library today.' : `${stats?.total} prompts saved${stats?.favorites > 0 ? ` · ${stats.favorites} favourite${stats.favorites !== 1 ? 's' : ''}` : ''}.`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '22px' }}>
        <StatCard label="Total prompts"  value={stats?.total}         color="#3B72D4" />
        <StatCard label="Favourites"     value={stats?.favorites}     color="#C4441A" />
        <StatCard label="Categories"     value={stats?.categoryCount} color="#2A9148" />
        <StatCard label="AI tools used"  value={stats?.aiToolCount}   color="#8040C8" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: '16px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-pv" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>7-day activity</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{stats?.activity?.reduce((s, a) => s + a.count, 0) || 0} prompts</span>
            </div>
            <ActivityBar activity={stats?.activity} />
          </div>

          {stats?.categoryBreakdown?.length > 0 && (
            <div className="card-pv" style={{ padding: '20px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '16px' }}>Category breakdown</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.categoryBreakdown.map(({ _id: cat, count }) => {
                  const clr = { Coding:'#3B72D4', Writing:'#2A9148', Image:'#8040C8', Video:'#C85C1E', Marketing:'#C42E72', Other:'#857E78' };
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-secondary)', width: '72px', flexShrink: 0 }}>{cat}</span>
                      <div className="bar-track-pv" style={{ flex: 1 }}><div className="bar-fill-pv" style={{ width: `${pct}%`, background: clr[cat] || 'var(--accent)' }} /></div>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', width: '42px', textAlign: 'right' }}>{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-pv" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Favourite rate</span>
            <div style={{ position: 'relative', width: '88px', height: '88px' }}>
              <svg viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--bg-muted)" strokeWidth="10" />
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--accent)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - favPct / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--f-serif)', fontSize: '18px', color: 'var(--text-primary)' }}>{favPct}%</span>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>{stats?.favorites} of {stats?.total} favourited</p>
          </div>

          {stats?.topTags?.length > 0 && (
            <div className="card-pv" style={{ padding: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>Top tags</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {stats.topTags.map(({ _id: tag, count }) => <span key={tag} className="tag-pv" title={`${count} uses`}>#{tag}</span>)}
              </div>
            </div>
          )}

          <div className="card-pv" style={{ padding: '14px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>Quick actions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <QuickAction icon={Plus}      label="New prompt"  desc="Write from scratch"    to="/prompts"   bg="var(--sage-subtle)"   color="var(--sage)" />
              <QuickAction icon={Wand2}     label="AI generate" desc="Generate with Groq AI" to="/prompts"   bg="var(--amber-subtle)"  color="var(--amber)" />
              <QuickAction icon={Heart}     label="Favourites"  desc="View starred prompts"  to="/favorites" bg="var(--accent-subtle)" color="var(--accent)" />
              <QuickAction icon={BarChart2} label="Analytics"   desc="Deep dive your stats"  to="/analytics" bg="var(--bg-subtle)"     color="var(--text-secondary)" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color="var(--text-tertiary)" /> Recent prompts
          </span>
          <Link to="/prompts" className="btn-pv btn-ghost-pv" style={{ fontSize: '13px', gap: '5px', textDecoration: 'none' }}>View all <ArrowRight size={13} /></Link>
        </div>

        {recentPrompts.length === 0 ? (
          <div className="empty-state-pv">
            <div className="empty-icon-pv"><Sparkles size={22} /></div>
            <div className="empty-title-pv">No prompts yet</div>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>Create your first prompt or generate one with AI</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link to="/prompts" className="btn-pv btn-primary-pv" style={{ gap: '6px', textDecoration: 'none' }}><Plus size={14} /> Create prompt</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {recentPrompts.map(prompt => (
              <div key={prompt._id} className="card-pv-hover" style={{ padding: '16px' }} onClick={() => navigate('/prompts')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prompt.title}</p>
                  {prompt.isFavorite && <Heart size={12} fill="var(--accent)" color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`cat-pill-pv cat-${prompt.category}`}><span className="cat-dot-pv" />{prompt.category}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{prompt.aiTool}</span>
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt.promptText}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <button onClick={async (e) => { e.stopPropagation(); await navigator.clipboard.writeText(prompt.promptText); toast.success('Copied'); }} className="icon-btn-pv"><Copy size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
