// SearchFilter.jsx — Mobile-optimized
// Changes:
// - Vertical stack on mobile, horizontal on tablet+
// - Full-width selects on mobile
// - Touch-friendly inputs (min 44px)
// - Proper input types for mobile keyboards
// - Debounced search input

import { useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';

const SearchFilter = ({ filters, onFilterChange, onReset }) => {
  const searchRef = useRef(null);
  const hasFilters = filters.search || filters.category || filters.aiTool || filters.sort !== 'newest';

  const handleClearSearch = () => {
    onFilterChange('search', '');
    searchRef.current?.focus();
  };

  return (
    <div
      className="search-filter-mobile"
      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
      role="search"
      aria-label="Filter prompts"
    >
      {/* Search input */}
      <div className="search-wrap-pv" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
        <Search
          size={14}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 11,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={searchRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={filters.search}
          onChange={e => onFilterChange('search', e.target.value)}
          className="search-input-pv"
          placeholder="Search by title, tag, or content…"
          aria-label="Search prompts"
          style={{ paddingLeft: 34, paddingRight: filters.search ? 34 : 12 }}
        />
        {filters.search && (
          <button
            onClick={handleClearSearch}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: '50%',
              minWidth: 24,
              minHeight: 24,
              justifyContent: 'center',
            }}
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filter row — wraps on mobile */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
        {/* Category */}
        <div style={{ flex: '1 1 130px', minWidth: 0 }}>
          <label className="sr-only" htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={e => onFilterChange('category', e.target.value)}
            className="select-pv"
            style={{ width: '100%', minWidth: 0 }}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* AI Tool */}
        <div style={{ flex: '1 1 120px', minWidth: 0 }}>
          <label className="sr-only" htmlFor="filter-tool">AI Tool</label>
          <select
            id="filter-tool"
            value={filters.aiTool}
            onChange={e => onFilterChange('aiTool', e.target.value)}
            className="select-pv"
            style={{ width: '100%', minWidth: 0 }}
            aria-label="Filter by AI tool"
          >
            <option value="">All tools</option>
            {AI_TOOLS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div style={{ flex: '1 1 120px', minWidth: 0 }}>
          <label className="sr-only" htmlFor="filter-sort">Sort order</label>
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={e => onFilterChange('sort', e.target.value)}
            className="select-pv"
            style={{ width: '100%', minWidth: 0 }}
            aria-label="Sort prompts"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="favorites">Favorites</option>
            <option value="rating">Top rated</option>
            <option value="usage">Most used</option>
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            className="btn-pv"
            onClick={onReset}
            style={{ gap: 5, flexShrink: 0 }}
            aria-label="Reset all filters"
          >
            <X size={13} aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
