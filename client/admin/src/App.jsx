import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import VIPMembers from './pages/VIPMembers';
import Payments from './pages/Payments';
import Predictions from './pages/Predictions';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (<AuthProvider><Toaster position="top-right" toastOptions={{style:{background:'#1a1a1a',color:'#f5f5f5',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'12px 16px',fontSize:'13px'}}}/><Routes><Route path="/login" element={<Login/>}/><Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="dashboard" element={<Dashboard/>}/><Route path="users" element={<Users/>}/><Route path="vip" element={<VIPMembers/>}/><Route path="payments" element={<Payments/>}/><Route path="predictions" element={<Predictions/>}/><Route path="groups" element={<Groups/>}/><Route path="notifications" element={<Notifications/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<Settings/>}/></Route></Routes></AuthProvider>);
}
export default App;
