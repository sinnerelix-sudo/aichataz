import { LayoutDashboard, MessageSquare, Settings, Users, LogOut, Sparkles } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel', active: true },
  { icon: MessageSquare, label: 'Söhbətlər' },
  { icon: Users, label: 'Sifarişlər' },
  { icon: Settings, label: 'Bot Ayarları' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Sparkles size={24} fill="currentColor" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">AIChatAz</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              item.active 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
          <LogOut size={20} />
          Çıxış
        </button>
      </div>
    </aside>
  );
}
