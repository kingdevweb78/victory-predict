const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const Prediction = require('../models/Prediction');
const Group = require('../models/Group');
const Log = require('../models/Log');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, vipUsers, freeUsers, totalPayments, pendingPayments, totalPredictions, totalGroups] = await Promise.all([
      User.countDocuments(), User.countDocuments({ level: { $in: ['vip_weekly', 'vip_monthly'] } }),
      User.countDocuments({ level: 'free' }), Payment.countDocuments({ status: 'approved' }),
      Payment.countDocuments({ status: 'pending' }), Prediction.countDocuments(), Group.countDocuments()
    ]);
    const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenue = await Payment.aggregate([{ $match: { status: 'approved', createdAt: { $gte: thirtyAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const recentPayments = await Payment.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5).populate('userId', 'name whatsappId');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-adminPassword');
    res.json({ success: true, dashboard: { totalUsers, vipUsers, freeUsers, totalPayments, pendingPayments, totalPredictions, totalGroups, revenue: revenue[0]?.total || 0, recentPayments, recentUsers } });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - +period * 24 * 60 * 60 * 1000);
    const [userReg, dailyRev, levelDist] = await Promise.all([
      User.aggregate([{ $match: { createdAt: { $gte: daysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Payment.aggregate([{ $match: { status: 'approved', createdAt: { $gte: daysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      User.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, analytics: { userRegistrations: userReg, dailyRevenue: dailyRev, levelDistribution: levelDist } });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/logs', async (req, res) => {
  try { const logs = await Log.find().sort({ createdAt: -1 }).limit(100); res.json({ success: true, logs }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;