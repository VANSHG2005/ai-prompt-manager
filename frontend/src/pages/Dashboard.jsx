import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { Sparkles, Heart, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORY_COLORS } from '../utils/constants';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card-hover p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {sub && <span className="text-gray-500 font-mono text-xs">{sub}</span>}
    </div>
    <p className="font-display font-bold text-white text-3xl mb-1">{value ?? '—'}</p>
    <p className="text-gray-500 font-body text-sm">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, promptsData] = await Promise.all([
          promptService.getStats(),
          promptService.getAll({ sort: 'newest' }),
        ]);
        setStats(statsData.stats);
        setRecentPrompts(promptsData.prompts.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-white text-2xl">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-gray-500 font-body mt-1">Here's an overview of your prompt library.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Sparkles} label="Total Prompts" value={stats?.total} color="bg-gradient-to-br from-neon-blue/80 to-blue-600" />
        <StatCard icon={Heart} label="Favorite Prompts" value={stats?.favorites} color="bg-gradient-to-br from-red-500/80 to-pink-600" />
        <StatCard icon={Tag} label="Categories Used" value={stats?.categoryCount} color="bg-gradient-to-br from-neon-purple/80 to-purple-600" />
      </div>

      {/* Category Breakdown */}
      {stats?.categoryBreakdown?.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="font-display font-semibold text-white mb-4">Category Breakdown</h3>
          <div className="space-y-2.5">
            {stats.categoryBreakdown.map(({ _id: cat, count }) => {
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs font-body ${colors.text} w-20 shrink-0`}>{cat}</span>
                  <div className="flex-1 bg-obsidian-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${colors.dot}`} style={{ width: `${pct}%`, background: undefined }} />
                  </div>
                  <span className="text-gray-500 font-mono text-xs w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Recent Prompts</h3>
          <Link to="/prompts" className="flex items-center gap-1.5 text-neon-blue text-sm hover:underline font-body">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentPrompts.length === 0 ? (
          <div className="card p-10 text-center">
            <Sparkles size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-body">No prompts yet</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/prompts" className="btn-primary inline-flex items-center gap-2">Create your first prompt</Link>
              <Link to="/prompts" className="flex items-center gap-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 text-neon-blue font-semibold text-sm px-4 py-2.5 rounded-lg">Generate with AI</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentPrompts.map(prompt => {
              const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
              return (
                <div key={prompt._id} className="card-hover p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-display font-semibold text-white text-sm truncate">{prompt.title}</p>
                    <span className={`badge ${catColors.bg} ${catColors.text} ${catColors.border} border shrink-0`}>{prompt.category}</span>
                  </div>
                  <p className="text-gray-500 text-xs font-mono truncate">{prompt.promptText}</p>
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
