
import React, { useState } from 'react';
import { Settings, Shield, Trash2, Building, Archive, Save, Bell, Globe, Database, FileText } from 'lucide-react';
import TrashBin from './TrashBin';
import { Document, Folder } from '../types';

interface SettingsPageProps {
  deletedDocs: Document[];
  deletedFolders: Folder[];
  autoOpenFiles: boolean;
  setAutoOpenFiles: (val: boolean) => void;
  onRestoreDoc: (doc: Document) => void;
  onRestoreFolder: (folder: Folder) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ deletedDocs, deletedFolders, autoOpenFiles, setAutoOpenFiles, onRestoreDoc, onRestoreFolder }) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'archiving' | 'trash'>('general');

  const settingsTabs = [
    { id: 'general', label: 'الإعدادات العامة', icon: Building },
    { id: 'archiving', label: 'قواعد الأرشفة', icon: Archive },
    { id: 'trash', label: 'سلة المهملات', icon: Trash2, count: deletedDocs.length + deletedFolders.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </div>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full border border-red-100">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {activeSubTab === 'general' && (
            <div className="p-8 space-y-8 animate-in slide-in-from-left-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">بيانات المنشأة</h3>
                <p className="text-slate-400 text-sm mt-1">تخصيص الهوية البصرية والمعلومات الأساسية لـ Paperless</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1">اسم الشركة / المؤسسة</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" defaultValue="شركة الحلول الهندسية المحدودة" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1">الرقم الضريبي / السجل</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" defaultValue="123456789-001" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h4 className="font-bold text-slate-800 mb-4">خيارات العرض والتحميل</h4>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">فتح الملف المنزل تلقائياً</h4>
                      <p className="text-xs text-slate-400 mt-1">فتح الملف في تبويبة جديدة فور اكتمال عملية التحميل الفردي</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={autoOpenFiles}
                      onChange={(e) => setAutoOpenFiles(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  <Save size={18} />
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'archiving' && (
            <div className="p-8 space-y-8 animate-in slide-in-from-left-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">قواعد الأرشفة الذكية</h3>
                <p className="text-slate-400 text-sm mt-1">ضبط كيفية ترقيم وتخزين الوثائق في النظام</p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">البادئة الرقمية (Prefix)</h4>
                    <p className="text-xs text-slate-400 mt-1">تضاف تلقائياً قبل رقم أي كتاب جديد</p>
                  </div>
                  <input type="text" className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-emerald-600" defaultValue="PRL-" />
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">مدة الاحتفاظ في سلة المهملات</h4>
                    <p className="text-xs text-slate-400 mt-1">عدد الأيام قبل الحذف النهائي للملفات</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-20 px-4 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold" defaultValue="60" />
                    <span className="text-xs font-bold text-slate-500">يوم</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  <Save size={18} />
                  تحديث القواعد
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'trash' && (
            <div className="p-8 animate-in slide-in-from-left-4 h-full">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">إدارة سلة المهملات</h3>
                  <p className="text-slate-400 text-sm mt-1">استعراض العناصر المحذوفة وإدارتها</p>
                </div>
                { (deletedDocs.length > 0 || deletedFolders.length > 0) && (
                   <button className="text-red-600 text-xs font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all">إفراغ السلة نهائياً</button>
                )}
              </div>
              <TrashBin 
                deletedDocs={deletedDocs} 
                deletedFolders={deletedFolders} 
                onRestoreDoc={onRestoreDoc} 
                onRestoreFolder={onRestoreFolder} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
