import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24, backgroundImage: 'radial-gradient(ellipse at top, rgba(16,185,129,0.08) 0%, transparent 50%)' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 420, padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16, boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>⚽</div>
          <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Victory Predict</h1>
          <p style={{ color: '#737373', fontSize: 14 }}>Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a3a3a3', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@victorypredict.com" style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a3a3a3', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#737373', cursor: 'pointer' }}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className="btn-glow" disabled={loading} style={{ width: '100%', padding: '14px 24px', fontSize: 15, marginBottom: 16 }}>
            {loading ? <span>● Signing in...</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Shield size={18} /> Sign In</span>}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#525252', fontSize: 12 }}><Zap size={12} style={{ color: '#10b981' }} /> Secured with JWT</div>
        </form>
      </div>
    </div>
  );
}