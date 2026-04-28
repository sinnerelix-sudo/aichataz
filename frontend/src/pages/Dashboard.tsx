import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, Plus, X, Camera, Activity, AlertCircle, Loader2, RefreshCw, PartyPopper,
  LayoutDashboard, ShoppingBag, Settings, MessageSquare, Info, ChevronRight, HelpCircle
} from 'lucide-react';
import { getBots, createBot, getLogs, getInstagramAuthUrl, api } from '../lib/api';

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
    name: '', niche: '', prompt: '', knowledge_base: '',
    style: 'Professional', greeting: 'Salam, necə kömək edə bilərəm?',
    discount_rules: '', human_handoff: ''
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true); else setRefreshing(true);
    try {
      const [botsRes, logsRes] = await Promise.all([getBots(), getLogs()]);
      setBots(botsRes.data);
      setLogs(logsRes.data);
      setError(null);
    } catch (err) { setError("Məlumatları yeniləmək mümkün olmadı."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') { setSuccessMsg("Xoş gəldiniz! Hesabınız hazırdır. ✨"); navigate('/dashboard', { replace: true }); }
    else if (params.get('instagram') === 'connected') { setSuccessMsg("Instagram bağlandı! ✅"); navigate('/dashboard', { replace: true }); fetchData(true); }
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData, location.search, navigate]);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBot(formData);
      setIsModalOpen(false);
      setFormData({ name: '', niche: '', prompt: '', knowledge_base: '', style: 'Professional', greeting: '', discount_rules: '', human_handoff: '' });
      setSuccessMsg("Bot yaradıldı! 🚀");
      fetchData();
    } catch (err: any) { setError(err.response?.data?.error || "Bot yaradıla bilmədi."); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-10 max-w-7xl mx-auto pt-24 lg:pt-10 min-h-screen pb-32">
      
      {/* GLOBAL TOAST - Highest Z-Index */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] w-full max-w-md px-4 space-y-3 pointer-events-none">
        {successMsg && (
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between gap-4 animate-in slide-in-from-top-10 shadow-2xl pointer-events-auto ring-4 ring-indigo-500/20">
            <div className="flex items-center gap-3 font-bold text-sm"><PartyPopper size={20} /> {successMsg}</div>
            <button onClick={() => setSuccessMsg(null)}><X size={18} /></button>
          </div>
        )}
        {error && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-3xl flex items-center justify-between gap-4 animate-in slide-in-from-top-10 shadow-2xl pointer-events-auto ring-4 ring-red-500/20">
            <div className="flex items-center gap-3 font-bold text-sm"><AlertCircle size={20} /> {error}</div>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">İdarəetmə Paneli</h1>
          <p className="text-slate-400 mt-1 text-[10px] font-black uppercase tracking-[0.3em]">AI Operator Control</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => fetchData(true)} disabled={refreshing} className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all"><RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Yeni Bot</button>
        </div>
      </header>

      {/* Grid - 1/2/4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Cəmi Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Botlarınız', value: bots.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Aktiv' : 'Bağlı deyil', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Gözləyən', value: '0', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}> <stat.icon size={24} /> </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-50/30">Mövcud Botlar</div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? <p className="p-20 text-center text-slate-300 font-bold italic">Bot tapılmadı.</p> : bots.map((bot) => (
                <div key={bot._id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-8 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl">{bot.name[0]}</div>
                    <div>
                        <p className="font-black text-slate-900 text-xl">{bot.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">{bot.niche}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3">
                    {bot.ig_connected ? (
                        <span className="px-5 py-2 bg-green-50 text-green-600 text-[10px] font-black rounded-xl border border-green-100 uppercase tracking-tighter">Instagram Qoşuldu ✅</span>
                    ) : (
                        <button onClick={() => window.location.href = getInstagramAuthUrl(bot._id)} className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl shadow-lg hover:bg-black uppercase tracking-widest flex items-center gap-2"> <Camera size={14} /> Bağla</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-50/30 flex items-center gap-3"><Activity size={16} /> Son Aktivlik</div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {logs.length === 0 ? <p className="p-20 text-center text-slate-300 font-bold italic">Aktivlik yoxdur.</p> : logs.map((log, idx) => (
                    <div key={idx} className="p-6 flex gap-6 items-start hover:bg-slate-50/50">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black ${log.type === 'comment' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{log.type === 'comment' ? 'C' : 'M'}</div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-center"><p className="font-black text-slate-900">@{log.from}</p><span className="text-[10px] font-bold text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                            <p className="text-sm text-slate-600 font-medium italic opacity-80 leading-relaxed">"{log.content}"</p>
                            {log.reply && <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-700 font-bold leading-relaxed">🤖 {log.reply}</div>}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group cursor-default">
            <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-white/10"><TrendingUp className="text-indigo-400" /></div>
                <h2 className="text-2xl font-black tracking-tight leading-tight">AI Bilgi Bazası</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Botlarınızı məhsul və qiymət siyahınızla təchiz edin.</p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">Aktiv Beyin</div>
                    <div className="text-sm font-black flex items-center gap-2 tracking-tight">Gemini 2.0 Flash <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /></div>
                </div>
                <button className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Məlumatları Yenilə</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Dəstək Mərkəzi</h3>
             <button className="w-full py-4 border-2 border-slate-50 rounded-2xl font-black text-[10px] text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"> <HelpCircle size={16} /> Yardım Lazımdır?</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Yeni Bot</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3.5 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-8 sm:p-10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Botun Adı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" required placeholder="Niş / Sahə" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
              </div>
              <textarea required placeholder="AI Təlimatı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none font-bold text-sm" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              <textarea required placeholder="Məhsullar və Qiymətlər" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-bold text-sm" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"> {submitting ? <Loader2 className="animate-spin" /> : "Botu Aktivləşdir 🚀"} </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
