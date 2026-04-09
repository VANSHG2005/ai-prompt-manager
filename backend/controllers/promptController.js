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

// @desc    Get all prompts with pagination
const getPrompts = async (req, res, next) => {
  try {
    const { category, aiTool, isFavorite, sort, search, tags, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build base pipeline with userId filter
    const basePipeline = [
      { $match: { userId: req.user._id } },
    ];

    // Apply filters
    let filterStage = {};
    if (category) filterStage.category = category;
    if (aiTool) filterStage.aiTool = aiTool;
    if (isFavorite === 'true') filterStage.isFavorite = true;

    if (search) {
      basePipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      basePipeline.push({ $match: { tags: { $in: tagList } } });
    }
    if (Object.keys(filterStage).length > 0) {
      basePipeline.push({ $match: filterStage });
    }

    // Apply sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'favorites') sortOption = { isFavorite: -1, createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'usage') sortOption = { usageCount: -1, createdAt: -1 };
    basePipeline.push({ $sort: sortOption });

    // Use $facet to get prompts + stats in one query
    const result = await Prompt.aggregate([
      ...basePipeline,
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
              },
            },
          ],
          categories: [{ $group: { _id: '$category' } }],
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        },
      },
    ]);

    const metadata = result[0].metadata[0] || { total: 0, favorites: 0 };
    const categoryCount = result[0].categories.length;
    const prompts = result[0].data;

    res.json({
      success: true,
      count: prompts.length,
      stats: {
        total: metadata.total,
        favorites: metadata.favorites,
        categoryCount,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: metadata.total,
        pages: Math.ceil(metadata.total / parseInt(limit)),
      },
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
    const stats = await Prompt.aggregate([
      { $match: { userId: req.user._id } },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
              },
            },
          ],
          categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          aiTools: [{ $group: { _id: '$aiTool', count: { $sum: 1 } } }],
          activity: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const result = stats[0];
    const counts = result.counts[0] || { total: 0, favorites: 0 };
    const categoryBreakdown = result.categories || [];
    const aiToolBreakdown = result.aiTools || [];
    const activity = result.activity || [];

    res.json({
      success: true,
      stats: {
        total: counts.total,
        favorites: counts.favorites,
        categoryCount: categoryBreakdown.length,
        categoryBreakdown,
        aiToolCount: aiToolBreakdown.length,
        aiToolBreakdown,
        activity,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { createPrompt, getPrompts, getPrompt, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt, getStats };
