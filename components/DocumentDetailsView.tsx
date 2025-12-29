
import React, { useState, useRef } from 'react';
import { ChevronRight, Calendar, Hash, User, Building2, Tag, FileText, Download, Info, MoreVertical, Trash2, PlusCircle, Paperclip, Check, FileSpreadsheet, FileImage, FileCode, FileQuestion } from 'lucide-react';
import { Document, Attachment } from '../types';

interface DocumentDetailsViewProps {
  doc: Document;
  autoOpenFiles: boolean;
  onBack: () => void;
  onDelete: () => void;
  onAddAttachment: (file: Attachment) => void;
}

const getFileInfo = (fileName: string, type: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (type.includes('pdf') || ext === 'pdf') {
    return { icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:border-blue-400' };
  }
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'svg'].includes(ext || '')) {
    return { icon: FileImage, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', hover: 'hover:border-rose-400' };
  }
  if (ext?.match(/xls|xlsx|csv/)) {
    return { icon: FileSpreadsheet, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', hover: 'hover:border-emerald-400' };
  }
  if (ext?.match(/doc|docx/)) {
    return { icon: FileText, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', hover: 'hover:border-indigo-400' };
  }
  return { icon: FileQuestion, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', hover: 'hover:border-slate-400' };
};

const DownloadButton: React.FC<{ file: Attachment, autoOpen: boolean }> = ({ file, autoOpen }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading || completed) return;

    setDownloading(true);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        setTimeout(() => {
          setDownloading(false);
          setCompleted(true);
          
          if (autoOpen) {
            window.open(file.url, '_blank');
          }
          
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.click();

          setTimeout(() => setCompleted(false), 3000);
        }, 600);
      } else {
        setProgress(currentProgress);
      }
    }, 120);
  };

  return (
    <button 
      onClick={startDownload}
      disabled={downloading}
      className={`relative p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
        completed ? 'bg-emerald-600 text-white shadow-emerald-200' : 
        downloading ? 'bg-slate-100 text-emerald-600' : 
        'bg-white text-slate-400 hover:text-emerald-600 hover:shadow-md'
      }`}
      title="تحميل الملف"
    >
      {downloading && (
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16" cy="16" r="14"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={88}
            strokeDashoffset={88 - (progress / 100) * 88}
            className="transition-all duration-150 ease-linear opacity-40"
          />
        </svg>
      )}
      {completed ? <Check size={20} className="animate-in zoom-in duration-300" /> : <Download size={20} />}
    </button>
  );
};

const DocumentDetailsView: React.FC<DocumentDetailsViewProps> = ({ doc, autoOpenFiles, onBack, onDelete, onAddAttachment }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onAddAttachment({
        id: Math.random().toString(36).substr(2, 5),
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const downloadAll = () => {
    doc.attachments.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
      }, index * 400);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500" onClick={() => setIsMenuOpen(false)}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleQuickUpload} />
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between bg-white p-4 px-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-2 font-bold text-sm">
            <ChevronRight size={20} /> الأرشيف العام
          </button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <FileText size={18} />
             </div>
             <h2 className="text-lg font-bold text-slate-800">{doc.subject}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={downloadAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 border border-emerald-500"
          >
            <Download size={16} /> تنزيل الكل
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            <PlusCircle size={16} /> إضافة مرفق
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <MoreVertical size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
              <button onClick={onDelete} className="w-full text-right px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                <Trash2 size={16} /> نقل لسلة المهملات
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Info size={14} /> البيانات الإدارية
            </h3>
            <div className="space-y-5 relative z-10">
              {[
                { icon: Hash, label: 'رقم المرجع', value: doc.refNumber },
                { icon: Calendar, label: 'تاريخ الأرشفة', value: doc.date },
                { icon: User, label: 'الجهة المرسلة', value: doc.sender },
                { icon: Building2, label: 'القسم المستلم', value: doc.receiver || 'غير محدد' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400"><item.icon size={18} /><span className="text-xs font-bold">{item.label}</span></div>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
               <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">الكلمات المفتاحية</h4>
               <div className="flex flex-wrap gap-2">
                 {doc.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                     <Tag size={10} />
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div><h3 className="text-xl font-bold text-slate-800">المرفقات</h3><p className="text-slate-400 text-sm mt-1">المستندات المؤرشفة المرتبطة بهذا الكتاب</p></div>
               <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Paperclip size={14} /> {doc.attachments.length} مرفقات
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {doc.attachments.map((file) => {
                 const info = getFileInfo(file.name, file.type);
                 const Icon = info.icon;
                 return (
                   <div key={file.id} className={`group bg-slate-50 p-5 rounded-3xl border ${info.border} ${info.hover} hover:bg-white transition-all flex flex-col shadow-sm hover:shadow-xl relative overflow-hidden`}>
                      <div className="flex items-start justify-between mb-4">
                         <div className={`p-3 rounded-2xl shadow-sm transition-all group-hover:scale-110 ${info.bg} ${info.color}`}>
                           <Icon size={24} />
                         </div>
                         <DownloadButton file={file} autoOpen={autoOpenFiles} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm truncate mb-1">{file.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{file.size}</p>
                      </div>
                   </div>
                 );
               })}
               {doc.attachments.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                   <Paperclip size={48} className="text-slate-200 mb-4" />
                   <p className="text-slate-400 font-bold">لا توجد مرفقات مرتبطة بهذا الكتاب</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsView;
