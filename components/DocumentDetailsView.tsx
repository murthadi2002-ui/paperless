
import React, { useState, useRef, useMemo } from 'react';
import { 
  ChevronRight, Calendar, Hash, User, Building2, Tag, 
  FileText, Download, Info, MoreVertical, Trash2, 
  PlusCircle, Paperclip, Check, FileSpreadsheet, 
  FileImage, FileCode, FileQuestion, SendHorizontal, 
  Clock, UserCheck, AlertCircle, Users, CheckSquare,
  X, History, Plus, Edit3, Upload, FileUp, UserPlus,
  ArrowLeft, Send
} from 'lucide-react';
import { Document, Attachment, User as UserType, WorkflowTask, DocStatus } from '../types';
import { MOCK_EMPLOYEES, CURRENT_USER } from '../constants';

interface DocumentDetailsViewProps {
  doc: Document;
  autoOpenFiles: boolean;
  onBack: () => void;
  onDelete: () => void;
  onUpdateSubject: (newSubject: string) => void;
  onAddAttachment: (file: Attachment) => void;
  onDeleteAttachment: (id: string) => void;
  onAddTask?: (docId: string, task: WorkflowTask) => void;
}

const DownloadIconWithProgress: React.FC<{ size?: number, isDownloading: boolean, progress: number }> = ({ size = 18, isDownloading, progress }) => {
  return (
    <div className="relative flex items-center justify-center">
      {isDownloading && (
        <svg className="absolute w-8 h-8 -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="17" fill="none" className="stroke-slate-100" strokeWidth="3" />
          <circle 
            cx="18" cy="18" r="17" fill="none" 
            className="stroke-emerald-500 transition-all duration-300" 
            strokeWidth="3" 
            strokeDasharray="106.8" 
            strokeDashoffset={106.8 - (progress * 1.068)}
            strokeLinecap="round"
          />
        </svg>
      )}
      <div className={`transition-all duration-300 ${isDownloading ? 'scale-75 text-emerald-600' : ''}`}>
        {progress === 100 && isDownloading ? <Check size={size} /> : <Download size={size} />}
      </div>
    </div>
  );
};

