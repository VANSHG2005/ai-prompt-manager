import { useState, useEffect, useCallback } from 'react';
import { Heart, MoreVertical, Edit2, Copy, Trash2, History, Zap, Plus,
         Sparkles, BarChart2, X, Wand2, Download, CheckSquare, Square,
         AlertCircle, RefreshCw } from 'lucide-react';
import PromptListItem from '../components/prompts/PromptListItem';
import PromptForm from '../components/prompts/PromptForm';
import PromptDetail from '../components/prompts/PromptDetail';
import DeleteConfirm from '../components/prompts/DeleteConfirm';
import SearchFilter from '../components/prompts/SearchFilter';
import PromptAnalytics from '../components/prompts/PromptAnalytics';
import AIGeneratorModal from '../components/prompts/AIGeneratorModal';
import TemplateVariableModal from '../components/prompts/TemplateVariableModal';
import VersionHistoryModal from '../components/prompts/VersionHistoryModal';
import { BulkToolbar, ExportModal } from '../components/prompts/BulkOperations';
import ViewToggle from '../components/common/ViewToggle';
import { PromptGridSkeleton } from '../components/common/SkeletonLoaders';
import usePrompts from '../hooks/usePrompts';
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const defaultFilters = { search: '', category: '', aiTool: '', sort: 'newest' };

