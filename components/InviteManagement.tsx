
import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Shield, Check, X, Clock, 
  MoreVertical, Edit2, ShieldAlert, Users, 
  Briefcase, Mail, Calendar, Activity, 
  Trash2, UserX, Settings2, Filter, 
  ArrowUpRight, Info, Save, Archive, FileStack, 
  Settings, LayoutGrid, CheckCircle2, ChevronDown, Copy, Key,
  Radio, UserCheck, Inbox, Layout, Building2, User as UserIcon,
  ShieldCheck, Lock, UserCog
} from 'lucide-react';
import { User, Department, Position } from '../types';

interface InviteManagementProps {
  departments: Department[];
  employees: User[];
  onInvite: (user: User) => Promise<void>;
  onUpdateEmployee: (id: string, updates: Partial<User>) => Promise<void>;
  positions: Position[];
}

const VIEW_ONLY_PERM = 'عرض الكتب فقط';
const AVAILABLE_PERMISSIONS = [
  'إضافة كتاب',
  'تعديل كتاب',
  'حذف كتاب',
  'إدارة المستخدمين',
  VIEW_ONLY_PERM,
  'تحميل ملفات',
  'إنشاء مشروع',
  'إدارة المشاريع',
  'عرض تقارير',
  'عرض الوثائق السرية'
];

