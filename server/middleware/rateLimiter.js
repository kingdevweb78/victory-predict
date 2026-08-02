const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const webhookLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 60 });
const predictLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 10 });
module.exports = { apiLimiter, authLimiter, webhookLimiter, predictLimiter };