import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Crown, CreditCard, BrainCircuit, Users2, Bell, BarChart3, Settings, LogOut, Menu, X, Zap } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/vip', icon: Crown, label: 'VIP Members' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/predictions', icon: BrainCircuit, label: 'Predictions' },
  { to: '/groups', icon: Users2, label: 'Groups' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) { navigate('/login'); return null; }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}
      <aside style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : -280, width: 280, height: '100vh', zIndex: 50, background: '#0a0a0a', borderRight: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', transition: 'left 0.3s ease' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚽</div>
            <div><div style={{ fontWeight: 700, fontSize: 16 }} className="gradient-text">Victory Predict</div><div style={{ fontSize: 11, color: '#737373' }}>Admin Panel</div></div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, marginBottom: 4, textDecoration: 'none', color: isActive ? '#10b981' : '#a3a3a3', background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent', fontWeight: isActive ? 600 : 400, transition: 'all 0.2s', fontSize: 14 })}><Icon size={18} />{label}</NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{(user?.name || 'A')[0]}</div>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'Admin'}</div><span className="badge badge-gold">Admin 👑</span></div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: 8 }}><LogOut size={18} /></button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: 0, padding: '24px', minHeight: '100vh', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(26,26,26,0.8)', border: '1px solid #2a2a2a', borderRadius: 10, padding: 10, color: '#f5f5f5', cursor: 'pointer' }}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} style={{ color: '#10b981' }} /><span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>System Active</span></div>
        </div>
        <Outlet />
      </main>
      <style>{`@media (min-width: 1024px) { aside { left: 0 !important; } main { margin-left: 280px !important; } main > div:first-child { display: none; } }`}</style>
    </div>
  );
}