import { CheckCircle2, Zap, ArrowRight, Camera, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 'instagram_pkg',
    name: 'Instagram Paketi',
    price: '29.90',
    icon: Camera,
    color: 'bg-pink-600',
    features: ['1 AI Bot', '1 Instagram Hesabı', 'DM & Rəylərə Cavab', '50 Məhsul Limiti', 'Sifariş Paneli'],
    popular: false
  },
  {
    id: 'whatsapp_pkg',
    name: 'WhatsApp Paketi',
    price: '29.90',
    icon: MessageCircle,
    color: 'bg-green-600',
    features: ['1 AI Bot', '1 WhatsApp Nömrəsi', 'Mesajlara Cavab', '50 Məhsul Limiti', 'Sifariş Paneli'],
    popular: false
  },
  {
    id: 'combo_pkg',
    name: 'Instagram + WhatsApp',
    price: '39.90',
    icon: Zap,
    color: 'bg-indigo-600',
    features: ['1 AI Bot (Hər iki kanal)', 'Instagram & WhatsApp', 'Birləşmiş Panel', '100 Məhsul Limiti', 'Lead Skorlama'],
    popular: true
  },
  {
    id: 'multi_pkg',
    name: 'Multi-Panel Paket',
    price: '99.90',
    icon: CheckCircle2,
    color: 'bg-slate-900',
    features: ['5 AI Bot', '5 Fərqli Hesab/Səhifə', 'Ayrı-ayrı Satış Panelləri', 'Limitsiz Məhsul', 'VIP Dəstək'],
    popular: false
  }
];

export default function PricingPage() {
  const navigate = useNavigate();

  const handleSelect = (planId: string) => {
    navigate(`/register?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">Sizin üçün ən uyğun <span className="text-indigo-600">tarif</span></h1>
          <p className="text-xl text-slate-500 font-medium">Bütün paketlərə professional AI dəstəyi daxildir.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-2xl flex flex-col ${plan.popular ? 'ring-4 ring-indigo-100 border-indigo-200 lg:-translate-y-4' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  Ən Çox Seçilən
                </div>
              )}
              
              <div className={`w-14 h-14 ${plan.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <plan.icon size={28} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-lg font-bold text-slate-400">₼ / ay</span>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm font-bold text-slate-600 leading-tight">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSelect(plan.id)}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                İndi Başla <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
