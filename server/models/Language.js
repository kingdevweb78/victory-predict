const { getStore } = require('../database/store');
const store = getStore('languages');

// Default translations
const defaults = {
  ht: { welcome: 'Byenveni!', vip: 'VIP', free: 'Gratis', prediction: 'Prediksyon', help: 'Ede' },
  en: { welcome: 'Welcome!', vip: 'VIP', free: 'Free', prediction: 'Prediction', help: 'Help' },
  fr: { welcome: 'Bienvenue!', vip: 'VIP', free: 'Gratuit', prediction: 'Prédiction', help: 'Aide' }
};

class Language {
  constructor(data) { Object.assign(this, data); }
  static findById(id) { const l = store.findById(id); return l ? new Language(l) : null; }
  static findOne(q) { return store.findOne(q); }
  static find(q) { return store.find(q).map(l => new Language(l)); }
  static create(d) { return new Language(store.create(d)); }
  static getDefaults() { return defaults; }
}

// Auto-seed languages
if (store.countDocuments() === 0) {
  Object.entries(defaults).forEach(([code, trans]) => {
    store.create({ code, name: code === 'ht' ? 'Haitian Creole' : code === 'fr' ? 'French' : 'English', nativeName: code === 'ht' ? 'Kreyòl Ayisyen' : code === 'fr' ? 'Français' : 'English', isActive: true, translations: trans });
  });
}

module.exports = Language;
