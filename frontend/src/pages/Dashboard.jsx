import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { promptService } from '../services/promptService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import {
  Sparkles, Heart, Tag, ArrowRight, Wand2, Plus,
  TrendingUp, Clock, Copy, Star, Zap, BarChart2,
  Bot, Flame
} from 'lucide-react';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, gradient, change }) => (
  <div className="card-hover p-5 relative overflow-hidden group">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient} opacity-5`} />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
      <p className="font-display font-black text-white text-4xl mb-1 tabular-nums">{value ?? '—'}</p>
      <p className="text-gray-500 font-body text-sm">{label}</p>
    </div>
  </div>
);

// ── Activity Heatmap (7-day mini bar) ─────────────────────────────────────
const ActivityBar = ({ activity }) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const found = activity?.find(a => a._id === key);
    days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), count: found?.count || 0, date: key });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-12">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1" title={`${d.date}: ${d.count} prompt${d.count !== 1 ? 's' : ''}`}>
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max((d.count / max) * 100, 8)}%`,
              background: d.count > 0
                ? `rgba(88,166,255,${0.3 + (d.count / max) * 0.7})`
                : 'rgba(48,54,61,0.8)',
            }}
          />
          <span className="text-gray-600 font-mono text-[9px]">{d.label[0]}</span>
        </div>
      ))}
    </div>
  );
};

