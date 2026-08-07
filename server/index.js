const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const connectDB = require('./database/connect');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? [config.adminUrl] : '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
if (config.nodeEnv === 'development') app.use(morgan('dev'));
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: '⚽ Victory Predict API', timestamp: new Date().toISOString(), mode: config.usePairingCode ? 'PAIRING_CODE' : 'QR_CODE' }));

// Bot status — see if bot is connected
app.get('/api/bot/status', (req, res) => {
  try {
    const whatsappBot = require('./bot/whatsappBot');
    const status = whatsappBot.getStatus();
    res.json({
      success: true,
      bot: {
        connected: status.connected,
        reconnectAttempts: status.reconnectAttempts,
        pairingCode: status.pairingCode,
        hasQR: status.hasQR,
        mode: config.usePairingCode ? 'PAIRING_CODE' : 'QR_CODE'
      }
    });
  } catch (e) { res.json({ success: true, bot: { connected: false, error: e.message } }); }
});

// List all users (for dashboard)
app.get('/api/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-adminPassword').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users, total: users.length });
  } catch (e) { res.status(500).json({ success: false }); }
});

// List all groups (for dashboard)
app.get('/api/groups', async (req, res) => {
  try {
    const Group = require('./models/Group');
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json({ success: true, groups, total: groups.length });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/languages', require('./routes/languageRoutes'));
app.use('/webhook', require('./webhook/webhookHandler'));

if (config.nodeEnv === 'production') {
  const adminPath = path.join(__dirname, '../client/admin/build');
  app.use('/admin', express.static(adminPath));
  app.get('/admin/*', (req, res) => res.sendFile(path.join(adminPath, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      logger.info('═'.repeat(50));
      logger.info('⚽ Victory Predict API on port ' + config.port);
      logger.info('🌐 Admin: ' + config.adminUrl);
      logger.info('📧 Admin Email: ' + config.adminEmail);
      logger.info('🔑 Admin Password: ' + config.adminPassword);
      logger.info('📱 Connection mode: ' + (config.usePairingCode ? 'PAIRING CODE' : 'QR CODE'));
      logger.info('⚽ Football API: FREE (prexzyapis.com) — no key needed!');
      logger.info('═'.repeat(50));
    });

    if (config.nodeEnv === 'production' || process.env.START_BOT === 'true') {
      const whatsappBot = require('./bot/whatsappBot');
      whatsappBot.start().catch(err => logger.error('Bot error: ' + err.message));
    }

    try { const scheduler = require('./services/schedulerService'); scheduler.start(); } catch (e) { logger.warn('Scheduler: ' + e.message); }
    if (process.env.SEED_DB === 'true') { const seed = require('./database/seed'); await seed(); }

    process.on('SIGTERM', () => { try { require('./services/schedulerService').stop(); } catch (e) {} server.close(() => process.exit(0)); });
    process.on('SIGINT', () => { try { require('./services/schedulerService').stop(); } catch (e) {} server.close(() => process.exit(0)); });
  } catch (error) { logger.error('Startup error: ' + error.message); process.exit(1); }
};

startServer();
module.exports = app;
