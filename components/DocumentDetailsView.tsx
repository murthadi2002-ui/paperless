
import React, { useState, useRef, useMemo } from 'react';
import { 
  ChevronRight, Calendar, Hash, User, Building2, Tag, 
  FileText, Download, Info, MoreVertical, Trash2, 
  PlusCircle, Paperclip, Check, FileSpreadsheet, 
  FileImage, FileCode, FileQuestion, SendHorizontal, 
  Clock, UserCheck, AlertCircle, Users, CheckSquare,
  X, History, Plus
} from 'lucide-react';
import { Document, Attachment, User as UserType, WorkflowTask, DocStatus } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

interface DocumentDetailsViewProps {
  doc: Document;
  autoOpenFiles: boolean;
  onBack: () => void;
  onDelete: () => void;
  onAddAttachment: (file: Attachment) => void;
  onAddTask?: (docId: string, task: WorkflowTask) => void;
}

// مكون أيقونة التنزيل مع مؤشر التقدم الدائري
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

const DocumentDetailsView: React.FC<DocumentDetailsViewProps> = ({ doc, autoOpenFiles, onBack, onDelete, onAddAttachment, onAddTask }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const [taskData, setTaskData] = useState({
    assigneeIds: [] as string[],
    dueDate: '',
    instructions: ''
  });

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl" onClick={() => setIsMenuOpen(false)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 px-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-2 font-bold text-sm text-right">الأرشيف العام <ChevronRight size={20} /></button>
          <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shadow-sm"><FileText size={18} /></div><h2 className="text-lg font-bold text-slate-800">{doc.subject}</h2></div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => simulateDownload('all')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all border border-slate-200"
          >
            <DownloadIconWithProgress size={16} isDownloading={downloadingId === 'all'} progress={downloadProgress} /> 
            تنزيل الكل
          </button>
          <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all"><SendHorizontal size={16} /> توجيه إداري</button>
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl"><MoreVertical size={20} /></button>
          {isMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
              <button onClick={onDelete} className="w-full text-right px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-end gap-3 transition-colors">نقل لسلة المهملات <Trash2 size={16} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
            <h3 className="text-xs font-black text-slate-400 mb-6 flex items-center justify-end gap-2 uppercase tracking-[0.2em]">سجل التوجيهات <History size={16} className="text-amber-500" /></h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
               {doc.tasks && doc.tasks.length > 0 ? (
                 doc.tasks.map((task, idx) => {
                   const start = new Date(task.createdAt).getTime();
                   const end = new Date(task.dueDate).getTime();
                   const now = Date.now();
                   const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                   const employees = MOCK_EMPLOYEES.filter(e => task.assigneeIds.includes(e.id));
                   
                   return (
                     <div key={task.id} className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 space-y-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">توجيه #{idx + 1}</span>
                           <div className="flex flex-row-reverse flex-wrap gap-1.5">
                             {employees.map(e => (
                               <div key={e.id} className="flex flex-row-reverse items-center gap-1.5 bg-white pl-2 pr-1 py-1 rounded-full border border-slate-200 shadow-sm">
                                  <img src={e.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                                  <span className="text-[9px] font-black text-slate-700 whitespace-nowrap">{e.name.split(' ')[0]}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <div className="flex flex-row-reverse justify-between text-[9px] font-black uppercase text-slate-400">
                             <span>تاريخ الاستحقاق</span>
                             <span className={progress > 85 ? 'text-red-500' : 'text-slate-600'}>{task.dueDate}</span>
                           </div>
                           <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${progress > 85 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div></div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 italic bg-white p-3 rounded-2xl border border-slate-100/50 leading-relaxed shadow-sm">"{task.instructions}"</p>
                     </div>
                   );
                 })
               ) : (
                 <div className="py-12 text-center text-slate-300">
                    <Clock size={32} className="mx-auto mb-3 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest">لا توجد توجيهات لهذا الكتاب</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex flex-row-reverse items-center justify-between mb-10 pb-6 border-b border-slate-50">
               <div className="text-right">
                 <h3 className="text-xl font-bold text-slate-800">المرفقات المؤرشفة</h3>
                 <p className="text-slate-400 text-sm mt-1">اضغط على أيقونة التنزيل لمعاينة الملف</p>
               </div>
               <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-xs font-black flex flex-row-reverse items-center gap-2"><Paperclip size={14} /> {doc.attachments.length} ملفات</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {doc.attachments.map((file) => (
                 <div key={file.id} onClick={() => simulateDownload(file.id)} className="p-4 bg-slate-50 border border-slate-100 rounded-[1.8rem] flex flex-row-reverse items-center gap-4 hover:bg-white hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all"><FileText size={22} /></div>
                    <div className="flex-1 text-right overflow-hidden">
                       <h4 className="font-black text-slate-800 text-xs truncate mb-1">{file.name}</h4>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{file.size}</p>
                    </div>
                    <DownloadIconWithProgress size={18} isDownloading={downloadingId === file.id} progress={downloadProgress} />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direction Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
             <div className="p-6 border-b border-slate-100 flex flex-row-reverse items-center justify-between shrink-0 bg-white">
                <div className="flex flex-row-reverse items-center gap-3">
                   <div className="p-2 bg-amber-600 text-white rounded-xl"><Users size={20} /></div>
                   <h4 className="font-black text-slate-800 text-sm">توجيه إداري جديد</h4>
                </div>
                <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
             </div>
             
             <div className="p-8 space-y-6 text-right">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اختر الموظفين المكلفين *</label>
                   <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {MOCK_EMPLOYEES.map(emp => (
                        <div 
                          key={emp.id} 
                          onClick={() => setTaskData(prev => ({...prev, assigneeIds: prev.assigneeIds.includes(emp.id) ? prev.assigneeIds.filter(i=>i!==emp.id) : [...prev.assigneeIds, emp.id]}))}
                          className={`flex flex-row-reverse items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${taskData.assigneeIds.includes(emp.id) ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                        >
                           <div className="flex flex-row-reverse items-center gap-2"><img src={emp.avatar} className="w-7 h-7 rounded-lg object-cover shadow-sm" alt="" /><span className="text-[11px] font-black text-slate-800">{emp.name}</span></div>
                           <div className={`w-4 h-4 rounded border flex items-center justify-center ${taskData.assigneeIds.includes(emp.id) ? 'bg-amber-600 border-amber-600 text-white shadow-sm' : 'bg-white border-slate-200'}`}>{taskData.assigneeIds.includes(emp.id) && <Check size={10} strokeWidth={4} />}</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">تاريخ الموعد النهائي (Deadline) *</label>
                   <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-sm text-right" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">التوجيهات الإدارية</label>
                   <textarea className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-xs resize-none text-right" rows={3} placeholder="اكتب التوجيه الإداري المطلوب..." value={taskData.instructions} onChange={e => setTaskData({...taskData, instructions: e.target.value})} />
                </div>
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-row-reverse gap-3">
                <button onClick={handleAddTask} disabled={taskData.assigneeIds.length === 0 || !taskData.dueDate} className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50">تفعيل التوجيه للجميع</button>
                <button onClick={() => setShowTaskForm(false)} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentDetailsView;
