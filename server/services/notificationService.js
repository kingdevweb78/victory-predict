const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

class NotificationService {
  async create({ type, title, message, targetType = 'all', targetId = null, metadata = {} }) {
    try { return await Notification.create({ type, title, message, targetType, targetId, metadata }); } catch (e) { return null; }
  }

  async getUserNotifications(whatsappId, page = 1, limit = 20) {
    const query = { $or: [{ targetType: 'all' }, { targetType: 'user', targetId: whatsappId }] };
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return { notifications, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(whatsappId) { return Notification.countDocuments({ targetId: whatsappId, isRead: false }); }
  async markAsRead(id) { return Notification.findByIdAndUpdate(id, { isRead: true }); }
  async markAllAsRead(whatsappId) { return Notification.updateMany({ targetId: whatsappId, isRead: false }, { isRead: true }); }

  async broadcast(type, title, message, targetType = 'all') {
    await this.create({ type, title, message, targetType });
    return { success: true };
  }

  async getAdminNotifications(page = 1, limit = 50) {
    const total = await Notification.countDocuments();
    const notifications = await Notification.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return { notifications, total, page, totalPages: Math.ceil(total / limit) };
  }

  async cleanOldNotifications() { const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); return Notification.deleteMany({ createdAt: { $lt: d }, isRead: true }); }
}

module.exports = new NotificationService();