/* ── Prompt card ─────────────────────────────────────── */
const MenuItem = ({ label, icon: Icon, onClick, color, hoverBg }) => (
  <button onClick={onClick}
    style={{ display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 10px',background:'none',border:'none',borderRadius:'var(--r-sm)',fontSize:13,color:color||'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--f-sans)',transition:'background 0.12s' }}
    onMouseEnter={e=>e.currentTarget.style.background=hoverBg||'var(--bg-base)'}
    onMouseLeave={e=>e.currentTarget.style.background='none'}
  >
    <Icon size={13} color={color||'var(--text-tertiary)'} /> {label}
  </button>
);

const EnhancedPromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite, onDuplicate, onView, onUseTemplate, onViewHistory }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const handleCopy = async e => { e?.stopPropagation(); await navigator.clipboard.writeText(prompt.promptText); toast.success('Copied!'); };
  const handleFav  = async e => { e.stopPropagation(); setFavLoading(true); await onToggleFavorite(prompt._id); setFavLoading(false); };
  const truncate = (t, n=120) => t.length>n ? t.slice(0,n)+'…' : t;
  const hasVars = /\{\{[^}]+\}\}/.test(prompt.promptText);

  return (
    <div className="prompt-card-pv animate-slide-up" onClick={()=>onView?.(prompt)}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
          <span className={`cat-pill-pv cat-${prompt.category}`}><span className="cat-dot-pv"/>{prompt.category}</span>
          <span style={{fontFamily:'var(--f-mono)',fontSize:11,color:'var(--text-tertiary)'}}>{prompt.aiTool}</span>
          {hasVars&&<span style={{fontFamily:'var(--f-mono)',fontSize:10,background:'var(--sage-subtle)',color:'var(--sage)',border:'1px solid var(--sage-border)',borderRadius:3,padding:'1px 5px'}}>template</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:2,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <button className="icon-btn-pv" onClick={handleFav} disabled={favLoading} style={{color:prompt.isFavorite?'var(--accent)':undefined}}>
            <Heart size={14} fill={prompt.isFavorite?'currentColor':'none'}/>
          </button>
          <div style={{position:'relative'}}>
            <button className="icon-btn-pv" onClick={()=>setShowMenu(m=>!m)}><MoreVertical size={14}/></button>
            {showMenu&&(
              <>
                <div style={{position:'fixed',inset:0,zIndex:10}} onClick={()=>setShowMenu(false)}/>
                <div style={{position:'absolute',right:0,top:32,zIndex:20,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:4,minWidth:185,boxShadow:'var(--shadow-md)',animation:'fadeIn 0.15s ease'}}>
                  {hasVars&&<MenuItem label="Use as template" icon={Zap} color="var(--sage)" hoverBg="var(--sage-subtle)" onClick={()=>{onUseTemplate?.(prompt);setShowMenu(false);}}/>}
                  <MenuItem label="Edit" icon={Edit2} onClick={()=>{onEdit(prompt);setShowMenu(false);}}/>
                  <MenuItem label="Duplicate" icon={Copy} onClick={()=>{onDuplicate(prompt._id);setShowMenu(false);}}/>
                  <MenuItem label="Copy text" icon={Copy} onClick={()=>{handleCopy();setShowMenu(false);}}/>
                  <MenuItem label="Version history" icon={History} onClick={()=>{onViewHistory?.(prompt);setShowMenu(false);}}/>
                  <div style={{borderTop:'1px solid var(--border)',margin:'4px 0'}}/>
                  <MenuItem label="Delete" icon={Trash2} color="var(--accent)" hoverBg="var(--accent-subtle)" onClick={()=>{onDelete(prompt._id);setShowMenu(false);}}/>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',lineHeight:1.35,letterSpacing:'-0.01em'}}>{prompt.title}</div>
      <div className="prompt-preview-pv">{truncate(prompt.promptText)}</div>
      {prompt.tags?.length>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
          {prompt.tags.slice(0,4).map(t=><span key={t} className="tag-pv">#{t}</span>)}
          {prompt.tags.length>4&&<span className="tag-pv">+{prompt.tags.length-4}</span>}
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid var(--border)',marginTop:'auto'}}>
        <span style={{fontFamily:'var(--f-mono)',fontSize:11.5,color:'var(--text-tertiary)'}}>
          {new Date(prompt.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </span>
        <div style={{display:'flex',gap:2}} onClick={e=>e.stopPropagation()}>
          {hasVars&&<button className="icon-btn-pv" title="Use as template" style={{color:'var(--sage)'}} onClick={()=>onUseTemplate?.(prompt)}><Zap size={12}/></button>}
          <button className="icon-btn-pv" title="Version history" onClick={()=>onViewHistory?.(prompt)}><History size={12}/></button>
          <button className="icon-btn-pv" title="Copy" onClick={handleCopy}><Copy size={13}/></button>
        </div>
      </div>
    </div>
  );
};

const SelectableCard = ({ id, selected, onSelect, selectionMode, children }) => (
  <div style={{position:'relative'}}>
    {selectionMode&&(
      <button onClick={e=>{e.stopPropagation();onSelect(id);}}
        style={{position:'absolute',top:10,left:10,zIndex:10,width:20,height:20,borderRadius:5,border:'none',
          background:selected?'var(--accent)':'var(--bg-surface)',
          boxShadow:selected?'none':'0 0 0 2px var(--border-strong)',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .12s'}}
      >
        {selected&&<span style={{color:'#fff',fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
      </button>
    )}
    <div style={{opacity:selectionMode&&!selected?0.6:1,transition:'opacity .15s'}}>{children}</div>
  </div>
);

/* ── Main page ───────────────────────────────────────── */
const Prompts = () => {
  const { prompts, loading, error, actionLoading, stats, fetchPrompts, createPrompt, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt } = usePrompts();
  const [viewMode, setViewMode] = useLocalStorage('promptViewMode','grid');
  const [showAnalytics, setShowAnalytics] = useLocalStorage('showAnalytics',false);
  const [filters, setFilters] = useState(defaultFilters);
  const debouncedSearch = useDebounce(filters.search, 350);

  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [aiPrefill, setAiPrefill] = useState(null);
  const [templatePrompt, setTemplatePrompt] = useState(null);
  const [historyPrompt, setHistoryPrompt] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const load = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category) params.category = filters.category;
    if (filters.aiTool)   params.aiTool   = filters.aiTool;
    if (filters.sort)     params.sort     = filters.sort;
    fetchPrompts(params);
  }, [debouncedSearch, filters.category, filters.aiTool, filters.sort, fetchPrompts]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!selectionMode) setSelectedIds([]); }, [selectionMode]);

  const handleFilterChange = (key,val) => setFilters(f=>({...f,[key]:val}));
  const handleFormSubmit = async formData => {
    const ok = editingPrompt ? await updatePrompt(editingPrompt._id,formData) : await createPrompt(formData);
    if (ok) { setShowForm(false); setEditingPrompt(null); setAiPrefill(null); }
  };
  const handleEdit = p => { setEditingPrompt(p); setAiPrefill(null); setShowForm(true); };
  const handleDeleteConfirm = async () => { const ok = await deletePrompt(deleteId); if (ok) setDeleteId(null); };
  const handleToggleFavorite = async id => {
    await toggleFavorite(id);
    if (viewingPrompt?._id === id) setViewingPrompt(p => p ? {...p,isFavorite:!p.isFavorite} : null);
  };
  const toggleSelect = id => setSelectedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const deselectAll  = () => { setSelectedIds([]); setSelectionMode(false); };

  const activeFiltersCount = [filters.category,filters.aiTool,filters.search].filter(Boolean).length + (filters.sort!=='newest'?1:0);

  return (
    <>
      {/* Toolbar — responsive two-row on mobile */}
      <div className="toolbar-mobile" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <span style={{fontFamily:'var(--f-mono)',fontSize:12.5,color:'var(--text-tertiary)'}}>
            {prompts.length} result{prompts.length!==1?'s':''}
            {activeFiltersCount>0&&<span style={{color:'var(--accent)',marginLeft:6}}>· {activeFiltersCount} filter{activeFiltersCount>1?'s':''} active</span>}
          </span>
          <button onClick={()=>setShowAnalytics(!showAnalytics)} className="btn-pv btn-ghost-pv" style={{fontSize:12.5,gap:5,color:showAnalytics?'var(--accent)':undefined}}>
            <BarChart2 size={13}/> {showAnalytics?'Hide':'Show'} analytics
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <ViewToggle mode={viewMode} onChange={setViewMode}/>
          <button onClick={()=>{setSelectionMode(s=>!s);setSelectedIds([]);}} className={`btn-pv ${selectionMode?'btn-sage-pv':''}`} style={{gap:5,fontSize:12.5}}>
            {selectionMode?<CheckSquare size={13}/>:<Square size={13}/>}
            <span className="hidden sm:block">{selectionMode?'Selecting':'Select'}</span>
          </button>
          <button onClick={()=>setShowExport(true)} className="btn-pv" style={{gap:5}} title="Export"><Download size={13}/></button>
          <button onClick={()=>setShowAI(true)} className="btn-ai-pv" style={{gap:6}}><Wand2 size={13}/><span className="hidden sm:block">Generate with AI</span></button>
          <button onClick={()=>{setEditingPrompt(null);setAiPrefill(null);setShowForm(true);}} className="btn-pv btn-primary-pv" style={{gap:5}}>
            <Plus size={14}/><span className="hidden sm:block">New prompt</span>
          </button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics&&stats.total>0&&(
        <div style={{marginBottom:20}} className="animate-slide-up">
          <PromptAnalytics stats={stats} prompts={prompts}/>
        </div>
      )}

      {/* Filters — responsive */}
      <div style={{marginBottom:14}}>
        <SearchFilter filters={filters} onFilterChange={handleFilterChange} onReset={()=>setFilters(defaultFilters)}/>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
          {[
            filters.category&&{label:`Category: ${filters.category}`,clear:()=>handleFilterChange('category','')},
            filters.aiTool  &&{label:`Tool: ${filters.aiTool}`,clear:()=>handleFilterChange('aiTool','')},
            filters.sort!=='newest'&&{label:`Sort: ${filters.sort}`,clear:()=>handleFilterChange('sort','newest')},
          ].filter(Boolean).map(chip=>(
            <span key={chip.label} className="tag-pv" style={{display:'inline-flex',alignItems:'center',gap:5}}>
              {chip.label}
              <button onClick={chip.clear} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-tertiary)',display:'flex',lineHeight:1,padding:'0 1px'}}><X size={10}/></button>
            </span>
          ))}
        </div>
      )}

      {/* Selection banner */}
      {selectionMode&&(
        <div style={{background:'var(--sage-subtle)',border:'1px solid var(--sage-border)',borderRadius:'var(--r-md)',padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--sage)'}} className="animate-slide-up">
          <CheckSquare size={14}/>
          <span>Tap prompts to select. Use floating toolbar for bulk actions.</span>
          <button onClick={()=>setSelectedIds(prompts.map(p=>p._id))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--sage)',fontWeight:600,fontFamily:'var(--f-sans)',fontSize:13,marginLeft:'auto'}}>
            All {prompts.length}
          </button>
          <button onClick={deselectAll} className="icon-btn-pv" style={{color:'var(--sage)'}}><X size={13}/></button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PromptGridSkeleton count={6}/>
      ) : error ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,paddingTop:60}}>
          <div style={{width:48,height:48,background:'var(--accent-subtle)',borderRadius:'var(--r-md)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <AlertCircle size={22} color="var(--accent)"/>
          </div>
          <p style={{fontSize:14,color:'var(--text-tertiary)'}}>{error}</p>
          <button onClick={load} className="btn-pv" style={{gap:6}}><RefreshCw size={13}/> Retry</button>
        </div>
      ) : prompts.length===0 ? (
        <div className="empty-state-pv">
          <div className="empty-icon-pv"><Sparkles size={22}/></div>
          <div className="empty-title-pv">{activeFiltersCount>0?'No matching prompts':'No prompts yet'}</div>
          <p style={{fontSize:14,color:'var(--text-tertiary)',marginBottom:20}}>
            {activeFiltersCount>0?'Try adjusting your search or filters':'Generate your first AI prompt or create one manually'}
          </p>
          {activeFiltersCount>0
            ?<button onClick={()=>setFilters(defaultFilters)} className="btn-pv" style={{gap:5}}><X size={13}/> Clear filters</button>
            :<div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>setShowAI(true)} className="btn-ai-pv" style={{gap:6}}><Wand2 size={13}/> Generate with AI</button>
              <button onClick={()=>{setEditingPrompt(null);setAiPrefill(null);setShowForm(true);}} className="btn-pv btn-primary-pv" style={{gap:5}}><Plus size={13}/> Create manually</button>
            </div>
          }
        </div>
      ) : viewMode==='grid' ? (
        /* Responsive grid — class controls columns via CSS */
        <div className="prompt-grid-mobile" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {prompts.map(p=>(
            <SelectableCard key={p._id} id={p._id} selected={selectedIds.includes(p._id)} onSelect={toggleSelect} selectionMode={selectionMode}>
              <EnhancedPromptCard
                prompt={p}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                onToggleFavorite={handleToggleFavorite}
                onDuplicate={duplicatePrompt}
                onView={prompt=>{if(selectionMode){toggleSelect(prompt._id);return;}setViewingPrompt(prompt);}}
                onUseTemplate={setTemplatePrompt}
                onViewHistory={setHistoryPrompt}
              />
            </SelectableCard>
          ))}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {prompts.map(p=>(
            <SelectableCard key={p._id} id={p._id} selected={selectedIds.includes(p._id)} onSelect={toggleSelect} selectionMode={selectionMode}>
              <PromptListItem
                prompt={p}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                onToggleFavorite={handleToggleFavorite}
                onDuplicate={duplicatePrompt}
                onView={prompt=>{if(selectionMode){toggleSelect(prompt._id);return;}setViewingPrompt(prompt);}}
              />
            </SelectableCard>
          ))}
        </div>
      )}

      {/* Modals */}
      <AIGeneratorModal isOpen={showAI} onClose={()=>setShowAI(false)} onUse={data=>{setEditingPrompt(null);setAiPrefill(data);setShowForm(true);}}/>
      <PromptDetail prompt={viewingPrompt} isOpen={!!viewingPrompt} onClose={()=>setViewingPrompt(null)}
        onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} onDuplicate={duplicatePrompt}
        onUseTemplate={p=>{setViewingPrompt(null);setTemplatePrompt(p);}}
        onViewHistory={p=>{setViewingPrompt(null);setHistoryPrompt(p);}}/>
      <PromptForm isOpen={showForm} onClose={()=>{setShowForm(false);setEditingPrompt(null);setAiPrefill(null);}}
        onSubmit={handleFormSubmit} initialData={editingPrompt||aiPrefill} loading={actionLoading}/>
      <DeleteConfirm isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDeleteConfirm} loading={actionLoading}/>
      <TemplateVariableModal isOpen={!!templatePrompt} onClose={()=>setTemplatePrompt(null)} prompt={templatePrompt}/>
      <VersionHistoryModal isOpen={!!historyPrompt} onClose={()=>setHistoryPrompt(null)} prompt={historyPrompt} onRestore={load}/>
      <ExportModal isOpen={showExport} onClose={()=>setShowExport(false)} selectedIds={[]}/>
      <BulkToolbar selectedIds={selectedIds} totalCount={prompts.length}
        onSelectAll={()=>setSelectedIds(prompts.map(p=>p._id))}
        onDeselectAll={deselectAll} onRefresh={load}
        onBulkDelete={()=>{deselectAll();load();}}/>
    </>
  );
};

export default Prompts;
