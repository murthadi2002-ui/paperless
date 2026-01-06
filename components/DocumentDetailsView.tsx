import React, { useState, useRef } from 'react';
import { 
  ChevronRight, Calendar, Hash, Building2, 
  FileText, Download, Info, MoreVertical, Trash2, 
  PlusCircle, Paperclip, Check, SendHorizontal, 
  Clock, CheckSquare, X, Edit3, Mic, Video, Play, Headphones
} from 'lucide-react';
import { Document, Attachment, User as UserType, WorkflowTask, DocStatus } from '../types';
import { updateDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface DocumentDetailsViewProps {
  doc: Document;
  autoOpenFiles: boolean;
  onBack: () => void;
  onDelete: () => void;
  onUpdateSubject: (newSubject: string) => void;
  onAddAttachment: (file: Attachment) => void;
  onDeleteAttachment: (id: string) => void;
  onAddTask?: (docId: string, task: WorkflowTask) => void;
  employees: UserType[];
  currentUser: UserType | null;
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
  doc, autoOpenFiles, onBack, onDelete, onUpdateSubject, onAddAttachment, onDeleteAttachment, onAddTask, employees, currentUser 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubject, setEditSubject] = useState(doc.subject);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [taskData, setTaskData] = useState({
    assigneeIds: [] as string[],
    dueDate: '',
    instructions: ''
  });

  const canEdit = currentUser?.role === 'admin' || currentUser?.permissions?.includes('تعديل كتاب');

  const base64ToBlob = (base64: string, mime: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const triggerRealDownload = (attachment: Attachment) => {
    try {
      let downloadUrl = attachment.url;
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
    } catch (err) {
      window.open(attachment.url, '_blank');
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, attachment: Attachment) => {
    e.stopPropagation();
    setDownloadingId(attachment.id);
    setDownloadProgress(0);
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

  const handlePreviewFile = (attachment: Attachment) => {
    if (attachment.url.startsWith('data:')) {
      const blob = base64ToBlob(attachment.url, attachment.type);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handleRenameFile = async (fileId: string) => {
    if (tempFileName.trim() && tempFileName !== doc.attachments.find(a => a.id === fileId)?.name) {
      const updatedAttachments = doc.attachments.map(a => 
        a.id === fileId ? { ...a, name: tempFileName } : a
      );
      await updateDoc(firestoreDoc(db, "documents", doc.id), { attachments: updatedAttachments });
    }
    setEditingFileId(null);
  };

  const handleAddTask = () => {
    if (!currentUser || taskData.assigneeIds.length === 0 || !taskData.dueDate) return;
    const newTask: WorkflowTask = {
      id: Math.random().toString(36).substr(2, 9),
      issuerId: currentUser.id,
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return <Mic size={22} />;
    if (type.startsWith('video/')) return <Video size={22} />;
    return <FileText size={22} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl" onClick={() => setIsMenuOpen(false)}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
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
        }
      }} />
      
      <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all flex items-center gap-2 font-black text-[11px] shrink-0">
             <ChevronRight size={18} /> الأرشيف العام
          </button>
          <div className="h-8 w-[1px] bg-slate-100 hidden lg:block shrink-0"></div>
          <div className="flex items-center gap-3 flex-1 group min-w-0">
             <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-100 shrink-0"><FileText size={20} /></div>
             {isEditingSubject ? (
               <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 min-w-0">
                 <input autoFocus type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (onUpdateSubject(editSubject), setIsEditingSubject(false))} className="flex-1 bg-slate-50 border border-emerald-500 rounded-xl px-4 py-2 font-black text-slate-800 outline-none text-sm min-w-0" />
                 <button onClick={() => { onUpdateSubject(editSubject); setIsEditingSubject(false); }} className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shrink-0"><Check size={18} /></button>
                 <button onClick={() => setIsEditingSubject(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl shrink-0"><X size={18} /></button>
               </div>
             ) : (
               <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                 <h2 className="text-base font-black text-slate-800 truncate leading-snug tracking-tight">{doc.subject}</h2>
                 {canEdit && <button onClick={() => setIsEditingSubject(true)} className="p-1.5 text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-all shrink-0"><Edit3 size={14} /></button>}
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">توجيه إداري</button>
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-3 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"><MoreVertical size={20} /></button>
            {isMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 origin-top-left overflow-hidden text-right">
                <button onClick={() => { setIsEditingSubject(true); setIsMenuOpen(false); }} className="w-full px-5 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-3 transition-colors"><Edit3 size={16} /> تعديل العنوان</button>
                <hr className="border-slate-50" />
                <button onClick={onDelete} className="w-full px-5 py-3 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-3 transition-colors"><Trash2 size={16} /> حذف الكتاب</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]"><Info size={16} className="text-emerald-600" /> تفاصيل الأرشفة</h3>
            <div className="space-y-4">
               {[
                 { label: 'الرقم المرجعي', value: doc.refNumber, icon: Hash, color: 'text-indigo-600' },
                 { label: 'تاريخ الكتاب', value: doc.date, icon: Calendar, color: 'text-emerald-600' },
                 { label: 'جهة الإصدار', value: doc.sender, icon: SendHorizontal, color: 'text-blue-600' },
                 { label: 'جهة الاستلام', value: doc.receiver || 'غير محدد', icon: Building2, color: 'text-cyan-600' },
                 { label: 'الحالة الحالية', value: doc.status, icon: CheckSquare, color: 'text-amber-600' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 bg-white rounded-lg shadow-sm ${item.color}`}><item.icon size={16} /></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">المستندات المرفقة <Paperclip size={16} className="text-emerald-600" /></h3>
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all border border-slate-100 shadow-sm">
                 <PlusCircle size={14} /> إضافة مرفق
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doc.attachments.map((file) => {
                  const isAudio = file.type.startsWith('audio/');
                  return (
                    <div key={file.id} className="group bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all flex items-center justify-between gap-3">
                       <div className="flex items-center gap-4 min-w-0 cursor-pointer flex-1" onClick={() => handlePreviewFile(file)}>
                          <div className={`p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${isAudio ? 'bg-indigo-600 text-white' : 'bg-white text-emerald-600'}`}>
                             {isAudio ? <Headphones size={22} /> : getFileIcon(file.type)}
                          </div>
                          <div className="overflow-hidden flex-1">
                             {editingFileId === file.id ? (
                               <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                                 <input autoFocus type="text" className="w-full bg-white border border-emerald-300 rounded-lg px-2 py-1 text-[10px] font-black outline-none" value={tempFileName} onChange={e => setTempFileName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRenameFile(file.id)} />
                                 <button onClick={() => handleRenameFile(file.id)} className="p-1 bg-emerald-600 text-white rounded-md shadow-sm"><Check size={12} /></button>
                                 <button onClick={() => setEditingFileId(null)} className="p-1 bg-slate-200 text-slate-500 rounded-md"><X size={12} /></button>
                               </div>
                             ) : (
                               <>
                                 <h4 className="text-[11px] font-black text-slate-800 truncate leading-tight">{file.name}</h4>
                                 <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{file.size} • {isAudio ? 'مقطع صوتي' : file.type.split('/')[1].toUpperCase()}</p>
                               </>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-0.5 shrink-0">
                          {isAudio && (
                            <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="تشغيل">
                              <Play size={16} fill="currentColor" />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); setTempFileName(file.name); }} className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="تعديل الاسم">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={(e) => handleDownloadClick(e, file)} className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="تنزيل">
                            <DownloadIconWithProgress isDownloading={downloadingId === file.id} progress={downloadProgress} size={15} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteAttachment(file.id); }} className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="حذف">
                            <Trash2 size={15} />
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><SendHorizontal size={18} className="text-emerald-600" /> توجيه إداري لزملاء حقيقيين</h3>
                 <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">المكلفون من المنشأة</label>
                    <select multiple className="w-full h-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={taskData.assigneeIds} onChange={(e) => setTaskData({...taskData, assigneeIds: Array.from(e.target.selectedOptions, (o: HTMLOptionElement) => o.value)})}>
                      {employees.filter(emp => emp.id !== currentUser?.id).map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الموعد النهائي</label>
                    <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">التوجيهات</label>
                    <textarea className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs resize-none" rows={3} value={taskData.instructions} onChange={e => setTaskData({...taskData, instructions: e.target.value})} />
                 </div>
                 <div className="flex gap-2 pt-4">
                    <button onClick={handleAddTask} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-[11px] shadow-lg hover:bg-emerald-700 transition-all">إرسال التوجيه</button>
                    <button onClick={() => setShowTaskForm(false)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[11px]">إلغاء</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsView;