const mongoose = require('mongoose');

const promptVersionSchema = new mongoose.Schema({
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  version: { type: Number, required: true },
  title: String,
  promptText: String,
  category: String,
  tags: [String],
  aiTool: String,
  changeNote: { type: String, default: '' },   // optional commit message
}, { timestamps: true });

promptVersionSchema.index({ promptId: 1, version: -1 });

module.exports = mongoose.model('PromptVersion', promptVersionSchema);
