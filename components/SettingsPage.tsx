
import React, { useState, useRef } from 'react';
import { 
  Settings, Shield, Trash2, Building, Archive, Save, 
  Bell, Globe, Database, FileText, User as UserIcon, 
  Camera, Mail, Key, Briefcase, Eye, EyeOff, Lock, 
  RefreshCw, CheckCircle2, AlertCircle, Smartphone,
  MapPin, Globe2, Clock, ShieldCheck, Zap, FileJson,
  Layout, Palette, Languages, Activity, Info, Plus, Trash,
  Users
} from 'lucide-react';
import TrashBin from './TrashBin';
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
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  onDeleteDepartment: (id: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  deletedDocs, deletedFolders, autoOpenFiles, setAutoOpenFiles, 
  onRestoreDoc, onRestoreFolder, departments, setDepartments, onDeleteDepartment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'general' | 'archiving' | 'trash'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(CURRENT_USER.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDeptName, setNewDeptName] = useState('');

  // Form States for richness
  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    title: 'كبير مهندسي الأرشفة',
    phone: '+964 770 000 0000',
    lang: 'ar'
  });

  const [orgData, setOrgData] = useState({
    name: 'شركة الحلول الهندسية المحدودة',
    taxId: '123456789-001',
    address: 'بغداد، حي المنصور، عمارة البركة',
    website: 'www.engineering-solutions.iq'
  });

  const settingsTabs = [
    { id: 'profile', label: 'الصفحة الشخصية', icon: UserIcon },
    { id: 'general', label: 'إعدادات المنشأة', icon: Building },
    { id: 'archiving', label: 'قواعد الأرشفة', icon: Archive },
    { id: 'trash', label: 'سلة المهملات', icon: Trash2, count: deletedDocs.length + deletedFolders.length },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept: Department = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDeptName.trim(),
      employeeCount: 0
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                  activeSubTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeSubTab === tab.id ? 'bg-white/20 border-white/20 text-white' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group hidden lg:block">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
            <h4 className="font-black text-sm mb-4 flex items-center gap-2 relative z-10">
              <ShieldCheck size={18} className="text-emerald-400" />
              أمن المعلومات
            </h4>
            <p className="text-[11px] text-emerald-100/70 leading-relaxed font-bold mb-6 relative z-10">
              جميع البيانات في Paperless مشفرة بمعايير AES-256. نحن نضمن سلامة وثائقك الرسمية.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-800/50 p-3 rounded-xl relative z-10 border border-emerald-700/50">
               <Clock size={14} />
               آخر دخول: منذ 5 دقائق من بغداد
            </div>
          </div>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm overflow-hidden flex flex-col min-h-[750px] transition-all relative">
          
          {/* الصفحة الشخصية */}
          {activeSubTab === 'profile' && (
            <div className="p-8 lg:p-14 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <div className="flex flex-col md:flex-row gap-12 items-center border-b border-slate-100 pb-12">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl ring-1 ring-slate-100">
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-2xl hover:bg-emerald-700 transition-all border-4 border-white active:scale-90"
                  >
                    <Camera size={22} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-right">
                   <div>
                     <h3 className="text-3xl font-black text-slate-900">{profileData.name}</h3>
                     <p className="text-emerald-600 font-black text-sm mt-1 uppercase tracking-widest">{profileData.title}</p>
                   </div>
                   <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                     <span className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm flex items-center gap-2">
                       <Shield size={14} /> {CURRENT_USER.role === 'admin' ? 'مدير عام النظام' : 'موظف أرشفة'}
                     </span>
                     <span className="px-5 py-2 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-slate-100 shadow-sm flex items-center gap-2">
                       <Briefcase size={14} /> {CURRENT_USER.department}
                     </span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {/* Personal Information Form */}
                <div className="space-y-8">
                  <h4 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserIcon size={20} /></div>
                    المعلومات الشخصية
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2 uppercase">الاسم الكامل</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800" defaultValue={profileData.name} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2 uppercase">المسمى الوظيفي</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800" defaultValue={profileData.title} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2 uppercase">رقم الهاتف</label>
                      <div className="relative">
                        <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800" defaultValue={profileData.phone} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences & Security */}
                <div className="space-y-8">
                  <h4 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Lock size={20} /></div>
                    تفضيلات النظام والأمان
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2 uppercase">لغة الواجهة</label>
                      <div className="relative">
                        <Languages className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 appearance-none">
                          <option value="ar">العربية (الافتراضية)</option>
                          <option value="en">English (Coming Soon)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2 uppercase">كلمة المرور الحالية</label>
                      <div className="relative">
                        <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type={showPassword ? "text" : "password"} className="w-full pr-14 pl-14 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-[1.2rem] border border-emerald-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><ShieldCheck size={20} /></div>
                         <div>
                            <p className="text-xs font-black text-emerald-900">المصادقة الثنائية (2FA)</p>
                            <p className="text-[10px] font-bold text-emerald-600">غير مفعلة حالياً</p>
                         </div>
                       </div>
                       <button className="text-xs font-black text-emerald-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">تفعيل الآن</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Activity size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold">آخر تحديث للملف: 12 آذار 2024</p>
                </div>
                <button className="w-full sm:w-auto px-16 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <Save size={22} /> حفظ التغييرات الشخصية
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'general' && (
            <div className="p-8 lg:p-14 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <div className="border-b border-slate-100 pb-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-300 hover:text-emerald-300 transition-all cursor-pointer group">
                   <Building size={32} />
                   <span className="text-[10px] font-black mt-2">شعار المنشأة</span>
                </div>
                <div className="flex-1 text-center md:text-right space-y-2">
                  <h3 className="text-3xl font-black text-slate-900">إعدادات المنشأة</h3>
                  <p className="text-slate-500 font-bold">تخصيص معلومات الهوية القانونية والتواصل للشركة</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={16} /> المعلومات القانونية
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">اسم المؤسسة الرسمي</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] font-black text-slate-800 outline-none" defaultValue={orgData.name} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الرقم الضريبي / السجل التجاري</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] font-black text-slate-800 outline-none" defaultValue={orgData.taxId} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} /> معلومات الاتصال
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">العنوان الفعلي</label>
                      <div className="relative">
                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] font-black text-slate-800 outline-none" defaultValue={orgData.address} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الموقع الإلكتروني</label>
                      <div className="relative">
                        <Globe2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] font-black text-slate-800 outline-none" defaultValue={orgData.website} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* أقسام المنشأة */}
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="font-black text-slate-900 flex items-center gap-3">
                      <Users size={22} className="text-emerald-600" />
                      أقسام المنشأة
                   </h4>
                   <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="اسم القسم الجديد..." 
                        className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                      />
                      <button 
                        onClick={addDepartment}
                        className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {departments.map(dept => (
                      <div key={dept.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                               <Briefcase size={16} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-800">{dept.name}</p>
                               <p className="text-[10px] font-bold text-slate-400">{dept.employeeCount} موظف</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => onDeleteDepartment(dept.id)}
                            className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                         >
                            <Trash size={14} />
                         </button>
                      </div>
                   ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
                <h4 className="font-black text-slate-900 mb-8 flex items-center gap-3">
                   <Palette size={22} className="text-emerald-600" />
                   تجربة المستخدم والعرض
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div>
                        <p className="text-sm font-black text-slate-800">فتح الملفات تلقائياً</p>
                        <p className="text-[10px] font-bold text-slate-400">فتح الوثيقة في تبويبة جديدة عند التحميل</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={autoOpenFiles} onChange={(e) => setAutoOpenFiles(e.target.checked)} />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                      </label>
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-16 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3">
                  <Save size={22} /> حفظ الإعدادات العامة
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'archiving' && (
            <div className="p-8 lg:p-14 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <div className="border-b border-slate-100 pb-10 flex flex-col md:flex-row items-center gap-8">
                <div className="p-6 bg-emerald-100 text-emerald-600 rounded-[2rem] shadow-xl">
                   <Archive size={40} />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-3xl font-black text-slate-900">قواعد الأرشفة الذكية</h3>
                  <p className="text-slate-500 font-bold">تحكم في منطق الترقيم، التصنيف، وسياسات الحذف الآلي</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <h4 className="font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FileJson size={20} /></div>
                    تنسيق الأرقام المرجعية
                  </h4>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 mr-2">البادئة الرقمية (Prefix)</label>
                       <input type="text" className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-emerald-600 text-center text-xl outline-none shadow-sm" defaultValue="PRL-" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 mr-2">رقم البداية</label>
                          <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-center outline-none shadow-sm" defaultValue="1000" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 mr-2">اللاحقة (Suffix)</label>
                          <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-center outline-none shadow-sm" defaultValue="2024" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Database size={20} /></div>
                    سياسة التخزين والحذف
                  </h4>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 mr-2">مدة البقاء في سلة المهملات</label>
                       <div className="flex items-center gap-4">
                         <input type="number" className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-center text-xl outline-none shadow-sm" defaultValue="60" />
                         <span className="text-sm font-black text-slate-400">يوم</span>
                       </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                       <div className="flex items-center justify-between p-2">
                         <div>
                            <p className="text-xs font-black text-slate-700">النسخ الاحتياطي السحابي</p>
                            <p className="text-[10px] font-bold text-slate-400">تزامن تلقائي كل 24 ساعة</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer scale-90">
                            <input type="checkbox" className="sr-only peer" checked />
                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                         </label>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-emerald-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md">
                       <Zap size={32} className="text-emerald-400" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black">تقنيات الذكاء الاصطناعي (OCR)</h4>
                       <p className="text-emerald-100/70 text-xs font-bold mt-1">تفعيل الاستخراج التلقائي للنصوص من الصور والماسحات الضوئية</p>
                    </div>
                 </div>
                 <button className="px-10 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-emerald-400 transition-all active:scale-95 relative z-10">إعدادات الـ AI المتقدمة</button>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-16 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3">
                  <RefreshCw size={22} /> تحديث القواعد الذكية
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'trash' && (
            <div className="p-8 lg:p-14 animate-in slide-in-from-bottom-6 duration-500 h-full flex flex-col">
              <div className="mb-12 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-8 gap-6">
                <div className="text-center md:text-right">
                  <h3 className="text-3xl font-black text-slate-900">إدارة سلة المهملات</h3>
                  <p className="text-slate-500 font-bold mt-1">استعراض واستعادة العناصر المحذوفة خلال آخر 60 يوماً</p>
                </div>
                { (deletedDocs.length > 0 || deletedFolders.length > 0) && (
                   <button className="flex items-center gap-3 text-red-600 text-sm font-black bg-red-50 hover:bg-red-100 px-8 py-4 rounded-[1.5rem] transition-all border border-red-100 shadow-xl shadow-red-50 active:scale-95">
                     <Trash2 size={22} /> إفراغ السلة نهائياً
                   </button>
                )}
              </div>
              <div className="flex-1 min-h-[400px]">
                <TrashBin 
                  deletedDocs={deletedDocs} 
                  deletedFolders={deletedFolders} 
                  onRestoreDoc={onRestoreDoc} 
                  onRestoreFolder={onRestoreFolder} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
