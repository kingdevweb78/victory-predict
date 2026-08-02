import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => { try { const res = await api.get('/api/groups?limit=50'); setGroups(res.data.groups); } catch (err) {} finally { setLoading(false); } };

  const toggleGroup = async (id, enabled) => { try { await api.put(`/api/groups/${id}`, { isEnabled: !enabled }); toast.success(enabled ? 'Disabled' : 'Enabled'); fetchGroups(); } catch (err) { toast.error('Error'); } };

  const deleteGroup = async (id) => { if (!window.confirm('Delete?')) return; try { await api.delete(`/api/groups/${id}`); toast.success('Deleted'); fetchGroups(); } catch (err) { toast.error('Error'); } };

  return (
    <div>
      <div style={{ marginBottom: 24 }}><h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Users2 size={24} style={{ color: '#06b6d4' }} /> Groups</h1></div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign:'center',padding:64,color:'#737373' }}>Loading...</div> : groups.length===0 ? <div style={{ textAlign:'center',padding:64 }}><Users2 size={40} style={{ color:'#525252',marginBottom:12 }} /><p style={{ color:'#737373' }}>No groups yet</p></div> : (
          <table className="data-table"><thead><tr><th>Group</th><th>ID</th><th>Members</th><th>Messages</th><th>Status</th><th>Actions</th></tr></thead><tbody>{groups.map(g=>(<tr key={g._id}><td style={{ fontWeight:600 }}>{g.name}</td><td style={{ color:'#737373',fontSize:12 }}>{g.groupId?.slice(0,20)}...</td><td>{g.memberCount||0}</td><td>{g.totalMessages||0}</td><td><span className={`badge ${g.isEnabled?'badge-green':'badge-red'}`}>{g.isEnabled?'Enabled':'Disabled'}</span></td><td><div style={{ display:'flex',gap:4 }}><button onClick={()=>toggleGroup(g._id,g.isEnabled)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}>{g.isEnabled?<ToggleRight size={18} style={{ color:'#10b981' }}/>:<ToggleLeft size={18} style={{ color:'#525252' }}/>}</button><button onClick={()=>deleteGroup(g._id)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}><Trash2 size={14} style={{ color:'#525252' }}/></button></div></td></tr>))}</tbody></table>
        )}
      </div>
    </div>
  );
}