const {getStore}=require('../database/store'); const store=getStore('notifications');
class Notification {
  constructor(data){Object.assign(this,data);}
  static findById(id){const n=store.findById(id);return n?new Notification(n):null;}
  static find(q={}){return store.find(q).map(n=>new Notification(n));}
  static create(d){return new Notification(store.create({...d,_createdAt:new Date().toISOString(),read:false}));}
}
module.exports=Notification;
