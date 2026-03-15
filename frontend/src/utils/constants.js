export const CATEGORIES = ['Coding', 'Writing', 'Image', 'Video', 'Marketing', 'Other'];

export const AI_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Other'];

// Legacy colour maps kept for any components that still reference them
// The design system now uses CSS variables (--cat-*) for theming
export const CATEGORY_COLORS = {
  Coding:    { bg: 'var(--cat-coding-bg)',    text: 'var(--cat-coding-text)',    dot: 'var(--cat-coding-dot)' },
  Writing:   { bg: 'var(--cat-writing-bg)',   text: 'var(--cat-writing-text)',   dot: 'var(--cat-writing-dot)' },
  Image:     { bg: 'var(--cat-image-bg)',     text: 'var(--cat-image-text)',     dot: 'var(--cat-image-dot)' },
  Video:     { bg: 'var(--cat-video-bg)',     text: 'var(--cat-video-text)',     dot: 'var(--cat-video-dot)' },
  Marketing: { bg: 'var(--cat-marketing-bg)', text: 'var(--cat-marketing-text)', dot: 'var(--cat-marketing-dot)' },
  Other:     { bg: 'var(--cat-other-bg)',     text: 'var(--cat-other-text)',     dot: 'var(--cat-other-dot)' },
};

export const AI_TOOL_COLORS = {
  ChatGPT:            'text-emerald-600',
  Claude:             'text-orange-600',
  Gemini:             'text-blue-600',
  Midjourney:         'text-purple-600',
  'DALL-E':           'text-pink-600',
  'Stable Diffusion': 'text-amber-600',
  Other:              'text-gray-500',
};
