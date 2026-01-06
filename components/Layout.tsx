import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Briefcase, Users, Settings, PlusCircle, LogOut, ChevronLeft, ChevronRight, MessageSquare, ClipboardList
} from 'lucide-react';
import { User } from '../types';
import ConfirmModal from './ConfirmModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick?: () => void;
  onLogout?: () => void;
  organizationName?: string;
  currentUser: User | null;
}

const LogoP = ({ size = 22 }: { size?: number }) => (
  <div 
    className="bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-200 flex items-center justify-center font-black"
    style={{ width: size * 1.8, height: size * 1.8, fontSize: size }}
  >
    P
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick, onLogout, organizationName, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'documents', label: 'الأرشيف العام', icon: FileText },
    { id: 'projects', label: 'المشاريع الهندسية', icon: Briefcase },
    { id: 'my-tasks', label: 'مهامي وتوجيهاتي', icon: ClipboardList },
    { id: 'messages', label: 'المراسلات الداخلية', icon: MessageSquare },
    { id: 'invites', label: 'إدارة الكوادر', icon: Users, adminOnly: true },
    { id: 'settings', label: 'الإعدادات والنظام', icon: Settings },
  ];

  const filteredMenu = menuItems.filter(item => !item.adminOnly || currentUser?.role === 'admin');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-cairo transition-all duration-300 text-right" dir="rtl">
      
      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="تأكيد الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج؟ سيتعين عليك إدخال بياناتك مرة أخرى للوصول."
        confirmLabel="نعم، تسجيل الخروج"
        cancelLabel="تراجع"
        type="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout?.();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <aside className={`${isCollapsed ? 'w-16' : 'lg:w-52 w-16'} bg-white border-l border-slate-200/60 flex flex-col transition-all duration-300 z-40 relative shadow-xl shadow-slate-200/30`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex absolute -left-3 top-10 w-6 h-10 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm z-50 transition-all hover:bg-emerald-50"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'lg:gap-3 justify-center lg:justify-start'} transition-all`}>
          <LogoP size={isCollapsed ? 14 : 18} />
          {!isCollapsed && <h1 className="hidden lg:block text-lg font-black text-slate-800 tracking-tight">Paperless</h1>}
        </div>

        <nav className="flex-1 mt-2 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'lg:gap-2.5 lg:px-3 justify-center lg:justify-start'} py-3 rounded-xl text-[11px] font-black transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className="shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="hidden lg:block flex-1 text-right truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'lg:gap-2.5 lg:p-2.5 lg:bg-slate-50 justify-center lg:justify-start'} rounded-xl transition-all`}>
            <img src={currentUser?.avatar || 'https://i.pravatar.cc/150'} alt="User" className="w-8 h-8 rounded-lg border-2 border-white shadow-sm shrink-0 object-cover" />
            {!isCollapsed && (
              <>
                <div className="hidden lg:block flex-1 overflow-hidden text-right">
                  <p className="text-[9px] font-black text-slate-800 truncate leading-none">{currentUser?.name || 'مستخدم'}</p>
                  <p className="text-[8px] font-bold text-slate-400 truncate mt-1">{organizationName}</p>
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="hidden lg:block text-slate-300 hover:text-red-500 transition-colors shrink-0" title="تسجيل الخروج">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">المنشأة الحالية</span>
              <span className="text-emerald-600 font-black text-sm">{organizationName}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            <span className="text-slate-800 font-black text-xs">{menuItems.find(m => m.id === activeTab)?.label}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-[10px] font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95">
              <PlusCircle size={14} />
              <span className="hidden sm:inline">أرشفة كتاب جديد</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-10 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;