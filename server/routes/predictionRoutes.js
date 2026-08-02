const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const aiEngine = require('../services/aiEngine');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, league } = req.query;
    const query = {};
    if (status) query.status = status;
    if (league) query.league = { $regex: league, $options: 'i' };
    const total = await Prediction.countDocuments(query);
    const predictions = await Prediction.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit);
    res.json({ success: true, predictions, pagination: { total, page: +page, totalPages: Math.ceil(total / +limit) } });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/generate', async (req, res) => {
  try {
    const { homeTeam, awayTeam, league } = req.body;
    if (!homeTeam || !awayTeam) return res.status(400).json({ success: false, message: 'Teams required' });
    const pred = await aiEngine.predictMatch({ homeTeam, awayTeam, league: league || 'Unknown', homeStats: {}, awayStats: {}, h2h: '' });
    const saved = await Prediction.create({ matchId: `gen-${Date.now()}`, homeTeam, awayTeam, league: league || 'Unknown', matchDate: new Date(), predictions: pred.predictions, analysis: pred.analysis, aiAnalysis: pred.aiAnalysis || '', requestedBy: req.user.whatsappId });
    res.json({ success: true, prediction: saved });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [total, correct, incorrect] = await Promise.all([
      Prediction.countDocuments(), Prediction.countDocuments({ isCorrect: true }), Prediction.countDocuments({ isCorrect: false })
    ]);
    res.json({ success: true, stats: { total, correct, incorrect, accuracy: total > 0 ? ((correct / (correct + incorrect)) * 100).toFixed(1) : 0 } });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try { await Prediction.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;