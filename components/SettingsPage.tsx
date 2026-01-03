
import React, { useState, useRef } from 'react';
import { 
  Settings, Shield, Trash2, Building, Archive, Save, 
  User as UserIcon, Camera, Mail, Key, Briefcase, Eye, 
  EyeOff, Lock, RefreshCw, CheckCircle2, AlertCircle, 
  Smartphone, ShieldCheck, Zap, FileJson, Activity, 
  Plus, Trash, Users, Bell, Globe, Database, 
  ToggleRight, Sliders, HardDrive, ShieldAlert
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

const LogoP = ({ size = 20 }: { size?: number }) => (
  <div 
    className="bg-emerald-600 text-white rounded-lg shadow-sm flex items-center justify-center font-black"
    style={{ width: size * 1.6, height: size * 1.6, fontSize: size }}
  >
    P
  </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  deletedDocs, deletedFolders, autoOpenFiles, setAutoOpenFiles, 
  onRestoreDoc, onRestoreFolder, departments, setDepartments, onDeleteDepartment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'general' | 'archiving' | 'trash'>('profile');
  const [avatar, setAvatar] = useState(CURRENT_USER.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDeptName, setNewDeptName] = useState('');

  // Profile Data States
  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    title: 'المدير التنفيذي للتقنية',
    phone: '+964 770 123 4567',
    notifEmail: true,
    notifBrowser: true
  });

  // Archive Rules States
  const [archiveRules, setArchiveRules] = useState({
    ocrEnabled: true,
    autoSummarize: true,
    retentionDays: 60,
    compressionLevel: 'high'
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const SectionHeader = ({ title, icon: Icon, desc }: any) => (
    <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-8">
      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] shadow-inner">
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900">{title}</h3>
        <p className="text-slate-400 font-bold text-sm mt-1">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-5 rounded-[2.8rem] border border-slate-200 shadow-sm space-y-1">
            {[
              { id: 'profile', label: 'الملف الشخصي', icon: UserIcon, desc: 'إدارة الهوية والبيانات' },
              { id: 'general', label: 'إعدادات المنشأة', icon: Building, desc: 'الهيكل الإداري والأقسام' },
              { id: 'archiving', label: 'قواعد الأرشفة', icon: Archive, desc: 'محرك الذكاء والـ OCR' },
              { id: 'trash', label: 'سلة المهملات', icon: Trash2, desc: 'استعادة المحذوفات', count: deletedDocs.length + deletedFolders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.8rem] transition-all group ${
                  activeSubTab === tab.id ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${activeSubTab === tab.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                    <tab.icon size={18} />
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black">{tab.label}</p>
                    <p className={`text-[10px] font-bold opacity-60 ${activeSubTab === tab.id ? 'text-emerald-50' : ''}`}>{tab.desc}</p>
                  </div>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === tab.id ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-8 bg-emerald-900 rounded-[2.8rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <ShieldCheck size={32} className="text-emerald-400 mb-6 relative z-10" />
            <h4 className="text-sm font-black mb-3 relative z-10">تشفير البيانات AES-256</h4>
            <p className="text-[11px] text-emerald-100/60 leading-relaxed font-bold relative z-10">
              جميع وثائقك ومعلوماتك الشخصية مؤمنة بأعلى معايير التشفير العسكري لضمان الخصوصية التامة.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm overflow-hidden min-h-[750px] relative transition-all duration-500">
          
          {/* 1. Profile Tab */}
          {activeSubTab === 'profile' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <SectionHeader title="الملف الشخصي" icon={UserIcon} desc="تحديث صورتك وبياناتك الشخصية" />
              
              <div className="flex flex-col md:flex-row gap-16 items-start">
                <div className="relative group mx-auto md:mx-0">
                  <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl relative">
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all border-4 border-white active:scale-90">
                    <Camera size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">الاسم الكامل</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">المسمى الوظيفي</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={profileData.title} onChange={e => setProfileData({...profileData, title: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">البريد الإلكتروني</label>
                    <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">رقم الهاتف</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-10 border-t border-slate-50">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Lock size={16} className="text-emerald-600" /> تغيير كلمة المرور</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input type="password" placeholder="كلمة المرور الحالية" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] font-bold text-sm outline-none" />
                  <input type="password" placeholder="كلمة المرور الجديدة" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] font-bold text-sm outline-none" />
                  <button className="bg-slate-900 text-white rounded-[1.2rem] font-black text-[11px] hover:bg-slate-800 transition-all">تحديث المرور</button>
                </div>
              </div>

              <div className="flex justify-end pt-12">
                <button className="px-16 py-4 bg-emerald-600 text-white rounded-[1.8rem] font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95">
                  <Save size={20} /> حفظ كافة التغييرات
                </button>
              </div>
            </div>
          )}

          {/* 2. General Settings */}
          {activeSubTab === 'general' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <SectionHeader title="إعدادات المنشأة" icon={Building} desc="التحكم في الهوية التنظيمية وهيكل الأقسام" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">اسم المنشأة / المؤسسة</label>
                      <div className="relative">
                        <Building className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600/30" size={20} />
                        <input type="text" className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-800 outline-none" defaultValue="المنشأة الوطنية للتطوير" />
                      </div>
                   </div>
                   <div className="p-8 bg-emerald-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                      <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">كود المنشأة الخاص</p>
                      <h3 className="text-3xl font-black tracking-widest">PAPER-7X9Y</h3>
                      <p className="text-[9px] text-emerald-100/40 mt-4 font-bold">شارك هذا الرمز مع الموظفين الجدد ليتمكنوا من طلب الانضمام لفريق عملك.</p>
                   </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col h-full">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> إدارة الأقسام</h4>
                  <div className="flex-1 space-y-3 mb-8 overflow-y-auto max-h-[300px] px-2 custom-scrollbar">
                    {departments.map(dept => (
                      <div key={dept.id} className="bg-white p-4 px-6 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
                        <span className="text-sm font-black text-slate-700">{dept.name}</span>
                        <button onClick={() => onDeleteDepartment(dept.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="اسم القسم الجديد..." className="flex-1 px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                    <button onClick={() => { if(!newDeptName) return; setDepartments([...departments, {id: Math.random().toString(), name: newDeptName, employeeCount: 0}]); setNewDeptName(''); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700"><Plus size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Archiving Rules */}
          {activeSubTab === 'archiving' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <SectionHeader title="قواعد الأرشفة الذكية" icon={Archive} desc="تخصيص محركات الذكاء الاصطناعي ومعالجة الملفات" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {[
                    { id: 'ocr', label: 'تفعيل التعرف على النصوص OCR', icon: Zap, state: archiveRules.ocrEnabled, desc: 'تحويل الصور الممسوحة إلى نصوص قابلة للبحث.' },
                    { id: 'summary', label: 'التلخيص التلقائي للمحتوى', icon: FileJson, state: archiveRules.autoSummarize, desc: 'إنشاء ملخص ذكي لمحتوى الكتاب فور أرشفته.' },
                    { id: 'autoOpen', label: 'فتح الملفات تلقائياً عند المعاينة', icon: Sliders, state: autoOpenFiles, desc: 'تسريع عملية المراجعة بفتح المرفقات مباشرة.' },
                  ].map((rule) => (
                    <div key={rule.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all cursor-pointer group" onClick={() => {
                      if(rule.id === 'ocr') setArchiveRules({...archiveRules, ocrEnabled: !archiveRules.ocrEnabled});
                      if(rule.id === 'summary') setArchiveRules({...archiveRules, autoSummarize: !archiveRules.autoSummarize});
                      if(rule.id === 'autoOpen') setAutoOpenFiles(!autoOpenFiles);
                    }}>
                      <div className={`p-4 rounded-2xl shadow-inner transition-all ${rule.state ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300'}`}>
                        <rule.icon size={22} />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-black text-slate-800">{rule.label}</h5>
                          <div className={`w-10 h-6 rounded-full transition-all relative ${rule.state ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rule.state ? 'left-1' : 'left-5'}`}></div>
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={16} className="text-emerald-600" /> سياسة تخزين البيانات</h5>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-black mb-2">
                          <span className="text-slate-500">الاحتفاظ بالملفات في سلة المهملات</span>
                          <span className="text-emerald-600">{archiveRules.retentionDays} يوم</span>
                        </div>
                        <input type="range" min="15" max="180" step="15" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" value={archiveRules.retentionDays} onChange={e => setArchiveRules({...archiveRules, retentionDays: parseInt(e.target.value)})} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">مستوى ضغط الصور والمرفقات</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={archiveRules.compressionLevel} onChange={e => setArchiveRules({...archiveRules, compressionLevel: e.target.value})}>
                          <option value="low">بدون ضغط (أعلى جودة - حجم أكبر)</option>
                          <option value="medium">ضغط متوسط (متوازن)</option>
                          <option value="high">ضغط عالي (أصغر حجم - جودة مقبولة)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex items-start gap-4">
                    <ShieldAlert size={24} className="text-amber-600 shrink-0" />
                    <div>
                      <h5 className="text-[12px] font-black text-amber-900 mb-1">تنبيه الخصوصية</h5>
                      <p className="text-[10px] font-bold text-amber-700 leading-relaxed">عند تفعيل ميزة OCR والملخص التلقائي، يتم معالجة بيانات الوثائق بشكل مشفر عبر محرك Paperless AI السحابي لتوليد النصوص اللحظية.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Trash Tab */}
          {activeSubTab === 'trash' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6 duration-500">
              <SectionHeader title="سلة المهملات" icon={Trash2} desc="إدارة العناصر المحذوفة مؤقتاً واستعادتها" />
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 overflow-hidden">
                <TrashBin 
                  deletedDocs={deletedDocs} 
                  deletedFolders={deletedFolders} 
                  onRestoreDoc={onRestoreDoc} 
                  onRestoreFolder={onRestoreFolder} 
                />
              </div>
            </div>
          )}

          {/* Tab Footer Branding */}
          <div className="absolute bottom-8 left-10 flex items-center gap-2 opacity-20 group hover:opacity-100 transition-opacity">
            <LogoP size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Paperless Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
