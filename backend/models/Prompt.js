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
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  aiTool: {
    type: String,
    required: [true, 'AI Tool is required'],
    enum: ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Other'],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

promptSchema.index({ userId: 1, createdAt: -1 });
promptSchema.index({ userId: 1, isFavorite: 1 });
promptSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Prompt', promptSchema);
