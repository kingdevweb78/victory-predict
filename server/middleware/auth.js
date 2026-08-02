const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { token = req.headers.authorization.split(' ')[1]; }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

const generateToken = (userId) => jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpire });

const verifyWebhook = (req, res, next) => {
  if (config.nodeEnv === 'development') return next();
  const signature = req.headers['x-webhook-signature'];
  if (!signature || signature !== config.webhookSecret) return res.status(401).json({ success: false, message: 'Invalid signature' });
  next();
};

module.exports = { protect, adminOnly, generateToken, verifyWebhook };