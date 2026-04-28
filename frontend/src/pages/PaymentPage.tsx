import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
        // Mock Payment Verification
        const userId = localStorage.getItem('userId');
        await api.post('/payment/verify', { 
            sub_id: 'mock_id', // In real app, get from URL or state
            userId: userId,
            planId: plan 
        });
        
        // Mock delay
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        }, 2000);
    } catch (e) {
        alert("Ödənişdə xəta baş verdi.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white text-center">
            <h1 className="text-2xl font-black">Ödənişi Tamamla</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Təhlükəsiz Ödəniş Sistemi</p>
        </div>
        
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Tarif</p>
                    <p className="font-black text-slate-800 text-lg uppercase">{plan?.replace('_pkg', '')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase">Məbləğ</p>
                    <p className="font-black text-indigo-600 text-2xl tracking-tighter">
                        {plan === 'combo_pkg' ? '39.90' : plan === 'multi_pkg' ? '99.90' : '29.90'} ₼
                    </p>
                </div>
            </div>

            {!success ? (
                <>
                <div className="space-y-4">
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Kart Nömrəsi" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="AA/İİ" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none font-bold" />
                        <input type="text" placeholder="CVV" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none font-bold" />
                    </div>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Ödəniş Et <ShieldCheck size={20} /></>}
                </button>
                </>
            ) : (
                <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Uğurlu Ödəniş!</h2>
                    <p className="text-slate-500 font-bold">Paneliniz hazırlanır...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
