const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  whatsappId: { type: String, required: true },
  plan: { type: String, enum: ['weekly', 'monthly'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'HTG' },
  method: { type: String, enum: ['moncash', 'natcash', 'other'], required: true },
  screenshot: { type: String, default: null },
  transactionId: { type: String, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNote: { type: String, default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

paymentSchema.index({ whatsappId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);