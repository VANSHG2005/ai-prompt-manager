import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import Spinner from '../components/common/Spinner';
import { BarChart2, TrendingUp, Tag, Bot, Calendar, Award, Clock } from 'lucide-react';

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="stat-card-pv" style={{ '--stat-color': color, display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <p style={{ fontFamily: 'var(--f-serif)', fontSize: '26px', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>{label}</p>
      {sub && <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{sub}</p>}
    </div>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.getStats(), promptService.getAll({})])
      .then(([s, p]) => { setStats(s.stats); setPrompts(p.prompts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Analytics">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  /* 30-day heatmap */
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const found = stats?.activity?.find(a => a._id === key);
    days.push({ key, count: found?.count || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
  }
  const heatMax = Math.max(...days.map(d => d.count), 1);

  /* AI tool breakdown */
  const toolMap = {};
  prompts.forEach(p => { toolMap[p.aiTool] = (toolMap[p.aiTool] || 0) + 1; });
  const toolData = Object.entries(toolMap).sort((a, b) => b[1] - a[1]);
  const toolMax = Math.max(...toolData.map(d => d[1]), 1);

  /* Tag cloud */
  const tagMap = {};
  prompts.forEach(p => p.tags?.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const tagData = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const tagMax = Math.max(...tagData.map(d => d[1]), 1);

  const longest = prompts.reduce((a, b) => (b.promptText.length > (a?.promptText?.length || 0) ? b : a), prompts[0] || null);
  const avgLen  = prompts.length ? Math.round(prompts.reduce((s, p) => s + p.promptText.length, 0) / prompts.length) : 0;
  const mostActive = [...days].sort((a, b) => b.count - a.count)[0];

  const catColors = { Coding:'#4a7fd4', Writing:'#2e9944', Image:'#8b4fc2', Video:'#d4621c', Marketing:'#c7336e', Other:'#807d78' };
  const toolColors = { ChatGPT:'#2e9944', Claude:'#d4621c', Gemini:'#4a7fd4', Midjourney:'#8b4fc2', 'DALL-E':'#c7336e', 'Stable Diffusion':'#d4940a', Other:'#807d78' };

  return (
    <DashboardLayout title="Analytics">
      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
        Insights into your prompt library and usage patterns over time.
      </p>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '22px' }}>
        <MetricCard icon={BarChart2} label="Total prompts"    value={stats?.total}           color="#4a7fd4" />
        <MetricCard icon={Award}     label="Favourites"       value={stats?.favorites}        color="#c84b1a" />
        <MetricCard icon={Clock}     label="Avg length"       value={`${avgLen}`} sub="chars"  color="#8a6a1a" />
        <MetricCard icon={Calendar}  label="Most active"      value={mostActive?.count || 0}  color="#2e9944" sub={mostActive?.label || '—'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* Heatmap */}
        <div className="card-pv" style={{ padding: '22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>30-day activity</p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Prompt creation frequency</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: '4px' }}>
            {days.map(d => {
              const intensity = heatMax > 0 ? d.count / heatMax : 0;
              return (
                <div
                  key={d.key}
                  title={`${d.label}: ${d.count} prompt${d.count !== 1 ? 's' : ''}`}
                  style={{
                    aspectRatio: '1', borderRadius: '2px', cursor: 'default',
                    background: d.count === 0 ? 'var(--bg-subtle)' : `rgba(200,71,26,${0.18 + intensity * 0.82})`,
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Less</span>
            {[0.18, 0.38, 0.58, 0.78, 1].map(o => (
              <div key={o} style={{ width: '12px', height: '12px', borderRadius: '2px', background: `rgba(200,71,26,${o})` }} />
            ))}
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>More</span>
          </div>
        </div>

        {/* Category */}
        <div className="card-pv" style={{ padding: '22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>By category</p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Distribution of your library</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(stats?.categoryBreakdown || []).map(({ _id: cat, count }) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{cat}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{pct}%</span>
                  </div>
                  <div className="bar-track-pv">
                    <div className="bar-fill-pv" style={{ width: `${pct}%`, background: catColors[cat] || '#807d78' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* AI Tools */}
        <div className="card-pv" style={{ padding: '22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>AI tool usage</p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Which tools you prompt most</p>
          {toolData.length === 0
            ? <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No data yet</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toolData.map(([tool, count]) => (
                  <div key={tool} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-secondary)', width: '110px', flexShrink: 0 }}>{tool}</span>
                    <div className="bar-track-pv" style={{ flex: 1 }}>
                      <div className="bar-fill-pv" style={{ width: `${(count / toolMax) * 100}%`, background: toolColors[tool] || '#807d78' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', width: '20px', textAlign: 'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Tag cloud */}
        <div className="card-pv" style={{ padding: '22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Tag cloud</p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Most used tags across prompts</p>
          {tagData.length === 0
            ? <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No tags yet</p>
            : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tagData.map(([tag, count]) => {
                  const scale = 0.7 + (count / tagMax) * 0.8;
                  const opacity = 0.5 + (count / tagMax) * 0.5;
                  return (
                    <span
                      key={tag}
                      className="tag-pv"
                      style={{ fontSize: `${Math.max(10, scale * 12)}px`, opacity }}
                      title={`${count} time${count !== 1 ? 's' : ''}`}
                    >
                      #{tag} <span style={{ color: 'var(--bg-muted)', marginLeft: '2px' }}>{count}</span>
                    </span>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* Longest prompt */}
      {longest?.title && (
        <div className="card-pv" style={{ padding: '22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={15} color="#d4940a" /> Longest prompt
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{longest.title}</p>
            <span className="tag-pv">{longest.promptText.length} chars</span>
          </div>
          <div className="prompt-mono-block-pv" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {longest.promptText}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
