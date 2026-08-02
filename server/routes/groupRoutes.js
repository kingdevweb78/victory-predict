const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, async (req, res) => {
  try { const groups = await Group.find().sort({ memberCount: -1 }); res.json({ success: true, groups }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { isEnabled, settings, messages, badWords } = req.body;
    const updates = {};
    if (typeof isEnabled === 'boolean') updates.isEnabled = isEnabled;
    if (settings) updates.settings = settings;
    if (messages) updates.messages = messages;
    if (badWords) updates.badWords = badWords;
    const group = await Group.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!group) return res.status(404).json({ success: false });
    res.json({ success: true, group });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try { await Group.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;