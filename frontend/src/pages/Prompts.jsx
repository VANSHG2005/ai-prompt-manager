import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PromptCard from '../components/prompts/PromptCard';
import PromptListItem from '../components/prompts/PromptListItem';
import PromptForm from '../components/prompts/PromptForm';
import PromptDetail from '../components/prompts/PromptDetail';
import DeleteConfirm from '../components/prompts/DeleteConfirm';
import SearchFilter from '../components/prompts/SearchFilter';
import PromptAnalytics from '../components/prompts/PromptAnalytics';
import AIGeneratorModal from '../components/prompts/AIGeneratorModal';
import ViewToggle from '../components/common/ViewToggle';
import usePrompts from '../hooks/usePrompts';
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';
import Spinner from '../components/common/Spinner';
import { Plus, Sparkles, BarChart2, X, Wand2 } from 'lucide-react';

const defaultFilters = { search: '', category: '', aiTool: '', sort: 'newest' };

const Prompts = () => {
  const { prompts, loading, actionLoading, stats, fetchPrompts, createPrompt, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt } = usePrompts();
  const [viewMode, setViewMode] = useLocalStorage('promptViewMode', 'grid');
  const [showAnalytics, setShowAnalytics] = useLocalStorage('showAnalytics', false);
  const [filters, setFilters] = useState(defaultFilters);
  const debouncedSearch = useDebounce(filters.search, 350);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  // Pre-fill data from AI generator
  const [aiPrefill, setAiPrefill] = useState(null);

  const load = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category) params.category = filters.category;
    if (filters.aiTool) params.aiTool = filters.aiTool;
    if (filters.sort) params.sort = filters.sort;
    fetchPrompts(params);
  }, [debouncedSearch, filters.category, filters.aiTool, filters.sort, fetchPrompts]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  const handleFormSubmit = async (formData) => {
    const success = editingPrompt
      ? await updatePrompt(editingPrompt._id, formData)
      : await createPrompt(formData);
    if (success) { setShowForm(false); setEditingPrompt(null); setAiPrefill(null); }
  };

  const handleEdit = (prompt) => { setEditingPrompt(prompt); setAiPrefill(null); setShowForm(true); };

  const handleDeleteConfirm = async () => {
    const success = await deletePrompt(deleteId);
    if (success) setDeleteId(null);
  };

  const handleToggleFavorite = async (id) => {
    await toggleFavorite(id);
    if (viewingPrompt?._id === id) {
      setViewingPrompt(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  // When AI generates a prompt, open the form pre-filled
  const handleAIGenerated = (data) => {
    setEditingPrompt(null);
    setAiPrefill(data);
    setShowForm(true);
  };

  const activeFiltersCount = [filters.category, filters.aiTool, filters.search]
    .filter(Boolean).length + (filters.sort !== 'newest' ? 1 : 0);

  return (
    <DashboardLayout title="Prompts">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 font-body text-sm">
            {prompts.length} result{prompts.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && <span className="text-neon-blue ml-1">({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active)</span>}
          </span>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 btn-secondary text-xs py-1.5 ${showAnalytics ? 'border-neon-blue/40 text-neon-blue' : ''}`}
          >
            <BarChart2 size={13} /> {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          {/* AI Generator Button */}
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 hover:border-neon-blue/70 text-neon-blue font-body font-semibold text-sm px-4 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-neon-blue/10"
          >
            <Wand2 size={15} className="animate-pulse" /> Generate with AI
          </button>
          <button onClick={() => { setEditingPrompt(null); setAiPrefill(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Prompt
          </button>
        </div>
      </div>

      {showAnalytics && stats.total > 0 && (
        <div className="mb-5 animate-slide-up">
          <PromptAnalytics stats={stats} prompts={prompts} />
        </div>
      )}

      <div className="mb-5">
        <SearchFilter filters={filters} onFilterChange={handleFilterChange} onReset={() => setFilters(defaultFilters)} />
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <span className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
              Category: {filters.category}
              <button onClick={() => handleFilterChange('category', '')} className="ml-1 hover:text-red-400"><X size={11} /></button>
            </span>
          )}
          {filters.aiTool && (
            <span className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
              Tool: {filters.aiTool}
              <button onClick={() => handleFilterChange('aiTool', '')} className="ml-1 hover:text-red-400"><X size={11} /></button>
            </span>
          )}
          {filters.sort !== 'newest' && (
            <span className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
              Sort: {filters.sort}
              <button onClick={() => handleFilterChange('sort', 'newest')} className="ml-1 hover:text-red-400"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : prompts.length === 0 ? (
        <div className="card p-16 text-center">
          <Sparkles size={40} className="text-gray-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white text-lg mb-2">
            {activeFiltersCount > 0 ? 'No matching prompts' : 'No prompts yet'}
          </h3>
          <p className="text-gray-500 font-body text-sm mb-5">
            {activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Generate your first AI prompt or create one manually'}
          </p>
          {activeFiltersCount > 0 ? (
            <button onClick={() => setFilters(defaultFilters)} className="btn-secondary inline-flex items-center gap-2"><X size={14} /> Clear filters</button>
          ) : (
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowAI(true)} className="flex items-center gap-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 text-neon-blue font-semibold text-sm px-5 py-2.5 rounded-lg">
                <Wand2 size={15} /> Generate with AI
              </button>
              <button onClick={() => { setEditingPrompt(null); setAiPrefill(null); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Create Manually</button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {prompts.map(prompt => (
            <PromptCard key={prompt._id} prompt={prompt} onEdit={handleEdit} onDelete={setDeleteId}
              onToggleFavorite={handleToggleFavorite} onDuplicate={duplicatePrompt} onView={setViewingPrompt} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {prompts.map(prompt => (
            <PromptListItem key={prompt._id} prompt={prompt} onEdit={handleEdit} onDelete={setDeleteId}
              onToggleFavorite={handleToggleFavorite} onDuplicate={duplicatePrompt} onView={setViewingPrompt} />
          ))}
        </div>
      )}

      <AIGeneratorModal isOpen={showAI} onClose={() => setShowAI(false)} onUse={handleAIGenerated} />

      <PromptDetail prompt={viewingPrompt} isOpen={!!viewingPrompt} onClose={() => setViewingPrompt(null)}
        onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} onDuplicate={duplicatePrompt} />

      <PromptForm isOpen={showForm} onClose={() => { setShowForm(false); setEditingPrompt(null); setAiPrefill(null); }}
        onSubmit={handleFormSubmit} initialData={editingPrompt || aiPrefill} loading={actionLoading} />

      <DeleteConfirm isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm} loading={actionLoading} />
    </DashboardLayout>
  );
};

export default Prompts;
