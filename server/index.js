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

app.get('/health', (req, res) => res.json({ success: true, message: 'Victory Predict API', timestamp: new Date().toISOString() }));
app.get('/api/bot/status', (req, res) => {
  try { const whatsappBot = require('./bot/whatsappBot'); res.json({ success: true, status: whatsappBot.getStatus() }); }
  catch (e) { res.json({ success: true, status: { connected: false, error: e.message } }); }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/languages', require('./routes/languageRoutes'));
app.use('/webhook', require('./webhook/webhookHandler'));

if (config.nodeEnv === 'production') { const ap = path.join(__dirname, '../client/admin/build'); app.use('/admin', express.static(ap)); app.get('/admin/*', (req, res) => res.sendFile(path.join(ap, 'index.html'))); }

app.use(notFound); app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => logger.info('Victory Predict API on port ' + config.port));
    if (config.nodeEnv === 'production' || process.env.START_BOT === 'true') { const whatsappBot = require('./bot/whatsappBot'); whatsappBot.start().catch(err => logger.error('Bot error: ' + err.message)); }
    try { const scheduler = require('./services/schedulerService'); scheduler.start(); } catch (e) { logger.warn('Scheduler not started: ' + e.message); }
    if (process.env.SEED_DB === 'true') { const seed = require('./database/seed'); await seed(); }
    process.on('SIGTERM', () => { try { require('./services/schedulerService').stop(); } catch (e) {} server.close(() => process.exit(0)); });
    process.on('SIGINT', () => { try { require('./services/schedulerService').stop(); } catch (e) {} server.close(() => process.exit(0)); });
  } catch (error) { logger.error('Startup error: ' + error.message); process.exit(1); }
};
startServer();
module.exports = app;
