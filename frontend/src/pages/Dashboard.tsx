import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, TrendingUp, CheckCircle2, Plus } from 'lucide-react';
import { getBots } from '../lib/api';

export default function Dashboard() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBots().then(res => {
      setBots(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Xoş gəldiniz! 👋</h1>
          <p className="text-slate-500 mt-1">Botunuzun fəaliyyətini burdan izləyə bilərsiniz.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Yeni Bot Yarat
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cəmi Mesajlar', value: '1,284', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Yeni Lead-lər', value: '42', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Sürət', value: '0.2s', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Bot Statusu', value: bots.length > 0 ? 'Aktiv' : 'Yoxdur', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800">Botlar</h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline">Hamısına bax</button>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
                <div className="p-8 text-center text-slate-400 italic">Yüklənir...</div>
            ) : bots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">Hələ ki bot yaradılmayıb.</div>
            ) : bots.map((bot) => (
              <div key={bot._id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {bot.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{bot.name}</p>
                  <p className="text-sm text-slate-500 truncate italic">{bot.niche}</p>
                </div>
                <div className="text-right">
                  <div className="mt-1 flex gap-1 justify-end">
                    <span className={`w-2 h-2 ${bot.is_active ? 'bg-green-500' : 'bg-slate-300'} rounded-full`} />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">
                        {bot.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-900 text-white rounded-2xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4">Ağıllı Bilgi Bazası</h2>
            <p className="text-indigo-100 text-sm leading-relaxed opacity-80">
              Botlarınıza məhsullarınızı və qiymətlərinizi burdan öyrədə bilərsiniz.
            </p>
            <div className="mt-8 space-y-4">
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-full bg-indigo-400 w-[100%] rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
              </div>
              <p className="text-xs text-indigo-200">Sistem hazırdır</p>
            </div>
            <button className="w-full mt-10 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
              Məlumatları Yenilə
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
