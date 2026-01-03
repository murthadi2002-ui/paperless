
import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Shield, Check, X, Clock, 
  MoreVertical, Edit2, ShieldAlert, Users, 
  Briefcase, Mail, Calendar, Activity, 
  Trash2, UserX, Settings2, Filter, 
  ArrowUpRight, Info, Save, Archive, FileStack, 
  Settings, LayoutGrid, CheckCircle2, ChevronDown, Copy, Key
} from 'lucide-react';
import { User, Department, Position } from '../types';

interface InviteManagementProps {
  departments: Department[];
  employees: User[];
  onInvite: (user: User) => Promise<void>;
  onUpdateEmployee: (id: string, updates: Partial<User>) => Promise<void>;
  positions: Position[];
}

const InviteManagement: React.FC<InviteManagementProps> = ({ departments, employees, onInvite, onUpdateEmployee, positions }) => {
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'team' | 'invites'>('team');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const orgCode = "PAPER-7X9Y"; 

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
      setSelectedDept(departments[0]?.name || '');
    }, 800);
  };

  const handleOpenEdit = (emp: User) => {
    setEditingEmployee(emp);
    setSelectedDept(emp.department || '');
    setSelectedPosId(emp.positionId || '');
    setActiveMenu(null);
  };

  const handleSaveEmployeeChanges = async () => {
    if (editingEmployee) {
      const pos = positions.find(p => p.id === selectedPosId);
      await onUpdateEmployee(editingEmployee.id, {
        department: selectedDept,
        positionId: selectedPosId,
        permissions: pos ? pos.permissions : editingEmployee.permissions
      });
      setEditingEmployee(null);
    }
  };

  const handleSendInvite = async () => {
    if (!foundUser || !selectedPosId) return;
    const pos = positions.find(p => p.id === selectedPosId);
    const newEmp: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 5),
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar,
      role: 'employee',
      organizationId: 'org-1',
      department: selectedDept,
      positionId: selectedPosId,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'لم يسجل دخول بعد',
      permissions: pos ? pos.permissions : []
    };
    await onInvite(newEmp);
    setFoundUser(null);
    setEmail('');
    setActiveTab('team');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl" onClick={() => setActiveMenu(null)}>
      {/* Edit Overlay */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setEditingEmployee(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
               <Settings2 className="text-emerald-600" /> تعديل بيانات الموظف
             </h3>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">القسم</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المنصب الوظيفي</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" value={selectedPosId} onChange={e => setSelectedPosId(e.target.value)}>
                    <option value="">اختر منصباً...</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="pt-6 flex gap-3">
                   <button onClick={handleSaveEmployeeChanges} className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">حفظ التغييرات</button>
                   <button onClick={() => setEditingEmployee(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Page Title & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
               <Users size={28} />
             </div>
             <h2 className="text-3xl font-extrabold text-slate-900">إدارة الكوادر</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md pr-1">تحكم في التعيينات، ربط الموظفين بالمناصب، ومراقبة نشاط الفريق.</p>
        </div>

        <div className="bg-emerald-900 p-6 rounded-[2.5rem] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden group border border-emerald-800">
           <div>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">رمز الانضمام للمنشأة</p>
              <h3 className="text-2xl font-black tracking-widest">{orgCode}</h3>
           </div>
           <button onClick={() => navigator.clipboard.writeText(orgCode)} className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white hover:text-emerald-900 transition-all border border-white/10 shadow-inner">
             <Copy size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button onClick={() => setActiveTab('team')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>الفريق الحالي</button>
              <button onClick={() => setActiveTab('invites')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><UserPlus size={16} />دعوة موظف</button>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="بحث سريع..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" />
            </div>
          </div>

          {activeTab === 'team' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <img src={emp.avatar} alt="" className="w-16 h-16 rounded-3xl border-4 border-white shadow-md object-cover" />
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-800 leading-tight">{emp.name}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1">{emp.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleOpenEdit(emp)} className="p-2.5 text-slate-300 hover:text-emerald-600 rounded-xl transition-all"><Edit2 size={20} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">القسم</p>
                       <p className="text-xs font-black text-slate-700 truncate">{emp.department || 'غير محدد'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">المنصب</p>
                       <p className="text-xs font-black text-slate-700 truncate">{positions.find(p=>p.id===emp.positionId)?.name || 'موظف'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{emp.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <h3 className="text-2xl font-black text-slate-900 mb-2">دعوة موظف جديد</h3>
               <p className="text-slate-400 text-sm mb-10 font-bold">اربط كفاءات جديدة بمنظومة الأرشفة مع تعيين المنصب المناسب.</p>
               <div className="relative mb-6 group">
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني للموظف..." className="w-full pr-10 pl-40 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-xl outline-none focus:border-emerald-500 transition-all font-bold" />
                 <button onClick={handleSearch} className="absolute left-3 top-3 bottom-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[1.2rem] font-bold shadow-lg" disabled={!email.includes('@')}>بحث</button>
               </div>
               
               {foundUser && (
                 <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-in slide-in-from-top-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <img src={foundUser.avatar} className="w-14 h-14 rounded-2xl border-4 border-white shadow-sm" alt="" />
                       <div><h4 className="font-black text-slate-800">{foundUser.name}</h4><p className="text-xs font-bold text-slate-400">{foundUser.email}</p></div>
                    </div>
                    <div className="flex gap-4">
                       <select className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold" value={selectedPosId} onChange={e=>setSelectedPosId(e.target.value)}>
                         <option value="">اختر منصباً...</option>
                         {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                       <button onClick={handleSendInvite} className="bg-emerald-600 text-white px-8 py-2 rounded-xl text-xs font-black shadow-lg">إرسال الدعوة</button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-fit">
           <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert size={18} className="text-emerald-600" /> ملخص الهيكل الإداري</h3>
           <div className="space-y-5">
              {[
                { label: 'إجمالي الموظفين', value: stats.total, color: 'text-emerald-600' },
                { label: 'أقسام مفعلة', value: stats.departmentCount, color: 'text-emerald-600' },
                { label: 'بانتظار الانضمام', value: stats.pending, color: 'text-amber-600' }
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                   <span className="text-xs font-black text-slate-500 uppercase">{row.label}</span>
                   <span className={`text-2xl font-black ${row.color}`}>{String(row.value).padStart(2, '0')}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
export default InviteManagement;
