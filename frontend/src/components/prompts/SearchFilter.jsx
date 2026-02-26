import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, AI_TOOLS } from '../../utils/constants';

const SearchFilter = ({ filters, onFilterChange, onReset }) => {
  const hasFilters = filters.search || filters.category || filters.aiTool || filters.sort !== 'newest';

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={filters.search}
          onChange={e => onFilterChange('search', e.target.value)}
          className="input-field pl-9"
          placeholder="Search by title, tag, or category..."
        />
        {filters.search && (
          <button onClick={() => onFilterChange('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {/* Category */}
        <select
          value={filters.category}
          onChange={e => onFilterChange('category', e.target.value)}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* AI Tool */}
        <select
          value={filters.aiTool}
          onChange={e => onFilterChange('aiTool', e.target.value)}
          className="input-field w-auto min-w-[120px]"
        >
          <option value="">All Tools</option>
          {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={e => onFilterChange('sort', e.target.value)}
          className="input-field w-auto min-w-[120px]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="favorites">Favorites</option>
        </select>

        {hasFilters && (
          <button onClick={onReset} className="btn-secondary flex items-center gap-1.5 whitespace-nowrap">
            <X size={14} /> Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
