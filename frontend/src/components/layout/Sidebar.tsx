import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Users, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel', path: '/dashboard' },
  { icon: MessageSquare, label: 'Söhbətlər', path: '/chats' },
  { icon: Users, label: 'Sifarişlər', path: '/orders' },
  { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="font-black text-lg text-slate-800 tracking-tight">AI Operator</span>
        </div>
        <button onClick={toggle} className="p-2 text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 h-screen bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-800">AI Operator</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-black text-sm uppercase tracking-wider
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-sm uppercase tracking-wider"
          >
            <LogOut size={20} />
            Çıxış
          </button>
        </div>
      </aside>
    </>
  );
}
