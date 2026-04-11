import { useState, useEffect } from 'react';
import { X, History, RotateCcw, Trash2, ChevronRight, GitBranch, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Minimal word-level diff — highlights added/removed words
const computeDiff = (oldText = '', newText = '') => {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  // Simple LCS-based diff (good enough for prompt text)
  const result = [];
  let oi = 0, ni = 0;

  while (oi < oldWords.length || ni < newWords.length) {
    if (oi >= oldWords.length) {
      result.push({ type: 'added', text: newWords[ni++] });
    } else if (ni >= newWords.length) {
      result.push({ type: 'removed', text: oldWords[oi++] });
    } else if (oldWords[oi] === newWords[ni]) {
      result.push({ type: 'same', text: oldWords[oi] });
      oi++; ni++;
    } else {
      // Look ahead up to 4 words for a match
      let found = false;
      for (let k = 1; k <= 4 && !found; k++) {
        if (ni + k < newWords.length && newWords[ni + k] === oldWords[oi]) {
          for (let j = 0; j < k; j++) result.push({ type: 'added', text: newWords[ni++] });
          found = true;
        } else if (oi + k < oldWords.length && oldWords[oi + k] === newWords[ni]) {
          for (let j = 0; j < k; j++) result.push({ type: 'removed', text: oldWords[oi++] });
          found = true;
        }
      }
      if (!found) {
        result.push({ type: 'removed', text: oldWords[oi++] });
        result.push({ type: 'added', text: newWords[ni++] });
      }
    }
  }

  return result;
};

const DiffView = ({ oldText, newText }) => {
  const diff = computeDiff(oldText, newText);
  const changes = diff.filter(d => d.type !== 'same').length;

  if (changes === 0) {
    return (
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '12.5px', color: 'var(--text-tertiary)', padding: '12px', textAlign: 'center' }}>
        No text changes in this version
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', gap: '12px' }}>
        <span style={{ color: 'var(--sage)' }}>+ Added</span>
        <span style={{ color: 'var(--accent)' }}>− Removed</span>
      </div>
      <div style={{
        background: 'var(--bg-subtle)', borderRadius: 'var(--r-sm)',
        padding: '12px 14px', fontFamily: 'var(--f-mono)', fontSize: '12.5px',
        lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto',
        border: '1px solid var(--border)', borderLeft: '3px solid var(--border-strong)',
      }}>
        {diff.map((token, i) => {
          if (token.type === 'same') return <span key={i}>{token.text}</span>;
          if (token.type === 'added') return (
            <span key={i} style={{ background: 'rgba(42,145,72,0.15)', color: 'var(--sage)', borderRadius: '2px', padding: '0 1px' }}>{token.text}</span>
          );
          return (
            <span key={i} style={{ background: 'rgba(196,68,26,0.12)', color: 'var(--accent)', textDecoration: 'line-through', borderRadius: '2px', padding: '0 1px' }}>{token.text}</span>
          );
        })}
      </div>
    </div>
  );
};

