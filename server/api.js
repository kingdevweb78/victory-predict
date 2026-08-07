const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config');
const connectDB = require('./database/connect');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let cachedDb = null;
const getDb = async () => { if (cachedDb && cachedDb.readyState === 1) return cachedDb; cachedDb = await connectDB(); return cachedDb; };

app.get('/health', async (req, res) => {
  try { await getDb(); res.json({ success: true, msg: '🏆 Victory Predict API — Vercel', ts: new Date().toISOString() }); }
  catch (e) { res.json({ success: true, msg: '🏆 Victory Predict API', ts: new Date().toISOString() }); }
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

const adminPath = path.join(__dirname, '../client/admin/build');
app.use('/admin', express.static(adminPath));
app.get('/admin/*', (req, res) => res.sendFile(path.join(adminPath, 'index.html')));
app.get('/', (req, res) => res.redirect('/admin'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
