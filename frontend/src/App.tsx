import React, { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/layout/Sidebar';
import { api } from './lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

class AppErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="h-screen w-screen flex items-center justify-center bg-white p-10 text-center">
        <div className="max-w-md space-y-6">
            <AlertCircle size={60} className="text-red-500 mx-auto" />
            <h1 className="text-3xl font-black">Xəta baş verdi</h1>
            <p className="text-slate-500 font-bold">Səhifəni yeniləyərək yenidən cəhd edin.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"> <RefreshCw size={20} /> Yenilə</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    
    api.get('/auth/me').then(res => {
        setUser(res.data.user);
        if (res.data.user) localStorage.setItem('userId', res.data.user._id || res.data.user.id);
        setLoading(false);
    }).catch(() => {
        localStorage.clear();
        setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Giriş yoxlanılır...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto"> {children} </main>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}
