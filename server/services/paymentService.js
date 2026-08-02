const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const config = require('../config');
const logger = require('../utils/logger');

class PaymentService {
  async createPayment(userId, whatsappId, plan, method) {
    const planConfig = config.vipPlans[plan];
    if (!planConfig) throw new Error('Invalid plan');
    return Payment.create({ userId, whatsappId, plan, amount: planConfig.price, method, status: 'pending' });
  }

  async approvePayment(paymentId, adminId, note = '') {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'pending') throw new Error('Payment not found or already processed');
    const user = await User.findById(payment.userId);
    const planConfig = config.vipPlans[payment.plan];
    const now = new Date();
    const existing = user.vipExpiry && user.vipExpiry > now ? user.vipExpiry : now;
    const newExpiry = new Date(existing.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);
    payment.status = 'approved'; payment.reviewedBy = adminId; payment.reviewNote = note; payment.reviewedAt = new Date();
    await payment.save();
    user.vipExpiry = newExpiry; user.level = payment.plan === 'monthly' ? 'vip_monthly' : 'vip_weekly';
    await user.save();
    await Notification.create({ type: 'payment_approved', title: 'VIP Approved', message: `VIP active until ${newExpiry.toLocaleDateString()}`, targetType: 'user', targetId: payment.whatsappId });
    return { payment, user, expiryDate: newExpiry };
  }

  async rejectPayment(paymentId, adminId, note = '') {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'pending') throw new Error('Payment not found or already processed');
    payment.status = 'rejected'; payment.reviewedBy = adminId; payment.reviewNote = note; payment.reviewedAt = new Date();
    await payment.save();
    return payment;
  }

  async getPendingPayments() { return Payment.find({ status: 'pending' }).populate('userId', 'name whatsappId').sort({ createdAt: -1 }); }

  async getPaymentHistory(filters = {}, page = 1, limit = 20) {
    const query = {};
    if (filters.status) query.status = filters.status;
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query).populate('userId', 'name whatsappId').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getRevenueStats(period = 'month') {
    const now = new Date();
    const startDate = new Date(now.getTime() - (period === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000);
    const payments = await Payment.find({ status: 'approved', createdAt: { $gte: startDate } });
    return { totalRevenue: payments.reduce((s, p) => s + p.amount, 0), totalPayments: payments.length, weeklyCount: payments.filter(p => p.plan === 'weekly').length, monthlyCount: payments.filter(p => p.plan === 'monthly').length };
  }

  getPaymentInstructions() { return `Send payment to MonCash: ${config.paymentInfo.moncash.number} or NatCash: ${config.paymentInfo.natcash.number}. Send screenshot after payment.`; }
}

module.exports = new PaymentService();