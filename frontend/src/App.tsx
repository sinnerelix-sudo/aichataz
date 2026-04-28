import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/layout/Sidebar';
import { useEffect, useState, type ReactNode } from 'react';
import { api } from './lib/api';
import { Loader2 } from 'lucide-react';

const PAYMENT_ENABLED = false;

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; user: any | null; sub: any | null }>({ 
    loading: true, user: null, sub: null 
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState({ loading: false, user: null, sub: null });
      return;
    }
    
    api.get('/auth/me')
      .then(res => {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.subscription) {
            localStorage.setItem('subscription', JSON.stringify(res.data.subscription));
        }
        setState({ loading: false, user: res.data.user, sub: res.data.subscription });
      })
      .catch(() => {
        localStorage.clear();
        setState({ loading: false, user: null, sub: null });
      });
  }, []);

  if (state.loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Yoxlanılır...</p>
      </div>
    );
  }

  if (!state.user) return <Navigate to="/login" replace />;
  
  if (PAYMENT_ENABLED) {
      const isPaid = state.sub && state.sub.status === 'active' && state.sub.paymentStatus === 'paid';
      if (!isPaid) return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><div className="p-10 font-bold text-slate-400 uppercase tracking-widest text-xs">Tezliklə...</div></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><div className="p-10 font-bold text-slate-400 uppercase tracking-widest text-xs">Tezliklə...</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div className="p-10 font-bold text-slate-400 uppercase tracking-widest text-xs">Tezliklə...</div></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
