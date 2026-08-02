const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  code: { type: String, enum: ['ht', 'en', 'fr'], required: true, unique: true },
  name: { type: String, required: true },
  nativeName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  translations: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Language', languageSchema);