
import React, { useState, useRef, useMemo } from 'react';
import { 
  Settings, Shield, Trash2, Building, Archive, Save, 
  User as UserIcon, Camera, Mail, Key, Briefcase, Eye, 
  EyeOff, Lock, RefreshCw, CheckCircle2, AlertCircle, 
  Smartphone, ShieldCheck, Zap, FileJson, Activity, 
  Plus, Trash, Users, Bell, Globe, Database, 
  ToggleRight, Sliders, HardDrive, ShieldAlert,
  Fingerprint, CreditCard, ChevronDown, Check, X,
  Layout, Building2, Layers, Users2, ArrowRightLeft, LogOut,
  Hash, Phone, Award, GraduationCap
} from 'lucide-react';
import TrashBin from './TrashBin';
import ConfirmModal from './ConfirmModal';
import { Document, Folder, User, Department } from '../types';
import { CURRENT_USER } from '../constants';

interface SettingsPageProps {
  deletedDocs: Document[];
  deletedFolders: Folder[];
  autoOpenFiles: boolean;
  setAutoOpenFiles: (val: boolean) => void;
  onRestoreDoc: (doc: Document) => void;
  onRestoreFolder: (folder: Folder) => void;
  departments: Department[];
  onAddDept: (name: string) => Promise<void>;
  onDeleteDepartment: (id: string, transferToId?: string) => Promise<void>;
  onLogout?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  deletedDocs, deletedFolders, autoOpenFiles, setAutoOpenFiles, 
  onRestoreDoc, onRestoreFolder, departments, onAddDept, onDeleteDepartment, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'trash'>('profile');
  const [avatar, setAvatar] = useState(CURRENT_USER.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDeptName, setNewDeptName] = useState('');
  
