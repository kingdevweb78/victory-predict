const { getStore } = require('../database/store');
const store = getStore('logs');

class Log {
  constructor(data) { Object.assign(this, data); }
  static create(data) { return new Log(store.create({ ...data, timestamp: new Date().toISOString() })); }
  static find(q) { return store.find(q).map(l => new Log(l)); }
  static countDocuments(q) { return store.countDocuments(q); }
}
module.exports = Log;
