import { useState } from 'react';
import { Trash2, Tag, Heart, Download, X, CheckSquare, Square, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Export Modal ────────────────────────────────────────────────────────────
const ExportModal = ({ isOpen, onClose, selectedIds }) => {
  const [format, setFormat] = useState('json');
  const [exporting, setExporting] = useState(false);
  const [scope, setScope] = useState(selectedIds.length > 0 ? 'selected' : 'all');

  const handleExport = async () => {
    setExporting(true);
    try {
      const ids = scope === 'selected' ? selectedIds : [];
      const res = await api.post('/prompts/bulk/export', { ids, format });
      const { data, count } = res.data;

      const ext = format === 'csv' ? 'csv' : format === 'markdown' ? 'md' : 'json';
      const mime = format === 'csv' ? 'text/csv' : format === 'markdown' ? 'text/markdown' : 'application/json';
      const content = format === 'json' ? JSON.stringify(data, null, 2) : data;

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptvault-export-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${count} prompt${count !== 1 ? 's' : ''} as ${format.toUpperCase()}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  const formats = [
    { id: 'json', label: 'JSON', desc: 'Machine-readable, perfect for re-importing' },
    { id: 'markdown', label: 'Markdown', desc: 'Human-readable with code blocks' },
    { id: 'csv', label: 'CSV', desc: 'Opens in Excel / Google Sheets' },
  ];

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-pv">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={18} color="var(--text-secondary)" />
            <h2 className="modal-title-pv" style={{ fontSize: '18px' }}>Export Prompts</h2>
          </div>
          <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body-pv" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'selected', label: `Selected (${selectedIds.length})` },
                { id: 'all', label: 'All prompts' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setScope(opt.id)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'var(--f-sans)',
                    fontSize: '13px', fontWeight: 500, transition: 'all .15s',
                    background: scope === opt.id ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                    border: `1px solid ${scope === opt.id ? 'var(--accent-border)' : 'var(--border)'}`,
                    color: scope === opt.id ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="form-label-pv" style={{ marginBottom: '10px' }}>Format</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                    background: format === f.id ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                    border: `1px solid ${format === f.id ? 'var(--accent-border)' : 'var(--border)'}`,
                    textAlign: 'left', transition: 'all .15s',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--r-sm)', flexShrink: 0,
                    background: format === f.id ? 'var(--accent)' : 'var(--bg-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fontWeight: 600, color: format === f.id ? '#fff' : 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                      {f.id.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: format === f.id ? 'var(--accent)' : 'var(--text-primary)' }}>{f.label}</p>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer-pv">
          <button className="btn-pv btn-ghost-pv" onClick={onClose}>Cancel</button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-pv btn-primary-pv"
            style={{ gap: '6px', minWidth: '130px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
          >
            {exporting ? <span className="mini-spinner-pv" /> : <Download size={13} />}
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Bulk Tag Modal ──────────────────────────────────────────────────────────
const BulkTagModal = ({ isOpen, onClose, selectedIds, onDone }) => {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [action, setAction] = useState('add');
  const [loading, setLoading] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleApply = async () => {
    if (tags.length === 0) return toast.error('Add at least one tag');
    setLoading(true);
    try {
      await api.post('/prompts/bulk/tag', { ids: selectedIds, tags, action });
      toast.success(`Tags ${action === 'add' ? 'added to' : 'removed from'} ${selectedIds.length} prompt${selectedIds.length !== 1 ? 's' : ''}`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tags');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-pv">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tag size={16} color="var(--text-secondary)" />
            <h2 className="modal-title-pv" style={{ fontSize: '17px' }}>Bulk Tag ({selectedIds.length})</h2>
          </div>
          <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body-pv" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['add', 'remove'].map(a => (
              <button
                key={a}
                onClick={() => setAction(a)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                  fontFamily: 'var(--f-sans)', fontSize: '13px', fontWeight: 500, transition: 'all .15s',
                  background: action === a ? (a === 'add' ? 'var(--sage-subtle)' : 'var(--accent-subtle)') : 'var(--bg-subtle)',
                  border: `1px solid ${action === a ? (a === 'add' ? 'var(--sage-border)' : 'var(--accent-border)') : 'var(--border)'}`,
                  color: action === a ? (a === 'add' ? 'var(--sage)' : 'var(--accent)') : 'var(--text-secondary)',
                }}
              >
                {a === 'add' ? '+ Add tags' : '− Remove tags'}
              </button>
            ))}
          </div>

          <div>
            <label className="form-label-pv">Tags</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                className="input-pv"
                placeholder="Type tag and press Enter…"
              />
              <button onClick={addTag} className="btn-pv" style={{ flexShrink: 0 }}>Add</button>
            </div>
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {tags.map(t => (
                <span key={t} className="tag-pv" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  #{t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', lineHeight: 1, padding: 0 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer-pv">
          <button className="btn-pv btn-ghost-pv" onClick={onClose}>Cancel</button>
          <button onClick={handleApply} disabled={loading} className="btn-pv btn-primary-pv" style={{ gap: '6px', display: 'flex', alignItems: 'center' }}>
            {loading ? <span className="mini-spinner-pv" /> : <Tag size={13} />}
            {loading ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Bulk Toolbar ────────────────────────────────────────────────────────────
const BulkToolbar = ({ selectedIds, totalCount, onSelectAll, onDeselectAll, onRefresh, onBulkDelete }) => {
  const [showExport, setShowExport] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const handleBulkFavorite = async (isFavorite) => {
    setFavLoading(true);
    try {
      await api.post('/prompts/bulk/favorite', { ids: selectedIds, isFavorite });
      toast.success(`${selectedIds.length} prompt${selectedIds.length !== 1 ? 's' : ''} ${isFavorite ? 'favorited' : 'unfavorited'}`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setFavLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} prompt${selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.post('/prompts/bulk/delete', { ids: selectedIds });
      toast.success(`${selectedIds.length} prompt${selectedIds.length !== 1 ? 's' : ''} deleted`);
      onBulkDelete(selectedIds);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div style={{
        position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 500, background: 'var(--bg-inverse, #1A1814)',
        border: '1px solid rgba(240,236,230,0.15)', borderRadius: 'var(--r-xl)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'slideUp 0.2s ease',
        color: 'var(--text-inverse)', backdropFilter: 'blur(12px)',
      }}>
        {/* Selection info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '10px', borderRight: '1px solid rgba(240,236,230,0.15)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', fontWeight: 600, color: '#fff' }}>{selectedIds.length}</span>
          </div>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: 'rgba(240,236,230,0.7)' }}>selected</span>
        </div>

        {/* Select all */}
        <button
          onClick={selectedIds.length === totalCount ? onDeselectAll : onSelectAll}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: '11.5px', color: 'rgba(240,236,230,0.6)', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          {selectedIds.length === totalCount ? <Square size={13} /> : <CheckSquare size={13} />}
          {selectedIds.length === totalCount ? 'Deselect all' : `Select all ${totalCount}`}
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(240,236,230,0.15)' }} />

        {/* Actions */}
        <button
          onClick={() => setShowTag(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,230,0.8)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--f-sans)', fontSize: '12.5px', padding: '5px 8px', borderRadius: 'var(--r-sm)', transition: 'background .12s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,236,230,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Tag size={13} /> Tag
        </button>

        <button
          onClick={() => handleBulkFavorite(true)}
          disabled={favLoading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,230,0.8)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--f-sans)', fontSize: '12.5px', padding: '5px 8px', borderRadius: 'var(--r-sm)', transition: 'background .12s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,236,230,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Heart size={13} /> Favorite
        </button>

        <button
          onClick={() => setShowExport(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,230,0.8)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--f-sans)', fontSize: '12.5px', padding: '5px 8px', borderRadius: 'var(--r-sm)', transition: 'background .12s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,236,230,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Download size={13} /> Export
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(240,236,230,0.15)' }} />

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(224,88,40,0.85)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--f-sans)', fontSize: '12.5px', padding: '5px 8px', borderRadius: 'var(--r-sm)', transition: 'background .12s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,88,40,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {deleting ? <span className="mini-spinner-pv" /> : <Trash2 size={13} />}
          {deleting ? 'Deleting…' : 'Delete'}
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(240,236,230,0.15)' }} />

        <button onClick={onDeselectAll} className="icon-btn-pv" style={{ color: 'rgba(240,236,230,0.5)', background: 'none', width: '24px', height: '24px' }}>
          <X size={14} />
        </button>
      </div>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} selectedIds={selectedIds} />
      <BulkTagModal isOpen={showTag} onClose={() => setShowTag(false)} selectedIds={selectedIds} onDone={onRefresh} />
    </>
  );
};

export { ExportModal, BulkTagModal, BulkToolbar };
export default BulkToolbar;
