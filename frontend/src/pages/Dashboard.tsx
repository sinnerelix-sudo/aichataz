import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, Plus, X, Camera, Activity, AlertCircle, Loader2, RefreshCw, PartyPopper 
} from 'lucide-react';
import { getBots, createBot, getLogs, getInstagramAuthUrl } from '../lib/api';

export default function Dashboard() {
  const [bots, setBots] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', niche: '', prompt: '', knowledge_base: ''
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [botsRes, logsRes] = await Promise.all([
        getBots(),
        getLogs()
      ]);
      setBots(botsRes.data);
      setLogs(logsRes.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Məlumatlar yenilənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Polling logic
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.get('registered') === 'true') {
      setSuccessMsg("Qeydiyyat tamamlandı. Paneliniz hazırdır! 🥳");
      navigate('/dashboard', { replace: true });
    } else if (params.get('instagram') === 'connected') {
      setSuccessMsg("Instagram hesabı uğurla qoşuldu! ✅");
      navigate('/dashboard', { replace: true });
      fetchData(true);
    } else if (params.get('instagram') === 'error') {
      setError("Instagram bağlantısı alınmadı. Zəhmət olmasa yenidən cəhd edin.");
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate, fetchData]);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createBot(formData);
      setIsModalOpen(false);
      setFormData({ name: '', niche: '', prompt: '', knowledge_base: '' });
      setSuccessMsg("Yeni bot uğurla yaradıldı! 🚀");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Bot yaradılanda xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin absolute inset-0" />
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
          </div>
          <p className="text-slate-500 font-black animate-pulse text-xs uppercase tracking-[0.2em]">Sistem Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 max-w-7xl mx-auto pt-24 lg:pt-10 min-h-screen pb-20">
      
      {/* Toast Messages */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 space-y-3 pointer-events-none">
        {successMsg && (
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-10 duration-500 shadow-2xl pointer-events-auto ring-4 ring-indigo-600/10">
            <div className="flex items-center gap-3">
              <PartyPopper size={20} className="flex-shrink-0" />
              <p className="font-bold text-sm tracking-tight">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-10 duration-500 shadow-2xl pointer-events-auto ring-4 ring-red-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="font-black text-xs uppercase tracking-widest opacity-80 text-red-100">Xəta Baş Verdi</p>
                <p className="font-bold text-sm tracking-tight">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
          </div>
        )}
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-3">
            Panel <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">AI Operator Control Center</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing} 
            className="p-3.5 text-slate-500 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={4} /> Yeni Bot
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sizin Botlar', value: bots.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Bağlı' : 'Yoxdur', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Sürət', value: '0.1s', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Bots Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
                <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-800">Mövcud Botlar</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                    <p className="text-slate-300 font-bold italic text-lg tracking-tight">Hələ ki heç bir bot yaradılmayıb.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">İlk Botunu Yarat</button>
                </div>
              ) : bots.map((bot) => (
                <div key={bot._id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-indigo-50">
                      {bot.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xl tracking-tight leading-none">{bot.name}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-1 rounded-lg tracking-widest font-mono">{bot.niche}</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <div className={`w-1.5 h-1.5 rounded-full ${bot.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{bot.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center sm:justify-end gap-3 w-full sm:w-auto">
                    {bot.ig_connected ? (
                      <div className="flex-1 sm:flex-none px-6 py-2.5 bg-green-50 text-green-700 text-[10px] font-black rounded-xl uppercase tracking-widest ring-1 ring-green-100 text-center">Instagram Qoşuldu ✅</div>
                    ) : (
                      <button 
                        onClick={() => window.location.href = getInstagramAuthUrl(bot._id)} 
                        className="flex-1 sm:flex-none px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <Camera size={16} /> Instagram'ı Bağla
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex items-center gap-3">
               <Activity size={18} className="text-indigo-600" />
               <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-800">Son Aktivlik</h2>
            </div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {logs.length === 0 ? (
                    <p className="p-20 text-center text-slate-300 font-bold italic tracking-tight">Hələ ki heç bir rəy və ya mesaj qeydə alınmayıb.</p>
                ) : logs.map((log, idx) => (
                    <div key={idx} className="p-6 flex gap-6 items-start hover:bg-slate-50/50 transition-colors">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black shadow-sm ring-4 ${log.type === 'comment' ? 'bg-orange-50 text-orange-600 ring-orange-50/50' : 'bg-blue-50 text-blue-600 ring-blue-50/50'}`}>
                            {log.type === 'comment' ? 'C' : 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-black text-slate-900 tracking-tight">@{log.from}</p>
                              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic opacity-80 mt-1">"{log.content}"</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Knowledge Info Card */}
        <div className="space-y-8">
          <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-indigo-600 transition-colors duration-500">
                <TrendingUp className="text-indigo-400 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-black mb-4 tracking-tighter leading-tight">Ağıllı Bilgi Bazası</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                Botlarınızı məhsul və qiymət siyahınızla tam təchiz edin ki, müştərilərə dəqiq cavab versin.
              </p>
              <div className="space-y-3 mb-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">Aktiv Beyin</div>
                    <div className="text-base font-black flex items-center gap-2">Gemini 2.0 Flash <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /></div>
                </div>
              </div>
              <button className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 border border-indigo-400/20">Məlumatları Yenilə</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4">Texniki Dəstək</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Hər hansı bir sualınız və ya texniki çətinliyiniz var?</p>
            <button className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-indigo-100 group-hover:text-indigo-600">
              Yardım Mərkəzi
            </button>
          </div>
        </div>
      </div>

      {/* Re-designed Create Bot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Yeni Bot</h2>
                <p className="text-slate-500 text-sm font-bold mt-1">Süni intellektinizi təlimatlandırın.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-8 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Botun Adı</label>
                    <input type="text" required placeholder="Məs: Satış Botu" className="w-full p-4.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sahə / Niş</label>
                    <input type="text" required placeholder="Məs: Xonça" className="w-full p-4.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">AI Davranış Qaydası (Prompt)</label>
                <textarea required placeholder="AI necə danışmalıdır? (Məs: Mehriban, qısa və satış fokuslu...)" className="w-full p-4.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-bold text-slate-700 text-sm" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Məhsul və Qiymət Siyahısı</label>
                <textarea required placeholder="Məhsul adlarını və qiymətlərini yazın..." className="w-full p-4.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-40 resize-none font-bold text-slate-700 text-sm" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              </div>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Botu Aktivləşdir 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
