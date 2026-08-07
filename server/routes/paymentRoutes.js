const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const { protect, adminOnly } = require('../middleware/auth');
const logger = require('../utils/logger');

router.use(protect);

router.get('/', adminOnly, async (req, res) => {
  try { const { page = 1, limit = 20, status, plan } = req.query; const result = await paymentService.getPaymentHistory({ status, plan }, +page, +limit); res.json({ success: true, ...result }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/pending', adminOnly, async (req, res) => {
  try { const payments = await paymentService.getPendingPayments(); res.json({ success: true, payments, total: payments.length }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/revenue', adminOnly, async (req, res) => {
  try { const stats = await paymentService.getRevenueStats(req.query.period); res.json({ success: true, stats }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/:id/approve', adminOnly, async (req, res) => {
  try {
    const result = await paymentService.approvePayment(req.params.id, req.user._id, req.body.note);
    try { const whatsappBot = require('../bot/whatsappBot'); if (whatsappBot.isConnected && result.user && result.user.whatsappId) { const { t } = require('../services/languageService'); await whatsappBot.sendMessage(result.user.whatsappId, { text: t('payment_approved', result.user.language) }); logger.info('WhatsApp notification sent to ' + result.user.whatsappId); } } catch (e) {}
    res.json({ success: true, message: 'Payment approved and user notified via WhatsApp', ...result });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/:id/reject', adminOnly, async (req, res) => {
  try {
    const payment = await paymentService.rejectPayment(req.params.id, req.user._id, req.body.note);
    try { const whatsappBot = require('../bot/whatsappBot'); const user = await User.findById(payment.userId); if (whatsappBot.isConnected && user && user.whatsappId) { const { t } = require('../services/languageService'); await whatsappBot.sendMessage(user.whatsappId, { text: t('payment_rejected', user.language) }); } } catch (e) {}
    res.json({ success: true, payment });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.get('/:id', adminOnly, async (req, res) => {
  try { const payment = await Payment.findById(req.params.id).populate('userId', 'name whatsappId'); if (!payment) return res.status(404).json({ success: false }); res.json({ success: true, payment }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;
