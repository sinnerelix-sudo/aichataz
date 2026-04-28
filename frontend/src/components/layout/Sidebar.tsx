import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Users, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel', path: '/' },
  { icon: MessageSquare, label: 'Söhbətlər', path: '/chats' },
  { icon: Users, label: 'Sifarişlər', path: '/orders' },
  { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-lg text-slate-800">AIChatAz</span>
        </div>
        <button onClick={toggle} className="p-2 text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 h-screen bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">AIChatAz</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 lg:py-0 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${location.pathname === item.path 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
            <LogOut size={20} />
            Çıxış
          </button>
        </div>
      </aside>
    </>
  );
}
