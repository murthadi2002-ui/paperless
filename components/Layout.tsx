
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Users, 
  Bell, 
  Settings, 
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  FileDown,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Reply
} from 'lucide-react';
import { CURRENT_USER, MOCK_MESSAGES, MOCK_DOCUMENTS } from '../constants';

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

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'doc' | 'task' | 'project' | 'message' | 'system' | 'response';
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '0', title: 'رد على توجيه إداري', desc: 'قام المهندس محمد علي بالرد على توجيه "تدقيق العقود الفنية" وتغيير الحالة لمكتمل.', time: 'الآن', type: 'response', isRead: false },
  { id: '1', title: 'كتاب وارد جديد', desc: 'وصل كتاب رسمي من وزارة الإسكان بانتظار الأرشفة والفرز.', time: 'منذ دقيقتين', type: 'doc', isRead: false },
  { id: '2', title: 'توجيه إداري جديد', desc: 'قام المدير العام بتوجيه كتاب "مراجعة مخططات برج دبي" إليك.', time: 'منذ ساعة', type: 'task', isRead: false },
  { id: '3', title: 'رسالة غير مقروءة', desc: 'سارة خالد: "هل اطلعت على آخر التحديثات في إضبارة الرواتب؟"', time: 'منذ 3 ساعات', type: 'message', isRead: false },
  { id: '4', title: 'مشروع جديد مفعل', desc: 'تم إنشاء مشروع "مجمع سكني - الرياض" بنجاح من قبل الإدارة.', time: 'منذ 5 ساعات', type: 'project', isRead: true },
  { id: '5', title: 'تنبيه أمني للنظام', desc: 'سيتم حذف الملفات الموجودة في سلة المهملات نهائياً خلال 24 ساعة.', time: 'منذ يوم', type: 'system', isRead: true },
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick, breadcrumbs = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Check for Sidebar Red Dots
  const hasUnreadMessages = MOCK_MESSAGES.some(m => m.receiverId === CURRENT_USER.id && !m.isRead);
  const hasPendingTasks = MOCK_DOCUMENTS.some(d => d.tasks?.some(t => t.assigneeIds.includes(CURRENT_USER.id) && t.status === 'pending'));

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'documents', label: 'الأرشيف العام', icon: FileText },
    { id: 'projects', label: 'المشاريع الهندسية', icon: Briefcase },
    { id: 'my-tasks', label: 'مهامي وتوجيهاتي', icon: ClipboardList, hasDot: hasPendingTasks },
    { id: 'messages', label: 'المراسلات الداخلية', icon: MessageSquare, hasDot: hasUnreadMessages },
    { id: 'invites', label: 'إدارة الكوادر', icon: Users },
    { id: 'settings', label: 'الإعدادات والنظام', icon: Settings },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'response': return <Reply className="text-emerald-500" size={16} />;
      case 'doc': return <FileDown className="text-blue-500" size={16} />;
      case 'task': return <UserCheck className="text-amber-500" size={16} />;
      case 'project': return <Briefcase className="text-purple-500" size={16} />;
      case 'message': return <Mail className="text-indigo-500" size={16} />;
      default: return <AlertCircle className="text-red-500" size={16} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-cairo transition-all duration-300 text-right" dir="rtl">
      {/* Sidebar - Slimmer version */}
      <aside 
        className={`${isCollapsed ? 'w-16' : 'w-56'} bg-white border-l border-slate-200 flex flex-col transition-all duration-300 z-40 relative group/sidebar shadow-xl shadow-slate-200/50`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-10 w-6 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm z-50 transition-all hover:bg-emerald-50"
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-emerald-100">
            <PlusCircle size={isCollapsed ? 18 : 22} />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-black text-slate-800 tracking-tight animate-in fade-in slide-in-from-right-2">Paperless</h1>
          )}
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-3 rounded-2xl text-xs font-black transition-all duration-200 relative group ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className={`${activeTab === item.id ? 'text-emerald-600' : ''} shrink-0 transition-transform group-hover:scale-110`} />
                {!isCollapsed && <span className="flex-1 text-right truncate">{item.label}</span>}
                
                {/* Red Dot Notification - Nazk Style */}
                {item.hasDot && (
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white shadow-sm ${isCollapsed ? 'left-2 top-2 translate-y-0' : ''}`}></span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 p-2 bg-slate-50 rounded-2xl'} transition-all`}>
            <img src={CURRENT_USER.avatar} alt="User" className={`w-9 h-9 rounded-xl border-2 border-white shadow-sm shrink-0 object-cover ${isCollapsed ? 'w-8 h-8' : ''}`} />
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden text-right">
                  <p className="text-[10px] font-black text-slate-800 truncate leading-none">{CURRENT_USER.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 truncate mt-1">{CURRENT_USER.email}</p>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest hidden lg:block">نظام الأرشفة الموحد</span>
            <ChevronLeft size={14} className="text-slate-200 hidden lg:block" />
            <div className="flex items-center gap-2 overflow-hidden">
              <button className="text-slate-800 font-black text-xs shrink-0">{menuItems.find(m => m.id === activeTab)?.label}</button>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronLeft size={14} className="text-slate-300 shrink-0" />
                  <span className="text-xs font-black text-emerald-600 truncate max-w-[120px]">{crumb.label}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-2xl transition-all ${isNotificationsOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              {isNotificationsOpen && (
                <div className="absolute left-0 top-full mt-3 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-4 duration-300 origin-top-left">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">تنبيهات النظام اللحظية</h3>
                    <button onClick={markAllAsRead} className="text-[10px] font-black text-emerald-600 hover:underline">تحديد الكل كمقروء</button>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors group relative ${!n.isRead ? 'bg-emerald-50/10' : ''}`}>
                          <div className="shrink-0 mt-1">
                            <div className={`p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform`}>
                              {getNotificationIcon(n.type)}
                            </div>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-[11px] font-black text-slate-800 truncate">{n.title}</h4>
                              <span className="text-[8px] font-black text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-md">{n.time}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.desc}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                            className="absolute top-4 left-4 p-1 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 text-center text-slate-300">
                        <CheckCircle2 size={40} className="mx-auto mb-3 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest">لا توجد تنبيهات جديدة في الأرشيف</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-center">
                    <button className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">عرض سجل التنبيهات الكامل</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">أرشفة وثيقة</span>
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
