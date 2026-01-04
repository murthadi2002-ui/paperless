
import React, { useState, useMemo } from 'react';
import { 
  Search, UserPlus, Shield, Check, X, Clock, 
  MoreVertical, Edit2, ShieldAlert, Users, 
  Briefcase, Mail, Calendar, Activity, 
  Trash2, UserX, Settings2, Filter, 
  ArrowUpRight, Info, Save, Archive, FileStack, 
  Settings, LayoutGrid, CheckCircle2, ChevronDown, Copy, Key,
  Radio, UserCheck, Inbox, Layout, Building2
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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'team' | 'requests'>('team');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const orgCode = "PAPER-7X9Y"; 

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

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    online: employees.filter(e => e.status === 'active').length, // Simplified for mock
    pending: joinRequests.length,
    departmentCount: departments.length
  }), [employees, joinRequests, departments]);

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

  const handleAcceptRequest = async (id: string) => {
    await onUpdateEmployee(id, { status: 'active' });
  };

  const handleRejectRequest = async (id: string) => {
    // For mock purpose, we just change status or keep as is. Logic could delete.
    await onUpdateEmployee(id, { status: 'offline' }); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 text-right" dir="rtl" onClick={() => setActiveMenu(null)}>
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
             <Users size={24} />
           </div>
           <div>
             <h2 className="text-xl font-black text-slate-900">إدارة القوى العاملة</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">نظام إدارة صلاحيات الوصول، مراقبة النشاط، وتوسيع فريق العمل</p>
           </div>
        </div>
        
        {/* Org Code Chip */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-700 shadow-xl self-start md:self-auto">
          <div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">رمز الانضمام</p>
            <p className="text-sm font-black tracking-widest leading-normal mt-0.5">{orgCode}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(orgCode)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards Row - Based on provided image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الفريق', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'متصل الآن', value: stats.online, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'طلبات الانضمام', value: stats.pending, icon: Inbox, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'الأقسام المتاحة', value: stats.departmentCount, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{String(stat.value).padStart(2, '0')}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Pane */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between bg-white/50 p-2 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex gap-1">
              <button onClick={() => setActiveTab('team')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'team' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>الفريق الحالي</button>
              <button onClick={() => setActiveTab('requests')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
                طلبات الانضمام 
                {stats.pending > 0 && <span className={`w-1.5 h-1.5 rounded-full bg-red-400 ${activeTab === 'requests' ? 'bg-white' : ''}`}></span>}
              </button>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="بحث بالاسم أو القسم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-9 pl-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none shadow-sm" />
            </div>
          </div>

          {activeTab === 'team' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={emp.avatar} alt="" className="w-12 h-12 rounded-xl border-2 border-white shadow-md object-cover" />
                        <div className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-tight">{emp.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{emp.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleOpenEdit(emp)} className="p-1.5 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">القسم</p>
                       <p className="text-[10px] font-black text-slate-700 truncate">{emp.department || 'غير محدد'}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">المنصب</p>
                       <p className="text-[10px] font-black text-slate-700 truncate">{positions.find(p=>p.id===emp.positionId)?.name || 'موظف'}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex flex-wrap gap-1">
                        {(emp.permissions || []).slice(0, 2).map((p, idx) => (
                           <span key={idx} className="text-[7px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100">{p}</span>
                        ))}
                     </div>
                     <span className="text-[8px] font-bold text-slate-400">{emp.lastActive}</span>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-300 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs font-black">لا يوجد موظفون يطابقون البحث</p>
                </div>
              )}
            </div>
          ) : (
            /* Join Requests Tab - Based on Image concept */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Inbox size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-800">طلبات الالتحاق المعلقة</h3>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400">تتم مراجعة الطلبات يدوياً للموافقة على الانضمام</p>
              </div>
              <div className="divide-y divide-slate-100">
                {joinRequests.map(req => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={req.avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" alt="" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{req.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400">{req.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                           <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                             <Calendar size={10} /> {req.joinedDate}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-[10px] font-black transition-all">رفض الطلب</button>
                       <button onClick={() => handleAcceptRequest(req.id)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all hover:bg-emerald-700">
                          <Check size={14} /> الموافقة والتعيين
                       </button>
                    </div>
                  </div>
                ))}
                {joinRequests.length === 0 && (
                  <div className="py-20 text-center text-slate-300">
                    <Inbox size={48} className="mx-auto opacity-10 mb-4" />
                    <p className="text-xs font-black">لا توجد طلبات انضمام حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setEditingEmployee(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
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
                   <button onClick={handleSaveEmployeeChanges} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">حفظ التغييرات</button>
                   <button onClick={() => setEditingEmployee(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InviteManagement;
