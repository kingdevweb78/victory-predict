import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Crown, Star, Calendar, Clock } from 'lucide-react';

export default function VIPMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVIP(); }, []);

  const fetchVIP = async () => {
    try { const res = await api.get('/api/users?level=vip_weekly,vip_monthly&limit=100'); setUsers(res.data.users); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const daysLeft = (expiry) => { if (!expiry) return 0; return Math.max(0, Math.ceil((new Date(expiry) - new Date()) / (1000*60*60*24))); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Crown size={24} style={{ color: '#f59e0b' }} /> VIP Members</h1><p style={{ color: '#737373', fontSize: 14 }}>All VIP subscribers</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[{ label: 'Total VIP', value: users.length, color: '#f59e0b' },{ label: 'VIP Weekly', value: users.filter(u=>u.level==='vip_weekly').length, color: '#10b981' },{ label: 'VIP Monthly', value: users.filter(u=>u.level==='vip_monthly').length, color: '#8b5cf6' },{ label: 'Expiring Soon', value: users.filter(u=>daysLeft(u.vipExpiry)<=3&&daysLeft(u.vipExpiry)>0).length, color: '#ef4444' }].map(s=>(<div key={s.label} className="stat-card"><p style={{ fontSize:13,color:'#737373' }}>{s.label}</p><p style={{ fontSize:32,fontWeight:800,color:s.color }}>{s.value}</p></div>))}
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : users.length===0 ? <div style={{ textAlign:'center',padding:64 }}><Crown size={40} style={{ color:'#525252',marginBottom:12 }} /><p style={{ color:'#737373' }}>No VIP members yet</p></div> : (
          <table className="data-table"><thead><tr><th>Member</th><th>Plan</th><th>Expiry</th><th>Days Left</th><th>Status</th></tr></thead><tbody>{users.map(u=>{const left=daysLeft(u.vipExpiry);return(<tr key={u._id}><td style={{ fontWeight:600 }}>{u.name||'Unknown'}{u.level==='vip_monthly'&&<Crown size={12} style={{ color:'#f59e0b',marginLeft:6,display:'inline' }} />}</td><td><span className={`badge ${u.level==='vip_monthly'?'badge-green':'badge-gold'}`}>{u.level==='vip_monthly'?'Monthly':'Weekly'}</span></td><td><Calendar size={14} style={{ color:'#737373',marginRight:4 }} />{u.vipExpiry?new Date(u.vipExpiry).toLocaleDateString():'N/A'}</td><td><span className={`badge ${left<=3?'badge-red':left<=7?'badge-gold':'badge-green'}`}><Clock size={10} /> {left} days</span></td><td><span className={`badge ${left>0?'badge-green':'badge-red'}`}>{left>0?'Active':'Expired'}</span></td></tr>)})}</tbody></table>
        )}
      </div>
    </div>
  );
}