
import React, { useState } from 'react';
import { 
  ClipboardList, Clock, CheckCircle2, AlertCircle, 
  ChevronLeft, FileText, Send, User, Calendar,
  ArrowUpRight, MessageSquare, Briefcase, Reply,
  UserCheck, History, Check, X
} from 'lucide-react';
import { Document, WorkflowTask } from '../types';
import { CURRENT_USER } from '../constants';

interface EmployeePortalProps {
  documents: Document[];
  onOpenDoc: (doc: Document) => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ documents, onOpenDoc }) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'completed'>('pending');
  const [selectedTask, setSelectedTask] = useState<{doc: Document, task: WorkflowTask} | null>(null);
  const [response, setResponse] = useState('');

  const myTasks = documents.flatMap(doc => 
    (doc.tasks || [])
      .filter(task => task.assigneeIds.includes(CURRENT_USER.id))
      .map(task => ({ doc, task }))
  ).filter(item => activeFilter === 'pending' ? item.task.status === 'pending' : item.task.status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">بوابة الموظف الذكية</h2>
          <p className="text-slate-500 text-sm mt-1 font-bold">إليك كافة التوجيهات الإدارية الموكلة إليك للمتابعة والإجابة</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit">
           <button onClick={() => setActiveFilter('pending')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeFilter === 'pending' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>بانتظار الإجابة ({myTasks.filter(t => t.task.status === 'pending').length})</button>
           <button onClick={() => setActiveFilter('completed')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeFilter === 'completed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>مكتملة الأرشفة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {myTasks.length > 0 ? (
          myTasks.map(({ doc, task }) => (
            <div key={task.id} onClick={() => setSelectedTask({doc, task})} className={`bg-white p-6 rounded-[2.5rem] border transition-all group cursor-pointer overflow-hidden flex flex-col relative ${selectedTask?.task.id === task.id ? 'ring-4 ring-amber-500/10 border-amber-500 shadow-2xl scale-[1.02]' : 'border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl border transition-all shadow-sm ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white'}`}>
                     {task.status === 'completed' ? <CheckCircle2 size={22} /> : <ClipboardList size={22} />}
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الموعد النهائي</span>
                     <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                        <Clock size={14} className={task.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'} />
                        {task.dueDate}
                     </div>
                  </div>
               </div>

               <div className="flex-1 space-y-2 mb-6">
                  <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">{doc.subject}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                     رقم المرجع: {doc.refNumber}
                  </div>
               </div>

               <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6 group-hover:bg-white transition-all shadow-inner">
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{task.instructions}"</p>
               </div>

               <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'} shadow-lg`}></div>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{task.status === 'completed' ? 'تمت الإجابة' : 'بانتظار المراجعة'}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-black transition-transform ${task.status === 'completed' ? 'text-emerald-600' : 'text-amber-600 group-hover:translate-x-[-4px]'}`}>
                     {task.status === 'completed' ? 'معاينة الرد' : 'الرد الآن'}
                     <ArrowUpRight size={14} />
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in-95">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-800">لا توجد مهام حالياً</h3>
             <p className="text-slate-400 text-sm font-bold mt-2">لقد أنجزت كافة التوجيهات الإدارية الموكلة إليك بنجاح</p>
          </div>
        )}
      </div>

      {/* Task Response Sidebar Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
           <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 ease-out border-r border-slate-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTask(null)} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={20} /></button>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div>
                       <h3 className="text-lg font-black text-slate-900">تفاصيل التوجيه الإداري</h3>
                       <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">توجيه صادر من المدير العام</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 {/* Document Info */}
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm"><FileText size={24} /></div>
                       <div>
                          <h4 className="text-base font-black text-slate-800 leading-snug">{selectedTask.doc.subject}</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1">رقم المرجع العالمي: {selectedTask.doc.refNumber}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white/60 p-4 rounded-2xl border border-white">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الجهة المرسلة</p>
                          <p className="text-xs font-black text-slate-700">{selectedTask.doc.sender}</p>
                       </div>
                       <div className="bg-white/60 p-4 rounded-2xl border border-white">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تاريخ الأرشفة</p>
                          <p className="text-xs font-black text-slate-700">{selectedTask.doc.date}</p>
                       </div>
                    </div>
                    <button onClick={() => onOpenDoc(selectedTask.doc)} className="w-full mt-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm">عرض الكتاب بالكامل ومرفقاته</button>
                 </div>

                 {/* The Task Instruction */}
                 <div className="space-y-4">
                    <h5 className="font-black text-slate-900 flex items-center gap-3 text-sm">
                       <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><UserCheck size={16} /></div>
                       التوجيه المطلوب تنفيذه
                    </h5>
                    <div className="p-6 bg-white border-2 border-amber-500/10 rounded-3xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/20"></div>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedTask.task.instructions}"</p>
                       <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400">
                          <History size={14} /> صدر في: {selectedTask.task.createdAt.split('T')[0]}
                       </div>
                    </div>
                 </div>

                 {/* Response Interface */}
                 {selectedTask.task.status === 'pending' ? (
                   <div className="space-y-4 pt-4">
                      <h5 className="font-black text-slate-900 flex items-center gap-3 text-sm">
                         <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Reply size={16} /></div>
                         الرد الإداري والإجراء المتخذ
                      </h5>
                      <textarea 
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="اكتب ردك هنا مع توضيح الإجراءات التي قمت بها..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-sm resize-none h-40 text-right"
                      />
                      <div className="flex gap-4">
                        <button disabled={!response.trim()} className="flex-1 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                           <Check size={20} /> اعتماد الرد وإغلاق المهمة
                        </button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4 pt-4 animate-in fade-in">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-md"><Check size={16} /></div>
                        <h5 className="font-black text-slate-900 text-sm">تم إنجاز المهمة والرد عليها</h5>
                      </div>
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner">
                        <p className="text-sm font-bold text-emerald-900 leading-relaxed">تمت مراجعة الكتاب وإبداء الرأي الفني، المرفقات سليمة ومطابقة للمواصفات المطلوبة.</p>
                        <div className="mt-4 flex items-center justify-between text-[10px] font-black text-emerald-600/60 uppercase">
                           <span>تم الرد في: 2024-05-10</span>
                           <span className="flex items-center gap-1"><User size={12} /> المسؤول: {CURRENT_USER.name}</span>
                        </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default EmployeePortal;
