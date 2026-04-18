import { useState, useEffect } from 'react';
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
  const HEATMAP_DAYS = 365;
  const HEATMAP_CELL = 13;

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
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><Spinner size="lg" /></div>
  );

  /* Activity heatmap (GitHub-style yearly view) */
  const activityMap = (stats?.activity || []).reduce((acc, a) => {
    acc[a._id] = a.count || 0;
    return acc;
  }, {});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - (HEATMAP_DAYS - 1));

  const gridStart = new Date(rangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const cells = [];
  const cursor = new Date(gridStart);
  while (cursor <= today) {
    const key = cursor.toISOString().split('T')[0];
    const inRange = cursor >= rangeStart && cursor <= today;
    cells.push({
      key,
      date: new Date(cursor),
      count: inRange ? (activityMap[key] || 0) : 0,
      inRange,
      label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const yearDays = cells.filter(c => c.inRange);
  const submissions = yearDays.reduce((sum, d) => sum + d.count, 0);
  const activeDays = yearDays.filter(d => d.count > 0).length;
  const heatMax = Math.max(...yearDays.map(d => d.count), 1);

  let currentStreak = 0;
  for (let i = yearDays.length - 1; i >= 0; i--) {
    if (yearDays[i].count > 0) currentStreak += 1;
    else break;
  }

  let totalStreak = 0;
  let runningStreak = 0;
  yearDays.forEach(d => {
    if (d.count > 0) {
      runningStreak += 1;
      totalStreak = Math.max(totalStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  });

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const sample = week.find(d => d.inRange);
    if (!sample) return;
    const month = sample.date.getMonth();
    if (month !== lastMonth) {
      const isYearBreak = month === 0 || monthLabels.length === 0;
      monthLabels.push({
        key: `${sample.date.getFullYear()}-${month}`,
        col: wi + 1,
        label: sample.date.toLocaleDateString('en-US', {
          month: 'short',
          ...(isYearBreak ? { year: '2-digit' } : {}),
        }),
      });
      lastMonth = month;
    }
  });

  const monthStartWeekIndexes = new Set(monthLabels.map(m => m.col - 1));

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
  const mostActive = [...yearDays].sort((a, b) => b.count - a.count)[0];

  const catColors = { Coding:'#4a7fd4', Writing:'#2e9944', Image:'#8b4fc2', Video:'#d4621c', Marketing:'#c7336e', Other:'#807d78' };
  const toolColors = { ChatGPT:'#2e9944', Claude:'#d4621c', Gemini:'#4a7fd4', Midjourney:'#8b4fc2', 'DALL-E':'#c7336e', 'Stable Diffusion':'#d4940a', Other:'#807d78' };

  return (
    <>
      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
        Insights into your prompt library and usage patterns over time.
      </p>

      {/* Metric cards */}
      <div className="analytics-4col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '22px' }}>
        <MetricCard icon={BarChart2} label="Total prompts"    value={stats?.total}           color="#4a7fd4" />
        <MetricCard icon={Award}     label="Favourites"       value={stats?.favorites}        color="#c84b1a" />
        <MetricCard icon={Clock}     label="Avg length"       value={`${avgLen}`} sub="chars"  color="#8a6a1a" />
        <MetricCard icon={Calendar}  label="Most active"      value={mostActive?.count || 0}  color="#2e9944" sub={mostActive?.label || '—'} />
      </div>

      {/* Heatmap */}
      <div className="card-pv analytics-heatmap-wrap" style={{ padding: '20px 20px 18px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: '15px', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 700 }}>{submissions}</span> submissions in the past one year
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Total active days: <strong style={{ color: 'var(--text-primary)' }}>{activeDays}</strong>
            </span>
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Max streak: <strong style={{ color: 'var(--text-primary)' }}>{totalStreak}</strong>
            </span>
            <select className="input-pv" style={{ height: '34px', width: '110px', padding: '0 10px', fontSize: '12.5px' }} defaultValue="Current">
              <option>Current</option>
            </select>
          </div>
        </div>

        <div style={{ width: '100%', paddingBottom: '2px' }}>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                columnGap: '3px',
                minHeight: '16px',
                marginBottom: '4px',
              }}
            >
              {monthLabels.map(m => (
                <span
                  key={m.key}
                  style={{
                    gridColumn: `${m.col} / span 4`,
                    fontFamily: 'var(--f-sans)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: 'fit-content',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`, columnGap: '3px' }}>
              {weeks.map((week, wi) => (
                <div
                  key={`week-${wi}`}
                  style={{
                    display: 'grid',
                    rowGap: '3px',
                    paddingLeft: monthStartWeekIndexes.has(wi) && wi !== 0 ? '3px' : 0,
                    borderLeft: monthStartWeekIndexes.has(wi) && wi !== 0 ? '1px solid var(--border-strong)' : 'none',
                  }}
                >
                  {week.map(day => {
                    const intensity = heatMax > 0 ? day.count / heatMax : 0;
                    return (
                      <div
                        key={day.key}
                        title={`${day.label}: ${day.count} prompt${day.count !== 1 ? 's' : ''}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          maxWidth: `${HEATMAP_CELL}px`,
                          maxHeight: `${HEATMAP_CELL}px`,
                          borderRadius: '2px',
                          cursor: 'default',
                          background: !day.inRange
                            ? 'transparent'
                            : day.count === 0
                            ? 'var(--bg-subtle)'
                            : `rgba(200,71,26,${0.18 + intensity * 0.82})`,
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Less</span>
            {[0.18, 0.38, 0.58, 0.78, 1].map(o => (
              <div key={o} style={{ width: '10px', height: '10px', borderRadius: '2px', background: `rgba(200,71,26,${o})` }} />
            ))}
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>More</span>
        </div>
      </div>

      {/* Category (moved to next line) */}
      <div className="card-pv" style={{ padding: '22px', marginBottom: '14px' }}>
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
    </>
  );
};

export default Analytics;
