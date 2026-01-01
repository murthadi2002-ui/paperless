
import React, { useState, useRef, useMemo } from 'react';
import { 
  ChevronRight, Calendar, Hash, User, Building2, Tag, 
  FileText, Download, Info, MoreVertical, Trash2, 
  PlusCircle, Paperclip, Check, FileSpreadsheet, 
  FileImage, FileCode, FileQuestion, SendHorizontal, 
  Clock, UserCheck, AlertCircle, Users, CheckSquare,
  X, History, Plus, Edit3, Upload, FileUp
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
        <svg className="absolute w-8 h-8 -rotate-90 pointer-events-none" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-200" strokeWidth="2" />
          <circle 
            cx="18" cy="18" r="16" fill="none" 
            className="stroke-emerald-500 transition-all duration-300" 
            strokeWidth="2" 
            strokeDasharray="100" 
            strokeDashoffset={100 - progress}
          />
        </svg>
      )}
      <Download size={size} className={isDownloading ? 'text-emerald-600' : ''} />
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

  const simulateDownload = (id: string) => {
    setDownloadingId(id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadingId(null), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleAddTask = () => {
    if (taskData.assigneeIds.length === 0 || !taskData.dueDate) return;
    const newTask: WorkflowTask = {
      id: Math.random().toString(36).substr(2, 9),
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
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 5),
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: '#'
      };
      onAddAttachment(newAttachment);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl" onClick={() => setIsMenuOpen(false)}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      
      {/* Header - Refined & Fixed Responsive Issues */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-4 px-6 rounded-[2rem] border border-slate-200 shadow-sm gap-4 overflow-hidden">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all flex items-center gap-2 font-black text-[11px] shrink-0">
             <ChevronRight size={18} /> الأرشيف
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden lg:block shrink-0"></div>
          <div className="flex items-center gap-3 flex-1 group min-w-0">
             <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shrink-0"><FileText size={18} /></div>
             {isEditingSubject ? (
               <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 min-w-0">
                 <input 
                   autoFocus
                   type="text" 
                   value={editSubject} 
                   onChange={(e) => setEditSubject(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSubjectSave()}
                   className="flex-1 bg-slate-50 border border-emerald-500 rounded-xl px-3 py-1.5 font-black text-slate-800 outline-none text-sm min-w-0"
                 />
                 <button onClick={handleSubjectSave} className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-md shrink-0"><Check size={16} /></button>
                 <button onClick={() => setIsEditingSubject(false)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg shrink-0"><X size={16} /></button>
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
            onClick={() => simulateDownload('all')} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black hover:bg-white hover:shadow-xl transition-all border border-slate-200 shrink-0"
          >
            <DownloadIconWithProgress size={16} isDownloading={downloadingId === 'all'} progress={downloadProgress} /> 
            تنزيل الكل
          </button>
          <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 shrink-0"><SendHorizontal size={16} /> توجيه إداري</button>
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2.5 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"><MoreVertical size={20} /></button>
            {isMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 origin-top-left overflow-hidden">
                <button onClick={() => { setIsEditingSubject(true); setIsMenuOpen(false); }} className="w-full text-right px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-3 transition-colors"><Edit3 size={16} /> تعديل الاسم</button>
                <hr className="border-slate-50" />
                <button onClick={onDelete} className="w-full text-right px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-3 transition-colors"><Trash2 size={16} /> حذف الوثيقة</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>
            <h3 className="text-xs font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10"><Info size={16} className="text-emerald-600" /> تفاصيل الأرشفة</h3>
            <div className="space-y-5 relative z-10">
               {[
                 { label: 'الرقم المرجعي', value: doc.refNumber, icon: Hash, color: 'text-indigo-600' },
                 { label: 'تاريخ الكتاب', value: doc.date, icon: Calendar, color: 'text-emerald-600' },
                 { label: 'جهة الإصدار', value: doc.sender, icon: Building2, color: 'text-blue-600' },
                 { label: 'الحالة الحالية', value: doc.status, icon: CheckSquare, color: 'text-amber-600' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 bg-white rounded-xl shadow-sm ${item.color}`}><item.icon size={16} /></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
            <h3 className="text-xs font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">سجل التوجيهات <History size={16} className="text-amber-500" /></h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
               {doc.tasks && doc.tasks.length > 0 ? (
                 doc.tasks.map((task, idx) => {
                   const employees = MOCK_EMPLOYEES.filter(e => task.assigneeIds.includes(e.id));
                   return (
                     <div key={task.id} className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 space-y-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50 shadow-sm">توجيه #{idx + 1}</span>
                           <div className="flex flex-row-reverse flex-wrap gap-1">
                             {employees.map(e => <img key={e.id} src={e.avatar} className="w-6 h-6 rounded-lg object-cover border-2 border-white shadow-sm" title={e.name} alt="" />)}
                           </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 italic bg-white p-3 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">"{task.instructions}"</p>
                        <div className="flex flex-row-reverse justify-between text-[8px] font-black text-slate-400 opacity-60">
                           <span>تاريخ الاستحقاق: {task.dueDate}</span>
                           <span className="flex items-center gap-1 uppercase tracking-widest"><Clock size={10} /> {task.status}</span>
                        </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="py-12 text-center text-slate-300">
                    <Clock size={40} className="mx-auto mb-3 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">لا توجد توجيهات متابعة<br/>على هذا الكتاب حالياً</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Slimmer/Nazk Header */}
            <div className="p-4 px-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
               <div className="overflow-hidden">
                 <h3 className="text-base font-black text-slate-800 truncate">مرفقات الأرشفة الرسمية</h3>
                 <p className="text-slate-400 text-[9px] font-bold mt-0.5 truncate">يمكنك معاينة، تحميل، أو إدارة الملفات الملحقة بالكتاب</p>
               </div>
               {canEdit && (
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-emerald-50 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95 group shrink-0">
                   <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-500" /> إرفاق ملف
                 </button>
               )}
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 content-start bg-slate-50/30">
               {doc.attachments.map((file) => (
                 <div key={file.id} onClick={() => simulateDownload(file.id)} className="group bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white rounded-[1.4rem] shadow-inner transition-all duration-500"><FileText size={28} /></div>
                       <div className="flex gap-1">
                          {canDelete && (
                            /* Always Visible Trash Icon - Nazk Style */
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteAttachment(file.id); }} 
                              className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                              title="حذف المرفق"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-md rounded-xl transition-all">
                            <DownloadIconWithProgress size={18} isDownloading={downloadingId === file.id} progress={downloadProgress} />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-black text-slate-800 text-xs truncate leading-tight" title={file.name}>{file.name}</h4>
                       <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{file.size}</span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">معاينة آمنة</span>
                       </div>
                    </div>
                    {downloadingId === file.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                      </div>
                    )}
                 </div>
               ))}
               
               {doc.attachments.length === 0 && (
                 <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                    <FileUp size={64} className="opacity-10 mb-6" />
                    <h4 className="font-black text-slate-800">لا توجد ملفات مرفقة حالياً</h4>
                    <p className="text-sm font-bold mt-2">استخدم زر "إرفاق ملف" بالأعلى لإضافة مستندات</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Direction Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 overflow-hidden">
             <div className="p-6 px-10 border-b border-slate-100 flex flex-row-reverse items-center justify-between shrink-0 bg-white">
                <div className="flex flex-row-reverse items-center gap-4">
                   <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-50"><Users size={22} /></div>
                   <div>
                      <h4 className="font-black text-slate-800 text-sm">تفعيل توجيه إداري</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">تتبع التنفيذ والاستجابة</p>
                   </div>
                </div>
                <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-all"><X size={24} /></button>
             </div>
             
             <div className="p-10 space-y-8 text-right bg-slate-50">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">تعيين الموظفين المكلفين *</label>
                   <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {MOCK_EMPLOYEES.map(emp => (
                        <div 
                          key={emp.id} 
                          onClick={() => setTaskData(prev => ({...prev, assigneeIds: prev.assigneeIds.includes(emp.id) ? prev.assigneeIds.filter(i=>i!==emp.id) : [...prev.assigneeIds, emp.id]}))}
                          className={`flex flex-row-reverse items-center justify-between p-3.5 rounded-[1.4rem] border transition-all cursor-pointer ${taskData.assigneeIds.includes(emp.id) ? 'bg-amber-600 text-white border-amber-600 shadow-xl' : 'bg-white border-slate-100 hover:border-amber-200 shadow-sm'}`}
                        >
                           <div className="flex flex-row-reverse items-center gap-3"><img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-inner" alt="" /><span className="text-xs font-black">{emp.name.split(' ')[0]} {emp.name.split(' ')[1]}</span></div>
                           <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${taskData.assigneeIds.includes(emp.id) ? 'bg-white text-amber-600 border-white' : 'bg-slate-50 border-slate-200'}`}>{taskData.assigneeIds.includes(emp.id) && <Check size={12} strokeWidth={4} />}</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">تاريخ الاستحقاق *</label>
                      <div className="relative">
                         <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input type="date" className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-black text-sm text-right shadow-sm" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الأولوية</label>
                      <select className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-black text-sm text-right shadow-sm appearance-none">
                         <option>عادي</option>
                         <option>هام جداً</option>
                         <option>عاجل وفوري</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">التوجيهات والتعليمات</label>
                   <textarea className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-emerald-500 transition-all font-black text-xs resize-none text-right shadow-sm h-32" placeholder="اكتب التعليمات الإدارية بدقة هنا..." value={taskData.instructions} onChange={e => setTaskData({...taskData, instructions: e.target.value})} />
                </div>
             </div>

             <div className="p-8 px-10 bg-slate-50 border-t border-slate-100 flex flex-row-reverse gap-4">
                <button onClick={handleAddTask} disabled={taskData.assigneeIds.length === 0 || !taskData.dueDate} className="flex-1 py-5 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"><SendHorizontal size={20} /> تفعيل التوجيه الإداري</button>
                <button onClick={() => setShowTaskForm(false)} className="px-12 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentDetailsView;
