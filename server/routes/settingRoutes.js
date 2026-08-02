const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try { const settings = await Setting.find(); const obj = {}; settings.forEach(s => obj[s.key] = s.value); res.json({ success: true, settings: obj }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/', adminOnly, async (req, res) => {
  try {
    const results = [];
    for (const [key, value] of Object.entries(req.body)) {
      const s = await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
      results.push(s);
    }
    res.json({ success: true, settings: results });
  } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;