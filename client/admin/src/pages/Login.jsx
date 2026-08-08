import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Zap } from 'lucide-react';
export default function Login() {
  const [email, setEmail] = useState('admin@victorypredict.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const ok = await login(email, password); if (ok) navigate('/dashboard'); else setError('Email ou modpas pa korek'); }
    catch (err) { setError(err.response?.data?.message || 'Ere koneksyon'); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(ellipse at top, #0f2b1d 0%, #0a0a0a 60%)', padding:20 }}>
      <div className="glass-card" style={{ width:'100%', maxWidth:420, padding:48, boxShadow:'0 40px 80px rgba(0,0,0,0.5)', border:'1px solid var(--border-color)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:72, height:72, borderRadius:20, margin:'0 auto 16px', background:'linear-gradient(135deg, #10b981, #059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, boxShadow:'0 0 40px rgba(16,185,129,0.3)' }}>🏆</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>Victory <span className="gradient-text">Predict</span></h1>
          <p style={{ fontSize:14, color:'var(--text-muted)' }}>Admin Dashboard 🇭🇹</p>
        </div>
        <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981' }} />
          <span style={{ fontSize:13, color:'#6ee7b7', fontWeight:500 }}>JSON Storage Active — No MongoDB</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}><label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6, textTransform:'uppercase' }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@victorypredict.com" required style={{ width:'100%' }} /></div>
          <div style={{ marginBottom:24 }}><label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6, textTransform:'uppercase' }}>Modpas</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width:'100%' }} /></div>
          {error && <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#fca5a5', fontSize:13, display:'flex', alignItems:'center', gap:8 }}><Shield size={16} color="#f87171" /> {error}</div>}
          <button type="submit" disabled={loading} className="btn-glow" style={{ width:'100%', padding:14, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>{loading ? <div style={{ width:20, height:20, border:'2px solid transparent', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} /> : <><Zap size={18} /> Konekte</>}</button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--text-muted)' }}>🏆 Victory Predict v2.2.0 — Powered by Groq AI</p>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
