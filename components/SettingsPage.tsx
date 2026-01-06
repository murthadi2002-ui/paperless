import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Settings, Shield, Trash2, Building, Save, User as UserIcon, Camera, Mail, Hash, Phone, GraduationCap, Award, Activity, ShieldCheck, Building2, Layout, Trash, LogOut, Sliders, Crown, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import TrashBin from './TrashBin';
import ConfirmModal from './ConfirmModal';
import { Document, Folder, User, Department } from '../types';

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
  onLeaveOrganization?: () => void;
  currentUser: User | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  deletedDocs, deletedFolders, autoOpenFiles, setAutoOpenFiles, 
  onRestoreDoc, onRestoreFolder, departments, onAddDept, onDeleteDepartment, onLogout, onLeaveOrganization, currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'subscription' | 'trash'>('profile');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [deptToDeleteId, setDeptToDeleteId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    title: 'موظف في المنشأة',
    phone: '',
    jobId: '',
    specialization: '',
    qualification: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email
      }));
      setAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const stats = useMemo(() => [
    { label: 'إجمالي الأقسام', value: departments.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'سلة المهملات', value: deletedDocs.length + deletedFolders.length, icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'حالة النظام', value: 'نشط', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'مستوى الأمان', value: 'مرتفع', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' }
  ], [departments, deletedDocs, deletedFolders]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-right" dir="rtl">
      {/* مودال تأكيد تسجيل الخروج العادي */}
      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="تأكيد الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟"
        confirmLabel="نعم، تسجيل الخروج"
        cancelLabel="تراجع"
        type="danger"
        onConfirm={() => onLogout?.()}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* مودال تأكيد الخروج من المنشأة نهائياً */}
      <ConfirmModal 
        isOpen={showLeaveConfirm}
        title="مغادرة المنشأة نهائياً"
        message={
          <div className="space-y-2">
            <p>سيتم فك ارتباط حسابك بهذه المنشأة ومسح كافة صلاحياتك.</p>
            <p className="text-red-500 font-black">تحتاج لرمز دعوة جديد للعودة مرة أخرى لهذه المنشأة.</p>
          </div>
        }
        confirmLabel="نعم، مغادرة المنشأة"
        cancelLabel="إلغاء"
        type="danger"
        onConfirm={() => onLeaveOrganization?.()}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-center">
             <Settings size={28} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات النظام</h2>
             <p className="text-[11px] text-slate-400 font-bold tracking-wider mt-0.5">تخصيص تجربة الأرشفة والتحكم في حسابك.</p>
           </div>
        </div>
      </div>

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

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/60 p-2 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 flex-nowrap whitespace-nowrap">
            <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              <UserIcon size={16} /> الملف الشخصي
            </button>
            <button onClick={() => setActiveTab('organization')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'organization' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              <Building size={16} /> إعدادات المنشأة
            </button>
            <button onClick={() => setActiveTab('trash')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'trash' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              <Trash2 size={16} /> سلة المهملات
            </button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center h-fit">
                <div className="relative group mb-6">
                  <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl">
                    <img src={avatar || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-800">{profileData.name}</h4>
                <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mt-2 border border-emerald-100">{profileData.title}</p>
                <div className="w-full space-y-2 mt-6">
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200">
                    <LogOut size={16} /> تسجيل الخروج من الحساب
                  </button>
                  <button onClick={() => setShowLeaveConfirm(true)} className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100">
                    <Trash size={16} /> الخروج من هذه المنشأة نهائياً
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><Sliders size={18} className="text-emerald-600" /> البيانات الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم بالكامل</label>
                          <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" value={profileData.name} readOnly />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
                          <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" value={profileData.email} readOnly />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-3"><Building2 size={18} className="text-emerald-600" /> الهيكل التنظيمي (الأقسام)</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {departments.map(dept => (
                      <div key={dept.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <p className="text-xs font-black text-slate-800">{dept.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{dept.employeeCount || 0} موظف</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'trash' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <TrashBin deletedDocs={deletedDocs} deletedFolders={deletedFolders} onRestoreDoc={onRestoreDoc} onRestoreFolder={onRestoreFolder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;