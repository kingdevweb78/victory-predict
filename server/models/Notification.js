const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_prediction', 'vip_expiry', 'payment_approved', 'payment_rejected', 'match_started', 'match_finished', 'new_broadcast', 'system', 'welcome'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetType: { type: String, enum: ['all', 'vip', 'free', 'admin', 'user', 'group'], default: 'all' },
  targetId: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  sentViaWhatsApp: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ targetId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);