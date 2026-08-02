const express = require('express');
const router = express.Router();
const { verifyWebhook } = require('../middleware/auth');
const { webhookLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

router.use(webhookLimiter);

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'victory-predict-verify-token';
  if (mode === 'subscribe' && token === verifyToken) return res.status(200).send(challenge);
  res.sendStatus(403);
});

router.post('/', verifyWebhook, async (req, res) => {
  try {
    logger.info('Webhook received');
    if (req.body.object === 'whatsapp_business_account') { /* process WhatsApp messages */ }
    if (req.body.type === 'payment') { /* process payment callback */ }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: false, message: 'Error processing' });
  }
});

module.exports = router;