const VersionHistoryModal = ({ isOpen, onClose, prompt, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showDiff, setShowDiff] = useState(true);

  useEffect(() => {
    if (!isOpen || !prompt) return;
    setLoading(true);
    setSelectedIdx(0);
    api.get(`/prompts/${prompt._id}/versions`)
      .then(res => {
        setVersions(res.data.versions || []);
        setCurrentVersion(res.data.currentVersion);
      })
      .catch(() => toast.error('Failed to load version history'))
      .finally(() => setLoading(false));
  }, [isOpen, prompt]);

  const handleRestore = async (version) => {
    setRestoring(version._id);
    try {
      await api.post(`/prompts/${prompt._id}/versions/${version._id}/restore`);
      toast.success(`Restored to version ${version.version}`);
      onRestore?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (version) => {
    setDeleting(version._id);
    try {
      await api.delete(`/prompts/${prompt._id}/versions/${version._id}`);
      setVersions(prev => prev.filter(v => v._id !== version._id));
      if (selectedIdx >= versions.length - 1) setSelectedIdx(Math.max(0, selectedIdx - 1));
      toast.success('Version deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen || !prompt) return null;

  const selected = versions[selectedIdx];
  const prev = versions[selectedIdx + 1];
  const isLatest = selectedIdx === 0;

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div className="modal-pv" style={{ maxWidth: '800px', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-pv">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={15} color="var(--amber)" />
            </div>
            <div>
              <h2 className="modal-title-pv" style={{ fontSize: '17px' }}>Version History</h2>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                {prompt.title} · v{currentVersion} current · {versions.length} snapshot{versions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button className="icon-btn-pv" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Timeline sidebar */}
          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '12px 8px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner-pv" style={{ width: '24px', height: '24px' }} />
              </div>
            ) : versions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '16px', textAlign: 'center' }}>No snapshots yet</p>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '1px', background: 'var(--border)' }} />

                {versions.map((v, i) => {
                  const isSelected = i === selectedIdx;
                  const isCurrent = v.version === currentVersion;
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedIdx(i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '8px 8px 8px 4px', marginBottom: '2px',
                        borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        transition: 'background .12s', position: 'relative',
                      }}
                    >
                      {/* Node */}
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                        background: isCurrent ? 'var(--accent)' : isSelected ? 'var(--accent)' : 'var(--bg-muted)',
                        border: `2px solid ${isCurrent ? 'var(--accent)' : isSelected ? 'var(--accent)' : 'var(--border-strong)'}`,
                        zIndex: 1, position: 'relative',
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11.5px', fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                            v{v.version}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: '9px', fontFamily: 'var(--f-mono)', background: 'var(--accent)', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>CURRENT</span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={9} /> {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {v.changeNote && (
                          <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.changeNote}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selected ? (
              <>
                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.title || prompt.title}</h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span className={`cat-pill-pv cat-${selected.category || prompt.category}`}><span className="cat-dot-pv" />{selected.category || prompt.category}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{selected.aiTool}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {new Date(selected.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    {!isLatest && (
                      <button
                        onClick={() => handleRestore(selected)}
                        disabled={!!restoring}
                        className="btn-pv btn-sage-pv"
                        style={{ gap: '5px', fontSize: '12.5px' }}
                      >
                        {restoring === selected._id ? <span className="mini-spinner-dark-pv" /> : <RotateCcw size={12} />}
                        Restore this
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selected)}
                      disabled={!!deleting}
                      className="btn-pv btn-danger-pv"
                      style={{ gap: '5px', fontSize: '12.5px' }}
                    >
                      {deleting === selected._id ? <span className="mini-spinner-dark-pv" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>

                {/* Diff toggle */}
                {prev && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setShowDiff(true)}
                      className={`tab-pv ${showDiff ? 'active' : ''}`}
                    >
                      Changes from v{prev.version}
                    </button>
                    <button
                      onClick={() => setShowDiff(false)}
                      className={`tab-pv ${!showDiff ? 'active' : ''}`}
                    >
                      Full text
                    </button>
                  </div>
                )}

                {/* Content */}
                {showDiff && prev ? (
                  <DiffView oldText={prev.promptText} newText={selected.promptText} />
                ) : (
                  <div style={{
                    background: 'var(--bg-subtle)', borderRadius: 'var(--r-sm)',
                    padding: '12px 14px', fontFamily: 'var(--f-mono)', fontSize: '12.5px',
                    color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                    maxHeight: '280px', overflowY: 'auto',
                    border: '1px solid var(--border)', borderLeft: '3px solid var(--amber-border)',
                  }}>
                    {selected.promptText}
                  </div>
                )}

                {/* Tags snapshot */}
                {selected.tags?.length > 0 && (
                  <div>
                    <span className="section-eyebrow-pv">Tags at this version</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selected.tags.map(t => <span key={t} className="tag-pv">#{t}</span>)}
                    </div>
                  </div>
                )}
              </>
            ) : !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px' }}>
                <GitBranch size={28} color="var(--text-tertiary)" />
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Select a version to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
