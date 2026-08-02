import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Bell, Send } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => { try { const res = await api.get('/api/notifications/admin?limit=50'); setNotifications(res.data.notifications); } catch (err) {} finally { setLoading(false); } };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return toast.error('Enter message');
    setSending(true);
    try { await api.post('/api/notifications/broadcast', { type: 'new_broadcast', title: 'Broadcast', message: broadcastMsg, targetType: 'all' }); toast.success('Sent!'); setBroadcastMsg(''); fetchNotifications(); }
    catch (err) { toast.error('Error'); }
    finally { setSending(false); }
  };

  const typeColors = { new_prediction: '#8b5cf6', vip_expiry: '#f59e0b', payment_approved: '#10b981', payment_rejected: '#ef4444', match_started: '#3b82f6', match_finished: '#06b6d4', new_broadcast: '#8b5cf6' };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={24} style={{ color: '#f59e0b' }} /> Notifications</h1></div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}><Send size={16} style={{ display:'inline',marginRight:8,color:'#10b981' }}/> Send Broadcast</h3>
        <div style={{ display:'flex',gap:12 }}><textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} placeholder="Enter message..." rows={2} style={{ flex:1,resize:'vertical' }}/><button className="btn-glow" onClick={handleBroadcast} disabled={sending} style={{ alignSelf:'flex-end',padding:'10px 20px' }}>{sending?'Sending...':'Send 📢'}</button></div>
      </div>
      <div className="glass-card" style={{ overflow:'hidden' }}>
        {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : notifications.length===0 ? <div style={{ textAlign:'center',padding:64 }}><Bell size={40} style={{ color:'#525252',marginBottom:12 }}/><p style={{ color:'#737373' }}>No notifications</p></div> : (
          <div>{notifications.map(n=>(<div key={n._id} style={{ padding:'16px 24px',borderBottom:'1px solid #1f1f1f',display:'flex',gap:12,alignItems:'flex-start' }}><div style={{ width:10,height:10,borderRadius:'50%',marginTop:4,background:typeColors[n.type]||'#525252',flexShrink:0 }}/><div style={{ flex:1 }}><div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}><span style={{ fontWeight:600,fontSize:14 }}>{n.title}</span><span style={{ fontSize:11,color:'#525252' }}>{new Date(n.createdAt).toLocaleString()}</span></div><p style={{ color:'#a3a3a3',fontSize:13,marginBottom:4 }}>{n.message}</p></div></div>))}</div>
        )}
      </div>
    </div>
  );
}