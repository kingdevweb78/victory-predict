const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, async (req, res) => {
  try { const { page = 1, limit = 50, enabled } = req.query; const query = {}; if (enabled !== undefined) query.isEnabled = enabled === 'true'; const total = await Group.countDocuments(query); const groups = await Group.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit); res.json({ success: true, groups, total, page: +page, totalPages: Math.ceil(total / +limit) }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/:id/toggle', adminOnly, async (req, res) => {
  try { const group = await Group.findById(req.params.id); if (!group) return res.status(404).json({ success: false }); group.isEnabled = !group.isEnabled; await group.save(); res.json({ success: true, group, message: group.isEnabled ? 'Group enabled' : 'Group disabled' }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/:id', adminOnly, async (req, res) => {
  try { const { settings, messages, badWords, language, name, logoUrl } = req.body; const update = {}; if (settings) update.settings = settings; if (messages) update.messages = messages; if (badWords) update.badWords = badWords; if (language) update.language = language; if (name) update.name = name; if (logoUrl !== undefined) update.logoUrl = logoUrl; const group = await Group.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }); if (!group) return res.status(404).json({ success: false }); res.json({ success: true, group }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/stats/summary', adminOnly, async (req, res) => {
  try { const [total, enabled, disabled, totalMessages] = await Promise.all([Group.countDocuments(), Group.countDocuments({ isEnabled: true }), Group.countDocuments({ isEnabled: false }), Group.aggregate([{ $group: { _id: null, total: { $sum: '$totalMessages' } } }])]); res.json({ success: true, stats: { total, enabled, disabled, totalMessages: totalMessages[0] ? totalMessages[0].total : 0 } }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/:id', async (req, res) => {
  try { const group = await Group.findById(req.params.id); if (!group) return res.status(404).json({ success: false }); res.json({ success: true, group }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;
