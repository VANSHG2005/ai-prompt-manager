import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { promptService } from '../services/promptService';
import { CATEGORY_COLORS, AI_TOOL_COLORS, CATEGORIES } from '../utils/constants';
import Spinner from '../components/common/Spinner';
import { FolderOpen, Copy, Heart, ChevronRight, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Collections = () => {
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    promptService.getAll({}).then(d => setAllPrompts(d.prompts)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...CATEGORIES.filter(c => allPrompts.some(p => p.category === c))];

  const filtered = allPrompts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags?.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Group by category
  const grouped = {};
  filtered.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied!', { icon: '📋' });
  };

  return (
    <DashboardLayout title="Collections">
      <div className="mb-6">
        <p className="text-gray-500 font-body text-sm">Browse your prompts organized by category.</p>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search prompts..." />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const colors = CATEGORY_COLORS[cat] || { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-400' };
          const count = cat === 'All' ? allPrompts.length : allPrompts.filter(p => p.category === cat).length;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${
                activeCategory === cat
                  ? cat === 'All' ? 'bg-obsidian-600 border-obsidian-400 text-white' : `${colors.bg} ${colors.text} ${colors.border}`
                  : 'bg-obsidian-800 border-obsidian-600 text-gray-500 hover:text-gray-300'
              }`}>
              {cat !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />}
              {cat}
              <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${activeCategory === cat ? 'bg-white/10' : 'bg-obsidian-700'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card p-14 text-center">
          <FolderOpen size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-body">No prompts found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, prompts]) => {
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
            const isOpen = expanded === category || activeCategory !== 'All';
            return (
              <div key={category} className="card overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => setExpanded(isOpen && expanded === category ? null : category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-obsidian-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <span className={`font-display font-semibold ${colors.text} text-base`}>{category}</span>
                    <span className="badge bg-obsidian-700 border border-obsidian-500 text-gray-400 font-mono text-xs">{prompts.length}</span>
                  </div>
                  <ChevronRight size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Prompt List */}
                {isOpen && (
                  <div className="border-t border-obsidian-700 divide-y divide-obsidian-700">
                    {prompts.map(prompt => {
                      const toolColor = AI_TOOL_COLORS[prompt.aiTool] || 'text-gray-400';
                      return (
                        <div key={prompt._id} className="px-4 py-3 hover:bg-obsidian-700/30 transition-colors group">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-display font-semibold text-white text-sm truncate">{prompt.title}</p>
                                {prompt.isFavorite && <Heart size={11} className="fill-red-400 text-red-400 shrink-0" />}
                              </div>
                              <p className="text-gray-500 font-mono text-xs leading-relaxed line-clamp-2">{prompt.promptText}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`font-mono text-xs ${toolColor}`}>{prompt.aiTool}</span>
                                {prompt.tags?.slice(0, 3).map(t => (
                                  <span key={t} className="badge bg-obsidian-700 text-gray-500 text-xs">#{t}</span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopy(prompt.promptText)}
                              className="p-2 rounded-lg bg-obsidian-700 hover:bg-obsidian-600 text-gray-500 hover:text-neon-blue transition-all opacity-0 group-hover:opacity-100 shrink-0"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Collections;
