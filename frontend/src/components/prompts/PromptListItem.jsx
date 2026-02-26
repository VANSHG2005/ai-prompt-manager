import { Heart, Copy, Trash2, Edit2, Copy as Dup, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../../utils/constants';

/**
 * RESUME FEATURE: List View variant of PromptCard
 * Compact horizontal layout ideal for power users with many prompts.
 * Shows all key info in a scannable single-row format.
 */
const PromptListItem = ({ prompt, onEdit, onDelete, onToggleFavorite, onDuplicate, onView }) => {
  const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
  const toolColor = AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other;

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.promptText);
    toast.success('Copied!', { icon: '📋' });
  };

  return (
    <div
      className="card-hover px-4 py-3 flex items-center gap-4 cursor-pointer group animate-slide-up"
      onClick={() => onView && onView(prompt)}
    >
      {/* Category dot */}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${catColors.dot}`} />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-white text-sm truncate group-hover:text-neon-blue transition-colors">
          {prompt.title}
        </p>
        <p className="text-gray-600 font-mono text-xs truncate mt-0.5">
          {prompt.promptText.slice(0, 80)}...
        </p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className={`badge ${catColors.bg} ${catColors.text} text-xs hidden md:inline-flex`}>{prompt.category}</span>
        <span className={`font-mono text-xs ${toolColor} hidden lg:block`}>{prompt.aiTool}</span>
        {prompt.tags?.length > 0 && (
          <div className="hidden xl:flex gap-1">
            {prompt.tags.slice(0, 2).map(t => (
              <span key={t} className="badge bg-obsidian-700 text-gray-500 text-xs">#{t}</span>
            ))}
          </div>
        )}
        <span className="text-gray-600 font-mono text-xs w-20 text-right hidden lg:block">
          {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onToggleFavorite(prompt._id); }}
          className="p-1.5 rounded hover:bg-obsidian-600 transition-colors">
          <Heart size={13} className={prompt.isFavorite ? 'fill-red-400 text-red-400' : 'text-gray-500'} />
        </button>
        <button onClick={handleCopy} className="p-1.5 rounded hover:bg-obsidian-600 text-gray-500 hover:text-white transition-colors">
          <Copy size={13} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDuplicate(prompt._id); }} className="p-1.5 rounded hover:bg-obsidian-600 text-gray-500 hover:text-white transition-colors">
          <Dup size={13} />
        </button>
        <button onClick={e => { e.stopPropagation(); onEdit(prompt); }} className="p-1.5 rounded hover:bg-obsidian-600 text-gray-500 hover:text-white transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(prompt._id); }} className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default PromptListItem;