// ── Quick Action Card ──────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, desc, to, color, onClick }) => {
  const content = (
    <div className="card-hover p-4 flex items-center gap-3 group cursor-pointer">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={17} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-display font-semibold text-white text-sm">{label}</p>
        <p className="text-gray-500 font-body text-xs truncate">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-600 group-hover:text-neon-blue ml-auto shrink-0 transition-colors" />
    </div>
  );
  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  return <Link to={to}>{content}</Link>;
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '⚡' : '🌙';

  useEffect(() => {
    const load = async () => {
      try {
        const [userStatsData, promptsData] = await Promise.all([
          userService.getStats(),
          promptService.getAll({ sort: 'newest' }),
        ]);
        setStats(userStatsData.stats);
        setRecentPrompts(promptsData.prompts.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  const favPct = stats?.total ? Math.round((stats.favorites / stats.total) * 100) : 0;

  return (
    <DashboardLayout title="Dashboard">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden card p-6 mb-6 border-obsidian-600">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-neon-blue/5 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display font-black text-white text-2xl mb-1">
              {greeting}, <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span> {greetingEmoji}
            </h2>
            <p className="text-gray-500 font-body text-sm">
              {stats?.total === 0
                ? 'Start building your prompt library today.'
                : `You have ${stats?.total} prompt${stats?.total !== 1 ? 's' : ''} saved${stats?.favorites > 0 ? ` · ${stats.favorites} favorite${stats.favorites !== 1 ? 's' : ''}` : ''}.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/prompts')}
              className="flex items-center gap-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 hover:border-neon-blue/70 text-neon-blue font-semibold text-sm px-4 py-2.5 rounded-lg transition-all"
            >
              <Wand2 size={15} /> Generate with AI
            </button>
            <Link to="/prompts" className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> New Prompt
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Sparkles}  label="Total Prompts"    value={stats?.total}         gradient="from-blue-500 to-blue-700" />
        <StatCard icon={Heart}     label="Favorites"        value={stats?.favorites}      gradient="from-red-500 to-pink-700" />
        <StatCard icon={Tag}       label="Categories"       value={stats?.categoryCount}  gradient="from-purple-500 to-violet-700" />
        <StatCard icon={Bot}       label="AI Tools Used"    value={stats?.aiToolCount}    gradient="from-emerald-500 to-teal-700" />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Activity + Breakdown */}
        <div className="lg:col-span-2 space-y-4">

          {/* 7-Day Activity */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Flame size={16} className="text-orange-400" /> Activity — Last 7 Days
              </h3>
              <span className="text-gray-600 font-mono text-xs">
                {stats?.activity?.reduce((s, a) => s + a.count, 0) || 0} prompts
              </span>
            </div>
            <ActivityBar activity={stats?.activity} />
          </div>

          {/* Category Breakdown */}
          {stats?.categoryBreakdown?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-neon-blue" /> Category Breakdown
              </h3>
              <div className="space-y-2.5">
                {stats.categoryBreakdown.map(({ _id: cat, count }) => {
                  const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`text-xs font-body ${colors.text} w-20 shrink-0`}>{cat}</span>
                      <div className="flex-1 bg-obsidian-700 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%`, backgroundColor: cat === 'Coding' ? '#58a6ff' : cat === 'Writing' ? '#3fb950' : cat === 'Image' ? '#bc8cff' : cat === 'Video' ? '#f78166' : cat === 'Marketing' ? '#ff7eb6' : '#8b949e' }} />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-gray-400 font-mono text-xs w-4 text-right">{count}</span>
                        <span className="text-gray-600 font-mono text-xs">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Favorite ratio ring */}
          <div className="card p-5 flex flex-col items-center gap-3">
            <h3 className="font-display font-semibold text-white self-start flex items-center gap-2">
              <Star size={15} className="text-yellow-400" /> Favorite Rate
            </h3>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 80 80" className="-rotate-90 w-full h-full">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#21262d" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#f85149" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - favPct / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-white text-xl">{favPct}%</span>
              </div>
            </div>
            <p className="text-gray-500 font-body text-xs text-center">
              {stats?.favorites} of {stats?.total} prompts favorited
            </p>
          </div>

          {/* Top Tags */}
          {stats?.topTags?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
                <Tag size={15} className="text-neon-purple" /> Top Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {stats.topTags.map(({ _id: tag, count }) => (
                  <span key={tag} className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-400 border border-obsidian-500 text-xs hover:border-neon-purple/40 hover:text-neon-purple transition-colors cursor-default">
                    #{tag} <span className="text-gray-600">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-white mb-3 text-sm px-1">Quick Actions</h3>
            <div className="space-y-1">
              <QuickAction icon={Plus}     label="New Prompt"      desc="Write from scratch"      to="/prompts"    color="bg-neon-blue/80" />
              <QuickAction icon={Wand2}    label="AI Generate"     desc="Generate with Groq AI"   to="/prompts"    color="bg-gradient-to-br from-neon-blue to-neon-purple" />
              <QuickAction icon={Heart}    label="Favorites"       desc="View starred prompts"    to="/favorites"  color="bg-red-500/80" />
              <QuickAction icon={BarChart2} label="Analytics"      desc="Deep dive your stats"    to="/analytics"  color="bg-emerald-500/80" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Prompts ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-gray-500" /> Recent Prompts
          </h3>
          <Link to="/prompts" className="flex items-center gap-1.5 text-neon-blue text-sm hover:underline font-body">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentPrompts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-obsidian-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-neon-blue" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">No prompts yet</h3>
            <p className="text-gray-500 font-body text-sm mb-5">Create your first prompt or generate one with AI</p>
            <div className="flex gap-3 justify-center">
              <Link to="/prompts" className="btn-primary flex items-center gap-2"><Plus size={15} /> Create Prompt</Link>
              <Link to="/prompts" className="flex items-center gap-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 text-neon-blue font-semibold text-sm px-4 py-2.5 rounded-lg">
                <Wand2 size={15} /> Generate with AI
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentPrompts.map(prompt => {
              const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
              const toolColor = AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other;
              return (
                <div key={prompt._id} className="card-hover p-4 group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-display font-semibold text-white text-sm leading-snug truncate group-hover:text-neon-blue transition-colors">{prompt.title}</p>
                    {prompt.isFavorite && <Heart size={13} className="fill-red-400 text-red-400 shrink-0 mt-0.5" />}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${catColors.bg} ${catColors.text} ${catColors.border} border text-xs`}>{prompt.category}</span>
                    <span className={`font-mono text-xs ${toolColor}`}>{prompt.aiTool}</span>
                  </div>
                  <p className="text-gray-600 text-xs font-mono truncate">{prompt.promptText}</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-obsidian-700">
                    <span className="text-gray-600 font-mono text-xs">
                      {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(prompt.promptText);
                        toast.success('Copied!', { icon: '📋' });
                      }}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-neon-blue transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
