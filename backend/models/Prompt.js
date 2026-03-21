const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  promptText: {
    type: String,
    required: [true, 'Prompt text is required'],
    maxlength: [10000, 'Prompt text cannot exceed 10000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Coding', 'Writing', 'Image', 'Video', 'Marketing', 'Other'],
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  aiTool: {
    type: String,
    required: [true, 'AI Tool is required'],
    enum: ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Other'],
  },
  isFavorite: { type: Boolean, default: false },

  // ── Version History ─────────────────────────────────────────────────────
  currentVersion: { type: Number, default: 1 },

  // ── Rating / Scoring ────────────────────────────────────────────────────
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  usageCount: { type: Number, default: 0 },  // incremented on copy

  // ── Sharing ─────────────────────────────────────────────────────────────
  isShared:   { type: Boolean, default: false },
  shareToken: { type: String, default: null, index: true, sparse: true },

}, { timestamps: true });

promptSchema.index({ userId: 1, createdAt: -1 });
promptSchema.index({ userId: 1, isFavorite: 1 });
promptSchema.index({ userId: 1, rating: -1 });
promptSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Prompt', promptSchema);
