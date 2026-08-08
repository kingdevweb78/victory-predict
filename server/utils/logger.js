const logger = {
  info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args),
  warn: (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args),
  debug: (...args) => process.env.DEBUG && console.log(new Date().toISOString(), '[DEBUG]', ...args),
};
module.exports = logger;
