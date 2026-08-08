import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-primary)',color:'var(--text-muted)' }}><div style={{ textAlign:'center' }}><div style={{ width:48,height:48,border:'3px solid transparent',borderTopColor:'#10b981',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>Chajman...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
