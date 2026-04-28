import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, X, Camera, Activity, AlertCircle, Loader2, RefreshCw, PartyPopper 
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

  const fetchData = useCallback(async (isSilent = false) => {
    const userId = localStorage.getItem('userId');
    if (!userId) { 
        window.location.href = '/login'; 
        return; 
    }

    if (!isSilent) setLoading(true); else setRefreshing(true);
    try {
      const [botsRes, logsRes] = await Promise.all([getBots(), getLogs()]);
      setBots(botsRes.data);
      setLogs(logsRes.data);
      setError(null);
    } catch (err: any) {
      setError("Məlumatlar yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('instagram') === 'connected') {
      setSuccessMsg("Instagram bağlandı! ✅");
      navigate('/dashboard', { replace: true });
      fetchData(true);
    } else if (params.get('instagram') === 'error') {
      setError("Bağlantı alınmadı. Yenidən cəhd edin.");
      navigate('/dashboard', { replace: true });
    } else if (params.get('registered') === 'true') {
      setSuccessMsg("Sisteminiz aktivləşdirildi! 🎉");
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate, fetchData]);

  const [formData, setFormData] = useState({ name: '', niche: '', prompt: '', knowledge_base: '' });

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error("Giriş edilməyib.");
      
      await createBot(formData);
      setIsModalOpen(false);
      setFormData({ name: '', niche: '', prompt: '', knowledge_base: '' });
      setSuccessMsg("Bot uğurla yaradıldı! 🚀");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 max-w-7xl mx-auto pt-24 lg:pt-10 min-h-screen relative">
      
      {/* Toast Layer - Higher index */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2147483647] w-full max-w-[min(90vw,500px)] pointer-events-none space-y-3">
        {successMsg && (
          <div className="pointer-events-auto bg-indigo-600 text-white px-6 py-4 rounded-[1.25rem] flex items-center justify-between gap-4 shadow-2xl">
            <p className="font-bold text-sm tracking-tight flex items-center gap-2"><PartyPopper size={18} /> {successMsg}</p>
            <button onClick={() => setSuccessMsg(null)}><X size={18} /></button>
          </div>
        )}
        {error && (
          <div className="pointer-events-auto bg-red-500 text-white px-6 py-4 rounded-[1.25rem] flex items-center justify-between gap-4 shadow-2xl">
            <p className="font-bold text-sm tracking-tight flex items-center gap-2"><AlertCircle size={18} /> {error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">İdarəetmə Paneli</h1>
          <p className="text-slate-400 mt-1 text-[10px] font-black uppercase tracking-widest">Sınaq Mərhələsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={refreshing} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"><RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 text-white rounded-[1rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Yeni Bot</button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Botlar', value: bots.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Bağlı' : 'Yoxdur', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'AI Sürət', value: '0.1s', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}> <stat.icon size={24} /> </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/20 text-center sm:text-left">Mövcud Botlar</div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? <p className="p-16 text-center text-slate-300 font-bold italic tracking-tight">Hələ ki bot yoxdur.</p> : bots.map((bot) => (
                <div key={bot._id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-8 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl flex-shrink-0">{bot.name[0]}</div>
                    <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xl truncate leading-none">{bot.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest italic">{bot.niche}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    {bot.ig_connected ? (
                        <div className="w-full px-5 py-2.5 bg-green-50 text-green-700 text-[10px] font-black rounded-xl border border-green-100 uppercase tracking-widest text-center shadow-sm">Instagram Qoşuldu ✅</div>
                    ) : (
                        <button onClick={() => { window.location.href = getInstagramAuthUrl(bot._id); }} className="w-full px-8 py-3.5 bg-slate-900 text-white text-[10px] font-black rounded-xl shadow-2xl hover:bg-black uppercase tracking-widest flex items-center justify-center gap-2"> <Camera size={18} /> Bağla</button>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full mx-auto sm:mx-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${bot.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{bot.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group cursor-default">
                <div className="relative z-10 space-y-8 text-center sm:text-left">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-white/10 mx-auto sm:mx-0 group-hover:bg-indigo-600 transition-all duration-500"><TrendingUp className="text-indigo-400 group-hover:text-white" /></div>
                    <h2 className="text-2xl font-black tracking-tighter leading-tight">Məhsul Bazası</h2>
                    <button className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Məhsul Əlavə Et</button>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl opacity-50 transition-opacity" />
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Yeni Bot</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-8 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Bot Adı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" required placeholder="Sahə" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 text-sm" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
              </div>
              <textarea required placeholder="Bot necə danışmalıdır? (Məs: Satış fokuslu, mehriban...)" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none font-bold text-slate-700 text-sm shadow-inner" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              <textarea required placeholder="Qiymətlər və məhsullar..." className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-bold text-slate-700 text-sm shadow-inner" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4 tracking-tighter uppercase tracking-widest"> {submitting ? <Loader2 className="animate-spin" /> : "Botu Aktivləşdir 🚀"} </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
