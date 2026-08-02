const express = require('express');
const router = express.Router();
const { getAllTranslations } = require('../services/languageService');

router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  if (!['ht', 'en', 'fr'].includes(lang)) return res.status(400).json({ success: false });
  res.json({ success: true, lang, translations: getAllTranslations(lang) });
});

router.get('/', (req, res) => {
  res.json({ success: true, languages: [{ code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyol Ayisyen', flag: '🇭🇹' }, { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' }, { code: 'fr', name: 'French', nativeName: 'Francais', flag: '🇫🇷' }] });
});

module.exports = router;