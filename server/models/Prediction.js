const {getStore}=require('../database/store'); const store=getStore('predictions');
class Prediction {
  constructor(data){Object.assign(this,data);}
  static findById(id){const p=store.findById(id);return p?new Prediction(p):null;}
  static find(q={}){return store.find(q).map(p=>new Prediction(p));}
  static findOne(q){const p=store.findOne(q);return p?new Prediction(p):null;}
  static countDocuments(q={}){return store.countDocuments(q);}
  static create(d){return new Prediction(store.create({...d,createdAt:new Date().toISOString()}));}
}
module.exports=Prediction;
