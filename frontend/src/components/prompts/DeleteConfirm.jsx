import { Trash2 } from 'lucide-react';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-pv" onClick={onClose}>
      <div
        className="modal-pv"
        style={{ maxWidth: '380px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(200,71,26,0.2)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <Trash2 size={20} color="var(--accent)" />
          </div>

          <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: '22px', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Delete prompt?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: '28px' }}>
            This action is permanent. The prompt and all its version history will be removed.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-pv" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-pv btn-danger-pv"
              style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="mini-spinner-pv" style={{ borderTopColor: 'var(--accent)' }} />
              ) : (
                <Trash2 size={13} />
              )}
              {loading ? 'Deleting…' : 'Delete forever'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
