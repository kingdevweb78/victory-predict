const {getStore}=require('../database/store'); const store=getStore('payments');
class Payment {
  constructor(data){Object.assign(this,data);}
  async save(){const e=store.findById(this._id);return e?store.update(this._id,this):store.create(this);}
  static findById(id){const p=store.findById(id);return p?new Payment(p):null;}
  static find(q={}){return store.find(q).map(p=>new Payment(p));}
  static findOne(q){const p=store.findOne(q);return p?new Payment(p):null;}
  static countDocuments(q={}){return store.countDocuments(q);}
  static create(d){return new Payment(store.create(d));}
  static findByIdAndUpdate(id,u){const r=store.update(id,u);return r?new Payment(r):null;}
}
module.exports=Payment;
