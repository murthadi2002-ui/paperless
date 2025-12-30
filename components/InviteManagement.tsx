
import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Shield, Check, X, Clock, 
  MoreVertical, Edit2, ShieldAlert, Users, 
  Briefcase, Mail, Calendar, Activity, 
  Trash2, UserX, Settings2, Filter, 
  ArrowUpRight, Info, Save, Archive, FileStack, 
  Settings, LayoutGrid, CheckCircle2, ChevronDown
} from 'lucide-react';
import { User, Department } from '../types';

interface InviteManagementProps {
  departments: Department[];
  employees: User[];
  setEmployees: React.Dispatch<React.SetStateAction<User[]>>;
}

const ALL_PERMISSIONS = [
  { id: 'add_doc', label: 'إضافة كتاب', category: 'الأرشفة', icon: Archive },
  { id: 'edit_doc', label: 'تعديل كتاب', category: 'الأرشفة', icon: Edit2 },
  { id: 'delete_doc', label: 'حذف كتاب', category: 'الأرشفة', icon: Trash2 },
  { id: 'view_doc', label: 'عرض الكتب فقط', category: 'الأرشفة', icon: FileStack },
  { id: 'status_doc', label: 'تغيير حالة الكتاب', category: 'المتابعة', icon: Activity },
  { id: 'close_doc', label: 'إغلاق كتاب', category: 'المتابعة', icon: CheckCircle2 },
  { id: 'upload_file', label: 'رفع ملفات', category: 'الملفات', icon: Archive },
  { id: 'download_file', label: 'تحميل ملفات', category: 'الملفات', icon: Save },
  { id: 'create_proj', label: 'إنشاء مشروع', category: 'المشاريع', icon: Briefcase },
  { id: 'view_reports', label: 'عرض تقارير', category: 'التقارير', icon: FileStack },
  { id: 'manage_users', label: 'إدارة المستخدمين', category: 'الإدارة', icon: Settings },
];

const CONFLICTING_WITH_READ_ONLY = [
  'إضافة كتاب', 'تعديل كتاب', 'حذف كتاب', 
  'تغيير حالة الكتاب', 'إغلاق كتاب', 
  'رفع ملفات', 'إنشاء مشروع', 'إدارة المستخدمين'
];

