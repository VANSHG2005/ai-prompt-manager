import { Search, X } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';

const SearchFilter = ({ filters, onFilterChange, onReset }) => {
  const hasFilters = filters.search || filters.category || filters.aiTool || filters.sort !== 'newest';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Search */}
      <div className="search-wrap-pv" style={{ flex: 1, minWidth: '200px' }}>
        <Search size={14} className="search-icon" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
        <input
          value={filters.search}
          onChange={e => onFilterChange('search', e.target.value)}
          className="search-input-pv"
          placeholder="Search by title, tag, or content…"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange('search', '')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category */}
      <select
        value={filters.category}
        onChange={e => onFilterChange('category', e.target.value)}
        className="select-pv"
        style={{ minWidth: '140px' }}
      >
        <option value="">All categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* AI Tool */}
      <select
        value={filters.aiTool}
        onChange={e => onFilterChange('aiTool', e.target.value)}
        className="select-pv"
        style={{ minWidth: '130px' }}
      >
        <option value="">All tools</option>
        {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={e => onFilterChange('sort', e.target.value)}
        className="select-pv"
        style={{ minWidth: '130px' }}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="favorites">Favorites</option>
        <option value="rating">Top rated</option>
        <option value="usage">Most used</option>
      </select>

      {hasFilters && (
        <button className="btn-pv" onClick={onReset} style={{ gap: '5px' }}>
          <X size={13} /> Reset
        </button>
      )}
    </div>
  );
};

export default SearchFilter;
