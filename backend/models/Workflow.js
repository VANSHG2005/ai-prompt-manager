const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  order:      { type: Number, required: true },
  title:      { type: String, required: true, trim: true },
  promptText: { type: String, required: true },
  aiTool:     { type: String, default: 'ChatGPT' },
  note:       { type: String, default: '' },       // tip for this step
  inputFrom:  { type: String, default: 'user' },   // 'user' | 'previous'
}, { _id: true });

const workflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 500 },
  steps:       [workflowStepSchema],
  tags:        [{ type: String, trim: true, lowercase: true }],
  isPublic:    { type: Boolean, default: false },
  runCount:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
