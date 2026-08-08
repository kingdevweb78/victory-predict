const fs = require('fs');
const path = require('path');
const config = require('../config');
const DATA_DIR = path.join(__dirname, '../../data');

class Store {
  constructor(fileName) {
    this.filePath = path.join(DATA_DIR, fileName.replace('.json','') + '.json');
    this._ensureFile();
  }
  _ensureDir() { if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true}); }
  _ensureFile() { this._ensureDir(); if(!fs.existsSync(this.filePath)) this.write([]); }
  read() { try{return JSON.parse(fs.readFileSync(this.filePath,'utf-8'));}catch(e){return[];} }
  write(data) { this._ensureDir(); try{fs.writeFileSync(this.filePath+'.bak',fs.readFileSync(this.filePath));}catch(e){} fs.writeFileSync(this.filePath,JSON.stringify(data,null,2)); }
  findById(id) { return this.read().find(x=>x._id===id||x._id===String(id))||null; }
  findOne(query) { return this.read().find(item=>Object.entries(query).every(([k,v])=>item[k]===v))||null; }
  find(query={}) { return this.read().filter(item=>Object.entries(query).every(([k,v])=>{if(typeof v==='object'&&v!==null&&v.$gte)return new Date(item[k])>=new Date(v.$gte);return item[k]===v;})); }
  create(doc) { const d=this.read(); const item={_id:Store.uid(),...doc,_createdAt:new Date().toISOString()}; d.push(item); this.write(d); return item; }
  update(id,updates) { const d=this.read(); const i=d.findIndex(x=>x._id===id||x._id===String(id)); if(i===-1)return null; d[i]={...d[i],...updates,_updatedAt:new Date().toISOString()}; this.write(d); return d[i]; }
  delete(id) { const d=this.read(); const i=d.findIndex(x=>x._id===id||x._id===String(id)); if(i===-1)return false; d.splice(i,1); this.write(d); return true; }
  countDocuments(query={}) { return this.find(query).length; }
  static uid() { return 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9); }
}

const stores={};
function getStore(name) { if(!stores[name])stores[name]=new Store(name); return stores[name]; }
module.exports={Store,getStore};
