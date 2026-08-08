const {getStore}=require('../database/store'); const store=getStore('settings');
class Setting {
  constructor(data){Object.assign(this,data);}
  async save(){const e=store.findById(this._id);return e?store.update(this._id,this):store.create(this);}
  static findById(id){const s=store.findById(id);return s?new Setting(s):null;}
  static find(q={}){return store.find(q).map(s=>new Setting(s));}
  static findOne(q){const s=store.findOne(q);return s?new Setting(s):null;}
  static create(d){return new Setting(store.create(d));}
  static findByIdAndUpdate(id,u){const r=store.update(id,u);return r?new Setting(r):null;}
}
module.exports=Setting;
