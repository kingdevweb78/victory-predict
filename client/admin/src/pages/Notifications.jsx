import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import toast from 'react-hot-toast';
export default function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const handleSend = (e) => { e.preventDefault(); if (!message) return toast.error('Antre yon mesaj'); setSending(true); setTimeout(()=>{ toast.success('Voye! 📨'); setMessage(''); setTitle(''); setSending(false); },800); };
  return (<div className="animate-slide-up"><div style={{ marginBottom:24 }}><h2 style={{ fontSize:24,fontWeight:700,display:'flex',alignItems:'center',gap:8 }}><Bell size={24} color="#ec4899"/> Notifikasyon</h2><p style={{ color:'var(--text-muted)',fontSize:13 }}>Voye notifikasyon</p></div><div className="glass-card" style={{ padding:28,maxWidth:500 }}><h3 style={{ fontSize:18,fontWeight:600,marginBottom:20,display:'flex',alignItems:'center',gap:8 }}><Send size={18} color="#ec4899"/> Voye Broadcast</h3><form onSubmit={handleSend}><div style={{ marginBottom:12 }}><input placeholder="Tit mesaj la..." value={title} onChange={e=>setTitle(e.target.value)} style={{ width:'100%' }}/></div><div style={{ marginBottom:16 }}><textarea placeholder="Ekri mesaj la..." value={message} onChange={e=>setMessage(e.target.value)} rows={4} style={{ width:'100%',resize:'vertical' }}/></div><button type="submit" disabled={sending} className="btn-glow" style={{ width:'100%',padding:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'linear-gradient(135deg,#ec4899,#db2777)' }}>{sending?'Voye...':<><Send size={16}/> Voye</>}</button></form></div></div>);
}
