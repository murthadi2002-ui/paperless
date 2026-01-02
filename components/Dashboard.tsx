
import React from 'react';
import { FileDown, FileUp, Clock, CheckCircle2, TrendingUp, Search, UserCheck, AlertTriangle, ArrowUpRight, SendHorizontal, Users, ArrowLeft, Send } from 'lucide-react';
import { DocType, Document, WorkflowTask } from '../types';
import { MOCK_EMPLOYEES, CURRENT_USER } from '../constants';

interface DashboardProps {
  documents: Document[];
  onOpenDoc?: (doc: Document) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, onOpenDoc }) => {
  const incomingCount = documents.filter(d => d.type === DocType.INCOMING).length;
  const outgoingCount = documents.filter(d => d.type === DocType.OUTGOING).length;
  const inProgressCount = documents.filter(d => d.status === 'قيد المتابعة' || d.tasks?.some(t => t.status !== 'completed')).length;
  const closedCount = documents.filter(d => d.status === 'مغلق').length;

  const taskedDocs = documents.filter(d => d.tasks?.some(t => t.status !== 'completed'));

  const stats = [
    { label: 'الكتب الواردة', value: incomingCount, icon: FileDown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الكتب الصادرة', value: outgoingCount, icon: FileUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'قيد المتابعة', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مكتملة الأرشفة', value: closedCount, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مرحباً بك، { CURRENT_USER.name }</h2>
          <p className="text-slate-400 mt-1 text-xs font-bold">إليك ملخص سريع للأعمال الإدارية وحالة الأرشفة اليوم</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="بحث سريع برقم الكتاب أو الموضوع..." 
            className="w-72 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                </div>
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110 shadow-sm`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Section - Redesigned with Full Identity Capsules */}
      {taskedDocs.length > 0 && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 px-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg"><Send size={18} /></div>
               <h3 className="font-black text-slate-800 text-sm">متابعة سجل التوجيهات الإدارية</h3>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-200">{taskedDocs.length} مهام بانتظار الإجابة</span>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {taskedDocs.slice(0, 3).map(doc => {
               const activeTask = [...doc.tasks].reverse().find(t => t.status !== 'completed');
               if (!activeTask) return null;

               const issuer = MOCK_EMPLOYEES.find(e => e.id === activeTask.issuerId) || CURRENT_USER;
               const assignees = MOCK_EMPLOYEES.filter(e => activeTask.assigneeIds.includes(e.id));

               return (
                 <div key={doc.id} onClick={() => onOpenDoc?.(doc)} className="bg-white p-6 rounded-[2.8rem] border border-slate-100 hover:shadow-2xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col h-full shadow-sm relative">
                    {/* Full Identity Flow with Names */}
                    <div className="flex flex-col gap-3.5 mb-6 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100/50">
                      {/* Full Issuer Pill (Name + Photo) */}
                      <div className="flex items-center self-start gap-3 bg-white px-4 py-2.5 rounded-full border border-indigo-100 shadow-sm transition-transform group-hover:scale-105 ring-2 ring-indigo-50/20">
                        <span className="text-[8px] font-black text-indigo-400 uppercase">مِن:</span>
                        <img src={issuer?.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                        <span className="text-[10px] font-black text-indigo-700 truncate max-w-[120px]">{issuer?.name}</span>
                      </div>
                      
                      <div className="pr-6 py-0.5 text-slate-200"><ArrowLeft size={16} strokeWidth={3} /></div>

                      {/* Full Assignees Pill */}
                      <div className="flex items-center self-end gap-3 bg-white px-4 py-2.5 rounded-full border border-amber-100 shadow-sm transition-transform group-hover:scale-105">
                        <span className="text-[8px] font-black text-amber-400 uppercase ml-1">إلى:</span>
                        <div className="flex -space-x-1.5 flex-row-reverse">
                          {assignees.slice(0, 2).map(a => (
                            <img key={a.id} src={a.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm" title={a.name} alt="" />
                          ))}
                          {assignees.length > 2 && (
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[8px] font-black flex items-center justify-center border-2 border-white">+{assignees.length - 2}</div>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-amber-700">{assignees.length === 1 ? assignees[0].name.split(' ')[0] : 'المكلفون'}</span>
                      </div>
                    </div>

                    <h4 className="text-[13px] font-black text-slate-800 line-clamp-2 mb-4 leading-relaxed flex-1 px-1 border-r-2 border-amber-100 pr-3">{doc.subject}</h4>
                    
                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <Clock size={12} /> {activeTask.dueDate}
                      </div>
                      <div className="text-[9px] font-black text-slate-300 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                        رقم الكتاب: {doc.refNumber}
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-6 px-10 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-sm">آخر المراسلات والأرشفة الرسمية</h3>
            <button className="text-emerald-600 text-[10px] font-black hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">عرض سجل الأرشيف</button>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} onClick={() => onOpenDoc?.(doc)} className="p-6 px-10 hover:bg-slate-50 transition-colors flex items-center gap-6 cursor-pointer group">
                <div className={`p-4 rounded-2xl transition-transform group-hover:rotate-12 ${doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-black text-slate-800 text-[13px] truncate leading-tight">{doc.subject}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.tasks?.some(t => t.status === 'pending') && <span className="text-[8px] font-black px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg uppercase border border-amber-100 shadow-sm">موجه</span>}
                      <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg">{doc.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                    <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-emerald-500" />{doc.refNumber}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="truncate max-w-[150px]">{doc.sender}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm h-fit">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">
             <AlertTriangle size={18} className="text-emerald-600" /> سجل النشاط اللحظي
          </h3>
          <div className="space-y-6">
            {[
              { user: 'سارة خالد', action: 'اعتمدت الإجراء على التوجيه الوارد', time: '10 د', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { user: 'محمد علي', action: 'قام بإغلاق أرشيف الكتاب #552', time: '1 س', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { user: 'أحمد محمد', action: 'وجه خطاباً إدارياً جديداً للمكتب الفني', time: '3 س', icon: SendHorizontal, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl ${activity.bg} flex items-center justify-center ${activity.color} border border-slate-100 shadow-sm transition-all group-hover:scale-110`}>
                    <Icon size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[12px] truncate leading-snug">
                      <span className="font-black text-slate-800">{activity.user}</span>{' '}
                      <span className="text-slate-500 font-bold">{activity.action}</span>
                    </p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5"><Clock size={10} />{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
