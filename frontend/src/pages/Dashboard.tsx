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

  const [formData, setFormData] = useState({ name: '', niche: '', prompt: '', knowledge_base: '' });

  const fetchData = useCallback(async (isSilent = false) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    if (!isSilent) setLoading(true); else setRefreshing(true);
    try {
      const [botsRes, logsRes] = await Promise.all([getBots(), getLogs()]);
      setBots(botsRes.data);
      setLogs(logsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Məlumatlar yenilənmədi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMsg("Qeydiyyat uğurlu! Sınaq mərhələsi aktivdir. 🥳");
      navigate('/dashboard', { replace: true });
    } else if (params.get('instagram') === 'connected') {
      setSuccessMsg("Instagram hesabı bağlandı! ✅");
      navigate('/dashboard', { replace: true });
      fetchData(true);
    } else if (params.get('instagram') === 'error') {
      setError("Instagram bağlantısı xətası.");
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
      setSuccessMsg("Bot yaradıldı! 🚀");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 max-w-7xl mx-auto pt-24 lg:pt-10 min-h-screen relative">
      
      {/* GLOBAL TOAST LAYER - Highest possible z-index */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2147483647] w-full max-w-[min(90vw,500px)] pointer-events-none space-y-3">
        {successMsg && (
          <div className="pointer-events-auto bg-indigo-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-10">
            <p className="font-bold text-sm flex items-center gap-2"><PartyPopper size={18} /> {successMsg}</p>
            <button onClick={() => setSuccessMsg(null)}><X size={18} /></button>
          </div>
        )}
        {error && (
          <div className="pointer-events-auto bg-red-500 text-white px-6 py-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-10">
            <p className="font-bold text-sm flex items-center gap-2"><AlertCircle size={18} /> {error}</p>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">İdarəetmə Paneli</h1>
          <p className="text-slate-400 mt-1 text-[10px] font-black uppercase tracking-widest">Trial Mode Active</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={refreshing} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"><RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 text-white rounded-[1rem] font-black text-xs uppercase tracking-widest shadow-xl">Yeni Bot</button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Botlar', value: bots.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Aktiv' : 'Yoxdur', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Sürət', value: '0.1s', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}> <stat.icon size={24} /> </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/30">Mövcud Botlar</div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? <p className="p-16 text-center text-slate-300 font-bold italic">Bot tapılmadı.</p> : bots.map((bot) => (
                <div key={bot._id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-8 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl">{bot.name[0]}</div>
                    <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xl truncate">{bot.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest italic">{bot.niche}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    {bot.ig_connected ? (
                        <div className="w-full px-5 py-2.5 bg-green-50 text-green-700 text-[10px] font-black rounded-xl border border-green-100 uppercase tracking-widest text-center shadow-sm">Instagram Qoşuldu ✅</div>
                    ) : (
                        <button onClick={() => window.location.href = getInstagramAuthUrl(bot._id)} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl shadow-2xl hover:bg-black uppercase tracking-widest flex items-center justify-center gap-2"> <Camera size={18} /> Instagramı Bağla</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/30 flex items-center gap-3"><Activity size={16} /> Son Aktivlik</div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {logs.length === 0 ? <p className="p-20 text-center text-slate-300 font-bold italic">Aktivlik yoxdur.</p> : logs.map((log, idx) => (
                    <div key={idx} className="p-6 flex gap-6 items-start hover:bg-slate-50/50">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black shadow-sm ring-4 ${log.type === 'comment' ? 'bg-orange-50 text-orange-600 ring-orange-50/50' : 'bg-blue-50 text-blue-600 ring-blue-50/50'}`}>{log.type === 'comment' ? 'C' : 'M'}</div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-center"><p className="font-black text-slate-900">@{log.from}</p><span className="text-[10px] font-bold text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                            <p className="text-sm text-slate-600 font-medium italic opacity-80 leading-relaxed">"{log.content}"</p>
                            {log.reply && <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-700 font-bold leading-relaxed shadow-inner">🤖 {log.reply}</div>}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group cursor-default">
                <div className="relative z-10 space-y-8">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-all duration-500"><TrendingUp className="text-indigo-400 group-hover:text-white" /></div>
                    <h2 className="text-2xl font-black tracking-tighter leading-tight">Məhsul Bazası</h2>
                    <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Məhsul Əlavə Et</button>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl opacity-50 transition-opacity" />
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto overflow-hidden border border-slate-100">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Yeni Bot</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3.5 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-8 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Bot Adı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" required placeholder="Sahə" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 text-sm" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
              </div>
              <textarea required placeholder="AI Təlimatı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none font-bold text-slate-700 text-sm shadow-inner" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              <textarea required placeholder="Məhsullar və Qiymətlər" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-bold text-slate-700 text-sm shadow-inner" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4 tracking-tighter uppercase tracking-widest"> {submitting ? <Loader2 className="animate-spin" /> : "Botu Aktivləşdir 🚀"} </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
