const BarChart = ({ data, type = 'category' }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  const colors = {
    Coding: '#4a7fd4', Writing: '#2e9944', Image: '#8b4fc2',
    Video: '#d4621c', Marketing: '#c7336e', Other: '#807d78',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map(({ label, count }) => {
        const pct = Math.round((count / max) * 100);
        const color = type === 'category' ? (colors[label] || '#807d78') : 'var(--accent)';
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 }}>
              {label}
            </span>
            <div className="bar-track-pv" style={{ flex: 1 }}>
              <div className="bar-fill-pv" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'var(--text-tertiary)', width: '24px', textAlign: 'right' }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DonutRing = ({ percentage, color = 'var(--accent)', size = 80, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

const PromptAnalytics = ({ stats, prompts }) => {
  if (!stats || !prompts) return null;

  const catMap = {};
  const toolMap = {};
  prompts.forEach(p => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
    toolMap[p.aiTool] = (toolMap[p.aiTool] || 0) + 1;
  });

  const catData = Object.entries(catMap).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  const toolData = Object.entries(toolMap).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  const favPct = stats.total ? Math.round((stats.favorites / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
      {/* Category */}
      <div className="card-pv" style={{ padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>By category</div>
        {catData.length === 0
          ? <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No data yet</p>
          : <BarChart data={catData} type="category" />}
      </div>

      {/* Tool */}
      <div className="card-pv" style={{ padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>By AI tool</div>
        {toolData.length === 0
          ? <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No data yet</p>
          : <BarChart data={toolData} type="tool" />}
      </div>

      {/* Favorite ratio */}
      <div className="card-pv" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Favorite ratio</div>
        <div style={{ position: 'relative' }}>
          <DonutRing percentage={favPct} size={96} stroke={10} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--f-serif)', fontSize: '20px', color: 'var(--text-primary)' }}>{favPct}%</span>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          {stats.favorites} of {stats.total} favorited
        </p>
      </div>
    </div>
  );
};

export { BarChart, DonutRing, PromptAnalytics };
export default PromptAnalytics;
