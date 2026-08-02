import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BrainCircuit, Target, Trash2 } from 'lucide-react';

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => { fetchPredictions(); fetchStats(); }, [page]);

  const fetchPredictions = async () => {
    setLoading(true);
    try { const res = await api.get(`/api/predictions?page=${page}&limit=20`); setPredictions(res.data.predictions); setPagination(res.data.pagination); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => { try { const res = await api.get('/api/predictions/stats'); setStats(res.data.stats); } catch (err) {} };

  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await api.delete(`/api/predictions/${id}`); toast.success('Deleted'); fetchPredictions(); fetchStats(); } catch (err) { toast.error('Error'); } };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><BrainCircuit size={24} style={{ color: '#8b5cf6' }} /> Predictions</h1><p style={{ color: '#737373', fontSize: 14 }}>AI Football Predictions History</p></div>
      {stats && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>{[{ label: 'Total', value: stats.total, color: '#8b5cf6' },{ label: 'Accuracy', value: `${stats.accuracy}%`, color: '#10b981' },{ label: 'Correct', value: stats.correct, color: '#10b981' },{ label: 'Incorrect', value: stats.incorrect, color: '#ef4444' }].map(s=>(<div key={s.label} className="stat-card"><p style={{ fontSize:13,color:'#737373' }}>{s.label}</p><p style={{ fontSize:28,fontWeight:800,color:s.color }}>{s.value}</p></div>))}</div>}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : (
          <table className="data-table"><thead><tr><th>Match</th><th>League</th><th>Prediction</th><th>Confidence</th><th>Result</th><th>Date</th><th></th></tr></thead><tbody>{predictions.map(p=>(<tr key={p._id}><td style={{ fontWeight:600 }}>{p.homeTeam} vs {p.awayTeam}</td><td style={{ color:'#737373',fontSize:13 }}>{p.league}</td><td><div style={{ fontSize:13 }}><div>Winner: <strong>{p.predictions?.winner}</strong></div><div style={{ color:'#737373' }}>Score: {p.predictions?.correctScore}</div></div></td><td><span className={`badge ${p.predictions?.confidence>=70?'badge-green':p.predictions?.confidence>=50?'badge-gold':'badge-red'}`}><Target size={10}/> {p.predictions?.confidence||0}%</span></td><td>{p.actualResult?.homeScore!=null?<span>{p.actualResult.homeScore}-{p.actualResult.awayScore} {p.isCorrect?'✅':p.isCorrect===false?'❌':'⏳'}</span>:<span style={{ color:'#737373' }}>Pending</span>}</td><td style={{ color:'#737373',fontSize:13 }}>{new Date(p.createdAt).toLocaleDateString()}</td><td><button onClick={()=>handleDelete(p._id)} style={{ background:'none',border:'none',color:'#525252',cursor:'pointer',padding:4 }}><Trash2 size={14}/></button></td></tr>))}</tbody></table>
        )}
        {pagination && <div style={{ padding:'16px 24px',display:'flex',justifyContent:'space-between',borderTop:'1px solid #1f1f1f' }}><span style={{ color:'#737373',fontSize:13 }}>Total: {pagination.total}</span><div style={{ display:'flex',gap:8 }}><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Prev</button><button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Next</button></div></div>}
      </div>
    </div>
  );
}