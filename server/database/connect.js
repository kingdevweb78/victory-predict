const User = require('../models/User');

async function connectDB() {
  try {
    await User.ensureAdmin();
    console.log('📁 JSON Storage Ready ✅');
  } catch (e) {
    console.log('⚠️ Storage:', e.message);
  }
  return { readyState: 1, name: 'JSON File Store' };
}

module.exports = connectDB;
