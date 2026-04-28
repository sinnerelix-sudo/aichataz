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

class AppErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error("🛑 [APP CRASH]:", error, info); }
  render() {
    if (this.state.hasError) return (
      <div className="h-screen w-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900">Xəta baş verdi</h2>
            <p className="text-slate-500 font-bold leading-relaxed">Səhifə yüklənərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                <RefreshCw size={20} /> Səhifəni yenilə
            </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; user: any | null }>({ loading: true, user: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setState({ loading: false, user: null }); return; }
    
    api.get('/auth/me').then(res => {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.subscription) localStorage.setItem('subscription', JSON.stringify(res.data.subscription));
        setState({ loading: false, user: res.data.user });
    }).catch(() => {
        localStorage.clear();
        setState({ loading: false, user: null });
    });
  }, []);

  if (state.loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Yoxlanılır...</p>
    </div>
  );

  if (!state.user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative"> {children} </main>
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
