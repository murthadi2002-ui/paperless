
import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Shield, Check, X, Clock, 
  MoreVertical, Edit2, ShieldAlert, Users, 
  Briefcase, Mail, Calendar, Activity, 
  Trash2, UserX, Settings2, Filter, 
  ArrowUpRight, Info, Save
} from 'lucide-react';
import { User } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

const ALL_PERMISSIONS = [
  { id: 'add_doc', label: 'إضافة كتاب', category: 'الأرشفة' },
  { id: 'edit_doc', label: 'تعديل كتاب', category: 'الأرشفة' },
  { id: 'delete_doc', label: 'حذف كتاب', category: 'الأرشفة' },
  { id: 'view_doc', label: 'عرض الكتب فقط', category: 'الأرشفة' },
  { id: 'status_doc', label: 'تغيير حالة الكتاب', category: 'المتابعة' },
  { id: 'close_doc', label: 'إغلاق كتاب', category: 'المتابعة' },
  { id: 'upload_file', label: 'رفع ملفات', category: 'الملفات' },
  { id: 'download_file', label: 'تحميل ملفات', category: 'الملفات' },
  { id: 'create_proj', label: 'إنشاء مشروع', category: 'المشاريع' },
  { id: 'view_reports', label: 'عرض تقارير', category: 'التقارير' },
  { id: 'manage_users', label: 'إدارة المستخدمين', category: 'الإدارة' },
];

