import { useState } from 'react';
import { Heart, Copy, Trash2, Edit2, Copy as Duplicate, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../../utils/constants';

const PromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite, onDuplicate, onView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
  const toolColor = AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      toast.success('Copied to clipboard!', { icon: '📋' });
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleFavorite = async () => {
    setFavoriteLoading(true);
    await onToggleFavorite(prompt._id);
    setFavoriteLoading(false);
  };

  const truncateText = (text, maxLen = 120) =>
    text.length > maxLen ? text.slice(0, maxLen) + '...' : text;

  return (
    <div className="card-hover p-4 group animate-slide-up relative" onClick={() => onView && onView(prompt)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm leading-snug truncate group-hover:text-neon-blue transition-colors">
            {prompt.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`badge ${catColors.bg} ${catColors.text} ${catColors.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catColors.dot} mr-1.5`} />
              {prompt.category}
            </span>
            <span className={`font-mono text-xs ${toolColor}`}>{prompt.aiTool}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className="p-1.5 rounded-lg hover:bg-obsidian-600 transition-all"
            title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={15}
              className={prompt.isFavorite ? 'fill-red-400 text-red-400' : 'text-gray-500 hover:text-red-400'}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-obsidian-600 transition-all text-gray-500 hover:text-white"
            >
              <MoreVertical size={15} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-obsidian-700 border border-obsidian-500 rounded-lg py-1 min-w-[150px] shadow-xl animate-fade-in">
                  <button
                    onClick={() => { onEdit(prompt); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-obsidian-600 hover:text-white transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { onDuplicate(prompt._id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-obsidian-600 hover:text-white transition-colors"
                  >
                    <Duplicate size={14} /> Duplicate
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-obsidian-600 hover:text-white transition-colors"
                  >
                    <Copy size={14} /> Copy Text
                  </button>
                  <div className="border-t border-obsidian-500 my-1" />
                  <button
                    onClick={() => { onDelete(prompt._id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Preview */}
      <p className="text-gray-500 text-xs font-mono leading-relaxed mb-3 bg-obsidian-900 rounded-lg p-2.5 border border-obsidian-700">
        {truncateText(prompt.promptText)}
      </p>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="badge bg-obsidian-700 text-gray-400 text-xs">#{tag}</span>
          ))}
          {prompt.tags.length > 4 && (
            <span className="badge bg-obsidian-700 text-gray-500 text-xs">+{prompt.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-xs font-mono">
          {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-blue transition-colors font-body"
        >
          <Copy size={12} /> Copy
        </button>
      </div>
    </div>
  );
};

export default PromptCard;