  // States for deletion with transfer
  const [deptToDeleteId, setDeptToDeleteId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  
  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    title: 'المدير التنفيذي للعمليات',
    phone: '+964 770 123 4567',
    jobId: 'EMP-2024-001',
    specialization: 'إدارة نظم المعلومات',
    qualification: 'ماجستير علوم حاسوب'
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDeleteDept = async () => {
    if (deptToDeleteId) {
      const targetDept = departments.find(d => d.id === deptToDeleteId);
      const hasEmployees = (targetDept?.employeeCount || 0) > 0;
      
      if (hasEmployees && !transferTargetId) return;

      await onDeleteDepartment(deptToDeleteId, transferTargetId || undefined);
      setDeptToDeleteId(null);
      setTransferTargetId('');
    }
  };

  const selectedDeptForDeletion = departments.find(d => d.id === deptToDeleteId);
  const hasEmployeesInSelected = (selectedDeptForDeletion?.employeeCount || 0) > 0;
  const otherDepartments = departments.filter(d => d.id !== deptToDeleteId);

  const stats = useMemo(() => [
    { label: 'إجمالي الأقسام', value: departments.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'سلة المهملات', value: deletedDocs.length + deletedFolders.length, icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'حالة النظام', value: 'نشط', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'مستوى الأمان', value: 'مرتفع', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' }
  ], [departments, deletedDocs, deletedFolders]);

  const isAdmin = CURRENT_USER.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl">
      {/* Confirm Logout Modal */}
      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="تأكيد الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من هذه المنشأة؟ ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى الأرشيف."
        confirmLabel="نعم، تسجيل الخروج"
        cancelLabel="تراجع"
        type="danger"
        onConfirm={() => onLogout?.()}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Confirm Delete Dept Modal */}
      <ConfirmModal 
        isOpen={!!deptToDeleteId}
        title="حذف القسم الإداري"
        message={
          <div className="space-y-4">
            <p>هل أنت متأكد من حذف قسم <span className="font-black text-slate-800">"{selectedDeptForDeletion?.name}"</span>؟</p>
            
            {hasEmployeesInSelected ? (
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-right space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 text-amber-600 font-black text-xs">
                  <Users2 size={16} /> تنبيه: هذا القسم يحتوي على ({selectedDeptForDeletion?.employeeCount}) موظف.
                </div>
                <p className="text-[11px] font-bold text-amber-700 leading-relaxed">يجب عليك اختيار قسم بديل لنقل هؤلاء الموظفين إليه قبل إتمام عملية الحذف:</p>
                
                <div className="relative">
                  <ArrowRightLeft className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400" size={14} />
                  <select 
                    className="w-full pr-10 pl-4 py-3 bg-white border border-amber-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-amber-500"
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                  >
                    <option value="">اختر القسم البديل...</option>
                    {otherDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">سيتم حذف القسم بشكل نهائي لأنه لا يحتوي على موظفين حالياً.</p>
            )}
          </div>
        }
        confirmLabel={hasEmployeesInSelected ? "نقل الموظفين وحذف القسم" : "نعم، احذف القسم"}
        cancelLabel="تراجع"
        type="danger"
        onConfirm={handleConfirmDeleteDept}
        onCancel={() => {
          setDeptToDeleteId(null);
          setTransferTargetId('');
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100/50 flex items-center justify-center">
             <Settings size={28} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات النظام</h2>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">تخصيص تجربة الأرشفة، إدارة الهوية المؤسسية، والتحكم في قواعد البيانات.</p>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>
              <stat.icon size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/60 p-2 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
          <div className="flex gap-1.5 flex-wrap">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              <UserIcon size={16} /> الملف الشخصي
            </button>
            <button 
              onClick={() => setActiveTab('organization')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'organization' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              <Building size={16} /> إعدادات المنشأة
            </button>
            <button 
              onClick={() => setActiveTab('trash')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'trash' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              <Trash2 size={16} /> سلة المهملات
            </button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center h-fit">
                <div className="relative group mb-6">
                  <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl relative">
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all border-2 border-white">
                    <Camera size={16} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                <h4 className="text-xl font-black text-slate-800">{profileData.name}</h4>
                <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mt-2 border border-emerald-100">{profileData.title}</p>
                
                <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
                   <div className="flex items-center justify-between text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معرف المستخدم</span>
                      <span className="text-[11px] font-bold text-slate-700 tracking-tight">#{CURRENT_USER.id.toUpperCase()}</span>
                   </div>
                   <div className="flex items-center justify-between text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الانضمام</span>
                      <span className="text-[11px] font-bold text-slate-700 tracking-tight">{CURRENT_USER.joinedDate || '2023-01-01'}</span>
                   </div>
                   
                   <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full mt-6 py-3.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100 shadow-sm active:scale-95"
                   >
                     <LogOut size={16} /> الخروج من هذه المنشأة
                   </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><Sliders size={18} className="text-emerald-600" /> البيانات الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم بالكامل</label>
                          <div className="relative">
                             <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="text" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الرقم الوظيفي</label>
                          <div className="relative">
                             <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="text" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10" value={profileData.jobId} onChange={e => setProfileData({...profileData, jobId: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
                          <div className="relative">
                             <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="email" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">رقم الهاتف الرسمي</label>
                          <div className="relative">
                             <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="text" dir="ltr" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 text-right" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">المؤهل العلمي</label>
                          <div className="relative">
                             <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="text" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10" value={profileData.qualification} onChange={e => setProfileData({...profileData, qualification: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">التخصص المهني</label>
                          <div className="relative">
                             <Award className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                             <input type="text" className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500/10" value={profileData.specialization} onChange={e => setProfileData({...profileData, specialization: e.target.value})} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                       <button className="px-10 py-3.5 bg-emerald-600/10 text-emerald-700 rounded-xl font-black text-xs border border-emerald-200/50 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                          <Save size={18} /> حفظ البيانات الشخصية
                       </button>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><ShieldCheck size={18} className="text-indigo-600" /> الصلاحيات الممنوحة</h3>
                       {!isAdmin && (
                         <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 flex items-center gap-1.5 animate-in fade-in">
                            <Lock size={10}/> للقراءة فقط
                         </div>
                       )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                       {isAdmin ? (
                          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm animate-in zoom-in-95">
                             <Zap size={14} className="text-indigo-600" fill="currentColor" />
                             <span className="text-[11px] font-black text-indigo-700 uppercase">صلاحيات مدير النظام الكاملة</span>
                          </div>
                       ) : (
                          <>
                             {(CURRENT_USER.permissions && CURRENT_USER.permissions.length > 0) ? (
                                CURRENT_USER.permissions.map((perm, idx) => (
                                   <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-[11px] font-black text-slate-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                      {perm}
                                   </div>
                                ))
                             ) : (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 text-slate-400 italic">
                                   <Shield size={16} />
                                   <span className="text-[11px] font-bold">لم يتم تعيين صلاحيات مخصصة بعد.</span>
                                </div>
                             )}
                          </>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><Building size={18} className="text-emerald-600" /> هوية المنشأة</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم المنشأة الرسمي</label>
                       <input type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-emerald-500/10" defaultValue="مجموعة الفاو الهندسية" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">رمز تعريف المنشأة</label>
                       <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                          <span className="font-black text-slate-700 tracking-widest">PAPER-7X9Y</span>
                          <span className="text-[8px] font-black text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">رقمي - ثابت</span>
                       </div>
                    </div>
                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                       <div className="flex items-center gap-3">
                          <Globe size={18} className="text-indigo-600" />
                          <h4 className="text-[11px] font-black text-indigo-900">إعدادات النطاق المخصص</h4>
                       </div>
                       <p className="text-[10px] font-bold text-indigo-600/80 leading-relaxed">يمكنك ربط تطبيق Paperless بنطاق بريدي خاص بشركتك لتفعيل تسجيل الدخول الموحد (SSO).</p>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><Building2 size={18} className="text-emerald-600" /> الهيكل التنظيمي (الأقسام)</h3>
                    <div className="flex gap-2">
                       <input type="text" placeholder="اسم القسم الجديد..." className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                       <button onClick={async () => { if(!newDeptName) return; await onAddDept(newDeptName); setNewDeptName(''); }} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all"><Plus size={18}/></button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {departments.map(dept => (
                      <div key={dept.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-emerald-600 transition-colors">
                              <Layout size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-800">{dept.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">{dept.employeeCount || 0} موظف مكلف</p>
                           </div>
                        </div>
                        <button onClick={() => setDeptToDeleteId(dept.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'trash' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><Trash2 size={24} /></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">سجل المحذوفات</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">إدارة الوثائق والأضابير التي تم حذفها مؤخراً.</p>
                  </div>
               </div>
               <TrashBin deletedDocs={deletedDocs} deletedFolders={deletedFolders} onRestoreDoc={onRestoreDoc} onRestoreFolder={onRestoreFolder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
