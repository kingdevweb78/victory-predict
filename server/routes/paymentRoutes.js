const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
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

// ✅ APPROVE + send WhatsApp notification to user
router.put('/:id/approve', adminOnly, async (req, res) => {
  try {
    const result = await paymentService.approvePayment(req.params.id, req.user._id, req.body.note);
    // ✅ Send WhatsApp notification to user
    try {
      const whatsappBot = require('../bot/whatsappBot');
      if (whatsappBot.isConnected && result.payment && result.payment.whatsappId) {
        const { t } = require('../services/languageService');
        const msg = '╔══ VIP AKTIVE ✅ ══════════╗\n║    PEMAN APWOUVE! 🎉     ║\n╚══════════════════════════╝\n\n✅ *VIP ou aktive!*\n\n📅 Ekspire: ' + new Date(result.expiryDate).toLocaleDateString() + '\n🏅 Plan: ' + (result.payment.plan === 'monthly' ? '💎 Monthly' : '⭐ Weekly') + '\n\n🔓 *Kounye a ou gen aksè a:*\n🔮 20 prediksyon/ jou\n📊 Correct Score EGZAK\n🖼️ Bèl flyer prediksyon\n📈 Estatistik avanse\n\n💎 *Byenveni nan VIP!* 🇭🇹';
        await whatsappBot.sendMessage(result.payment.whatsappId, { text: msg });
        logger.info('WhatsApp VIP notification sent to ' + result.payment.whatsappId);
      }
    } catch (e) {}
    res.json({ success: true, message: '✅ Peman apwouve — notifikasyon voye sou WhatsApp itilizatè a', ...result });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ✅ REJECT + send WhatsApp notification
router.put('/:id/reject', adminOnly, async (req, res) => {
  try {
    const payment = await paymentService.rejectPayment(req.params.id, req.user._id, req.body.note);
    try {
      const whatsappBot = require('../bot/whatsappBot');
      if (whatsappBot.isConnected && payment && payment.whatsappId) {
        const msg = '╔══ PEMAN REJETE ❌ ═════════╗\n║    PEMAN PA VALIDE      ║\n╚══════════════════════════╝\n\n❌ *Peman ou an pa valide.*\n\n💡 Tanpri eseye anko:\n📅 .weekly — 1,500 HTG\n📅 .monthly — 4,500 HTG\n\n📸 Voye yon lòt screenshot ki pi klè.';
        await whatsappBot.sendMessage(payment.whatsappId, { text: msg });
      }
    } catch (e) {}
    res.json({ success: true, payment });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.get('/:id', adminOnly, async (req, res) => {
  try { const payment = await Payment.findById(req.params.id).populate('userId', 'name whatsappId'); if (!payment) return res.status(404).json({ success: false }); res.json({ success: true, payment }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;
