import { useEffect, useState, useCallback } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
      setError("Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBot(formData);
      setIsModalOpen(false);
      setFormData({ name: '', niche: '', prompt: '', knowledge_base: '' });
      fetchData();
    } catch (err: any) {
      alert("Bot yaradılanda xəta baş verdi: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] lg:h-screen">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto pt-20 lg:pt-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AIChatAz Panel 👋</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Süni intellekt operatorlarınızın mərkəzi.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            title="Yenilə"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            <Plus size={20} strokeWidth={3} /> Yeni Bot
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Cəmi Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktiv Botlar', value: bots.filter(b => b.is_active).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram', value: bots.some(b => b.ig_connected) ? 'Bağlı' : 'Yoxdur', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'AI Model', value: 'Gemini 2.0', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Bots List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">Sizin Botlar</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {bots.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic font-medium">Hələ ki heç bir bot yaradılmayıb.</div>
              ) : bots.map((bot) => (
                <div key={bot._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-inner flex-shrink-0">
                      {bot.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate text-lg leading-tight">{bot.name}</p>
                      <p className="text-sm text-slate-500 font-medium truncate italic">{bot.niche}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    {bot.ig_connected ? (
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[11px] font-black rounded-full uppercase tracking-tight">Instagram Qoşuldu ✅</span>
                    ) : (
                      <a 
                        href={getInstagramAuthUrl(bot._id)} 
                        className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-100 hover:bg-pink-700 active:scale-[0.95] transition-all flex items-center gap-2"
                      >
                         <Camera size={14} /> Instagram'ı Bağla
                      </a>
                    )}
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${bot.is_active ? 'text-green-500' : 'text-slate-300'}`}>
                      <span className={`w-2 h-2 rounded-full ${bot.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                      {bot.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 font-bold text-lg text-slate-800 flex items-center gap-2">
               <Activity size={20} className="text-indigo-600" /> Son Aktivlik
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic font-medium">Hələ ki heç bir aktivlik (mesaj/rəy) qeydə alınmayıb.</div>
                ) : logs.map((log, idx) => (
                    <div key={idx} className="p-4 sm:p-5 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${log.type === 'comment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {log.type === 'comment' ? 'C' : 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-black text-slate-900 truncate truncate">@{log.from}</p>
                              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">"{log.content}"</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                <TrendingUp className="text-indigo-300" />
              </div>
              <h2 className="text-2xl font-black mb-4 leading-tight">Ağıllı Bilgi Bazası</h2>
              <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">
                Botlarınız hər müştəriyə bir mütəxəssis kimi cavab verir. Məlumatları istənilən vaxt yeniləyə bilərsiniz.
              </p>
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] uppercase font-black text-indigo-400">Sistem Statusu</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  </div>
                  <div className="text-sm font-bold">Gemini 2.0 Flash Aktiv ⚡</div>
              </div>
              <button className="w-full mt-8 py-3.5 bg-white text-indigo-950 rounded-2xl font-black hover:bg-indigo-50 active:scale-[0.97] transition-all shadow-xl">
                Məlumatları Yenilə
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4">Dəstək</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Hər hansı bir çətinlik çəkirsiniz? Bizə bildirin.</p>
            <button className="w-full py-3 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Yardım Mərkəzi
            </button>
          </div>
        </div>
      </div>

      {/* Modern Bot Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 fade-in duration-300 overflow-hidden my-auto">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Yeni AI Bot</h2>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Xidmət sahənizi və qaydaları təyin edin.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateBot} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Botun Adı</label>
                  <input 
                    type="text" required placeholder="Məs: Xonça Bot" 
                    className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Niş / Sahə</label>
                  <input 
                    type="text" required placeholder="Məs: Xonça satışı" 
                    className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" 
                    value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">AI Təlimatı (Personality)</label>
                <textarea 
                  required placeholder="Məs: Sən xonça satışı üzrə 10 illik təcrübəli, mehriban satıcısan..." 
                  className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none font-medium text-slate-700" 
                  value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Məhsul və Qiymət Siyahısı</label>
                <textarea 
                  required placeholder="Məs: Qırmızı xonça - 50 AZN, Gəlin xonçası - 120 AZN..." 
                  className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all h-32 resize-none font-medium text-slate-700" 
                  value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} 
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Botu İndi Aktivləşdir 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
