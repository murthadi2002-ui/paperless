
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Users, 
  Bell, 
  Settings, 
  PlusCircle,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick?: () => void;
  breadcrumbs?: Breadcrumb[];
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick, breadcrumbs = [] }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'documents', label: 'الأرشيف العام', icon: FileText },
    { id: 'projects', label: 'المشاريع', icon: Briefcase },
    { id: 'invites', label: 'إدارة الموظفين', icon: Users },
    { id: 'settings', label: 'الإعدادات والنظام', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-cairo">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <PlusCircle size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Paperless</h1>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={20} className={activeTab === item.id ? 'text-emerald-600' : ''} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <img src={CURRENT_USER.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="flex-1 overflow-hidden text-right">
              <p className="text-sm font-bold text-slate-800 truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-slate-500 truncate">{CURRENT_USER.email}</p>
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">النظام</span>
            <ChevronLeft size={14} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab(activeTab)}
                className="text-slate-800 font-bold text-sm hover:text-emerald-600 transition-colors"
              >
                {menuItems.find(m => m.id === activeTab)?.label}
              </button>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronLeft size={14} className="text-slate-300" />
                  <button 
                    onClick={crumb.onClick}
                    className={`text-sm font-bold truncate max-w-[150px] transition-colors ${
                      idx === breadcrumbs.length - 1 ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-slate-800">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={onAddClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-200"
            >
              <PlusCircle size={18} />
              <span>أرشفة جديدة</span>
            </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
