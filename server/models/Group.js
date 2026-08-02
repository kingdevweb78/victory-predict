const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Unknown Group' },
  isEnabled: { type: Boolean, default: true },
  settings: {
    deleteLinks: { type: Boolean, default: true }, deleteSpam: { type: Boolean, default: true },
    antiFlood: { type: Boolean, default: true }, antiBadWords: { type: Boolean, default: true },
    adminOnlyCommands: { type: Boolean, default: false }, autoModeration: { type: Boolean, default: true },
    autoLogs: { type: Boolean, default: true }
  },
  messages: {
    welcome: { type: String, default: 'Byenveni nan {group}!' },
    goodbye: { type: String, default: 'Orevwa! Bonn chans!' }
  },
  badWords: [{ type: String }],
  adminIds: [{ type: String }],
  memberCount: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  addedBy: { type: String, default: null },
  language: { type: String, enum: ['ht', 'en', 'fr'], default: 'ht' }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);