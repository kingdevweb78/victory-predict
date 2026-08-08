const {getStore}=require('../database/store'); const store=getStore('users');
class User {
  constructor(data){Object.assign(this,data);}
  isVipActive(){return this.vipExpiry&&new Date(this.vipExpiry)>new Date();}
  async save(){const e=store.findById(this._id);return e?store.update(this._id,this):store.create(this);}
  static findById(id){const u=store.findById(id);return u?new User(u):null;}
  static findOne(q){const u=store.findOne(q);return u?new User(u):null;}
  static find(q={}){return store.find(q).map(u=>new User(u));}
  static countDocuments(q={}){return store.countDocuments(q);}
  static create(d){return new User(store.create(d));}
  static findByIdAndUpdate(id,u){const r=store.update(id,u);return r?new User(r):null;}
  static async ensureAdmin(){const c=require('../config');if(!store.findOne({email:c.adminEmail})){store.create({_id:'admin_001',name:'Admin King',email:c.adminEmail,password:c.adminPassword,whatsappId:c.adminNumber,language:'ht',level:'admin',isAdmin:true,vipExpiry:'2099-12-31',totalPredictions:0,favoriteTeams:[]});}}
}
module.exports=User;
