import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ mode, onChange }) => (
  <div className="view-toggle-pv">
    <button
      onClick={() => onChange('grid')}
      className={`view-btn-pv ${mode === 'grid' ? 'active' : ''}`}
      title="Grid view"
    >
      <LayoutGrid size={15} />
    </button>
    <button
      onClick={() => onChange('list')}
      className={`view-btn-pv ${mode === 'list' ? 'active' : ''}`}
      title="List view"
    >
      <List size={15} />
    </button>
  </div>
);

export default ViewToggle;
