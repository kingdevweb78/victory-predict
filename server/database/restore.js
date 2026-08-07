const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

const restore = async (filename) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    if (!filename) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.gz')).sort().reverse();
      if (!files.length) { logger.error('No backup files found'); return; }
      filename = files[0];
    }
    const filepath = path.join(backupDir, filename);
    if (!fs.existsSync(filepath)) { logger.error('Backup file not found: ' + filename); return; }
    const uri = config.mongodbUri;
    const cmd = 'mongorestore --uri="' + uri + '" --gzip --drop --archive=' + filepath;
    exec(cmd, (error, stdout, stderr) => {
      if (error) { logger.error('Restore failed: ' + error.message); return; }
      logger.info('Restore complete from: ' + filename);
    });
  } catch (error) { logger.error('Restore error: ' + error.message); }
};

if (require.main === module) { const fn = process.argv[2]; require('./connect')().then(() => { restore(fn).then(() => { logger.info('Restore complete'); process.exit(0); }); }); }
module.exports = restore;
