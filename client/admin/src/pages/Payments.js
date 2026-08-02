import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { fetchPayments(); }, [filter, page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const status = filter !== 'all' ? filter : '';
      const res = await api.get(`/api/payments?page=${page}&limit=20${status ? '&status='+status : ''}`);
      setPayments(res.data.payments);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/api/payments/${id}/approve`, { note }); toast.success('Payment approved!'); setSelected(null); setNote(''); fetchPayments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/api/payments/${id}/reject`, { note }); toast.success('Payment rejected.'); setSelected(null); setNote(''); fetchPayments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (status) => {
    const map = { pending: { label: 'Pending', cls: 'badge-gold', icon: <Clock size={10} /> }, approved: { label: 'Approved', cls: 'badge-green', icon: <CheckCircle size={10} /> }, rejected: { label: 'Rejected', cls: 'badge-red', icon: <XCircle size={10} /> } };
    const b = map[status] || map.pending;
    return <span className={`badge ${b.cls}`}>{b.icon} {b.label}</span>;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={24} style={{ color: '#10b981' }} /> Payments</h1><p style={{ color: '#737373', fontSize: 14 }}>Manage payment verifications</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all','pending','approved','rejected'].map(f=>(<button key={f} onClick={()=>{setFilter(f);setPage(1);}} style={{ padding:'8px 16px',borderRadius:20,border:'1px solid #2a2a2a',background:filter===f?'rgba(16,185,129,0.1)':'transparent',color:filter===f?'#10b981':'#a3a3a3',cursor:'pointer',fontSize:13,fontWeight:filter===f?600:400,textTransform:'capitalize' }}>{f}{f==='pending'&&<span style={{ marginLeft:6,background:'#f59e0b',color:'#000',padding:'2px 8px',borderRadius:10,fontSize:11 }}>{payments.filter(p=>p.status==='pending').length}</span>}</button>))}
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : (
          <table className="data-table"><thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{payments.map(p=>(<tr key={p._id}><td style={{ fontWeight:600 }}>{p.userId?.name||p.whatsappId}</td><td><span className="badge badge-blue">{p.plan}</span></td><td style={{ fontWeight:600,color:'#10b981' }}>{p.amount} HTG</td><td style={{ textTransform:'capitalize' }}>{p.method}</td><td>{statusBadge(p.status)}</td><td style={{ color:'#737373',fontSize:13 }}>{new Date(p.createdAt).toLocaleDateString()}</td><td><div style={{ display:'flex',gap:4 }}><button onClick={()=>setSelected(p)} style={{ background:'none',border:'none',color:'#737373',cursor:'pointer',padding:4 }}><Eye size={16}/></button>{p.status==='pending'&&<><button onClick={()=>handleApprove(p._id)} style={{ background:'none',border:'none',color:'#10b981',cursor:'pointer',padding:4 }}><CheckCircle size={16}/></button><button onClick={()=>handleReject(p._id)} style={{ background:'none',border:'none',color:'#ef4444',cursor:'pointer',padding:4 }}><XCircle size={16}/></button></>}</div></td></tr>))}</tbody></table>
        )}
        {pagination && <div style={{ padding:'16px 24px',display:'flex',justifyContent:'space-between',borderTop:'1px solid #1f1f1f' }}><span style={{ color:'#737373',fontSize:13 }}>Total: {pagination.total}</span><div style={{ display:'flex',gap:8 }}><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Prev</button><button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Next</button></div></div>}
      </div>
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div onClick={e=>e.stopPropagation()} className="glass-card animate-slide-up" style={{ width:'90%',maxWidth:480,padding:32 }}>
            <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>Payment Details</h2>
            <div style={{ display:'grid',gap:12,marginBottom:20 }}>
              <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:'#737373' }}>User</span><span style={{ fontWeight:600 }}>{selected.userId?.name||'N/A'}</span></div>
              <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:'#737373' }}>Plan</span><span>{selected.plan}</span></div>
              <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:'#737373' }}>Amount</span><span style={{ fontWeight:600,color:'#10b981' }}>{selected.amount} HTG</span></div>
              <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:'#737373' }}>Status</span>{statusBadge(selected.status)}</div>
            </div>
            {selected.status==='pending'&&<>
              <input placeholder="Note (optional)..." value={note} onChange={e=>setNote(e.target.value)} style={{ width:'100%',marginBottom:16 }} />
              <div style={{ display:'flex',gap:12 }}><button className="btn-glow" onClick={()=>handleApprove(selected._id)} style={{ flex:1 }}><CheckCircle size={16} style={{ display:'inline',marginRight:6 }} />Approve</button><button className="btn-glow btn-gold" onClick={()=>handleReject(selected._id)} style={{ flex:1 }}><XCircle size={16} style={{ display:'inline',marginRight:6 }} />Reject</button></div>
            </>}
            <button onClick={()=>setSelected(null)} style={{ width:'100%',marginTop:16,padding:10,background:'transparent',border:'1px solid #2a2a2a',borderRadius:12,color:'#737373',cursor:'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}