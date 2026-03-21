const mongoose = require('mongoose');
const crypto = require('crypto');

const sharedPromptSchema = new mongoose.Schema({
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shareToken: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(12).toString('hex'),
    index: true,
  },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null }, // null = never expires
  allowCopy: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SharedPrompt', sharedPromptSchema);
