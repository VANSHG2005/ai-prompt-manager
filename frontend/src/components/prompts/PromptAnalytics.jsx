import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../../utils/constants';

/**
 * RESUME FEATURE: Visual Analytics Component
 * Shows prompt distribution across categories and AI tools
 * Uses pure CSS bar charts — no external chart library needed
 */

const BarChart = ({ data, colorMap, type = 'category' }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map(({ label, count }) => {
        const colors = type === 'category'
          ? (CATEGORY_COLORS[label] || CATEGORY_COLORS.Other)
          : null;
        const pct = Math.round((count / max) * 100);
        return (
          <div key={label} className="flex items-center gap-3">
            <span className={`text-xs font-body w-24 shrink-0 truncate ${type === 'category' ? colors.text : 'text-gray-400'}`}>
              {label}
            </span>
            <div className="flex-1 bg-obsidian-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${type === 'category' ? colors.dot : 'bg-neon-blue'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-gray-500 font-mono text-xs w-5 text-right shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

const DonutRing = ({ percentage, color = '#58a6ff', size = 80, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#21262d" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
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

  // Build category breakdown from prompts
  const catMap = {};
  const toolMap = {};
  prompts.forEach(p => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
    toolMap[p.aiTool] = (toolMap[p.aiTool] || 0) + 1;
  });

  const catData = Object.entries(catMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const toolData = Object.entries(toolMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const favPct = stats.total ? Math.round((stats.favorites / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Category breakdown */}
      <div className="card p-5 md:col-span-1">
        <h4 className="font-display font-semibold text-white text-sm mb-4">By Category</h4>
        {catData.length === 0
          ? <p className="text-gray-600 text-xs">No data yet</p>
          : <BarChart data={catData} type="category" />
        }
      </div>

      {/* AI Tool breakdown */}
      <div className="card p-5 md:col-span-1">
        <h4 className="font-display font-semibold text-white text-sm mb-4">By AI Tool</h4>
        {toolData.length === 0
          ? <p className="text-gray-600 text-xs">No data yet</p>
          : <BarChart data={toolData} type="tool" />
        }
      </div>

      {/* Favorite ratio */}
      <div className="card p-5 flex flex-col items-center justify-center gap-3">
        <h4 className="font-display font-semibold text-white text-sm">Favorite Ratio</h4>
        <div className="relative">
          <DonutRing percentage={favPct} color="#f85149" size={96} stroke={10} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-white text-lg">{favPct}%</span>
          </div>
        </div>
        <p className="text-gray-500 font-body text-xs text-center">
          {stats.favorites} of {stats.total} prompts favorited
        </p>
      </div>
    </div>
  );
};

export { BarChart, DonutRing, PromptAnalytics };
export default PromptAnalytics;
