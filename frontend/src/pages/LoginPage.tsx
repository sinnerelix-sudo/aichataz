import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || "Giriş zamanı xəta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Xoş gəldiniz</h1>
          <p className="text-slate-500 font-bold mt-2">Panelə daxil olmaq üçün məlumatları yazın.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" required placeholder="Email" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="password" required placeholder="Şifrə" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-70 mt-8">
            {loading ? <Loader2 className="animate-spin" /> : <>Daxil Ol <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center mt-8 font-bold text-sm text-slate-400">
          Hesabın yoxdur? <Link to="/pricing" className="text-indigo-600 hover:underline">Tariflərə bax</Link>
        </p>
      </div>
    </div>
  );
}
