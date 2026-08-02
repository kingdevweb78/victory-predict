import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Users, Crown, CreditCard, BrainCircuit, Users2, DollarSign, ArrowUp, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([api.get('/api/admin/dashboard'), api.get('/api/admin/analytics?period=7')]);
      setData({ ...dashRes.data.dashboard, ...analyticsRes.data.analytics });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 16 }}>⚽</div><p style={{ color: '#737373' }}>Loading...</p></div></div>;

  const stats = [
    { icon: Users, label: 'Total Users', value: data?.totalUsers || 0, color: '#3b82f6' },
    { icon: Crown, label: 'VIP Members', value: data?.vipUsers || 0, color: '#f59e0b' },
    { icon: CreditCard, label: 'Payments', value: data?.totalPayments || 0, color: '#10b981' },
    { icon: BrainCircuit, label: 'Predictions', value: data?.totalPredictions || 0, color: '#8b5cf6' },
    { icon: Users2, label: 'Groups', value: data?.totalGroups || 0, color: '#06b6d4' },
    { icon: DollarSign, label: 'Revenue (30d)', value: `${(data?.revenue || 0).toLocaleString()} HTG`, color: '#ef4444' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome back, <span className="gradient-text">{user?.name || 'Admin'}</span> 👋</h1>
        <p style={{ color: '#737373', fontSize: 14 }}>Here's what's happening with Victory Predict today.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><p style={{ fontSize: 13, color: '#737373', marginBottom: 8 }}>{label}</p><p style={{ fontSize: 28, fontWeight: 800, color: '#f5f5f5' }}>{value}</p></div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} style={{ color }} /></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><DollarSign size={16} style={{ display: 'inline', marginRight: 8, color: '#10b981' }} />Revenue (7 Days)</h3>
          {data?.dailyRevenue && <ResponsiveContainer width="100%" height={250}><AreaChart data={data.dailyRevenue}><defs><linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f"/><XAxis dataKey="_id" stroke="#525252" fontSize={12}/><YAxis stroke="#525252" fontSize={12}/><Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f5f5f5' }}/><Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#revG)" strokeWidth={2}/></AreaChart></ResponsiveContainer>}
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><Users size={16} style={{ display: 'inline', marginRight: 8, color: '#3b82f6' }} />New Users (7 Days)</h3>
          {data?.userRegistrations && <ResponsiveContainer width="100%" height={250}><LineChart data={data.userRegistrations}><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f"/><XAxis dataKey="_id" stroke="#525252" fontSize={12}/><YAxis stroke="#525252" fontSize={12}/><Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f5f5f5' }}/><Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }}/></LineChart></ResponsiveContainer>}
        </div>
      </div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><TrendingUp size={16} style={{ display: 'inline', marginRight: 8, color: '#f59e0b' }} />Recent Payments</h3>
        {data?.recentPayments?.length > 0 ? <table className="data-table"><thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{data.recentPayments.map(p => (<tr key={p._id}><td style={{ fontWeight: 500 }}>{p.userId?.name || p.whatsappId}</td><td><span className="badge badge-blue">{p.plan}</span></td><td style={{ fontWeight: 600 }}>{p.amount} HTG</td><td><span className={`badge badge-${p.status === 'approved' ? 'green' : 'gold'}`}>{p.status}</span></td><td style={{ color: '#737373', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table> : <p style={{ color: '#737373', textAlign: 'center', padding: 32 }}>No recent payments</p>}
      </div>
    </div>
  );
}