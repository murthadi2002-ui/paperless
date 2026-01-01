
import React from 'react';
/* Added missing SendHorizontal import */
import { FileDown, FileUp, Clock, CheckCircle2, TrendingUp, Search, UserCheck, AlertTriangle, ArrowUpRight, SendHorizontal } from 'lucide-react';
import { DocType, Document, WorkflowTask } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

interface DashboardProps {
  documents: Document[];
  onOpenDoc?: (doc: Document) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, onOpenDoc }) => {
  const incomingCount = documents.filter(d => d.type === DocType.INCOMING).length;
  const outgoingCount = documents.filter(d => d.type === DocType.OUTGOING).length;
  const inProgressCount = documents.filter(d => d.status === 'قيد المتابعة' || !!d.task).length;
  const closedCount = documents.filter(d => d.status === 'مغلق').length;

  const taskedDocs = documents.filter(d => !!d.task && d.task.status !== 'completed');

  const stats = [
    { label: 'الكتب الواردة', value: incomingCount, icon: FileDown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الكتب الصادرة', value: outgoingCount, icon: FileUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'قيد المتابعة', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مكتملة الأرشفة', value: closedCount, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مرحباً بك، { "أحمد محمد" }</h2>
          <p className="text-slate-500 mt-1">إليك ملخص سريع للأعمال الإدارية والمتابعة اليوم</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث سريع برقم الكتاب أو الموضوع..." 
            className="w-80 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <TrendingUp size={14} />
                <span>نظام توجيه مفعل</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Section */}
      {taskedDocs.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md"><UserCheck size={20} /></div>
               <h3 className="font-bold text-slate-800">متابعة الكتب الموجهة (قيد الإجابة)</h3>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{taskedDocs.length} مهام معلقة</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {taskedDocs.slice(0, 3).map(doc => {
               const emp = MOCK_EMPLOYEES.find(e => e.id === doc.task?.assigneeId);
               return (
                 <div key={doc.id} onClick={() => onOpenDoc?.(doc)} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <img src={emp?.avatar} className="w-8 h-8 rounded-lg object-cover border border-white shadow-sm" alt="" />
                        <span className="text-[11px] font-black text-slate-700">{emp?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase">
                        <Clock size={12} /> {doc.task?.dueDate}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 line-clamp-1 mb-2">{doc.subject}</h4>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">رقم: {doc.refNumber}</span>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">آخر المراسلات والأرشفة</h3>
            <button className="text-emerald-600 text-sm font-bold hover:underline">عرض الأرشيف</button>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} onClick={() => onOpenDoc?.(doc)} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-4 cursor-pointer">
                <div className={`p-3 rounded-xl ${doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">{doc.subject}</h4>
                    <div className="flex items-center gap-2">
                      {doc.task && <span className="text-[9px] font-black px-2 py-1 bg-amber-100 text-amber-700 rounded-lg uppercase tracking-widest">موجه للمتابعة</span>}
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{doc.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">رقم: {doc.refNumber}</span>
                    <span className="flex items-center gap-1">من: {doc.sender}</span>
                    <span className="flex items-center gap-1">بتاريخ: {doc.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <AlertTriangle size={18} className="text-emerald-600" /> سجل النشاط اللحظي
          </h3>
          <div className="space-y-6">
            {[
              { user: 'سارة خالد', action: 'أجابت على الكتاب الموجه #102', time: 'منذ 10 دقائق', icon: UserCheck },
              { user: 'محمد علي', action: 'أغلق الكتاب رقم #552', time: 'منذ ساعة', icon: CheckCircle2 },
              { user: 'أحمد محمد', action: 'وجه كتاباً لليلى محمود', time: 'منذ 3 ساعات', icon: SendHorizontal },
              { user: 'سارة خالد', action: 'أرفقت ملفاً جديداً', time: 'منذ 5 ساعات', icon: FileUp },
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-bold text-slate-800">{activity.user}</span>{' '}
                      <span className="text-slate-500 text-xs">{activity.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{activity.time}</p>
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
