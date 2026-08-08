const Notification = require('../models/Notification');

class NotificationService {
  async create(data) {
    return Notification.create({ ...data, createdAt: new Date().toISOString() });
  }

  async find(query) {
    return Notification.find(query);
  }

  getStatus() {
    return { active: true, notifications: Notification.find().length };
  }
}

module.exports = new NotificationService();
