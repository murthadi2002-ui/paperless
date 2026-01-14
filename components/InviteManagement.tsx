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
  onUpdateEmployee: (id: string, updates: Partial<User>) => Promise<void>;
  onKickEmployee: (id: string) => Promise<void>;
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

const InviteManagement: React.FC<InviteManagementProps> = ({ departments, employees, onUpdateEmployee, onKickEmployee, positions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee'>('employee');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'offline' | 'pending'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'team' | 'requests'>('team');

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      e.status !== 'pending'
    );
  }, [employees, searchTerm]);

  const joinRequests = useMemo(() => {
    return employees.filter(e => e.status === 'pending');
  }, [employees]);

  const handleOpenEdit = (emp: User) => {
    setEditingEmployee(emp);
    setSelectedDept(emp.department || '');
    setSelectedPosId(emp.positionId || '');
    setSelectedRole(emp.role);
    setSelectedStatus(emp.status || 'active');
    setSelectedPermissions(emp.permissions || []);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => {
      if (perm === VIEW_ONLY_PERM) return prev.includes(perm) ? [] : [VIEW_ONLY_PERM];
      const newList = prev.filter(p => p !== VIEW_ONLY_PERM);
      return newList.includes(perm) ? newList.filter(p => p !== perm) : [...newList, perm];
    });
  };

  const handleSaveEmployeeChanges = async () => {
    if (editingEmployee) {
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
    <div className="space-y-6 animate-in fade-in duration-700 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-center"><Users size={28} /></div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">إدارة القوى العاملة</h2>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">تحكم كامل في صلاحيات الوصول للزملاء الحقيقيين.</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
          <div className="flex gap-1.5">
            <button onClick={() => setActiveTab('team')} className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}><Users size={16} /> الفريق الحالي</button>
            <button onClick={() => setActiveTab('requests')} className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}><UserPlus size={16} /> طلبات الانضمام {joinRequests.length > 0 && <span className="w-2 h-2 rounded-full bg-red-400"></span>}</button>
          </div>
          <div className="relative w-72"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input type="text" placeholder="بحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none shadow-inner" /></div>
        </div>

        {activeTab === 'team' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={emp.avatar} className="w-14 h-14 rounded-xl object-cover ring-4 ring-slate-50" />
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{emp.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenEdit(emp)} className="p-2 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">القسم</p><p className="text-[11px] font-black text-slate-700 truncate">{emp.department || 'عام'}</p></div>
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">الدور</p><p className="text-[11px] font-black text-slate-700 truncate">{emp.role === 'admin' ? 'مدير نظام' : 'موظف'}</p></div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                   <div className="flex flex-wrap gap-1.5">
                      {(emp.permissions || []).map((p, idx) => <span key={idx} className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100/50">{p}</span>)}
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <button onClick={() => handleOpenEdit(emp)} className="text-[9px] font-black text-emerald-600 flex items-center gap-1.5">تعديل الصلاحيات <ArrowUpRight size={10}/></button>
                     <button onClick={() => onKickEmployee(emp.id)} className="text-[9px] font-black text-red-400 hover:text-red-600">طرد من المنشأة</button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-black text-slate-800">طلبات الالتحاق الحقيقية</h3></div>
            <div className="divide-y divide-slate-100">
              {joinRequests.map(req => (
                <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={req.avatar} className="w-14 h-14 rounded-xl object-cover ring-4 ring-slate-50" />
                    <div><h4 className="text-sm font-black text-slate-800 leading-tight">{req.name}</h4><p className="text-[10px] font-bold text-slate-400 mt-0.5">{req.email}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => onKickEmployee(req.id)} className="px-6 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-black">رفض</button>
                     <button onClick={() => handleOpenEdit(req)} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-black shadow-lg flex items-center gap-2">القبول وتعيين الصلاحيات</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingEmployee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 pt-20" onClick={() => setEditingEmployee(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4"><div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg"><UserCog size={22} /></div><div><h3 className="text-lg font-black text-slate-800">تعديل ملف الموظف</h3><p className="text-[10px] font-bold text-slate-400 uppercase">{editingEmployee.name}</p></div></div>
               <button onClick={() => setEditingEmployee(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><X size={20}/></button>
             </div>
             <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400">القسم</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>{departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400">الدور</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={selectedRole} onChange={e => setSelectedRole(e.target.value as any)}><option value="employee">موظف</option><option value="admin">مدير</option></select></div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400">مصفوفة الصلاحيات</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <button key={perm} onClick={() => togglePermission(perm)} className={`flex items-center gap-2.5 p-3 rounded-xl border text-right ${selectedPermissions.includes(perm) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedPermissions.includes(perm) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{selectedPermissions.includes(perm) && <Check size={12} strokeWidth={4} />}</div>
                          <span className={`text-[11px] font-bold ${selectedPermissions.includes(perm) ? 'text-emerald-700' : 'text-slate-500'}`}>{perm}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 rounded-b-2xl">
                <button onClick={handleSaveEmployeeChanges} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2">تأكيد الاعتماد</button>
                <button onClick={() => setEditingEmployee(null)} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InviteManagement;