import { AlertTriangle } from 'lucide-react';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-obsidian-800 border border-obsidian-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <h3 className="font-display font-bold text-white text-lg mb-2">Delete Prompt</h3>
          <p className="text-gray-400 font-body text-sm mb-6">
            This action cannot be undone. The prompt will be permanently deleted.
          </p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