const InviteManagement: React.FC<InviteManagementProps> = ({ departments, employees, setEmployees }) => {
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
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
    departmentCount: departments.length
  }), [employees, departments]);

  const groupedPermissions = useMemo(() => {
    return ALL_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof ALL_PERMISSIONS>);
  }, []);

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
      setSelectedPerms(['عرض الكتب فقط']);
      setSelectedDept(departments[0]?.name || '');
    }, 800);
  };

  const handleOpenEdit = (emp: User) => {
    setEditingEmployee(emp);
    setSelectedPerms(emp.permissions || []);
    setSelectedDept(emp.department || '');
    setActiveMenu(null);
  };

  const handleSavePermsAndDept = () => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, permissions: selectedPerms, department: selectedDept } : e));
      setEditingEmployee(null);
    }
  };

  const handleSendInvite = () => {
    if (!foundUser) return;
    const newEmp: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar,
      role: 'employee',
      department: selectedDept,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'لم يسجل دخول بعد',
      permissions: selectedPerms
    };
    setEmployees([...employees, newEmp]);
    setFoundUser(null);
    setEmail('');
    setActiveTab('team');
  };

  const togglePermission = (permLabel: string) => {
    setSelectedPerms(prev => {
      const isAlreadySelected = prev.includes(permLabel);
      let nextPerms = isAlreadySelected 
        ? prev.filter(p => p !== permLabel) 
        : [...prev, permLabel];

      if (!isAlreadySelected && permLabel === 'عرض الكتب فقط') {
        nextPerms = nextPerms.filter(p => !CONFLICTING_WITH_READ_ONLY.includes(p));
      } 
      else if (!isAlreadySelected && CONFLICTING_WITH_READ_ONLY.includes(permLabel)) {
        nextPerms = nextPerms.filter(p => p !== 'عرض الكتب فقط');
      }

      return nextPerms;
    });
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
            { label: 'الأقسام المتاحة', value: stats.departmentCount, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button onClick={() => setActiveTab('team')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>الفريق الحالي</button>
              <button onClick={() => setActiveTab('invites')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><UserPlus size={16} />دعوة موظف</button>
            </div>
            {activeTab === 'team' && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="ابحث بالاسم أو القسم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
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
                        <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1"><Mail size={12} className="text-emerald-500" /> {emp.email}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button onClick={(e) => toggleMenu(e, emp.id)} className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                      {activeMenu === emp.id && (
                        <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
                          <button onClick={() => handleOpenEdit(emp)} className="w-full text-right px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"><Settings2 size={14} /> تعديل البيانات</button>
                          <hr className="my-1 border-slate-50" />
                          <button className="w-full text-right px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><UserX size={14} /> تعطيل الحساب</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">القسم الحالي</p>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Briefcase size={14} className="text-emerald-500" />{emp.department}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">تاريخ الانضمام</p>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Calendar size={14} className="text-emerald-500" />{emp.joinedDate}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {emp.permissions?.slice(0, 4).map(p => <span key={p} className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-100">{p}</span>)}
                    {(emp.permissions?.length || 0) > 4 && <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">+{emp.permissions!.length - 4} أخرى</span>}
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.lastActive}</span>
                    </div>
                    <button onClick={() => handleOpenEdit(emp)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">تعديل البيانات <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[1.5rem] shadow-inner"><UserPlus size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">دعوة موظف جديد</h3>
                    <p className="text-slate-400 text-sm mt-1 font-bold">اربط كفاءات جديدة بمنظومة الأرشفة الذكية لشركتك</p>
                  </div>
               </div>
               <div className="relative mb-10 group">
                 <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none"><Mail className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} /></div>
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني للموظف..." className="w-full pr-16 pl-40 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold placeholder:text-slate-300" />
                 <button onClick={handleSearch} className="absolute left-3 top-3 bottom-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[1.2rem] font-bold transition-all flex items-center gap-3 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50" disabled={!email.includes('@')}>{isSearching ? <span className="animate-spin border-3 border-white border-t-transparent w-5 h-5 rounded-full"></span> : <Search size={22} />} بحث ذكي</button>
               </div>
               {foundUser && (
                 <div className="animate-in slide-in-from-top-6 duration-500">
                   <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 flex items-center gap-6 mb-10">
                      <img src={foundUser.avatar} alt="" className="w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-xl" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3"><h4 className="text-xl font-black text-slate-800">{foundUser.name}</h4><span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">مستخدم مسجل</span></div>
                        <p className="text-slate-500 font-bold mt-1">{foundUser.email}</p>
                      </div>
                      <button onClick={() => setFoundUser(null)} className="p-3 hover:bg-white rounded-full text-slate-300 hover:text-red-500 transition-all"><X size={24} /></button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* اختيار القسم */}
                      <div className="space-y-4">
                        <h5 className="font-black text-slate-800 flex items-center gap-2 text-lg"><Briefcase size={22} className="text-emerald-600" />تعيين القسم</h5>
                        <div className="relative">
                          <select 
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                          >
                            <option value="">اختر القسم المناسب...</option>
                            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                          </select>
                          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                      </div>

                      {/* الصلاحيات */}
                      <div className="space-y-4 md:col-span-2">
                        <h5 className="font-black text-slate-800 flex items-center gap-2 text-lg"><Shield size={22} className="text-emerald-600" />تحديد الصلاحيات المبدئية</h5>
                        <div className="space-y-8">
                          {(Object.entries(groupedPermissions) as [string, typeof ALL_PERMISSIONS][]).map(([category, perms]) => (
                            <div key={category} className="space-y-3">
                              <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">{category}</h6>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {perms.map(perm => (
                                  <label key={perm.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${selectedPerms.includes(perm.label) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-600'}`}>
                                    <div className={`p-2 rounded-xl transition-colors ${selectedPerms.includes(perm.label) ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:text-emerald-500'}`}><perm.icon size={16} /></div>
                                    <span className="text-xs font-black truncate flex-1">{perm.label}</span>
                                    <input type="checkbox" checked={selectedPerms.includes(perm.label)} onChange={() => togglePermission(perm.label)} className="hidden" />
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                      <button 
                        onClick={handleSendInvite}
                        disabled={!selectedDept}
                        className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                      >
                        <UserPlus size={24} /> إرسال دعوة الانضمام
                      </button>
                      <button onClick={() => setFoundUser(null)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black hover:bg-slate-200 transition-all active:scale-95">إلغاء</button>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xs font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10"><ShieldAlert size={18} className="text-emerald-600" /> الحالة العامة للفريق</h3>
              <div className="space-y-5 relative z-10">
                 {[
                   { label: 'مدراء النظام', value: '01', icon: Shield, color: 'text-indigo-600' },
                   { label: 'موظفون نشطون', value: String(stats.active).padStart(2, '0'), icon: Activity, color: 'text-emerald-600' },
                   { label: 'أقسام مفعلة', value: String(stats.departmentCount).padStart(2, '0'), icon: Briefcase, color: 'text-blue-600' },
                   { label: 'دعوات قيد الانتظار', value: String(stats.pending).padStart(2, '0'), icon: Mail, color: 'text-amber-600' }
                 ].map((row, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all cursor-default">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-white shadow-sm ${row.color}`}><row.icon size={20} /></div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{row.label}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800 tracking-tighter">{row.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Permissions & Department Edit Modal - REFINED UI */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400 flex flex-col max-h-[85vh] border border-slate-200">
             {/* Optimized Header Section */}
             <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="relative">
                     <img src={editingEmployee.avatar} alt="" className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-sm object-cover" />
                     <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-lg shadow-sm ring-2 ring-white"><Shield size={12} /></div>
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-900 leading-tight">تحرير صلاحيات الموظف</h3>
                     <p className="text-[11px] text-slate-400 font-bold mt-0.5">{editingEmployee.name} • {editingEmployee.email}</p>
                   </div>
                </div>
                <button onClick={() => setEditingEmployee(null)} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
             </div>
             
             {/* Scrollable Content Area */}
             <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50/30 space-y-8">
                {/* تعديل القسم */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">القسم الوظيفي</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* شبكة الصلاحيات */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                   {(Object.entries(groupedPermissions) as [string, typeof ALL_PERMISSIONS][]).map(([category, perms]) => (
                      <div key={category} className="space-y-3">
                         <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 px-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</h4>
                            <span className="text-[9px] font-bold text-slate-300 tracking-tighter">({perms.length})</span>
                         </div>
                         <div className="grid grid-cols-1 gap-2">
                            {perms.map(perm => (
                               <label key={perm.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group hover:shadow-sm ${selectedPerms.includes(perm.label) ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}>
                                  <div className="flex items-center gap-3">
                                     <div className={`p-1.5 rounded-lg transition-colors ${selectedPerms.includes(perm.label) ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-300 group-hover:text-emerald-500'}`}><perm.icon size={14} /></div>
                                     <span className={`text-[11px] font-black ${selectedPerms.includes(perm.label) ? 'text-emerald-900' : 'text-slate-600'}`}>{perm.label}</span>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedPerms.includes(perm.label) ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200'}`}>{selectedPerms.includes(perm.label) && <Check size={12} strokeWidth={4} />}</div>
                                  <input type="checkbox" className="hidden" checked={selectedPerms.includes(perm.label)} onChange={() => togglePermission(perm.label)} />
                               </label>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Optimized Footer Action Bar */}
             <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-slate-300"><Info size={16} /><p className="text-[10px] font-bold">يتم تطبيق الصلاحيات فور الحفظ</p></div>
                <div className="flex gap-3">
                   <button onClick={() => setEditingEmployee(null)} className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all">إلغاء</button>
                   <button onClick={handleSavePermsAndDept} className="px-8 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"><Save size={16} /> حفظ التعديلات</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteManagement;
