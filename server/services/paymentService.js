const Payment = require('../models/Payment');
const User = require('../models/User');

class PaymentService {
  async createPayment(userId, whatsappId, plan, method) {
    return Payment.create({
      userId, whatsappId, plan, method,
      status: 'pending',
      amount: plan === 'weekly' ? 1500 : 4500,
      transactionId: 'txn_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    });
  }

  async approvePayment(paymentId) {
    const p = Payment.findById(paymentId);
    if (!p) return null;
    const days = p.plan === 'weekly' ? 7 : 30;
    const exp = new Date();
    exp.setDate(exp.getDate() + days);

    const u = User.findOne({ whatsappId: p.whatsappId });
    if (u) {
      u.level = p.plan === 'weekly' ? 'vip_weekly' : 'vip_monthly';
      u.vipExpiry = exp.toISOString();
      User.findByIdAndUpdate(u._id, u);
    }
    return Payment.findByIdAndUpdate(paymentId, { status: 'approved', approvedAt: new Date().toISOString() });
  }

  async rejectPayment(paymentId, reason) {
    return Payment.findByIdAndUpdate(paymentId, { status: 'rejected', reason, rejectedAt: new Date().toISOString() });
  }
}

module.exports = new PaymentService();