const InviteManagement: React.FC = () => {
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [employees, setEmployees] = useState<User[]>(MOCK_EMPLOYEES);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'team' | 'invites'>('team');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    departments: new Set(employees.map(e => e.department)).size
  }), [employees]);

  const handleSearch = () => {
    if (!email.includes('@')) return;
    setIsSearching(true);
    setTimeout(() => {
      setFoundUser({
        name: 'ياسين محمود فؤاد',
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      });
      setIsSearching(false);
      setSelectedPerms(['عرض الكتب فقط', 'تحميل ملفات']);
    }, 800);
  };

  const handleOpenEdit = (emp: User) => {
    setEditingEmployee(emp);
    setSelectedPerms(emp.permissions || []);
    setActiveMenu(null);
  };

  const handleSavePerms = () => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, permissions: selectedPerms } : e));
      setEditingEmployee(null);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700" onClick={() => setActiveMenu(null)}>
      {/* Page Title & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
               <Users size={28} />
             </div>
             <h2 className="text-3xl font-extrabold text-slate-900">إدارة القوى العاملة</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md pr-1">
            تحكم كامل في صلاحيات الوصول، مراقبة النشاط اللحظي، وتوسيع فريق عمل Paperless الخاص بك.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 lg:max-w-3xl">
          {[
            { label: 'إجمالي الفريق', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'متصل الآن', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'دعوات معلقة', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'الأقسام', value: stats.departments, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                <p className="text-lg font-black text-slate-800 leading-none">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                الفريق الحالي
              </button>
              <button 
                onClick={() => setActiveTab('invites')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <UserPlus size={16} />
                دعوة موظف
              </button>
            </div>
            
            {activeTab === 'team' && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو القسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            )}
          </div>

          {activeTab === 'team' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-6 duration-500">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={emp.avatar} alt="" className="w-16 h-16 rounded-3xl border-4 border-white shadow-md object-cover" />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${emp.status === 'active' ? 'bg-emerald-500' : emp.status === 'pending' ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-800 leading-tight">{emp.name}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                          <Mail size={12} className="text-emerald-500" /> {emp.email}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleMenu(e, emp.id)}
                        className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {activeMenu === emp.id && (
                        <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
                          <button 
                            onClick={() => handleOpenEdit(emp)}
                            className="w-full text-right px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                          >
                            <Settings2 size={14} /> تعديل الصلاحيات
                          </button>
                          <button className="w-full text-right px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                            <Mail size={14} /> إرسال بريد
                          </button>
                          <hr className="my-1 border-slate-50" />
                          <button className="w-full text-right px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                            <UserX size={14} /> تعطيل الحساب
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">القسم</p>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                         <Briefcase size={14} className="text-emerald-500" />
                         {emp.department}
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">تاريخ الانضمام</p>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                         <Calendar size={14} className="text-emerald-500" />
                         {emp.joinedDate}
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {emp.permissions?.slice(0, 4).map(p => (
                      <span key={p} className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-100">{p}</span>
                    ))}
                    {(emp.permissions?.length || 0) > 4 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">+{emp.permissions!.length - 4} أخرى</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.lastActive}</span>
                    </div>
                    <button 
                      onClick={() => handleOpenEdit(emp)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                    >
                      تعديل الصلاحيات <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[1.5rem] shadow-inner">
                    <UserPlus size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">دعوة موظف جديد</h3>
                    <p className="text-slate-400 text-sm mt-1 font-bold">اربط كفاءات جديدة بمنظومة الأرشفة الذكية لشركتك</p>
                  </div>
               </div>
               
               <div className="relative mb-10 group">
                 <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <Mail className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} />
                 </div>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="أدخل البريد الإلكتروني للموظف..." 
                   className="w-full pr-16 pl-40 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold placeholder:text-slate-300"
                 />
                 <button 
                   onClick={handleSearch}
                   className="absolute left-3 top-3 bottom-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[1.2rem] font-bold transition-all flex items-center gap-3 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
                   disabled={!email.includes('@')}
                 >
                   {isSearching ? <span className="animate-spin border-3 border-white border-t-transparent w-5 h-5 rounded-full"></span> : <Search size={22} />}
                   بحث ذكي
                 </button>
               </div>

               {foundUser && (
                 <div className="animate-in slide-in-from-top-6 duration-500">
                   <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 flex items-center gap-6 mb-10">
                      <img src={foundUser.avatar} alt="" className="w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-xl" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black text-slate-800">{foundUser.name}</h4>
                          <span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">مستخدم مسجل</span>
                        </div>
                        <p className="text-slate-500 font-bold mt-1">{foundUser.email}</p>
                      </div>
                      <button onClick={() => setFoundUser(null)} className="p-3 hover:bg-white rounded-full text-slate-300 hover:text-red-500 transition-all"><X size={24} /></button>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                          <Shield size={22} className="text-emerald-600" />
                          تحديد الصلاحيات الممنوحة
                        </h5>
                        <div className="text-xs font-bold text-slate-400">
                          تم تحديد {selectedPerms.length} صلاحيات
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ALL_PERMISSIONS.map(perm => (
                          <label 
                            key={perm.id} 
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                              selectedPerms.includes(perm.label) 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                                : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-600'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={`text-xs font-black ${selectedPerms.includes(perm.label) ? 'text-white' : 'text-slate-800'}`}>{perm.label}</span>
                              <span className={`text-[10px] font-bold ${selectedPerms.includes(perm.label) ? 'text-emerald-100' : 'text-slate-400'}`}>{perm.category}</span>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={selectedPerms.includes(perm.label)}
                              onChange={() => togglePermission(perm.label)}
                              className="hidden" 
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedPerms.includes(perm.label) ? 'bg-white border-white text-emerald-600' : 'border-slate-200'
                            }`}>
                              {selectedPerms.includes(perm.label) && <Check size={12} strokeWidth={4} />}
                            </div>
                          </label>
                        ))}
                      </div>
                   </div>

                   <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                      <button className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-[0.98]">
                        <UserPlus size={24} /> إرسال دعوة الانضمام الرسمية
                      </button>
                      <button onClick={() => setFoundUser(null)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black hover:bg-slate-200 transition-all active:scale-95">إلغاء</button>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right: Sidebar Access Control or Quick Summary */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xs font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
                 <ShieldAlert size={18} className="text-emerald-600" /> الحالة العامة للفريق
              </h3>
              
              <div className="space-y-5 relative z-10">
                 {[
                   { label: 'مدراء النظام', value: '01', icon: Shield, color: 'text-indigo-600' },
                   { label: 'موظفون نشطون', value: String(stats.active).padStart(2, '0'), icon: Activity, color: 'text-emerald-600' },
                   { label: 'أقسام مفعلة', value: String(stats.departments).padStart(2, '0'), icon: Briefcase, color: 'text-blue-600' },
                   { label: 'دعوات قيد الانتظار', value: String(stats.pending).padStart(2, '0'), icon: Mail, color: 'text-amber-600' }
                 ].map((row, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all cursor-default">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-white shadow-sm ${row.color}`}>
                          <row.icon size={20} />
                        </div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{row.label}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800 tracking-tighter">{row.value}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-10 p-6 bg-emerald-900 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group/card">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:rotate-12 transition-transform">
                   <Info size={120} />
                 </div>
                 <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                   دليل الصلاحيات
                   <Info size={18} />
                 </h4>
                 <p className="text-emerald-100/80 text-xs leading-relaxed font-bold mb-6">
                   تذكّر أن الصلاحيات تمنح للموظف وصولاً فورياً للملفات الحساسة. ننصح بمراجعة الصلاحيات دورياً لكل موظف.
                 </p>
                 <button className="w-full py-3.5 bg-white text-emerald-900 rounded-2xl text-xs font-black shadow-lg hover:bg-emerald-50 transition-all active:scale-95">
                   تحميل سجل الأنشطة الأسبوعي
                 </button>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                أحدث عمليات الانضمام
              </h4>
              <div className="space-y-4">
                {employees.slice(0, 3).map((e, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={e.avatar} alt="" className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black text-slate-800 truncate">{e.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{e.department}</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">جديد</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Permissions Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                   <div className="relative">
                     <img src={editingEmployee.avatar} alt="" className="w-20 h-20 rounded-[1.8rem] border-4 border-white shadow-xl object-cover" />
                     <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-xl shadow-lg">
                        <Shield size={16} />
                     </div>
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">صلاحيات: {editingEmployee.name}</h3>
                     <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                        <Briefcase size={14} className="text-emerald-600" />
                        {editingEmployee.department}
                     </p>
                   </div>
                </div>
                <button onClick={() => setEditingEmployee(null)} className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-all shadow-sm">
                  <X size={24} />
                </button>
             </div>
             
             <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {ALL_PERMISSIONS.map(perm => (
                      <label 
                        key={perm.id} 
                        className={`flex items-center justify-between p-5 rounded-[1.8rem] border-2 transition-all cursor-pointer group ${
                          selectedPerms.includes(perm.label) 
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-inner' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                        }`}
                      >
                         <div className="flex flex-col">
                           <span className={`text-sm font-black ${selectedPerms.includes(perm.label) ? 'text-emerald-900' : 'text-slate-600'}`}>{perm.label}</span>
                           <span className="text-[10px] font-bold opacity-60">{perm.category}</span>
                         </div>
                         <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                           selectedPerms.includes(perm.label) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200'
                         }`}>
                           {selectedPerms.includes(perm.label) && <Check size={14} strokeWidth={4} />}
                         </div>
                         <input 
                           type="checkbox" 
                           className="hidden"
                           checked={selectedPerms.includes(perm.label)}
                           onChange={() => togglePermission(perm.label)}
                         />
                      </label>
                   ))}
                </div>
             </div>

             <div className="p-10 bg-slate-50 flex gap-4">
                <button 
                  onClick={handleSavePerms}
                  className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Save size={24} /> حفظ التغييرات وتحديث الجلسة
                </button>
                <button onClick={() => setEditingEmployee(null)} className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl font-black hover:bg-slate-50 transition-all active:scale-95">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteManagement;
