const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, level, search } = req.query;
    const query = {};
    if (level) query.level = level;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { whatsappId: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-adminPassword').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit);
    res.json({ success: true, users, pagination: { total, page: +page, totalPages: Math.ceil(total / +limit) } });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [total, vip, free, admins] = await Promise.all([
      User.countDocuments(), User.countDocuments({ level: { $in: ['vip_weekly', 'vip_monthly'] } }),
      User.countDocuments({ level: 'free' }), User.countDocuments({ isAdmin: true })
    ]);
    res.json({ success: true, stats: { totalUsers: total, vipUsers: vip, freeUsers: free, admins } });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { level, isBlocked, vipExpiry } = req.body;
    const updates = {};
    if (level) updates.level = level;
    if (typeof isBlocked === 'boolean') updates.isBlocked = isBlocked;
    if (vipExpiry) updates.vipExpiry = vipExpiry;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-adminPassword');
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;