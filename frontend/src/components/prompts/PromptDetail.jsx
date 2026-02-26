import { useState } from 'react';
import { X, Copy, Edit2, Heart, Tag, Bot, Calendar, Copy as Duplicate } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, AI_TOOL_COLORS } from '../../utils/constants';

/**
 * RESUME FEATURE: Full-screen Prompt Detail Modal
 * Shows complete prompt with character count, tag display,
 * copy button, metadata, and edit/favorite actions.
 */
const PromptDetail = ({ prompt, isOpen, onClose, onEdit, onToggleFavorite, onDuplicate }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const catColors = CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.Other;
  const toolColor = AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    toast.success('Prompt copied!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-obsidian-800 border border-obsidian-600 rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-obsidian-700 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-white text-xl leading-snug">{prompt.title}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`badge ${catColors.bg} ${catColors.text} ${catColors.border} border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${catColors.dot} mr-1.5`} />
                {prompt.category}
              </span>
              <span className={`flex items-center gap-1 font-mono text-xs ${toolColor}`}>
                <Bot size={11} /> {prompt.aiTool}
              </span>
              <span className="flex items-center gap-1 text-gray-500 font-mono text-xs">
                <Calendar size={11} />
                {new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-obsidian-700 text-gray-400 hover:text-white transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Prompt text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-500 text-xs font-body uppercase tracking-wider">Prompt</label>
              <span className="text-gray-600 font-mono text-xs">{prompt.promptText.length} chars</span>
            </div>
            <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-4 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {prompt.promptText}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <label className="text-gray-500 text-xs font-body uppercase tracking-wider block mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 badge bg-obsidian-700 text-gray-300 border border-obsidian-500 text-xs">
                    <Tag size={10} />#{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Updated */}
          {prompt.updatedAt !== prompt.createdAt && (
            <p className="text-gray-600 font-mono text-xs">
              Last updated: {new Date(prompt.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-obsidian-700 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => onToggleFavorite(prompt._id)} className={`btn-secondary flex items-center gap-1.5 text-xs ${prompt.isFavorite ? 'text-red-400 border-red-500/30' : ''}`}>
              <Heart size={14} className={prompt.isFavorite ? 'fill-red-400' : ''} />
              {prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button onClick={() => { onDuplicate(prompt._id); onClose(); }} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Duplicate size={14} /> Duplicate
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onEdit(prompt); onClose(); }} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={handleCopy} className={`btn-primary flex items-center gap-1.5 text-xs ${copied ? 'bg-green-500' : ''}`}>
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;
