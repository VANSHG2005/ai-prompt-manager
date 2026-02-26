/**
 * AI Prompt Generator Service
 * Calls our backend /api/ai/* endpoints which securely proxy to Anthropic.
 * The API key is NEVER exposed to the frontend.
 */
import api from './api';

export const generatePrompt = async ({ topic, category, aiTool, tone, length }) => {
  const res = await api.post('/ai/generate', { topic, category, aiTool, tone, length });
  return res.data.result;
};

export const improvePrompt = async ({ promptText, goal }) => {
  const res = await api.post('/ai/improve', { promptText, goal });
  return res.data.result;
};

export const generateVariations = async ({ promptText, count = 3 }) => {
  const res = await api.post('/ai/variations', { promptText, count });
  return res.data.result;
};

export const suggestTags = async ({ promptText, category }) => {
  const res = await api.post('/ai/suggest-tags', { promptText, category });
  return res.data.result;
};

export const generateTitle = async ({ promptText }) => {
  const res = await api.post('/ai/generate-title', { promptText });
  return res.data.result;
};
