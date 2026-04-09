import { useState, useEffect, useCallback } from 'react';
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

  const handleAIGenerated = (data) => {
    setEditingPrompt(null);
    setAiPrefill(data);
    setShowForm(true);
  };

  const activeFiltersCount = [filters.category, filters.aiTool, filters.search]
    .filter(Boolean).length + (filters.sort !== 'newest' ? 1 : 0);

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
            {prompts.length} result{prompts.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>· {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>}
          </span>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="btn-pv btn-ghost-pv"
            style={{ fontSize: '12.5px', gap: '5px', color: showAnalytics ? 'var(--accent)' : undefined }}
          >
            <BarChart2 size={13} /> {showAnalytics ? 'Hide' : 'Show'} analytics
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button onClick={() => setShowAI(true)} className="btn-ai-pv" style={{ gap: '6px' }}>
            <Wand2 size={13} /> Generate with AI
          </button>
          <button
            onClick={() => { setEditingPrompt(null); setAiPrefill(null); setShowForm(true); }}
            className="btn-pv btn-primary-pv"
            style={{ gap: '5px' }}
          >
            <Plus size={14} /> New prompt
          </button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && stats.total > 0 && (
        <div style={{ marginBottom: '20px' }} className="animate-slide-up">
          <PromptAnalytics stats={stats} prompts={prompts} />
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '14px' }}>
        <SearchFilter filters={filters} onFilterChange={handleFilterChange} onReset={() => setFilters(defaultFilters)} />
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {filters.category && (
            <span className="tag-pv" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              Category: {filters.category}
              <button onClick={() => handleFilterChange('category', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', lineHeight: 1, padding: '0 1px' }}>
                <X size={10} />
              </button>
            </span>
          )}
          {filters.aiTool && (
            <span className="tag-pv" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              Tool: {filters.aiTool}
              <button onClick={() => handleFilterChange('aiTool', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', lineHeight: 1, padding: '0 1px' }}>
                <X size={10} />
              </button>
            </span>
          )}
          {filters.sort !== 'newest' && (
            <span className="tag-pv" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              Sort: {filters.sort}
              <button onClick={() => handleFilterChange('sort', 'newest')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', lineHeight: 1, padding: '0 1px' }}>
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Spinner size="lg" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="empty-state-pv">
          <div className="empty-icon-pv"><Sparkles size={22} /></div>
          <div className="empty-title-pv">{activeFiltersCount > 0 ? 'No matching prompts' : 'No prompts yet'}</div>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
            {activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Generate your first AI prompt or create one manually'}
          </p>
          {activeFiltersCount > 0 ? (
            <button onClick={() => setFilters(defaultFilters)} className="btn-pv" style={{ gap: '5px' }}>
              <X size={13} /> Clear filters
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => setShowAI(true)} className="btn-ai-pv" style={{ gap: '6px' }}><Wand2 size={13} /> Generate with AI</button>
              <button onClick={() => { setEditingPrompt(null); setAiPrefill(null); setShowForm(true); }} className="btn-pv btn-primary-pv" style={{ gap: '5px' }}><Plus size={13} /> Create manually</button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {prompts.map(p => (
            <PromptCard key={p._id} prompt={p} onEdit={handleEdit} onDelete={setDeleteId}
              onToggleFavorite={handleToggleFavorite} onDuplicate={duplicatePrompt} onView={setViewingPrompt} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {prompts.map(p => (
            <PromptListItem key={p._id} prompt={p} onEdit={handleEdit} onDelete={setDeleteId}
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
    </>
  );
};

export default Prompts;
