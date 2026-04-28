import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', formData);
      const data = res.data;
      if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.subscription) localStorage.setItem('subscription', JSON.stringify(data.subscription));
          window.location.href = data.redirectTo || "/dashboard";
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Giriş zamanı xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white p-10 sm:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
            <Sparkles size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Xoş gəldiniz</h1>
          <p className="text-slate-400 font-bold mt-3 uppercase tracking-widest text-[10px]">AI Operator Giriş</p>
        </div>

        {error && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 relative z-10">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="email" required placeholder="Email" className="w-full pl-14 pr-4 py-4.5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-800 transition-all shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="password" required placeholder="Şifrə" className="w-full pl-14 pr-4 py-4.5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-800 transition-all shadow-inner" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all disabled:opacity-70 mt-10 uppercase tracking-widest">
            {loading ? <><Loader2 className="animate-spin" /> Giriş Edilir...</> : <>Daxil Ol <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center mt-12 font-bold text-xs text-slate-400 relative z-10">
          Hesabın yoxdur? <Link to="/pricing" className="text-indigo-600 hover:underline ml-1 font-black">Tariflərə bax</Link>
        </p>

        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl translate-y-16 -translate-x-16" />
      </div>
    </div>
  );
}
