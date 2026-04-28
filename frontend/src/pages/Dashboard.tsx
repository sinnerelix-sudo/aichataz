import { useEffect, useState } from 'react';
import { MessageSquare, Users, TrendingUp, CheckCircle2, Plus, X, Instagram, Activity } from 'lucide-react';
import { getBots, createBot, api } from '../lib/api';

export default function Dashboard() {
  const [bots, setBots] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', niche: '', prompt: '', knowledge_base: '' });

  const fetchData = async () => {
    try {
      const botsRes = await getBots();
      setBots(botsRes.data);
      // Fetch recent logs (we'll need a route for this)
      const logsRes = await api.get('/bots/logs');
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateBot = async (e: any) => {
    e.preventDefault();
    await createBot(formData);
    setIsModalOpen(false);
    setFormData({ name: '', niche: '', prompt: '', knowledge_base: '' });
    fetchData();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AIChatAz Panel 👋</h1>
          <p className="text-slate-500 mt-1">Süni intellekt operatorlarınızın mərkəzi.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus size={18} /> Yeni Bot
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cəmi Aktivlik', value: logs.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aktiv Botlar', value: bots.filter(b => b.is_active).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Instagram Bağlantısı', value: bots.some(b => b.ig_connected) ? 'Aktiv' : 'Yoxdur', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Sürət', value: '0.1s', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bots List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="font-bold text-lg text-slate-800">Sizin Botlar</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {bots.map((bot) => (
                <div key={bot._id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">{bot.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{bot.name}</p>
                    <p className="text-sm text-slate-500">{bot.niche}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {bot.ig_connected ? (
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase">Instagram Qoşuldu</span>
                    ) : (
                      <a href={`https://aichataz.onrender.com/api/auth/instagram/start?bot_id=${bot._id}`} className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold rounded-full uppercase hover:bg-pink-100 transition-colors">Bağla</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 font-bold text-lg">Son Aktivlik (Comments/Messages)</div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                {logs.length === 0 ? <p className="p-8 text-center text-slate-400 italic">Hələ ki aktivlik yoxdur.</p> : logs.map((log, idx) => (
                    <div key={idx} className="p-4 flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'comment' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {log.type === 'comment' ? 'C' : 'M'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">@{log.from}</p>
                            <p className="text-sm text-slate-600 mt-0.5">"{log.content}"</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Knowledge Base Info */}
        <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden h-fit">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4">Ağıllı Bilgi Bazası</h2>
            <p className="text-indigo-100 text-sm leading-relaxed opacity-80">Hər bot öz nişi üzrə mütəxəssis kimi cavab verir. Məlumatları istənilən vaxt yeniləyə bilərsiniz.</p>
            <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Sistem Statusu</div>
                <div className="text-sm font-medium">Gemini 2.0 Flash Aktiv ⚡</div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Yeni AI Bot</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBot} className="p-6 space-y-4">
              <input type="text" required placeholder="Bot Adı" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" required placeholder="Niş (Məs: Xonça satışı)" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
              <textarea required placeholder="AI Təlimatı" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24" value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
              <textarea required placeholder="Qiymətlər və Məhsullar" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24" value={formData.knowledge_base} onChange={e => setFormData({...formData, knowledge_base: e.target.value})} />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Yarat 🚀</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
