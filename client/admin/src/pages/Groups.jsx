import React, { useEffect, useState } from 'react';
import { groupsAPI } from '../utils/api';
import { MessageSquare, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = () => { groupsAPI.getAll().then(({ data }) => { if (data.success) setGroups(data.groups || []); }).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);
  const handleToggle = async (id) => { try { await groupsAPI.toggle(id); toast.success('Toggle!'); fetch(); } catch { toast.error('Erè'); } };
  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom:24 }}><h2 style={{ fontSize:24, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><MessageSquare size={24} color="#3b82f6" /> Gwoup WhatsApp</h2><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{groups.length} gwoup</p></div>
      {loading ? <div style={{ textAlign:'center', padding:60 }}>Chajman...</div> :
       groups.length===0 ? <div className="glass-card" style={{ textAlign:'center', padding:60 }}><MessageSquare size={48} color="var(--text-muted)" style={{ opacity:0.3 }} /><h3 style={{ color:'var(--text-secondary)' }}>Pa gen gwoup</h3></div> :
       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
        {groups.map((g, i) => (
          <div key={g._id||i} className="glass-card" style={{ padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:g.enabled?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#525252,#404040)', display:'flex', alignItems:'center', justifyContent:'center' }}><Users size={20} color="#fff" /></div>
                <div><div style={{ fontWeight:700, fontSize:15 }}>{g.name||'Unknown'}</div><div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{(g.id||'').substring(0,20)}...</div></div>
              </div>
              <button onClick={() => handleToggle(g._id)} style={{ background:'none', border:'none', cursor:'pointer' }}>{g.enabled!==false?<ToggleRight size={32} color="#10b981" />:<ToggleLeft size={32} color="var(--text-muted)" />}</button>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}><span>👥 {g.memberCount||0} manm</span><span style={{ color:g.enabled!==false?'#34d399':'#f87171', fontWeight:600 }}>{g.enabled!==false?'🟢 Aktif':'🔴 Stop'}</span></div>
          </div>))}
       </div>}
    </div>
  );
}
