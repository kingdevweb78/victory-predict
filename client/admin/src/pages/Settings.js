import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Settings2, Save, Globe, Bot, CreditCard, Shield, Database } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => { try { const res = await api.get('/api/settings'); setSettings(res.data.settings); } catch (err) {} finally { setLoading(false); } };

  const handleSave = async () => { setSaving(true); try { await api.put('/api/settings', settings); toast.success('Saved!'); } catch (err) { toast.error('Error'); } finally { setSaving(false); } };

  const handleChange = (key, value) => { setSettings(prev=>({...prev,[key]:value})); };

  const sections = [
    { icon: Bot, title: 'Bot Settings', fields: [{ key:'bot_name',label:'Bot Name',type:'text' },{ key:'prefix',label:'Command Prefix',type:'text' },{ key:'mode',label:'Bot Mode',type:'select',options:['public','private'] }] },
    { icon: CreditCard, title: 'Payment', fields: [{ key:'vip_weekly_price',label:'VIP Weekly (HTG)',type:'number' },{ key:'vip_monthly_price',label:'VIP Monthly (HTG)',type:'number' }] },
    { icon: Globe, title: 'General', fields: [{ key:'language',label:'Default Language',type:'select',options:['ht','en','fr'] },{ key:'max_daily_predictions',label:'Max Daily Predictions',type:'number' }] },
    { icon: Shield, title: 'Security', fields: [{ key:'maintenance_mode',label:'Maintenance Mode',type:'toggle' }] },
  ];

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}><div><h1 style={{ fontSize:24,fontWeight:800,display:'flex',alignItems:'center',gap:8 }}><Settings2 size={24} style={{ color:'#a3a3a3' }}/> Settings</h1></div><button className="btn-glow" onClick={handleSave} disabled={saving}><Save size={16} style={{ display:'inline',marginRight:6 }}/>{saving?'Saving...':'Save'}</button></div>
      {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : (
        <div style={{ display:'grid',gap:16 }}>
          {sections.map(({ icon:Icon,title,fields })=>(<div key={title} className="glass-card" style={{ padding:24 }}><h3 style={{ fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8 }}><Icon size={16} style={{ color:'#10b981' }}/> {title}</h3><div style={{ display:'grid',gap:16 }}>{fields.map(({ key,label,type,options })=>(<div key={key}><label style={{ display:'block',fontSize:13,fontWeight:600,color:'#a3a3a3',marginBottom:6 }}>{label}</label>{type==='toggle'?<button onClick={()=>handleChange(key,!settings[key])} style={{ padding:'10px 20px',borderRadius:12,background:settings[key]?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${settings[key]?'#10b981':'#ef4444'}`,color:settings[key]?'#34d399':'#f87171',cursor:'pointer',fontWeight:600,fontSize:14 }}>{settings[key]?'ON':'OFF'}</button>:type==='select'?<select value={settings[key]||''} onChange={e=>handleChange(key,e.target.value)} style={{ width:'100%',maxWidth:300 }}>{options.map(o=>(<option key={o} value={o}>{o}</option>))}</select>:<input type={type} value={settings[key]||''} onChange={e=>handleChange(key,type==='number'?parseInt(e.target.value):e.target.value)} style={{ width:'100%',maxWidth:300 }}/>}</div>))}</div></div>))}
        </div>
      )}
      <div className="glass-card" style={{ padding:24,marginTop:24,border:'1px solid rgba(239,68,68,0.2)' }}><h3 style={{ fontSize:16,fontWeight:700,marginBottom:16,color:'#f87171',display:'flex',alignItems:'center',gap:8 }}><Database size={16}/> Database</h3><p style={{ color:'#737373',fontSize:13,marginBottom:16 }}>Backup and restore your database.</p><div style={{ display:'flex',gap:12 }}><button className="btn-glow" style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)' }}><Database size={14} style={{ display:'inline',marginRight:6 }}/> Backup</button><button className="btn-glow btn-gold"><Database size={14} style={{ display:'inline',marginRight:6 }}/> Restore</button></div></div>
    </div>
  );
}