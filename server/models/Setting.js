const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['general', 'bot', 'payment', 'prediction', 'notification', 'security'], default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);