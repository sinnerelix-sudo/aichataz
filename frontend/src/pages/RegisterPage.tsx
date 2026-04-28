import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || '';

  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: ''
  });
  const [otp, setOtp] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) {
        setError("Zəhmət olmasa əvvəlcə tarif seçin.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { 
          ...formData, 
          plan: plan 
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      setStep(2); 
    } catch (err: any) {
      const msg = err.response?.data?.error || "Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    // Mock OTP Verification
    setTimeout(() => {
        setLoading(false);
        navigate(`/payment?plan=${plan}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {step === 1 ? 'Hesabını yarat' : 'Nömrəni təsdiqlə'}
            </h1>
            <p className="text-slate-500 font-bold mt-2 italic text-sm">
                Seçilmiş tarif: <span className="text-indigo-600 uppercase tracking-widest">{plan || 'SEÇİLMƏYİB'}</span>
            </p>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
            </div>
        )}

        {step === 1 && (
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
                    {loading ? <Loader2 className="animate-spin" /> : <>Qeydiyyatı Tamamla <ArrowRight size={20} /></>}
                </button>
            </form>
        )}

        {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="bg-indigo-50 p-8 rounded-[2.5rem] text-center space-y-2 border border-indigo-100 shadow-inner">
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">WhatsApp nömrənizə kod göndərildi:</p>
                    <p className="font-black text-indigo-600 text-2xl tracking-tighter">{formData.phone}</p>
                </div>
                <input 
                    type="text" maxLength={6} placeholder="000000"
                    className="w-full p-8 text-center text-4xl font-black tracking-[1.5rem] rounded-[2rem] bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all shadow-sm"
                    value={otp} onChange={e => setOtp(e.target.value)}
                />
                <button 
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Təsdiqlə və Ödənişə Keç"}
                </button>
                <p className="text-center text-xs font-bold text-slate-400 italic">Test rejimi: İstənilən 6 rəqəmi yaza bilərsiniz.</p>
            </div>
        )}
      </div>
    </div>
  );
}
