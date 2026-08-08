require('dotenv').config();

module.exports = {
  port: process.env.PORT || 10000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'victory-predict-jwt-secret-key-2026',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  adminEmail: process.env.ADMIN_EMAIL || 'kfixed91@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || '445566',
  adminNumber: process.env.ADMIN_NUMBER || '50955394345',
  pairingPhoneNumber: process.env.PAIRING_PHONE_NUMBER || '50955394345',
  groqApiKey: process.env.GROQ_API_KEY || '',
  webhookSecret: process.env.WEBHOOK_SECRET || 'webhook-secret-key',
  storageType: process.env.STORAGE_TYPE || 'json',
};
