import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try { const res = await api.get(`/api/admin/analytics?period=${period}`); setData(res.data.analytics); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const pieData = data?.levelDistribution?.map(d=>({ name: d._id?.replace(/_/g,' ').toUpperCase()||'Unknown', value: d.count }))||[];
  const totalRevenue = data?.dailyRevenue?.reduce((sum,d)=>sum+d.total,0)||0;
  const totalUsers = data?.userRegistrations?.reduce((sum,d)=>sum+d.count,0)||0;
  const totalPredictions = data?.dailyPredictions?.reduce((sum,d)=>sum+d.count,0)||0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={24} style={{ color: '#8b5cf6' }} /> Analytics</h1></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>{[{ value:'7',label:'7 Days' },{ value:'30',label:'30 Days' },{ value:'90',label:'90 Days' }].map(opt=>(<button key={opt.value} onClick={()=>setPeriod(opt.value)} style={{ padding:'8px 20px',borderRadius:20,border:'1px solid #2a2a2a',background:period===opt.value?'rgba(16,185,129,0.1)':'transparent',color:period===opt.value?'#10b981':'#a3a3a3',cursor:'pointer',fontWeight:period===opt.value?600:400,fontSize:13 }}>{opt.label}</button>))}</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32 }}>
        {[{ icon:DollarSign,label:'Revenue',value:`${totalRevenue.toLocaleString()} HTG`,color:'#10b981' },{ icon:Users,label:'New Users',value:totalUsers,color:'#3b82f6' },{ icon:Target,label:'Predictions',value:totalPredictions,color:'#8b5cf6' },{ icon:TrendingUp,label:'Avg/Day',value:`${Math.round(totalRevenue/parseInt(period))} HTG`,color:'#f59e0b' }].map(s=>(<div key={s.label} className="stat-card"><p style={{ fontSize:13,color:'#737373',marginBottom:8 }}>{s.label}</p><p style={{ fontSize:28,fontWeight:800,color:s.color }}>{s.value}</p></div>))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(400px,1fr))',gap:16 }}>
        <div className="glass-card" style={{ padding:24 }}><h3 style={{ fontSize:16,fontWeight:700,marginBottom:20 }}><DollarSign size={16} style={{ display:'inline',marginRight:8,color:'#10b981' }}/> Daily Revenue</h3><ResponsiveContainer width="100%" height={250}><BarChart data={data?.dailyRevenue||[]}><CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f"/><XAxis dataKey="_id" stroke="#525252" fontSize={12}/><YAxis stroke="#525252" fontSize={12}/><Tooltip contentStyle={{ background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:8,color:'#f5f5f5' }}/><Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
        <div className="glass-card" style={{ padding:24 }}><h3 style={{ fontSize:16,fontWeight:700,marginBottom:20 }}><Users size={16} style={{ display:'inline',marginRight:8,color:'#3b82f6' }}/> User Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>{pieData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={{ background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:8,color:'#f5f5f5' }}/><Legend/></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}