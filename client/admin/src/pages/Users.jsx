import React, { useEffect, useState } from 'react';
import { usersAPI } from '../utils/api';
import { Search, Mail, MoreHorizontal } from 'lucide-react';
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { usersAPI.getAll().then(({ data }) => { if (data.success) setUsers(data.users || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const filtered = users.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.whatsappId || '').includes(search));
  return (
    <div className="animate-slide-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div><h2 style={{ fontSize:24, fontWeight:700 }}>👥 Itilizate</h2><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{users.length} itilizate</p></div>
        <div style={{ position:'relative' }}><Search size={16} style={{ position:'absolute', left:12, top:11, color:'var(--text-muted)' }} /><input placeholder="Cheche..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:40, width:240 }} /></div>
      </div>
      <div className="glass-card" style={{ overflow:'hidden' }}>
        <table className="data-table"><thead><tr><th>Itilizate</th><th>WhatsApp</th><th>Lang</th><th>VIP</th><th>Status</th><th>Dat</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Chajman...</td></tr> :
             filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>{search ? 'Pa gen rezilta' : 'Pa gen itilizate'}</td></tr> :
             filtered.map((u, i) => (
              <tr key={u._id || i}>
                <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><div style={{ width:36, height:36, borderRadius:10, background:u.isAdmin?'linear-gradient(135deg,#8b5cf6,#6d28d9)':'linear-gradient(135deg,#3b82f6,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700 }}>{u.name?.[0]||'?'}</div><div><div style={{ fontWeight:600 }}>{u.name||'Unknown'}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}><Mail size={10} /> {u.email||'N/A'}</div></div></div></td>
                <td style={{ fontFamily:'monospace', fontSize:13 }}>{u.whatsappId||'N/A'}</td>
                <td><span className="badge badge-blue">{(u.language||'HT').toUpperCase()}</span></td>
                <td>{u.isVip ? <span className="badge badge-gold">👑 VIP</span> : <span className="badge badge-green">Gratis</span>}</td>
                <td><span style={{ color:u.isActive!==false?'#34d399':'#f87171', fontSize:13 }}>{u.isActive!==false?'🟢 Aktif':'🔴 Inaktif'}</span></td>
                <td style={{ fontSize:12, color:'var(--text-muted)' }}>{u.createdAt?new Date(u.createdAt).toLocaleDateString('fr'):'N/A'}</td>
              </tr>))}
          </tbody></table>
      </div>
    </div>
  );
}
