const express = require('express');
const router = express.Router();
const footballApi = require('../services/footballApi');

router.get('/', async (req, res) => {
  try { const matches = await footballApi.getTodayMatches(); res.json({ success: true, matches }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/today', async (req, res) => {
  try { const matches = await footballApi.getTodayMatches(); res.json({ success: true, matches }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/live', async (req, res) => {
  try { const matches = await footballApi.getLiveMatches(); res.json({ success: true, matches, isLive: true }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/:id', async (req, res) => {
  try { const match = await footballApi.getMatchById(req.params.id); if (!match) return res.status(404).json({ success: false }); res.json({ success: true, match }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;