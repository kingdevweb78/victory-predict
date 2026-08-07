const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/victory-predict',
  jwtSecret: process.env.JWT_SECRET || 'vp-jwt-secret-change-me',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  botName: process.env.BOT_NAME || 'Victory Predict',
  prefix: process.env.PREFIX || '.',
  adminNumber: process.env.ADMIN_NUMBER || '509XXXXXXXX',
  mode: process.env.MODE || 'public',
  usePairingCode: process.env.USE_PAIRING_CODE === 'true',
  pairingPhoneNumber: process.env.PAIRING_PHONE_NUMBER || '',
  // AI — still needs Groq key for predictions
  groqApiKey: process.env.GROQ_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'llama-3.1-70b-versatile',
  // Football data — FREE API, no key needed!
  footballApiUrl: process.env.FOOTBALL_API_URL || 'https://prexzyapis.com/sports',
  livescoreUrl: process.env.LIVESCORE_URL || 'https://prexzyapis.com/sports/goallivescore',
  // Admin
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3000/admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@victorypredict.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123!',
  // VIP Plans
  vipPlans: { weekly: { name: 'VIP Weekly', price: 1500, duration: 7 }, monthly: { name: 'VIP Monthly', price: 4500, duration: 30 } },
  // Payment (MonCash / NatCash)
  paymentInfo: { moncash: { name: 'MonCash', number: process.env.MONCASH_NUMBER || '+50944XXXXXXX' }, natcash: { name: 'NatCash', number: process.env.NATCASH_NUMBER || '+5095XXXXXXXX' } },
  // Webhook
  webhookSecret: process.env.WEBHOOK_SECRET || 'vp-webhook-secret',
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'vp-verify-token',
  // Limits
  languages: ['ht', 'en', 'fr'],
  defaultLanguage: 'ht',
  freeDailyLimit: 3,
  vipDailyLimit: 20,
};
