import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { api } from './lib/api';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<{ loading: boolean; user: any | null }>({ loading: true, user: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuth({ loading: false, user: null });
      return;
    }
    
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAuth({ loading: false, user: res.data }))
      .catch(() => setAuth({ loading: false, user: null }));
  }, []);

  if (auth.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!auth.user) return <Navigate to="/login" replace />;
  
  // Basic Subscription/Payment Guard
  if (!auth.user.subscription || auth.user.subscription.status !== 'active') {
      return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
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
        
        {/* Dashboard and its sub-pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><div>Chats Page (Tezliklə)</div></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><div>Orders Page (Tezliklə)</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div>Settings Page (Tezliklə)</div></ProtectedRoute>} />
        
        {/* Wildcard redirect to dashboard or landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
