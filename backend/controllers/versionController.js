const Prompt = require('../models/Prompt');
const PromptVersion = require('../models/PromptVersion');

// Snapshot helper — called by promptController on every update
const createSnapshot = async (prompt, changeNote = '') => {
  await PromptVersion.create({
    promptId:   prompt._id,
    userId:     prompt.userId,
    version:    prompt.currentVersion,
    title:      prompt.title,
    promptText: prompt.promptText,
    category:   prompt.category,
    tags:       prompt.tags,
    aiTool:     prompt.aiTool,
    changeNote,
  });
};

// @route GET /api/prompts/:id/versions
const getVersions = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const versions = await PromptVersion.find({ promptId: req.params.id })
      .sort({ version: -1 })
      .select('-__v');

    res.json({ success: true, versions, currentVersion: prompt.currentVersion });
  } catch (err) { next(err); }
};

// @route POST /api/prompts/:id/versions/:versionId/restore
const restoreVersion = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const version = await PromptVersion.findById(req.params.versionId);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    // Snapshot current state before overwriting
    await createSnapshot(prompt, 'Auto-saved before restore');

    prompt.title      = version.title;
    prompt.promptText = version.promptText;
    prompt.category   = version.category;
    prompt.tags       = version.tags;
    prompt.aiTool     = version.aiTool;
    prompt.currentVersion += 1;
    await prompt.save();

    res.json({ success: true, message: `Restored to version ${version.version}`, prompt });
  } catch (err) { next(err); }
};

// @route DELETE /api/prompts/:id/versions/:versionId
const deleteVersion = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    await PromptVersion.findByIdAndDelete(req.params.versionId);
    res.json({ success: true, message: 'Version deleted' });
  } catch (err) { next(err); }
};

module.exports = { getVersions, restoreVersion, deleteVersion, createSnapshot };
