const {getStore}=require('../database/store'); const store=getStore('groups');
class Group {
  constructor(data){Object.assign(this,data);}
  async save(){const e=store.findById(this._id);return e?store.update(this._id,this):store.create(this);}
  static findById(id){const g=store.findById(id);return g?new Group(g):null;}
  static find(q={}){return store.find(q).map(g=>new Group(g));}
  static findOne(q){const g=store.findOne(q);return g?new Group(g):null;}
  static create(d){return new Group(store.create(d));}
}
module.exports=Group;
