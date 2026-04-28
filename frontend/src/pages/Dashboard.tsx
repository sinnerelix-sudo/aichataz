import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, TrendingUp, CheckCircle2, 
  Plus, X, Camera, Activity, AlertCircle, Loader2, RefreshCw 
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
    name: '',
    niche: '',
    prompt: '',
    knowledge_base: ''
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const [botsRes, logsRes] = await Promise.all([
        getBots(),
        getLogs()
      ]);
      setBots(botsRes.data);
      setLogs(logsRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Məlumatlar yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Check for URL parameters after Instagram redirect
    const params = new URLSearchParams(location.search);
    if (params.get('instagram') === 'connected') {
      setSuccessMsg("Instagram hesabı uğurla bağlandı! ✅");
      // Clean up URL
      navigate('/', { replace: true });
      fetchData(true);
    } else if (params.get('instagram') === 'error') {
      setError("Instagram'ı bağlamaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.");
      navigate('/', { replace: true });
    }

    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData, location.search, navigate]);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBot(formData);
      setIsModalOpen(false);
      setFormData({ name: '', niche: '', prompt: '', knowledge_base: '' });
      fetchData();
    } catch (err: any) {
      alert("Bot yaradılanda xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  };

  const connectInstagram = (botId: string) => {
    const authUrl = getInstagramAuthUrl(botId);
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Sistem Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto pt-20 lg:pt-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)}><X size={18} /></button>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AIChatAz Panel 👋</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base font-bold opacity-70">Süni intellekt operatorlarınızın mərkəzi.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="p-3 text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={22} strokeWidth={3} /> Yeni Bot
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Botlar', value: bots.filter(b => b.is_active).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Bağlı' : 'Yoxdur', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Sürət', value: '0.1s', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center font-black text-slate-800">Sizin Botlar</div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? (
                <div className="p-16 text-center text-slate-400 italic font-bold">Hələ ki heç bir bot yaradılmayıb.</div>
              ) : bots.map((bot) => (
                <div key={bot._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {bot.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-tight">{bot.name}</p>
                      <p className="text-sm text-slate-400 font-bold italic mt-0.5">{bot.niche}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    {bot.ig_connected ? (
                      <span className="px-5 py-2 bg-green-50 text-green-600 text-[11px] font-black rounded-full uppercase tracking-tighter ring-1 ring-green-100">Instagram Qoşuldu ✅</span>
                    ) : (
                      <button 
                        onClick={() => connectInstagram(bot._id)} 
                        className="px-6 py-2.5 bg-pink-600 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-100 hover:bg-pink-700 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Camera size={14} /> Instagram'ı Bağla
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${bot.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{bot.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 font-black text-slate-800">Son Aktivlik</div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {logs.length === 0 ? <p className="p-16 text-center text-slate-400 italic font-bold">Aktivlik yoxdur.</p> : logs.map((log, idx) => (
                    <div key={idx} className="p-6 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black ${log.type === 'comment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {log.type === 'comment' ? 'C' : 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-black text-slate-900">@{log.from}</p>
                              <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">"{log.content}"</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-950 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-4">Ağıllı Bilgi Bazası</h2>
              <p className="text-indigo-200/70 text-sm font-bold leading-relaxed">Botunuzu məhsul və qiymətlərinizlə tam təchiz edin.</p>
              <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">Model</div>
                  <div className="text-base font-black flex items-center gap-2">Gemini 2.0 Flash <TrendingUp size={16} className="text-green-400" /></div>
              </div>
              <button className="w-full mt-8 py-4 bg-white text-indigo-950 rounded-2xl font-black hover:bg-indigo-50 active:scale-95 transition-all shadow-2xl">Yenilə</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yeni Bot</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Botun Adı" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" required placeholder="Niş / Sahə" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
              </div>
              <textarea required placeholder="AI Təlimatı (Personality)" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none font-bold" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              <textarea required placeholder="Qiymətlər və Məhsullar" className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-bold" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                {submitting ? <Loader2 className="animate-spin" /> : "Botu Aktivləşdir 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
