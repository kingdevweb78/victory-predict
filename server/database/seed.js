const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    logger.info('Seeding database...');
    await User.ensureAdmin();
    logger.info('Seed complete! Admin: ' + config.adminEmail);
  } catch (error) { logger.error('Seed error: ' + error.message); }
};

if (require.main === module) { seed().then(() => process.exit(0)); }
module.exports = seed;
