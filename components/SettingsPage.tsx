
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
  onAddDept: (name: string) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<void>;
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
  onRestoreDoc, onRestoreFolder, departments, onAddDept, onDeleteDepartment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'general' | 'archiving' | 'trash'>('profile');
  const [avatar, setAvatar] = useState(CURRENT_USER.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDeptName, setNewDeptName] = useState('');

  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    title: 'المدير التنفيذي',
    phone: '+964 770 123 4567'
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 text-right" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-5 rounded-[2.8rem] border border-slate-200 shadow-sm space-y-1">
            {[
              { id: 'profile', label: 'الملف الشخصي', icon: UserIcon, desc: 'إدارة الهوية والبيانات' },
              { id: 'general', label: 'إعدادات المنشأة', icon: Building, desc: 'الهيكل الإداري والأقسام' },
              { id: 'archiving', label: 'قواعد الأرشفة', icon: Archive, desc: 'محرك الذكاء والـ OCR' },
              { id: 'trash', label: 'سلة المهملات', icon: Trash2, desc: 'استعادة المحذوفات', count: deletedDocs.length + deletedFolders.length },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.8rem] transition-all ${activeSubTab === tab.id ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${activeSubTab === tab.id ? 'bg-white/20' : 'bg-slate-50'}`}><tab.icon size={18} /></div>
                  <div className="text-right"><p className="text-[13px] font-black">{tab.label}</p><p className={`text-[10px] font-bold opacity-60`}>{tab.desc}</p></div>
                </div>
                {tab.count !== undefined && tab.count > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === tab.id ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-700'}`}>{tab.count}</span>}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm overflow-hidden min-h-[650px] relative">
          
          {activeSubTab === 'profile' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6">
              <div className="flex flex-col md:flex-row gap-16 items-start">
                <div className="relative group mx-auto md:mx-0">
                  <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl relative"><img src={avatar} alt="Profile" className="w-full h-full object-cover" /></div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all border-4 border-white"><Camera size={20} /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">الاسم الكامل</label><input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">المسمى الوظيفي</label><input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none" value={profileData.title} onChange={e => setProfileData({...profileData, title: e.target.value})} /></div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'general' && (
            <div className="p-10 lg:p-16 space-y-12 animate-in slide-in-from-bottom-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">اسم المنشأة</label><input type="text" className="w-full pr-6 pl-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-800 outline-none" defaultValue="المنشأة الوطنية" /></div>
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> إدارة الأقسام</h4>
                  <div className="space-y-3 mb-8 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {departments.map(dept => (
                      <div key={dept.id} className="bg-white p-4 px-6 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <span className="text-sm font-black text-slate-700">{dept.name}</span>
                        <button onClick={() => onDeleteDepartment(dept.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="اسم القسم..." className="flex-1 px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                    <button onClick={async () => { if(!newDeptName) return; await onAddDept(newDeptName); setNewDeptName(''); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg"><Plus size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'trash' && (
            <div className="p-10 lg:p-16 space-y-12">
               <TrashBin deletedDocs={deletedDocs} deletedFolders={deletedFolders} onRestoreDoc={onRestoreDoc} onRestoreFolder={onRestoreFolder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
