const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  whatsappId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: 'User' },
  language: { type: String, enum: ['ht', 'en', 'fr'], default: 'ht' },
  level: { type: String, enum: ['free', 'vip_weekly', 'vip_monthly', 'admin'], default: 'free' },
  vipExpiry: { type: Date, default: null },
  vipBadge: { type: String, default: null },
  favoriteTeams: [{ type: String }],
  favoriteLeagues: [{ type: String }],
  totalPredictions: { type: Number, default: 0 },
  dailyPredictions: { type: Number, default: 0 },
  lastPredictionDate: { type: Date, default: null },
  groupIds: [{ type: String }],
  isBlocked: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  adminPassword: { type: String, default: null },
  email: { type: String, default: null },
  profilePicture: { type: String, default: null },
  lastActive: { type: Date, default: Date.now },
  settings: { notifications: { type: Boolean, default: true }, autoPredict: { type: Boolean, default: false }, darkMode: { type: Boolean, default: true } },
  metadata: { totalPayments: { type: Number, default: 0 }, lastPaymentDate: { type: Date, default: null }, registrationSource: { type: String, default: 'whatsapp' } }
}, { timestamps: true });

userSchema.pre('save', async function(next) { if (this.isModified('adminPassword') && this.adminPassword) { this.adminPassword = await bcrypt.hash(this.adminPassword, 12); } next(); });
userSchema.methods.comparePassword = async function(candidatePassword) { if (!this.adminPassword) return false; return bcrypt.compare(candidatePassword, this.adminPassword); };
userSchema.methods.isVipActive = function() { if (!this.vipExpiry) return false; return new Date() < this.vipExpiry; };
userSchema.methods.getVipDaysRemaining = function() { if (!this.vipExpiry) return 0; const diff = new Date(this.vipExpiry) - new Date(); return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))); };

module.exports = mongoose.model('User', userSchema);
