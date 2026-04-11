const Prompt = require('../models/Prompt');
const PromptVersion = require('../models/PromptVersion');

// @route POST /api/prompts/bulk/delete
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No prompt IDs provided' });
    }

    const result = await Prompt.deleteMany({
      _id: { $in: ids },
      userId: req.user._id,
    });

    // Clean up version history
    await PromptVersion.deleteMany({ promptId: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} prompt${result.deletedCount !== 1 ? 's' : ''} deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (err) { next(err); }
};

// @route POST /api/prompts/bulk/tag
const bulkTag = async (req, res, next) => {
  try {
    const { ids, tags, action = 'add' } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No prompt IDs provided' });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ success: false, message: 'No tags provided' });
    }

    const normalizedTags = tags.map(t => t.trim().toLowerCase());

    let update;
    if (action === 'add') {
      update = { $addToSet: { tags: { $each: normalizedTags } } };
    } else if (action === 'remove') {
      update = { $pullAll: { tags: normalizedTags } };
    } else {
      update = { $set: { tags: normalizedTags } };
    }

    const result = await Prompt.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      update
    );

    res.json({
      success: true,
      message: `Tags updated for ${result.modifiedCount} prompt${result.modifiedCount !== 1 ? 's' : ''}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) { next(err); }
};

// @route POST /api/prompts/bulk/favorite
const bulkFavorite = async (req, res, next) => {
  try {
    const { ids, isFavorite } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No prompt IDs provided' });
    }

    const result = await Prompt.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      { $set: { isFavorite: Boolean(isFavorite) } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} prompt${result.modifiedCount !== 1 ? 's' : ''} ${isFavorite ? 'added to' : 'removed from'} favorites`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) { next(err); }
};

// @route POST /api/prompts/bulk/export
const bulkExport = async (req, res, next) => {
  try {
    const { ids, format = 'json' } = req.body;

    let query = { userId: req.user._id };
    if (Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids };
    }

    const prompts = await Prompt.find(query).sort({ createdAt: -1 });

    if (format === 'json') {
      const exportData = prompts.map(p => ({
        title: p.title,
        promptText: p.promptText,
        category: p.category,
        aiTool: p.aiTool,
        tags: p.tags,
        isFavorite: p.isFavorite,
        rating: p.rating,
        createdAt: p.createdAt,
      }));
      return res.json({ success: true, data: exportData, count: exportData.length });
    }

    if (format === 'markdown') {
      const md = prompts.map(p => {
        const tags = p.tags.length > 0 ? p.tags.map(t => `\`${t}\``).join(' ') : 'none';
        return `## ${p.title}\n\n**Category:** ${p.category} | **AI Tool:** ${p.aiTool} | **Tags:** ${tags}\n\n\`\`\`\n${p.promptText}\n\`\`\`\n\n---\n`;
      }).join('\n');
      return res.json({ success: true, data: md, count: prompts.length });
    }

    if (format === 'csv') {
      const header = 'Title,Category,AI Tool,Tags,Favorite,Rating,Created At,Prompt Text\n';
      const rows = prompts.map(p => {
        const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
        return [
          escape(p.title),
          escape(p.category),
          escape(p.aiTool),
          escape(p.tags.join(';')),
          escape(p.isFavorite ? 'Yes' : 'No'),
          escape(p.rating),
          escape(new Date(p.createdAt).toISOString().split('T')[0]),
          escape(p.promptText),
        ].join(',');
      }).join('\n');
      return res.json({ success: true, data: header + rows, count: prompts.length });
    }

    res.status(400).json({ success: false, message: 'Invalid format. Use json, markdown, or csv' });
  } catch (err) { next(err); }
};

module.exports = { bulkDelete, bulkTag, bulkFavorite, bulkExport };
