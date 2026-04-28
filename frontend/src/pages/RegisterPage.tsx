import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || 'instagram_pkg';

  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', surname: '', email: '', password: '', phone: ''
  });
  const [otp, setOtp] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { ...formData, selectedPlan: plan });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      setStep(2); // Move to OTP
    } catch (err: any) {
      alert(err.response?.data?.error || "Qeydiyyat zamanı xəta.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    // Mock OTP Verification
    setTimeout(() => {
        setLoading(false);
        navigate(`/payment?sub_id=mock_sub_${Math.random()}&plan=${plan}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {step === 1 ? 'Hesabını yarat' : 'Nömrəni təsdiqlə'}
            </h1>
            <p className="text-slate-500 font-bold mt-2 italic text-sm">
                Seçilmiş tarif: <span className="text-indigo-600 uppercase tracking-widest">{plan.replace('_pkg', '')}</span>
            </p>
        </div>

        {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" required placeholder="Ad" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" required placeholder="Soyad" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
                    </div>
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" required placeholder="Email" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="tel" required placeholder="Mobil nömrə (WhatsApp)" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" required placeholder="Şifrə" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-70 mt-8">
                    {loading ? <Loader2 className="animate-spin" /> : <>Davam Et <ArrowRight size={20} /></>}
                </button>
            </form>
        )}

        {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="bg-indigo-50 p-6 rounded-[2rem] text-center space-y-2">
                    <p className="font-bold text-slate-700">WhatsApp nömrənizə kod göndərildi:</p>
                    <p className="font-black text-indigo-600 text-xl tracking-widest">{formData.phone}</p>
                </div>
                <input 
                    type="text" maxLength={6} placeholder="6 rəqəmli kod"
                    className="w-full p-6 text-center text-3xl font-black tracking-[1rem] rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={otp} onChange={e => setOtp(e.target.value)}
                />
                <button 
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Təsdiqlə və Davam Et"}
                </button>
                <p className="text-center text-sm font-bold text-slate-400 italic">Test rejimi: İstənilən 6 rəqəmi yaza bilərsiniz.</p>
            </div>
        )}
      </div>
    </div>
  );
}