const InviteManagement: React.FC<InviteManagementProps> = ({ departments, employees, onInvite, onUpdateEmployee, positions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee'>('employee');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'offline' | 'pending'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'team' | 'requests'>('team');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const orgCode = "PAPER-7X9Y"; 

  // بيانات وهمية للمعاينة (Preview)
  const PREVIEW_EMPLOYEE: User = {
    id: 'preview-1',
    name: 'محمد علي منصور',
    email: 'm.ali@paperless.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    role: 'employee',
    organizationId: 'org-1',
    department: 'الإدارة القانونية',
    status: 'active',
    joinedDate: '2023-01-20',
    lastActive: 'منذ ساعتين',
    permissions: ['إضافة كتاب', 'تعديل كتاب', 'حذف كتاب']
  };

  const PREVIEW_REQUEST: User = {
    id: 'preview-req-1',
    name: 'سارة خالد',
    email: 'sara.k@paperless.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: 'employee',
    organizationId: 'org-1',
    status: 'pending',
    joinedDate: '2023-05-12'
  };

  const filteredEmployees = useMemo(() => {
    const list = employees.filter(e => 
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      e.status !== 'pending'
    );
    return searchTerm === '' ? [PREVIEW_EMPLOYEE, ...list] : list;
  }, [employees, searchTerm]);

  const joinRequests = useMemo(() => {
    const list = employees.filter(e => e.status === 'pending');
    return [PREVIEW_REQUEST, ...list];
  }, [employees]);

  const stats = useMemo(() => ({
    total: filteredEmployees.length,
    active: filteredEmployees.filter(e => e.status === 'active').length,
    online: 3,
    pending: joinRequests.length,
    departmentCount: 6
  }), [filteredEmployees, joinRequests]);

  const handleOpenEdit = (emp: User) => {
    setEditingEmployee(emp);
    setSelectedDept(emp.department || '');
    setSelectedPosId(emp.positionId || '');
    setSelectedRole(emp.role);
    setSelectedStatus(emp.status || 'active');
    setSelectedPermissions(emp.permissions || []);
    setActiveMenu(null);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => {
      const isAlreadySelected = prev.includes(perm);
      
      // إذا كان المستخدم يضغط على "عرض الكتب فقط"
      if (perm === VIEW_ONLY_PERM) {
        if (!isAlreadySelected) {
          // إذا كان يفعله: نقوم بإلغاء كل الصلاحيات الأخرى وتثبيته هو فقط
          return [VIEW_ONLY_PERM];
        } else {
          // إذا كان يلغي تفعيله: نرجعه كمصفوفة فارغة
          return [];
        }
      } 
      
      // إذا كان يضغط على أي صلاحية أخرى
      else {
        let newList = [...prev];
        if (isAlreadySelected) {
          newList = newList.filter(p => p !== perm);
        } else {
          // عند تفعيل أي شيء آخر، نقوم بإزالة "عرض الكتب فقط" إذا كان موجوداً
          newList = newList.filter(p => p !== VIEW_ONLY_PERM);
          newList.push(perm);
        }
        return newList;
      }
    });
  };

  const handleGrantAll = () => {
    // منح الكل يستثني دائماً "عرض الكتب فقط"
    setSelectedPermissions(AVAILABLE_PERMISSIONS.filter(p => p !== VIEW_ONLY_PERM));
  };

  const handleSaveEmployeeChanges = async () => {
    if (editingEmployee) {
      if (editingEmployee.id.startsWith('preview')) {
        setEditingEmployee(null);
        return;
      }

      await onUpdateEmployee(editingEmployee.id, {
        department: selectedDept,
        positionId: selectedPosId,
        role: selectedRole,
        status: selectedStatus,
        permissions: selectedPermissions
      });
      setEditingEmployee(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 text-right" dir="rtl" onClick={() => setActiveMenu(null)}>
      {/* Page Title & Join Code Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100/50 flex items-center justify-center">
             <Users size={28} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">إدارة القوى العاملة</h2>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">تحكم كامل في صلاحيات الوصول، مراقبة النشاط اللحظي، وتوسيع فريق عمل Paperless الخاص بك.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2.5 pr-5 rounded-2xl border border-slate-200 shadow-sm self-start lg:self-auto min-w-[200px]">
          <div className="flex-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">رمز الانضمام للمنشأة</p>
            <p className="text-sm font-black tracking-[0.2em] text-slate-800">{orgCode}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(orgCode)} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'الأقسام المتاحة', value: stats.departmentCount, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'دعوات معلقة', value: stats.pending, icon: Inbox, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'متصل الآن', value: stats.online, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'إجمالي الفريق', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-100 transition-colors">
            <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>
              <stat.icon size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{String(stat.value).padStart(1, '0')}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
          <div className="flex gap-1.5">
            <button 
              onClick={() => setActiveTab('team')} 
              className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              <Users size={16} /> الفريق الحالي
            </button>
            <button 
              onClick={() => setActiveTab('requests')} 
              className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              <UserPlus size={16} /> طلبات الانضمام 
              {joinRequests.length > 0 && <span className={`w-2 h-2 rounded-full bg-red-400 animate-pulse ${activeTab === 'requests' ? 'bg-white' : ''}`}></span>}
            </button>
          </div>
          <div className="relative w-72 ml-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="ابحث بالاسم أو القسم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none shadow-inner" />
          </div>
        </div>

        {activeTab === 'team' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative">
                {emp.id.startsWith('preview') && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-100 text-[7px] font-black text-slate-400 rounded-md uppercase z-10">معاينة التصميم</div>
                )}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={emp.avatar} alt="" className="w-14 h-14 rounded-xl border-2 border-white shadow-md object-cover ring-4 ring-slate-50" />
                      <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1"><Mail size={10} /> {emp.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenEdit(emp)} className="p-2 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Layout size={8}/> القسم</p>
                     <p className="text-[11px] font-black text-slate-700 truncate">{emp.department || 'عام'}</p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar size={8}/> المنصب</p>
                     <p className="text-[11px] font-black text-slate-700 truncate">{positions.find(p=>p.id===emp.positionId)?.name || (emp.role === 'admin' ? 'مدير نظام' : 'موظف')}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                   <div className="flex flex-wrap gap-1.5">
                      {(emp.permissions || []).slice(0, 3).map((p, idx) => (
                         <span key={idx} className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100/50">{p}</span>
                      ))}
                      {(emp.permissions || []).length > 3 && <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded border border-slate-100">+{(emp.permissions || []).length - 3}</span>}
                   </div>
                   <div className="flex items-center justify-between">
                     <button onClick={() => handleOpenEdit(emp)} className="text-[9px] font-black text-emerald-600 flex items-center gap-1.5 hover:underline">تعديل البيانات والصلاحيات <ArrowUpRight size={10}/></button>
                     <p className="text-[9px] text-slate-300 font-black flex items-center gap-1.5"><Activity size={10} /> {emp.lastActive}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600 border border-slate-100"><Inbox size={18} /></div>
                  <h3 className="text-sm font-black text-slate-800">طلبات الالتحاق عبر رمز المنشأة</h3>
               </div>
               <p className="text-[10px] font-bold text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest">{joinRequests.length} طلب بانتظار المراجعة</p>
            </div>
            <div className="divide-y divide-slate-100">
              {joinRequests.map(req => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/80 transition-all group relative">
                  <div className="flex items-center gap-4">
                    <img src={req.avatar} className="w-14 h-14 rounded-xl border-2 border-white shadow-md object-cover ring-4 ring-slate-50" alt="" />
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{req.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => onUpdateEmployee(req.id, {status: 'offline'})} className="px-6 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-black transition-all">رفض</button>
                     <button onClick={() => onUpdateEmployee(req.id, {status: 'active'})} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95">
                        <Check size={16} /> قبول وتعيين
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-6 pt-20 animate-in fade-in overflow-y-auto" onClick={() => setEditingEmployee(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col mb-20 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg">
                   <UserCog size={22} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-slate-800">تعديل ملف الموظف</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingEmployee.name}</p>
                 </div>
               </div>
               <button onClick={() => setEditingEmployee(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><X size={20}/></button>
             </div>

             {/* Content */}
             <div className="p-8 space-y-8">
                {/* Section: Roles & Depts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2"><Layout size={12}/> القسم الإداري</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                      <option value="">اختر القسم...</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2"><Briefcase size={12}/> المسمى الوظيفي</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={selectedPosId} onChange={e => setSelectedPosId(e.target.value)}>
                      <option value="">اختر مسمى وظيفي...</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2"><ShieldCheck size={12}/> دور الصلاحية</label>
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                         <button onClick={() => setSelectedRole('admin')} className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${selectedRole === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>مدير نظام</button>
                         <button onClick={() => setSelectedRole('employee')} className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${selectedRole === 'employee' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>موظف عادي</button>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2"><Lock size={12}/> حالة الحساب</label>
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                         <button onClick={() => setSelectedStatus('active')} className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${selectedStatus === 'active' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>نشط</button>
                         <button onClick={() => setSelectedStatus('offline')} className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${selectedStatus === 'offline' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>معطل</button>
                      </div>
                   </div>
                </div>

                {/* Section: Permissions Matrix */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-2"><Shield size={14} className="text-emerald-600"/> مصفوفة الصلاحيات المخصصة</label>
                      <button onClick={handleGrantAll} className="text-[9px] font-black text-emerald-600 hover:underline">منح الكل</button>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <button 
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-right group ${selectedPermissions.includes(perm) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-100'}`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${selectedPermissions.includes(perm) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                             {selectedPermissions.includes(perm) && <Check size={12} strokeWidth={4} />}
                          </div>
                          <span className={`text-[11px] font-bold ${selectedPermissions.includes(perm) ? 'text-emerald-700' : 'text-slate-500'}`}>{perm}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 rounded-b-2xl">
                <button onClick={handleSaveEmployeeChanges} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Save size={20}/> حفظ التغييرات والاعتماد
                </button>
                <button onClick={() => setEditingEmployee(null)} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InviteManagement;
