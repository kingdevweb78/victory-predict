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
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
if (config.nodeEnv === 'development') app.use(morgan('dev'));
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.json({ success: true, message: '🏆 Victory Predict — Heroku Ready!', timestamp: new Date().toISOString(), storage: 'JSON File Store' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/webhook', require('./webhook/webhookHandler'));

if (config.nodeEnv === 'production') {
  try {
    const adminPath = path.join(__dirname, '../client/admin/build');
    app.use('/admin', express.static(adminPath));
    app.get('/admin/*', (req, res) => res.sendFile(path.join(adminPath, 'index.html')));
  } catch (e) {}
}

app.get('/', (req, res) => res.json({ success: true, name: '🏆 Victory Predict', version: '2.2.0', storage: 'JSON File Store' }));
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log('═'.repeat(50));
      console.log('🏆 Victory Predict v2.2.0 — Heroku Ready!');
      console.log('📁 Storage: JSON File Store (No MongoDB!)');
      console.log('🌐 Port: ' + port);
      console.log('═'.repeat(50));
    });
    try { const whatsappBot = require('./bot/whatsappBot'); whatsappBot.start().catch(err => logger.error('Bot: ' + err.message)); } catch (e) {}
    try { require('./services/schedulerService').start(); } catch (e) {}
  } catch (error) { console.log('Startup error:', error.message); }
};

startServer();
module.exports = app;
