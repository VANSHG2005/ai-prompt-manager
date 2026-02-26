import { LayoutGrid, List } from 'lucide-react';

/**
 * RESUME FEATURE: View Mode Toggle
 * Allows users to switch between Grid and List view.
 * Preference is persisted via useLocalStorage.
 */
const ViewToggle = ({ mode, onChange }) => (
  <div className="flex items-center bg-obsidian-800 border border-obsidian-600 rounded-lg p-1 gap-1">
    <button
      onClick={() => onChange('grid')}
      className={`p-2 rounded-md transition-all ${mode === 'grid' ? 'bg-obsidian-600 text-white' : 'text-gray-500 hover:text-white'}`}
      title="Grid view"
    >
      <LayoutGrid size={15} />
    </button>
    <button
      onClick={() => onChange('list')}
      className={`p-2 rounded-md transition-all ${mode === 'list' ? 'bg-obsidian-600 text-white' : 'text-gray-500 hover:text-white'}`}
      title="List view"
    >
      <List size={15} />
    </button>
  </div>
);

export default ViewToggle;
