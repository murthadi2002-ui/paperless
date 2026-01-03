
import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Briefcase, Users, Bell, Settings, PlusCircle, LogOut, ChevronLeft, ChevronRight, MessageSquare, ClipboardList, Building2
} from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick?: () => void;
  onLogout?: () => void;
  organizationName?: string;
}

const LogoP = ({ size = 22 }: { size?: number }) => (
  <div 
    className="bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center font-black"
    style={{ width: size * 1.8, height: size * 1.8, fontSize: size }}
  >
    P
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick, onLogout, organizationName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'documents', label: 'الأرشيف العام', icon: FileText },
    { id: 'projects', label: 'المشاريع الهندسية', icon: Briefcase },
    { id: 'my-tasks', label: 'مهامي وتوجيهاتي', icon: ClipboardList },
    { id: 'messages', label: 'المراسلات الداخلية', icon: MessageSquare },
    { id: 'invites', label: 'إدارة الكوادر', icon: Users },
    { id: 'settings', label: 'الإعدادات والنظام', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-cairo transition-all duration-300 text-right" dir="rtl">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-l border-slate-200 flex flex-col transition-all duration-300 z-40 relative shadow-xl shadow-slate-200/50`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -left-3 top-10 w-6 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm z-50 transition-all hover:bg-emerald-50">
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
          <LogoP size={isCollapsed ? 16 : 22} />
          {!isCollapsed && <h1 className="text-xl font-black text-slate-800 tracking-tight">Paperless</h1>}
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 rounded-2xl text-xs font-black transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="flex-1 text-right truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 p-3 bg-slate-50 rounded-2xl'} transition-all`}>
            <img src={CURRENT_USER.avatar} alt="User" className="w-9 h-9 rounded-xl border-2 border-white shadow-sm shrink-0 object-cover" />
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden text-right">
                  <p className="text-[10px] font-black text-slate-800 truncate leading-none">{CURRENT_USER.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 truncate mt-1">{organizationName}</p>
                </div>
                <button onClick={onLogout} className="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="تسجيل الخروج">
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">المنشأة الحالية</span>
              <span className="text-emerald-600 font-black text-sm">{organizationName}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            <span className="text-slate-800 font-black text-xs">{menuItems.find(m => m.id === activeTab)?.label}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-100 active:scale-95">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">أرشفة كتاب جديد</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;
