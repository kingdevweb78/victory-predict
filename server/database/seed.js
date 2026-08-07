const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Setting = require('../models/Setting');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    logger.info('Seeding database...');
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (!existingAdmin) {
      await User.create({ whatsappId: 'admin-' + Date.now(), name: 'KING DEV', email: config.adminEmail, adminPassword: config.adminPassword, isAdmin: true, level: 'admin', language: 'ht' });
      logger.info('Admin created: ' + config.adminEmail);
      logger.info('Password: ' + config.adminPassword);
    }
    const defaults = [
      { key: 'bot_name', value: 'Victory Predict', category: 'bot' },
      { key: 'prefix', value: '.', category: 'bot' },
      { key: 'mode', value: 'public', category: 'bot' },
      { key: 'default_language', value: 'ht', category: 'general' },
      { key: 'maintenance_mode', value: false, category: 'general' },
      { key: 'vip_weekly_price', value: 1500, category: 'payment' },
      { key: 'vip_monthly_price', value: 4500, category: 'payment' },
      { key: 'free_daily_predictions', value: 3, category: 'prediction' },
      { key: 'vip_daily_predictions', value: 20, category: 'prediction' },
      { key: 'auto_predictions_enabled', value: true, category: 'prediction' },
      { key: 'payment_moncash_number', value: '+50944XXXXXXX', category: 'payment' },
      { key: 'payment_natcash_number', value: '+5095XXXXXXXX', category: 'payment' },
    ];
    for (const s of defaults) { await Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true }); }
    const predCount = await Prediction.countDocuments();
    if (predCount === 0) {
      await Prediction.insertMany([
        { matchId: 'sample-1', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', league: 'La Liga', matchDate: new Date(), predictions: { winner: 'Barcelona', doubleChance: '1X', over15: 'Yes', over25: 'Yes', over35: 'No', btts: 'Yes', correctScore: '2-1', confidence: 72 }, requestedBy: 'system' },
        { matchId: 'sample-2', homeTeam: 'Man City', awayTeam: 'Liverpool', league: 'Premier League', matchDate: new Date(), predictions: { winner: 'Man City', doubleChance: '1X', over15: 'Yes', over25: 'Yes', over35: 'Yes', btts: 'Yes', correctScore: '3-2', confidence: 68 }, requestedBy: 'system' },
        { matchId: 'sample-3', homeTeam: 'PSG', awayTeam: 'Marseille', league: 'Ligue 1', matchDate: new Date(), predictions: { winner: 'PSG', doubleChance: '1', over15: 'Yes', over25: 'Yes', over35: 'No', btts: 'No', correctScore: '2-0', confidence: 82 }, requestedBy: 'system' },
      ]);
      logger.info('Sample predictions created');
    }
    logger.info('Seed complete!');
  } catch (error) { logger.error('Seed error: ' + error.message); }
};
if (require.main === module) { require('./connect')().then(() => { seed().then(() => process.exit(0)); }); }
module.exports = seed;
