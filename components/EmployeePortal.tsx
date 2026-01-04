
import React, { useState } from 'react';
import { 
  ClipboardList, Clock, CheckCircle2, AlertCircle, 
  ChevronLeft, FileText, Send, User, Calendar,
  ArrowUpRight, MessageSquare, Briefcase, Reply,
  UserCheck, History, Check, X, Users, UserPlus,
  ArrowLeft, ArrowRightLeft, SendHorizontal
} from 'lucide-react';
import { Document, WorkflowTask } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface EmployeePortalProps {
  documents: Document[];
  onOpenDoc: (doc: Document) => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ documents, onOpenDoc }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'completed'>('incoming');
  const [selectedTask, setSelectedTask] = useState<{doc: Document, task: WorkflowTask} | null>(null);
  const [response, setResponse] = useState('');

  // Filtering Logic
  const allPortalTasks = documents.flatMap(doc => 
    (doc.tasks || []).map(task => ({ doc, task }))
  );

  const filteredTasks = allPortalTasks.filter(({ task }) => {
    if (activeTab === 'incoming') {
      return task.assigneeIds.includes(CURRENT_USER.id) && task.status !== 'completed';
    } else if (activeTab === 'outgoing') {
      return task.issuerId === CURRENT_USER.id && task.status !== 'completed';
    } else {
      // Completed tasks where user is either issuer or assignee
      return (task.assigneeIds.includes(CURRENT_USER.id) || task.issuerId === CURRENT_USER.id) && task.status === 'completed';
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">بوابة المتابعة الذكية</h2>
          <p className="text-slate-400 text-[11px] mt-1 font-bold uppercase tracking-wider">إدارة المراسلات، التوجيهات، والمهام الإدارية اللحظية</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm h-fit">
           <button onClick={() => setActiveTab('incoming')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === 'incoming' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
             <ClipboardList size={14} /> مهامي (الواردة)
           </button>
           <button onClick={() => setActiveTab('outgoing')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === 'outgoing' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
             <SendHorizontal size={14} /> توجيهاتي (الصادرة)
           </button>
           <button onClick={() => setActiveTab('completed')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
             <CheckCircle2 size={14} /> المكتملة
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(({ doc, task }) => {
            const issuer = MOCK_EMPLOYEES.find(e => e.id === task.issuerId) || CURRENT_USER;
            const assignees = MOCK_EMPLOYEES.filter(e => task.assigneeIds.includes(e.id));
            const isMyOutgoing = task.issuerId === CURRENT_USER.id;

            return (
              <div key={task.id} onClick={() => setSelectedTask({doc, task})} className={`bg-white p-6 rounded-2xl border transition-all group cursor-pointer overflow-hidden flex flex-col relative ${selectedTask?.task.id === task.id ? 'ring-4 ring-emerald-500/10 border-emerald-500 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                {/* Meta Labels */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${isMyOutgoing ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {isMyOutgoing ? 'أمر إداري صادر منك' : 'توجيه متابعة وارد'}
                  </span>
                  <span className="text-[9px] font-black text-slate-300">#{task.id.toUpperCase()}</span>
                </div>

                {/* Refined Identity Section */}
                <div className="flex flex-col gap-2.5 mb-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100/50">
                   <div className="flex items-center self-start gap-2.5 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm ring-2 ring-indigo-50/20">
                     <span className="text-[8px] font-black text-indigo-300 uppercase">مِن:</span>
                     <img src={issuer?.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-100 shadow-inner" alt="" />
                     <span className="text-[10px] font-black text-indigo-700">{issuer?.name}</span>
                   </div>

                   <div className="pr-5 py-0.5 text-slate-200"><ArrowLeft size={14} strokeWidth={3} /></div>

                   <div className="flex items-center self-end gap-2.5 bg-white px-4 py-2 rounded-full border border-amber-100 shadow-sm">
                     <span className="text-[8px] font-black text-amber-300 uppercase ml-1">إلى:</span>
                     <div className="flex -space-x-1.5 flex-row-reverse">
                       {assignees.slice(0, 3).map(a => (
                         <img key={a.id} src={a.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-amber-50" title={a.name} alt="" />
                       ))}
                       {assignees.length > 3 && (
                         <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[7px] font-black flex items-center justify-center border-2 border-white">+{assignees.length - 3}</div>
                       )}
                     </div>
                     <span className="text-[10px] font-black text-amber-700">
                        {assignees.find(a => a.id === CURRENT_USER.id) ? 'أنت' : assignees[0]?.name.split(' ')[0]} 
                        {assignees.length > 1 ? ` +${assignees.length - 1}` : ''}
                     </span>
                   </div>
                </div>

                <div className="flex-1 space-y-2 mb-5">
                  <h4 className="text-sm font-black text-slate-800 leading-tight line-clamp-2">{doc.subject}</h4>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                        <Calendar size={12} className="text-emerald-500" />
                        {doc.date}
                     </div>
                     <div className="h-3 w-[1px] bg-slate-200"></div>
                     <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600">
                        <Clock size={12} />
                        استحقاق: {task.dueDate}
                     </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6 italic">
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed line-clamp-2">"{task.instructions}"</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.status === 'completed' ? 'تم التنفيذ' : 'تحت المراجعة'}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-black transition-transform ${task.status === 'completed' ? 'text-emerald-600' : 'text-amber-600 group-hover:translate-x-[-4px]'}`}>
                     {task.status === 'completed' ? 'عرض الرد' : (isMyOutgoing ? 'متابعة الزملاء' : 'الرد الآن')}
                     <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 animate-in fade-in zoom-in-95 shadow-inner">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ClipboardList size={36} />
             </div>
             <h3 className="text-xl font-black text-slate-800">السجل فارغ حالياً</h3>
             <p className="text-slate-400 text-[11px] font-bold mt-2 uppercase tracking-widest">لا توجد توجيهات {activeTab === 'outgoing' ? 'صادرة منك' : 'واردة إليك'} في الوقت الحالي</p>
          </div>
        )}
      </div>

      {/* Task Response Sidebar Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
           <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 ease-out border-r border-slate-200">
              <div className="p-6 px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTask(null)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
                    <div className="h-6 w-[1px] bg-slate-100"></div>
                    <div>
                       <h3 className="text-base font-black text-slate-900">سجل التوجيه الإداري</h3>
                       <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">معاينة تفاصيل التنفيذ والمتابعة</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-50/20">
                 {/* Document Info Card */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg"><FileText size={24} /></div>
                       <div className="overflow-hidden text-right">
                          <h4 className="text-sm font-black text-slate-800 leading-tight">{selectedTask.doc.subject}</h4>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">المرجع: {selectedTask.doc.refNumber}</p>
                       </div>
                    </div>
                    <button onClick={() => onOpenDoc(selectedTask.doc)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">استعراض ملف الوثيقة الأصلي <ArrowUpRight size={14}/></button>
                 </div>

                 {/* Flow Section */}
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">أطراف التكليف الإداري</h5>
                    
                    <div className="flex flex-col gap-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16"></div>
                       <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50/30 rounded-full -ml-16 -mb-16"></div>
                       
                       <div className="absolute top-[90px] right-[64px] bottom-[115px] w-0.5 bg-slate-100 z-0"></div>
                       
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-full border border-indigo-100 shadow-md ring-4 ring-indigo-50/50">
                             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                             <span className="text-[9px] font-black text-indigo-400 uppercase">المُوجّه:</span>
                             <img src={MOCK_EMPLOYEES.find(e => e.id === selectedTask.task.issuerId)?.avatar || CURRENT_USER.avatar} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                             <div className="text-right">
                                <p className="text-xs font-black text-slate-800 leading-none">{MOCK_EMPLOYEES.find(e => e.id === selectedTask.task.issuerId)?.name || CURRENT_USER.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1">{MOCK_EMPLOYEES.find(e => e.id === selectedTask.task.issuerId)?.department || CURRENT_USER.department}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col gap-3 relative z-10 mr-12">
                          <div className="flex items-center gap-2 mb-1 pr-2">
                             <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md uppercase border border-amber-100 shadow-sm">المكلفون بالمتابعة</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                             {MOCK_EMPLOYEES.filter(e => selectedTask.task.assigneeIds.includes(e.id)).map(a => (
                               <div key={a.id} className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-sm transition-all ${a.id === CURRENT_USER.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}>
                                  <img src={a.avatar} className="w-7 h-7 rounded-full object-cover border-2 border-white" alt="" />
                                  <span className="text-[11px] font-black pr-1">{a.name}</span>
                                  {a.id === CURRENT_USER.id && <span className="text-[7px] font-black bg-white/20 px-2 py-0.5 rounded-full mr-1">أنت</span>}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Instruction Container */}
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">التعليمات الإدارية الملحقة</h5>
                    <div className="p-8 bg-white border border-amber-200 rounded-2xl relative overflow-hidden shadow-sm">
                       <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400"></div>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed italic pr-4">"{selectedTask.task.instructions}"</p>
                       <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300">
                            <History size={14} /> صدر في: {selectedTask.task.createdAt.split('T')[0]}
                          </div>
                          <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">الموعد النهائي: {selectedTask.task.dueDate}</div>
                       </div>
                    </div>
                 </div>

                 {/* Interface based on role & status */}
                 {selectedTask.task.status === 'pending' ? (
                   <div className="space-y-4 pt-4">
                      {selectedTask.task.issuerId === CURRENT_USER.id ? (
                        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center text-center gap-4">
                           <div className="p-4 bg-white rounded-2xl shadow-lg text-indigo-400 ring-8 ring-indigo-50">
                             <Clock size={40} />
                           </div>
                           <div>
                             <h5 className="font-black text-indigo-900 text-base">بانتظار رد المكلفين</h5>
                             <p className="text-xs font-bold text-indigo-600/80 mt-2 leading-relaxed">لقد أصدرت هذا التوجيه لزملائك. ستتلقى تنبيهاً فور قيام أحدهم بالرد واعتماد الإجراءات الفنية اللازمة.</p>
                           </div>
                        </div>
                      ) : (
                        <>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-2">تحرير الرد الإداري</h5>
                          <textarea 
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="اكتب ردك هنا مع توضيح الإجراءات الفنية المتخذة..."
                            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-sm resize-none h-40 text-right shadow-sm"
                          />
                          <button disabled={!response.trim()} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                             <Check size={20} /> اعتماد التنفيذ وإغلاق المهمة
                          </button>
                        </>
                      )}
                   </div>
                 ) : (
                   <div className="space-y-4 pt-4 animate-in fade-in">
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-md"><Check size={16} /></div>
                        <h5 className="font-black text-slate-900 text-sm">تم إنجاز المهمة بنجاح</h5>
                      </div>
                      <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-inner">
                        <p className="text-xs font-bold text-emerald-900 leading-relaxed italic">"تمت مراجعة الكتاب وإبداء الرأي الفني، المرفقات سليمة ومطابقة للمواصفات المطلوبة."</p>
                        <div className="mt-6 flex items-center justify-between text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">
                           <span>تاريخ الاعتماد: 2024-05-10</span>
                           <span className="flex items-center gap-1">الموظف المسؤول: {MOCK_EMPLOYEES.find(e => selectedTask.task.assigneeIds.includes(e.id))?.name}</span>
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
