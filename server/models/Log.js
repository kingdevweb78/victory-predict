const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warning', 'error', 'debug', 'success'], default: 'info' },
  category: { type: String, enum: ['system', 'bot', 'payment', 'admin', 'group', 'prediction', 'api', 'user'], required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: null }
}, { timestamps: true });

logSchema.index({ category: 1, createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);