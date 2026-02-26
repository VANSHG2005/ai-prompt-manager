/**
 * AI Prompt Generator Controller
 * Powered by Groq API (FREE) — Llama 3.3 70B
 * Blazing fast inference, no cost, no credit card needed.
 * Get your free key at: https://console.groq.com/
 */

const Groq = require('groq-sdk');

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Get your free key at https://console.groq.com/');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL = 'llama-3.3-70b-versatile';

const callGroq = async (systemPrompt, userMessage, maxTokens = 1000) => {
  const groq = getClient();
  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || '';
};

// ─── POST /api/ai/generate ────────────────────────────────────────────────
const generatePrompt = async (req, res, next) => {
  try {
    const { topic, category, aiTool, tone, length } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const system = `You are an expert AI prompt engineer. Generate highly effective, specific, and actionable prompts.
Return ONLY the prompt text — no preamble, no explanation, no surrounding quotes.`;

    const user = `Create a ${length || 'medium'}-length prompt for ${aiTool || 'ChatGPT'} in the ${category || 'General'} category.
Topic: ${topic}
Tone: ${tone || 'professional'}
Make it specific, include context, and ensure excellent AI output.`;

    const result = await callGroq(system, user);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/improve ─────────────────────────────────────────────────
const improvePrompt = async (req, res, next) => {
  try {
    const { promptText, goal } = req.body;
    if (!promptText?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required' });
    }

    const system = `You are an expert AI prompt engineer. Improve prompts to maximise their effectiveness.
Return ONLY the improved prompt — no explanation, no comparison, no surrounding quotes.`;

    const user = `Improve this prompt${goal ? ` with goal: "${goal}"` : ''}:

${promptText}

Make it more specific, add context, improve structure.`;

    const result = await callGroq(system, user);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/variations ──────────────────────────────────────────────
const generateVariations = async (req, res, next) => {
  try {
    const { promptText, count = 3 } = req.body;
    if (!promptText?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required' });
    }

    const system = `You are an expert AI prompt engineer.
Return a valid JSON array of exactly ${count} prompt strings. No markdown, no code fences, no explanation.
Format: ["prompt one", "prompt two", "prompt three"]`;

    const user = `Generate ${count} distinct variations of this prompt, each with a different angle:

${promptText}`;

    const raw = await callGroq(system, user, 1500);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      result = raw
        .split('\n')
        .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(l => l.length > 20)
        .slice(0, count);
    }

    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/suggest-tags ────────────────────────────────────────────
const suggestTags = async (req, res, next) => {
  try {
    const { promptText, category } = req.body;
    if (!promptText?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required' });
    }

    const system = `Generate tags for an AI prompt.
Return ONLY a valid JSON array of 3-6 lowercase hyphenated tag strings.
Example: ["react","code-review","performance"]
No markdown, no explanation — just the array.`;

    const user = `Tags for this ${category || ''} prompt:\n${promptText.slice(0, 500)}`;

    const raw = await callGroq(system, user, 120);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      result = raw.match(/\b[a-z][a-z0-9-]+\b/g)?.slice(0, 6) || [];
    }

    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/ai/generate-title ─────────────────────────────────────────
const generateTitle = async (req, res, next) => {
  try {
    const { promptText } = req.body;
    if (!promptText?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required' });
    }

    const system = `Generate a short, descriptive title for an AI prompt.
Return ONLY the title — 3 to 7 words, no quotes, no trailing punctuation.`;

    const user = `Title for:\n${promptText.slice(0, 400)}`;

    const result = await callGroq(system, user, 60);
    res.json({ success: true, result: result.replace(/^["']|["']$/g, '').trim() });
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePrompt, improvePrompt, generateVariations, suggestTags, generateTitle };
