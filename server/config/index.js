const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/victory-predict',
  jwtSecret: process.env.JWT_SECRET || 'victory-predict-default-jwt-secret',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  botName: process.env.BOT_NAME || 'Victory Predict',
  botInfo: process.env.BOT_INFO || 'Victory Predict - Premium Football Prediction Bot',
  prefix: process.env.PREFIX || '.',
  sessionId: process.env.SESSION_ID || 'victory-predict-session',
  adminNumber: process.env.ADMIN_NUMBER || '509XXXXXXXX',
  mode: process.env.MODE || 'public',
  groqApiKey: process.env.GROQ_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'llama-3.1-70b-versatile',
  moncashClientId: process.env.MONCASH_CLIENT_ID || '',
  moncashClientSecret: process.env.MONCASH_CLIENT_SECRET || '',
  moncashEnv: process.env.MONCASH_ENV || 'sandbox',
  natcashApiKey: process.env.NATCASH_API_KEY || '',
  natcashSecret: process.env.NATCASH_SECRET || '',
  webhookSecret: process.env.WEBHOOK_SECRET || 'victory-predict-webhook-secret',
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'victory-predict-verify-token',
  footballApiKey: process.env.FOOTBALL_API_KEY || '',
  footballApiUrl: process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3000/admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@victorypredict.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123!',
  vipPlans: {
    weekly: { name: 'VIP Weekly', price: 1500, duration: 7 },
    monthly: { name: 'VIP Monthly', price: 4500, duration: 30 }
  },
  paymentInfo: {
    moncash: { name: 'MonCash', number: '+50944XXXXXXX', instruction: 'Voye lajan nan nimewo MonCash sa a:' },
    natcash: { name: 'NatCash', number: '+5095XXXXXXXX', instruction: 'Voye lajan nan nimewo NatCash sa a:' }
  },
  languages: ['ht', 'en', 'fr'],
  defaultLanguage: 'ht',
  backupInterval: process.env.BACKUP_INTERVAL || '0 */6 * * *'
};