const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  whatsappId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: 'User' },
  language: { type: String, enum: ['ht', 'en', 'fr'], default: 'ht' },
  level: { type: String, enum: ['free', 'vip_weekly', 'vip_monthly', 'admin'], default: 'free' },
  vipExpiry: { type: Date, default: null },
  favoriteTeams: [{ type: String }],
  favoriteLeagues: [{ type: String }],
  totalPredictions: { type: Number, default: 0 },
  groupIds: [{ type: String }],
  isBlocked: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  adminPassword: { type: String, default: null },
  email: { type: String, default: null },
  lastActive: { type: Date, default: Date.now },
  settings: { notifications: { type: Boolean, default: true }, autoPredict: { type: Boolean, default: false } }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('adminPassword') && this.adminPassword) {
    this.adminPassword = await bcrypt.hash(this.adminPassword, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.adminPassword) return false;
  return bcrypt.compare(candidatePassword, this.adminPassword);
};

userSchema.methods.isVipActive = function() {
  if (!this.vipExpiry) return false;
  return new Date() < this.vipExpiry;
};

module.exports = mongoose.model('User', userSchema);