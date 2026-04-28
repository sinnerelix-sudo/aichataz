import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ msg: string; code?: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) {
        setError({ msg: "Zəhmət olmasa əvvəlcə tarif seçin." });
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { ...formData, plan });
      
      const { token, user, redirectTo } = res.data;
      
      // SAVE TO STORAGE
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      
      // MVP: Redirect directly to dashboard
      navigate(redirectTo || '/dashboard?registered=true');
      
    } catch (err: any) {
      const data = err.response?.data;
      setError({ 
        msg: data?.error || "Qeydiyyat zamanı xəta baş verdi.", 
        code: data?.code 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Hesabını yarat
            </h1>
            <p className="text-slate-500 font-bold mt-2 italic text-sm">
                Seçilmiş tarif: <span className="text-indigo-600 uppercase tracking-widest">{plan || 'SEÇİLMƏYİB'}</span>
            </p>
        </div>

        {error && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${error.code === 'EMAIL_EXISTS' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                <div className="flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error.msg}</p>
                </div>
                {error.code === 'EMAIL_EXISTS' && (
                    <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all whitespace-nowrap">
                        <LogIn size={14} /> Giriş Et
                    </Link>
                )}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required placeholder="Ad" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold shadow-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required placeholder="Soyad" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold shadow-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
            </div>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required placeholder="Email" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="tel" required placeholder="Mobil nömrə (WhatsApp)" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold shadow-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required placeholder="Şifrə" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-70 mt-8">
                {loading ? <><Loader2 className="animate-spin" /> Qeydiyyat yaradılır...</> : <>Davam Et <ArrowRight size={20} /></>}
            </button>
        </form>

        <p className="text-center mt-8 font-bold text-sm text-slate-400">
            Artıq hesabın var? <Link to="/login" className="text-indigo-600 hover:underline">Daxil ol</Link>
        </p>
      </div>
    </div>
  );
}