const DocumentDetailsView: React.FC<DocumentDetailsViewProps> = ({ 
  doc, autoOpenFiles, onBack, onDelete, onUpdateSubject, onAddAttachment, onDeleteAttachment, onAddTask 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubject, setEditSubject] = useState(doc.subject);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [taskData, setTaskData] = useState({
    assigneeIds: [] as string[],
    dueDate: '',
    instructions: ''
  });

  const canEdit = CURRENT_USER.role === 'admin' || CURRENT_USER.permissions?.includes('تعديل كتاب');
  const canDelete = CURRENT_USER.role === 'admin' || CURRENT_USER.permissions?.includes('حذف كتاب');

  // تحويل Base64 إلى Blob لتنزيل حقيقي
  const base64ToBlob = (base64: string, mime: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const triggerRealDownload = (attachment: Attachment) => {
    try {
      let downloadUrl = attachment.url;
      
      // إذا كان الملف Base64، نحوله لـ Blob URL ليكون "حقيقي" وقابل للفتح بالمتصفح بشكل أفضل
      if (attachment.url.startsWith('data:')) {
        const blob = base64ToBlob(attachment.url, attachment.type);
        downloadUrl = URL.createObjectURL(blob);
      }

      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // تنظيف الـ Blob URL بعد الاستخدام
      if (attachment.url.startsWith('data:')) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      }
    } catch (err) {
      console.error("Download error:", err);
      // Fallback للرابط المباشر
      window.open(attachment.url, '_blank');
    }
  };

  const handleDownloadClick = (attachment: Attachment) => {
    setDownloadingId(attachment.id);
    setDownloadProgress(0);
    
    // محاكاة بصرية سريعة ثم التنزيل الفعلي
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerRealDownload(attachment);
          setTimeout(() => setDownloadingId(null), 1000);
          return 100;
        }
        return prev + 25;
      });
    }, 80);
  };

  const handleDownloadAll = () => {
    setDownloadingId('all');
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          doc.attachments.forEach((at, idx) => {
            setTimeout(() => triggerRealDownload(at), idx * 400); // تأخير بسيط لضمان تنفيذ كل التنزيلات
          });
          setTimeout(() => setDownloadingId(null), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handlePreviewFile = (attachment: Attachment) => {
    if (attachment.url.startsWith('data:')) {
      const blob = base64ToBlob(attachment.url, attachment.type);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handleAddTask = () => {
    if (taskData.assigneeIds.length === 0 || !taskData.dueDate) return;
    const newTask: WorkflowTask = {
      id: Math.random().toString(36).substr(2, 9),
      issuerId: CURRENT_USER.id,
      assigneeIds: taskData.assigneeIds,
      dueDate: taskData.dueDate,
      instructions: taskData.instructions,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    onAddTask?.(doc.id, newTask);
    setShowTaskForm(false);
    setTaskData({ assigneeIds: [], dueDate: '', instructions: '' });
  };

  const handleSubjectSave = () => {
    if (editSubject.trim() && editSubject !== doc.subject) {
      onUpdateSubject(editSubject);
    }
    setIsEditingSubject(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: event.target?.result as string
        };
        onAddAttachment(newAttachment);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl" onClick={() => setIsMenuOpen(false)}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-4 px-6 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all flex items-center gap-2 font-black text-[11px] shrink-0">
             <ChevronRight size={18} /> الأرشيف العام
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden lg:block shrink-0"></div>
          <div className="flex items-center gap-3 flex-1 group min-w-0">
             <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-100 shrink-0"><FileText size={20} /></div>
             {isEditingSubject ? (
               <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 min-w-0">
                 <input 
                   autoFocus
                   type="text" 
                   value={editSubject} 
                   onChange={(e) => setEditSubject(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSubjectSave()}
                   className="flex-1 bg-slate-50 border border-emerald-500 rounded-xl px-4 py-2 font-black text-slate-800 outline-none text-sm min-w-0"
                 />
                 <button onClick={handleSubjectSave} className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shrink-0"><Check size={18} /></button>
                 <button onClick={() => setIsEditingSubject(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl shrink-0"><X size={18} /></button>
               </div>
             ) : (
               <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                 <h2 className="text-base font-black text-slate-800 truncate leading-snug tracking-tight" title={doc.subject}>
                    {doc.subject}
                 </h2>
                 {canEdit && <button onClick={() => setIsEditingSubject(true)} className="p-1.5 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-all shrink-0"><Edit3 size={14} /></button>}
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            onClick={handleDownloadAll} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-white hover:shadow-xl transition-all border border-slate-200"
          >
            <DownloadIconWithProgress size={16} isDownloading={downloadingId === 'all'} progress={downloadProgress} /> 
            تنزيل الكل
          </button>
          <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">توجيه إداري</button>
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-3 text-slate-300 hover:text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"><MoreVertical size={20} /></button>
            {isMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 origin-top-left overflow-hidden">
                <button onClick={() => { setIsEditingSubject(true); setIsMenuOpen(false); }} className="w-full text-right px-5 py-3.5 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-3 transition-colors"><Edit3 size={16} /> تعديل الاسم</button>
                <hr className="border-slate-50" />
                <button onClick={onDelete} className="w-full text-right px-5 py-3.5 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-3 transition-colors"><Trash2 size={16} /> حذف الوثيقة</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]"><Info size={16} className="text-emerald-600" /> تفاصيل الأرشفة</h3>
            <div className="space-y-4">
               {[
                 { label: 'الرقم المرجعي', value: doc.refNumber, icon: Hash, color: 'text-indigo-600' },
                 { label: 'تاريخ الكتاب', value: doc.date, icon: Calendar, color: 'text-emerald-600' },
                 { label: 'جهة الإصدار', value: doc.sender, icon: Building2, color: 'text-blue-600' },
                 { label: 'جهة الاستلام', value: doc.receiver || 'غير محدد', icon: Send, color: 'text-cyan-600' },
                 { label: 'الحالة الحالية', value: doc.status, icon: CheckSquare, color: 'text-amber-600' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4.5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                       <div className={`p-2.5 bg-white rounded-xl shadow-sm ${item.color}`}><item.icon size={16} /></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-fit">
            <h3 className="text-[11px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">سجل التوجيهات <History size={16} className="text-amber-500" /></h3>
            <div className="space-y-4 max-h-[450px] overflow-y-auto px-1 custom-scrollbar">
               {doc.tasks && doc.tasks.length > 0 ? (
                 doc.tasks.map((task, idx) => {
                   const issuer = MOCK_EMPLOYEES.find(e => e.id === task.issuerId) || CURRENT_USER;
                   const assignees = MOCK_EMPLOYEES.filter(e => task.assigneeIds.includes(e.id));
                   return (
                     <div key={task.id} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-5 shadow-sm">
                        <div className="flex flex-col gap-3.5 border-b border-slate-200/50 pb-4">
                           <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-full border border-indigo-100 self-start shadow-sm ring-2 ring-indigo-50/30">
                             <img src={issuer?.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                             <span className="text-[10px] font-black text-indigo-600 truncate max-w-[130px]">{issuer?.name}</span>
                           </div>
                           <div className="pr-5 text-slate-200"><ArrowLeft size={14} strokeWidth={4} /></div>
                           <div className="flex flex-wrap gap-1 items-center self-end bg-amber-50 px-3 py-2 rounded-full border border-amber-100 shadow-sm">
                             <span className="text-[8px] font-black text-amber-500 ml-1">إلى:</span>
                             <div className="flex -space-x-1.5 flex-row-reverse">
                                {assignees.slice(0, 3).map(e => <img key={e.id} src={e.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm" title={e.name} alt="" />)}
                             </div>
                           </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 italic bg-white p-4 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">"{task.instructions}"</p>
                     </div>
                   );
                 })
               ) : (
                 <div className="py-16 text-center text-slate-300">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">لا توجد توجيهات متابعة حالياً</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">المستندات المرفقة <Paperclip size={16} className="text-emerald-600" /></h3>
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all border border-slate-100">
                 <PlusCircle size={14} /> إضافة مرفق جديد
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doc.attachments.map((file) => (
                  <div key={file.id} className="group bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4 min-w-0 cursor-pointer" onClick={() => handlePreviewFile(file)}>
                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                           <FileText size={24} />
                        </div>
                        <div className="overflow-hidden">
                           <h4 className="text-xs font-black text-slate-800 truncate">{file.name}</h4>
                           <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{file.size} • {file.type.split('/')[1].toUpperCase()}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button 
                          onClick={() => handleDownloadClick(file)} 
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="تنزيل"
                        >
                          <DownloadIconWithProgress isDownloading={downloadingId === file.id} progress={downloadProgress} />
                        </button>
                        <button onClick={() => onDeleteAttachment(file.id)} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="حذف"><Trash2 size={18} /></button>
                     </div>
                  </div>
                ))}
                {doc.attachments.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <Paperclip size={48} className="mx-auto opacity-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">لا توجد مرفقات لهذا الكتاب</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.8rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><SendHorizontal className="text-emerald-600" /> تحرير توجيه إداري</h3>
                 <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الموظفون المكلفون</label>
                    <select 
                      multiple 
                      className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs custom-scrollbar"
                      value={taskData.assigneeIds}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setTaskData({...taskData, assigneeIds: options});
                      }}
                    >
                      {MOCK_EMPLOYEES.map(emp => <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>)}
                    </select>
                    <p className="text-[9px] text-slate-400 pr-2 mt-1">اضغط مع الاستمرار على (Ctrl/Cmd) لاختيار أكثر من موظف</p>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">تاريخ الاستحقاق (Deadline)</label>
                    <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">التعليمات الفنية والإدارية</label>
                    <textarea className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs resize-none" rows={3} placeholder="اكتب التعليمات هنا..." value={taskData.instructions} onChange={e => setTaskData({...taskData, instructions: e.target.value})} />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={handleAddTask} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">إرسال التوجيه</button>
                    <button onClick={() => setShowTaskForm(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">إلغاء</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsView;
