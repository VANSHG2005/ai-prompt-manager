import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import Spinner from '../components/common/Spinner';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../utils/constants';
import { BarChart2, TrendingUp, Tag, Bot, Calendar, Flame, Award, Clock } from 'lucide-react';

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="card p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon size={17} className="text-white" />
    </div>
    <div>
      <p className="font-display font-bold text-white text-2xl tabular-nums">{value ?? '—'}</p>
      <p className="text-gray-500 font-body text-xs">{label}</p>
      {sub && <p className="text-gray-600 font-mono text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const HeatmapRow = ({ label, value, max, color }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 font-body text-xs w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-obsidian-700 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color || '#58a6ff' }} />
      </div>
      <span className="text-gray-500 font-mono text-xs w-6 text-right">{value}</span>
    </div>
  );
};

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
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  // Build 30-day calendar heatmap
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const found = stats?.activity?.find(a => a._id === key);
    days.push({ key, count: found?.count || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
  }
  const heatMax = Math.max(...days.map(d => d.count), 1);

  // AI tool usage
  const toolMap = {};
  prompts.forEach(p => { toolMap[p.aiTool] = (toolMap[p.aiTool] || 0) + 1; });
  const toolData = Object.entries(toolMap).sort((a, b) => b[1] - a[1]);
  const toolMax = Math.max(...toolData.map(d => d[1]), 1);

  // Tag cloud
  const tagMap = {};
  prompts.forEach(p => p.tags?.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const tagData = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const tagMax = Math.max(...tagData.map(d => d[1]), 1);

  // Longest prompt
  const longest = prompts.reduce((a, b) => (b.promptText.length > a.promptText.length ? b : a), prompts[0] || {});
  const avgLen = prompts.length ? Math.round(prompts.reduce((s, p) => s + p.promptText.length, 0) / prompts.length) : 0;

  // Most active day
  const mostActive = [...days].sort((a, b) => b.count - a.count)[0];

  return (
    <DashboardLayout title="Analytics">
      <div className="mb-6">
        <p className="text-gray-500 font-body text-sm">Insights into your prompt library and usage patterns.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={BarChart2} label="Total Prompts"   value={stats?.total}         color="bg-gradient-to-br from-blue-500 to-blue-700" />
        <MetricCard icon={Award}    label="Favorites"        value={stats?.favorites}      color="bg-gradient-to-br from-red-500 to-pink-600" />
        <MetricCard icon={Clock}    label="Avg Prompt Length" value={`${avgLen}`}          sub="characters" color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MetricCard icon={Flame}    label="Most Active Day"  value={mostActive?.count || 0} sub={mostActive?.label || '—'} color="bg-gradient-to-br from-orange-500 to-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* 30-day heatmap */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-neon-blue" /> 30-Day Activity
          </h3>
          <div className="grid grid-cols-10 gap-1">
            {days.map(d => {
              const intensity = heatMax > 0 ? d.count / heatMax : 0;
              return (
                <div
                  key={d.key}
                  title={`${d.label}: ${d.count} prompt${d.count !== 1 ? 's' : ''}`}
                  className="aspect-square rounded-sm cursor-default transition-transform hover:scale-125"
                  style={{ background: d.count === 0 ? '#21262d' : `rgba(88,166,255,${0.2 + intensity * 0.8})` }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-gray-600 font-mono text-xs">Less</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map(o => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(88,166,255,${o})` }} />
            ))}
            <span className="text-gray-600 font-mono text-xs">More</span>
          </div>
        </div>

        {/* Category pie-ish */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-neon-purple" /> By Category
          </h3>
          <div className="space-y-2.5">
            {(stats?.categoryBreakdown || []).map(({ _id: cat, count }) => {
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              const hex = { Coding: '#58a6ff', Writing: '#3fb950', Image: '#bc8cff', Video: '#f78166', Marketing: '#ff7eb6', Other: '#8b949e' }[cat] || '#8b949e';
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-body ${colors.text}`}>{cat}</span>
                    <span className="text-gray-500 font-mono text-xs">{pct}%</span>
                  </div>
                  <div className="bg-obsidian-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: hex }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* AI Tool usage */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Bot size={16} className="text-emerald-400" /> AI Tool Usage
          </h3>
          {toolData.length === 0 ? (
            <p className="text-gray-600 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {toolData.map(([tool, count]) => {
                const colorClass = AI_TOOL_COLORS[tool] || 'text-gray-400';
                const hex = { ChatGPT: '#3fb950', Claude: '#f78166', Gemini: '#58a6ff', Midjourney: '#bc8cff', 'DALL-E': '#ff7eb6', 'Stable Diffusion': '#d29922', Other: '#8b949e' }[tool] || '#8b949e';
                return (
                  <div key={tool} className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${colorClass} w-28 shrink-0`}>{tool}</span>
                    <div className="flex-1 bg-obsidian-700 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${(count / toolMax) * 100}%`, backgroundColor: hex }} />
                    </div>
                    <span className="text-gray-500 font-mono text-xs w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tag cloud */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Tag size={16} className="text-neon-blue" /> Tag Cloud
          </h3>
          {tagData.length === 0 ? (
            <p className="text-gray-600 text-sm">No tags yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tagData.map(([tag, count]) => {
                const scale = 0.7 + (count / tagMax) * 0.8;
                const opacity = 0.5 + (count / tagMax) * 0.5;
                return (
                  <span key={tag}
                    className="badge bg-obsidian-700 border border-obsidian-500 text-neon-blue font-mono cursor-default hover:border-neon-blue/40 transition-colors"
                    style={{ fontSize: `${Math.max(10, scale * 13)}px`, opacity }}
                    title={`Used ${count} time${count !== 1 ? 's' : ''}`}
                  >
                    #{tag} <span className="text-gray-600 text-xs ml-1">{count}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Longest prompt */}
      {longest?.title && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <Award size={16} className="text-yellow-400" /> Longest Prompt
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <p className="font-display font-semibold text-white">{longest.title}</p>
            <span className="badge bg-obsidian-700 text-gray-400 border border-obsidian-500 font-mono text-xs">{longest.promptText.length} chars</span>
          </div>
          <p className="text-gray-500 font-mono text-xs leading-relaxed bg-obsidian-900 rounded-lg p-3 border border-obsidian-700 line-clamp-3">
            {longest.promptText}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
