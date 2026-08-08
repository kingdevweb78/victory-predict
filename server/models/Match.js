const { getStore } = require('../database/store');
const store = getStore('matches');

class Match {
  constructor(data) { Object.assign(this, data); }
  static findById(id) { const m = store.findById(id); return m ? new Match(m) : null; }
  static findOne(q) { const m = store.findOne(q); return m ? new Match(m) : null; }
  static find(q) { return store.find(q).map(m => new Match(m)); }
  static create(d) { return new Match(store.create({ ...d, createdAt: new Date().toISOString() })); }
  static countDocuments(q) { return store.countDocuments(q); }
}
module.exports = Match;
