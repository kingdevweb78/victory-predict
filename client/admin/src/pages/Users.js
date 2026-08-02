import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Shield, Star, Crown } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get(`/api/users?page=${page}&limit=20&search=${search}`); setUsers(res.data.users); setPagination(res.data.pagination); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const levelBadge = (level) => {
    const map = { free: { label: 'Free', cls: 'badge-blue' }, vip_weekly: { label: 'VIP Weekly', cls: 'badge-gold' }, vip_monthly: { label: 'VIP Monthly', cls: 'badge-green' }, admin: { label: 'Admin', cls: 'badge-red' } };
    const b = map[level] || map.free;
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800 }}>Users</h1><p style={{ color: '#737373', fontSize: 14 }}>Manage all users</p></div>
      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#525252' }} />
          <input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: '100%', paddingLeft: 40 }} />
        </div>
        <button className="btn-glow" onClick={fetchUsers}>Refresh</button>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 64, color: '#737373' }}>Loading...</div> : (
          <table className="data-table">
            <thead><tr><th>User</th><th>WhatsApp ID</th><th>Level</th><th>Predictions</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>{users.map(u => (<tr key={u._id}><td style={{ fontWeight: 600 }}>{u.name || 'Unknown'}{u.isAdmin && <Shield size={12} style={{ color: '#f59e0b', marginLeft: 6, display: 'inline' }} />}</td><td style={{ color: '#737373', fontSize: 13 }}>{u.whatsappId?.replace('@s.whatsapp.net', '')}</td><td>{levelBadge(u.level)}</td><td>{u.totalPredictions || 0}</td><td><span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td><td style={{ color: '#737373', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td></tr>))}</tbody>
          </table>
        )}
        {pagination && <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1f1f1f' }}><span style={{ color: '#737373', fontSize: 13 }}>Total: {pagination.total}</span><div style={{ display: 'flex', gap: 8 }}><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Prev</button><button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'6px 14px',borderRadius:8,background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#f5f5f5',cursor:'pointer',fontSize:13 }}>Next</button></div></div>}
      </div>
    </div>
  );
}