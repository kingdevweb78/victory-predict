import React, { useState } from 'react';
import { Bell, Send, Users, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
export default function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('broadcast');
  const [sending, setSending] = useState(false);
  const handleSend = async (e) => { e.preventDefault(); if (!message) return toast.error('Antre yon mesaj'); setSending(true); setTimeout(() => { toast.success('Voye! 📨'); setMessage(''); setTitle(''); setSending(false); }, 800); };
  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom:24 }}><h2 style={{ fontSize:24, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><Bell size={24} color="#ec4899" /> Notifikasyon</h2><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Voye notifikasyon</p></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:20 }}>
        <div className="glass-card" style={{ padding:28 }}>
          <h3 style={{ fontSize:18, fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><Send size={18} color="#ec4899" /> Voye Broadcast</h3>
          <form onSubmit={handleSend}>
            <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:4 }}>Tit</label><input placeholder="Tit mesaj la..." value={title} onChange={e => setTitle(e.target.value)} style={{ width:'100%' }} /></div>
            <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:4 }}>Mesaj</label><textarea placeholder="Ekri mesaj la..." value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ width:'100%', resize:'vertical' }} /></div>
            <div style={{ marginBottom:16, display:'flex', gap:8 }}>{['broadcast','vip','all'].map(t => <button key={t} type="button" onClick={() => setType(t)} style={{ padding:'8px 16px', borderRadius:20, fontSize:12, fontWeight:600, border:'1px solid', cursor:'pointer', background:type===t?'rgba(236,72,153,0.12)':'transparent', borderColor:type===t?'rgba(236,72,153,0.3)':'var(--border-color)', color:type===t?'#f472b6':'var(--text-secondary)', display:'flex', alignItems:'center', gap:6 }}>{t==='vip'?<><Users size={12} /> VIP</>:t==='all'?<><Globe size={12} /> Tout</>:<><Bell size={12} /> Broadcast</>}</button>)}</div>
            <button type="submit" disabled={sending} className="btn-glow" style={{ width:'100%', padding:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#ec4899,#db2777)' }}>{sending?'Voye...':<><Send size={16} /> Voye</>}</button>
          </form>
        </div>
        <div className="glass-card" style={{ padding:28 }}><h3 style={{ fontSize:18, fontWeight:600, marginBottom:20 }}>📋 Istorik</h3><div style={{ textAlign:'center', padding:40 }}><Bell size={48} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:16 }} /><h3 style={{ color:'var(--text-secondary)', marginBottom:8 }}>Pa gen notifikasyon</h3></div></div>
      </div>
    </div>
  );
}
