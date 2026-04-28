import { ArrowRight, Camera, MessageCircle, Zap, Shield, BarChart3, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-[#FDFCFB] text-slate-900 overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="font-black text-2xl tracking-tighter">AI Operator</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Xüsusiyyətlər</a>
          <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Tariflər</a>
          <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">FAQ</a>
        </div>
        <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-black transition-all">Giriş</Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
          <Zap size={14} fill="currentColor" /> 2026-cı ilin Satış İnqilabı
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-8 max-w-4xl mx-auto">
          AI satış operatorunu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">indi işə götür</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          AI Operator Instagram rəylərini və WhatsApp mesajlarını saniyələr içində cavablandırır, 
          satış kataloqunuzu bilir və sifarişləri avtomatik qəbul edir.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/pricing" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            AI Botu İşə Götür <ArrowRight size={20} />
          </Link>
          <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all">
            Demo İzlə
          </button>
        </div>
        
        {/* Mockup Card */}
        <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-4 lg:p-8 max-w-5xl mx-auto overflow-hidden">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 bg-slate-50 rounded-[2rem] p-6 text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-pink-500 rounded-full" />
                    <span className="font-black text-slate-800">@instagram_user</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium">Salam, qırmızı xonçanın qiyməti nədir?</div>
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 text-sm font-bold ml-4">
                      Salam! Qırmızı xonça hazırda endirimdədir - 45 AZN. Sifariş vermək istəyirsiniz? 😊
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8 flex flex-col justify-center text-left space-y-6">
                  <h3 className="text-3xl font-black text-slate-900">Müştərini saniyələr içində qazan</h3>
                  <p className="text-slate-500 font-medium">Gözləmək yoxdur. Səhv məlumat yoxdur. AI Operator 7/24 sizin yerinizə satış edir.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-2xl">
                      <p className="text-2xl font-black text-green-600">98%</p>
                      <p className="text-xs font-bold text-green-700 uppercase">Dəqiqlik</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-2xl">
                      <p className="text-2xl font-black text-indigo-600">0.2s</p>
                      <p className="text-xs font-bold text-indigo-700 uppercase">Sürət</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          <div className="absolute -z-10 top-20 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-indigo-100/30 to-transparent blur-[120px]" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-16">Niyə AI Operator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Camera, title: 'Instagram İnteqrasiyası', desc: 'DM və rəylərə saniyələr içində professional cavablar.' },
              { icon: MessageCircle, title: 'WhatsApp Operatoru', desc: 'Müştərilərinizə sevdikləri platformada xidmət göstərin.' },
              { icon: BarChart3, title: 'Sifariş İzləmə', desc: 'AI avtomatik sifarişləri tanıyır və bazaya qeyd edir.' },
              { icon: Shield, title: 'Güvənli və Gizli', desc: 'Bütün məlumatlar və tokenlər yüksək səviyyədə şifrlənir.' },
              { icon: Globe, title: 'Dil Dəstəyi', desc: 'Azərbaycan dilində mükəmməl və təbii danışıq qabiliyyəti.' },
              { icon: Zap, title: 'Gemini 2.0 Flash', desc: 'Dünyanın ən sürətli və ağıllı AI texnologiyası ilə təchiz olunub.' },
            ].map((f, i) => (
              <div key={i} className="text-left group cursor-default">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <h2 className="text-4xl font-black mb-8">Biznesini AI ilə böyütməyə hazırsan?</h2>
        <Link to="/pricing" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-slate-50 transition-all shadow-2xl">
          Tarifləri Gör <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">© 2026 AI Operator. Bütün hüquqlar qorunur.</p>
      </footer>
    </div>
  );
}
