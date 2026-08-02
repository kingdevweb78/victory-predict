const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email, isAdmin: true });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: config.jwtExpire });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, level: req.user.level, isAdmin: req.user.isAdmin } });
});

router.post('/register-admin', async (req, res) => {
  try {
    if (await User.findOne({ isAdmin: true })) return res.status(400).json({ success: false, message: 'Admin exists' });
    const { email, password, name } = req.body;
    const admin = await User.create({ whatsappId: 'admin-' + Date.now(), name: name || 'Admin', email, adminPassword: password, isAdmin: true, level: 'admin', language: 'ht' });
    const token = jwt.sign({ id: admin._id }, config.jwtSecret, { expiresIn: config.jwtExpire });
    res.status(201).json({ success: true, token, user: { id: admin._id, name: admin.name, email: admin.email, isAdmin: true } });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;