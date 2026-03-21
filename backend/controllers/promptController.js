const Prompt = require('../models/Prompt');
const { createSnapshot } = require('./versionController');

// @desc    Create prompt
const createPrompt = async (req, res, next) => {
  try {
    const { title, promptText, category, tags, aiTool } = req.body;
    const prompt = await Prompt.create({
      userId: req.user._id, title, promptText, category,
      tags: tags || [], aiTool, currentVersion: 1,
    });
    // Snapshot version 1
    await createSnapshot(prompt, 'Initial version');
    res.status(201).json({ success: true, message: 'Prompt created', prompt });
  } catch (err) { next(err); }
};

// @desc    Get all prompts
const getPrompts = async (req, res, next) => {
  try {
    const { category, aiTool, isFavorite, sort, search, tags } = req.query;
    let query = { userId: req.user._id };

    if (category)         query.category   = category;
    if (aiTool)           query.aiTool     = aiTool;
    if (isFavorite === 'true') query.isFavorite = true;

    if (search) {
      query.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { tags:     { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagList };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest')   sortOption = { createdAt: 1 };
    if (sort === 'favorites') sortOption = { isFavorite: -1, createdAt: -1 };
    if (sort === 'rating')   sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'usage')    sortOption = { usageCount: -1, createdAt: -1 };

    const prompts = await Prompt.find(query).sort(sortOption);
    const total      = await Prompt.countDocuments({ userId: req.user._id });
    const favorites  = await Prompt.countDocuments({ userId: req.user._id, isFavorite: true });
    const categories = await Prompt.distinct('category', { userId: req.user._id });

    res.json({
      success: true, count: prompts.length,
      stats: { total, favorites, categoryCount: categories.length },
      prompts,
    });
  } catch (err) { next(err); }
};

// @desc    Get single prompt
const getPrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, prompt });
  } catch (err) { next(err); }
};

// @desc    Update prompt — auto-snapshot before save
const updatePrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const { title, promptText, category, tags, aiTool, changeNote } = req.body;

    // Snapshot the CURRENT state before overwriting
    await createSnapshot(prompt, changeNote || '');

    if (title)      prompt.title      = title;
    if (promptText) prompt.promptText = promptText;
    if (category)   prompt.category   = category;
    if (tags !== undefined) prompt.tags = tags;
    if (aiTool)     prompt.aiTool     = aiTool;
    prompt.currentVersion += 1;

    await prompt.save();
    res.json({ success: true, message: 'Prompt updated', prompt });
  } catch (err) { next(err); }
};

// @desc    Delete prompt
const deletePrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, message: 'Prompt deleted' });
  } catch (err) { next(err); }
};

// @desc    Toggle favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    prompt.isFavorite = !prompt.isFavorite;
    await prompt.save();
    res.json({ success: true, message: prompt.isFavorite ? 'Added to favorites' : 'Removed from favorites', prompt });
  } catch (err) { next(err); }
};

// @desc    Duplicate prompt
const duplicatePrompt = async (req, res, next) => {
  try {
    const original = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const duplicate = await Prompt.create({
      userId: req.user._id,
      title: `${original.title} (Copy)`,
      promptText: original.promptText,
      category: original.category,
      tags: original.tags,
      aiTool: original.aiTool,
      isFavorite: false,
      currentVersion: 1,
    });
    await createSnapshot(duplicate, 'Duplicated from original');
    res.status(201).json({ success: true, message: 'Prompt duplicated', prompt: duplicate });
  } catch (err) { next(err); }
};

// @desc    Dashboard stats
const getStats = async (req, res, next) => {
  try {
    const total     = await Prompt.countDocuments({ userId: req.user._id });
    const favorites = await Prompt.countDocuments({ userId: req.user._id, isFavorite: true });
    const categories = await Prompt.distinct('category', { userId: req.user._id });
    const categoryBreakdown = await Prompt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, stats: { total, favorites, categoryCount: categories.length, categoryBreakdown } });
  } catch (err) { next(err); }
};

module.exports = { createPrompt, getPrompts, getPrompt, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt, getStats };
