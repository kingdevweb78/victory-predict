const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

const backup = async () => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = 'backup-' + timestamp + '.gz';
    const filepath = path.join(backupDir, filename);
    const uri = config.mongodbUri;
    const cmd = 'mongodump --uri="' + uri + '" --gzip --archive=' + filepath;
    exec(cmd, (error, stdout, stderr) => {
      if (error) { logger.error('Backup failed: ' + error.message); return; }
      logger.info('Backup created: ' + filename);
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.gz')).sort();
      while (files.length > 7) { fs.unlinkSync(path.join(backupDir, files.shift())); }
    });
  } catch (error) { logger.error('Backup error: ' + error.message); }
};

if (require.main === module) { require('./connect')().then(() => { backup().then(() => { logger.info('Backup complete'); process.exit(0); }); }); }
module.exports = backup;
