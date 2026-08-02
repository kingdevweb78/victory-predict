const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Setting = require('../models/Setting');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    logger.info('Seeding database...');
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (!existingAdmin) {
      await User.create({ whatsappId: 'admin-' + Date.now(), name: 'KING DEV', email: config.adminEmail, adminPassword: config.adminPassword, isAdmin: true, level: 'admin', language: 'ht' });
      logger.info('Admin created');
    }
    const defaults = [
      { key: 'bot_name', value: 'Victory Predict', category: 'bot' },
      { key: 'prefix', value: '.', category: 'bot' },
      { key: 'mode', value: 'public', category: 'bot' },
      { key: 'language', value: 'ht', category: 'general' },
      { key: 'vip_weekly_price', value: 1500, category: 'payment' },
      { key: 'vip_monthly_price', value: 4500, category: 'payment' },
      { key: 'maintenance_mode', value: false, category: 'general' },
      { key: 'max_daily_predictions', value: 20, category: 'prediction' },
    ];
    for (const s of defaults) { await Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true }); }
    logger.info('Seed complete');
  } catch (error) { logger.error(`Seed error: ${error.message}`); }
};

if (require.main === module) {
  require('./connect')().then(() => { seed().then(() => process.exit(0)); });
}
module.exports = seed;