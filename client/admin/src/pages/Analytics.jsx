import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
export default function Analytics() {
  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom:24 }}><h2 style={{ fontSize:24, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><BarChart3 size={24} color="#06b6d4" /> Analitik</h2><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Statistik ak pefomans</p></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:20 }}>
        {[{ label:'To Sikse', value:'72%', color:'#10b981', icon:'🎯' },{ label:'Revni Mwa Sa', value:'$0', color:'#f59e0b', icon:'💰' },{ label:'Nouvo Users', value:'0', color:'#3b82f6', icon:'👥' },{ label:'Prediksyon Aktif', value:'0', color:'#8b5cf6', icon:'⚡' }].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding:28, textAlign:'center' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', border:'4px solid '+s.color, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', background:s.color+'14' }}><span style={{ fontSize:28 }}>{s.icon}</span></div>
            <h3 style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{s.label}</h3>
            <p style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding:28, marginTop:20, textAlign:'center' }}><PieChart size={48} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:16 }} /><h3 style={{ color:'var(--text-secondary)', marginBottom:8 }}>Plis grafik ap vini...</h3></div>
    </div>
  );
}
