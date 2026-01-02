
import React, { useState, useRef, useMemo } from 'react';
import { 
  ChevronRight, Calendar, Hash, User, Building2, Tag, 
  FileText, Download, Info, MoreVertical, Trash2, 
  PlusCircle, Paperclip, Check, FileSpreadsheet, 
  FileImage, FileCode, FileQuestion, SendHorizontal, 
  Clock, UserCheck, AlertCircle, Users, CheckSquare,
  X, History, Plus, Edit3, Upload, FileUp, UserPlus,
  ArrowLeft
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

  const simulateDownload = (id: string) => {
    setDownloadingId(id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadingId(null), 800);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
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
      <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-4 px-6 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4 overflow-hidden">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all flex items-center gap-2 font-black text-[11px] shrink-0 border border-transparent hover:border-slate-100">
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
                   className="flex-1 bg-slate-50 border border-emerald-500 rounded-xl px-4 py-2 font-black text-slate-800 outline-none text-sm min-w-0 shadow-inner"
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
            onClick={() => simulateDownload('all')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-white hover:shadow-xl transition-all border border-slate-200 shrink-0"
          >
            <DownloadIconWithProgress size={16} isDownloading={downloadingId === 'all'} progress={downloadProgress} /> 
            تنزيل الكل
          </button>
          <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 shrink-0"><SendHorizontal size={16} /> توجيه إداري</button>
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
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>
            <h3 className="text-[11px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10"><Info size={16} className="text-emerald-600" /> تفاصيل الأرشفة</h3>
            <div className="space-y-4 relative z-10">
               {[
                 { label: 'الرقم المرجعي', value: doc.refNumber, icon: Hash, color: 'text-indigo-600' },
                 { label: 'تاريخ الكتاب', value: doc.date, icon: Calendar, color: 'text-emerald-600' },
                 { label: 'جهة الإصدار', value: doc.sender, icon: Building2, color: 'text-blue-600' },
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
                     <div key={task.id} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-5 animate-in slide-in-from-top-4 shadow-sm">
                        {/* Elegant Full Identity Pills */}
                        <div className="flex flex-col gap-3.5 border-b border-slate-200/50 pb-4">
                           {/* Full Issuer Pill with Photo and Name */}
                           <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-full border border-indigo-100 self-start shadow-sm ring-2 ring-indigo-50/30">
                             <img src={issuer?.avatar} className="w-6 h-6 rounded-full object-cover border border-white" alt="" />
                             <span className="text-[10px] font-black text-indigo-600 truncate max-w-[130px]">{issuer?.name}</span>
                           </div>
                           
                           <div className="pr-5 text-slate-200"><ArrowLeft size={14} strokeWidth={4} /></div>

                           {/* Multi-Assignees Pill */}
                           <div className="flex flex-wrap gap-1 items-center self-end bg-amber-50 px-3 py-2 rounded-full border border-amber-100 shadow-sm">
                             <span className="text-[8px] font-black text-amber-500 ml-1">إلى:</span>
                             <div className="flex -space-x-1.5 flex-row-reverse">
                                {assignees.slice(0, 3).map(e => <img key={e.id} src={e.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm" title={e.name} alt="" />)}
                                {assignees.length > 3 && <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-[7px] font-black flex items-center justify-center border-2 border-white">+{assignees.length - 3}</div>}
                             </div>
                           </div>
                        </div>

                        <p className="text-[11px] font-bold text-slate-700 italic bg-white p-4 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">"{task.instructions}"</p>
                        
                        <div className="flex flex-row-reverse justify-between text-[8px] font-black text-slate-400 opacity-60 px-2">
                           <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={10} /> {task.dueDate}</span>
                           <span className="flex items-center gap-1 uppercase tracking-widest"><Clock size={10} /> {task.status}</span>
                        </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="py-16 text-center text-slate-300">
                    <Clock size={48} className="mx-auto mb-4 opacity-5" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">لا توجد توجيهات متابعة<br/>على هذا الكتاب حالياً</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Slimmer/Nazk Header */}
            <div className="p-5 px-10 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
               <div className="overflow-hidden">
                 <h3 className="text-base font-black text-slate-800 truncate">مرفقات الأرشفة الرسمية</h3>
                 <p className="text-slate-400 text-[10px] font-bold mt-1 truncate">معاينة وإدارة كافة المستندات الممسوحة ضوئياً والملحقة</p>
               </div>
               {canEdit && (
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] shadow-xl shadow-emerald-50 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95 group shrink-0">
                   <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-500" /> إرفاق مستند
                 </button>
               )}
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 content-start bg-slate-50/20">
               {doc.attachments.map((file) => (
                 <div key={file.id} onClick={() => simulateDownload(file.id)} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col relative overflow-hidden ring-1 ring-slate-100/50">
                    <div className="flex justify-between items-start mb-8">
                       <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white rounded-[1.8rem] shadow-inner transition-all duration-500 group-hover:rotate-3"><FileText size={32} /></div>
                       <div className="flex gap-1">
                          {canDelete && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteAttachment(file.id); }} 
                              className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all" 
                              title="حذف المرفق"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                          <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-lg rounded-2xl transition-all">
                            <DownloadIconWithProgress size={20} isDownloading={downloadingId === file.id} progress={downloadProgress} />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="font-black text-slate-800 text-xs truncate leading-tight pr-1" title={file.name}>{file.name}</h4>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{file.size}</span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 shadow-sm border border-emerald-100/50">معاينة ذكية</span>
                       </div>
                    </div>
                    {downloadingId === file.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-100">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                      </div>
                    )}
                 </div>
               ))}
               
               {doc.attachments.length === 0 && (
                 <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-300 bg-white border-2 border-dashed border-slate-200 rounded-[3.5rem] shadow-inner">
                    <div className="p-10 bg-slate-50 rounded-full mb-6">
                      <FileUp size={64} className="opacity-10" />
                    </div>
                    <h4 className="font-black text-slate-800 text-lg">الأرشيف الرقمي فارغ</h4>
                    <p className="text-sm font-bold mt-2 text-slate-400">استخدم زر "إرفاق مستند" بالأعلى لإضافة الملفات الممسوحة</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Direction Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-400 overflow-hidden">
             <div className="p-6 px-10 border-b border-slate-100 flex flex-row-reverse items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                <div className="flex flex-row-reverse items-center gap-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"><SendHorizontal size={22} /></div>
                   <div>
                      <h4 className="font-black text-slate-800 text-base leading-tight">تفعيل توجيه إداري</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">تنسيق المتابعة وتنفيذ الأوامر</p>
                   </div>
                </div>
                <button onClick={() => setShowTaskForm(false)} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-red-500 transition-all"><X size={24} /></button>
             </div>
             
             <div className="p-10 space-y-8 text-right bg-slate-50/50">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3 flex items-center gap-2">
                     <Users size={14} /> تعيين الكوادر المكلفة بالمتابعة *
                   </label>
                   <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {MOCK_EMPLOYEES.map(emp => (
                        <div 
                          key={emp.id} 
                          onClick={() => setTaskData(prev => ({...prev, assigneeIds: prev.assigneeIds.includes(emp.id) ? prev.assigneeIds.filter(i=>i!==emp.id) : [...prev.assigneeIds, emp.id]}))}
                          className={`flex flex-row-reverse items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm ${taskData.assigneeIds.includes(emp.id) ? 'bg-amber-600 text-white border-amber-600 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-amber-200'}`}
                        >
                           <div className="flex flex-row-reverse items-center gap-3">
                              <img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-inner" alt="" />
                              <span className="text-[11px] font-black truncate max-w-[120px]">{emp.name}</span>
                           </div>
                           <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${taskData.assigneeIds.includes(emp.id) ? 'bg-white text-amber-600 border-white shadow-inner' : 'bg-slate-50 border-slate-200'}`}>{taskData.assigneeIds.includes(emp.id) && <Check size={12} strokeWidth={4} />}</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">تاريخ الاستحقاق النهائي *</label>
                      <div className="relative group">
                         <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                         <input type="date" className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-sm text-right shadow-sm" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">مستوى الأولوية</label>
                      <div className="relative group">
                        <AlertCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <select className="w-full pr-14 pl-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-black text-sm text-right shadow-sm appearance-none cursor-pointer">
                           <option>عادي</option>
                           <option>هام جداً</option>
                           <option>عاجل وفوري</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3">التعليمات والردود المطلوبة</label>
                   <textarea className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-xs resize-none text-right shadow-inner h-36" placeholder="اكتب التعليمات الإدارية بدقة هنا للزملاء المكلفين..." value={taskData.instructions} onChange={e => setTaskData({...taskData, instructions: e.target.value})} />
                </div>
             </div>

             <div className="p-8 px-10 bg-white border-t border-slate-100 flex flex-row-reverse gap-4">
                <button onClick={handleAddTask} disabled={taskData.assigneeIds.length === 0 || !taskData.dueDate} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"><SendHorizontal size={20} /> تفعيل التوجيه والمتابعة</button>
                <button onClick={() => setShowTaskForm(false)} className="px-12 py-5 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentDetailsView;
