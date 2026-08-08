import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Crown, CreditCard, Target, MessageSquare, Bell, BarChart3, Settings, LogOut, Menu, Zap } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Utilisateurs' },
  { path: '/vip', icon: Crown, label: 'VIP' },
  { path: '/payments', icon: CreditCard, label: 'Paiements' },
  { path: '/predictions', icon: Target, label: 'Prediksyon' },
  { path: '/groups', icon: MessageSquare, label: 'Gwoup' },
  { path: '/notifications', icon: Bell, label: 'Notifikasyon' },
  { path: '/analytics', icon: BarChart3, label: 'Analytik' },
  { path: '/settings', icon: Settings, label: 'Paramet' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} />}
      <aside style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-280px', width: 260, height: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'left 0.3s ease' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>🏆</div>
          <div><div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Victory Predict</div><div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={10} color="#10b981" /> Admin Panel</div></div>
        </div>
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, marginBottom: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500, color: isActive ? '#fff' : 'var(--text-secondary)', background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent', border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent', transition: 'all 0.2s' })}><Icon size={18} />{label}{path === '/vip' && <span className="badge badge-gold" style={{ marginLeft: 'auto', fontSize: 10 }}>VIP</span>}</NavLink>))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>{user?.name?.[0] || 'K'}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'KING DEV'}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</div></div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, borderRadius: 8 }}><LogOut size={18} /></button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}><Menu size={20} /></button>
            <div><h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}><span className="gradient-text">Victory Predict</span></h1><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>🇭🇹 Admin Dashboard</p></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} /><span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Online</span></div>
        </header>
        <div style={{ padding: '24px' }}><Outlet /></div>
      </main>
    </div>
  );
}
