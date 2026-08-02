const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try { const { page = 1, limit = 20 } = req.query; const result = await notificationService.getUserNotifications(req.user.whatsappId, +page, +limit); res.json({ success: true, ...result }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/admin', adminOnly, async (req, res) => {
  try { const { page = 1, limit = 50 } = req.query; const result = await notificationService.getAdminNotifications(+page, +limit); res.json({ success: true, ...result }); } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/unread-count', async (req, res) => {
  try { const count = await notificationService.getUnreadCount(req.user.whatsappId); res.json({ success: true, count }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/:id/read', async (req, res) => {
  try { await notificationService.markAsRead(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); }
});

router.put('/read-all', async (req, res) => {
  try { await notificationService.markAllAsRead(req.user.whatsappId); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/broadcast', adminOnly, async (req, res) => {
  try { const { type, title, message, targetType } = req.body; const result = await notificationService.broadcast(type || 'new_broadcast', title || 'Broadcast', message, targetType || 'all'); res.json({ success: true, result }); } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;