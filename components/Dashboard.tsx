import React from 'react';
import { FileDown, FileUp, Clock, CheckCircle2, TrendingUp, Search, AlertTriangle, ArrowUpRight, Send, ArrowLeft } from 'lucide-react';
import { DocType, Document } from '../types';
import { auth } from '../firebase';

interface DashboardProps {
  documents: Document[];
  onOpenDoc?: (doc: Document) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, onOpenDoc }) => {
  const currentUser = auth.currentUser;
  const incomingCount = documents.filter(d => d.type === DocType.INCOMING).length;
  const outgoingCount = documents.filter(d => d.type === DocType.OUTGOING).length;
  const inProgressCount = documents.filter(d => d.status === 'قيد المتابعة' || d.tasks?.some(t => t.status !== 'completed')).length;
  const closedCount = documents.filter(d => d.status === 'مغلق').length;

  const taskedDocs = documents.filter(d => d.tasks?.some(t => t.status !== 'completed'));

  const stats = [
    { label: 'الكتب الواردة', value: incomingCount, icon: FileDown, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'الكتب الصادرة', value: outgoingCount, icon: FileUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'قيد المتابعة', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مكتملة الأرشفة', value: closedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مرحباً بك، { currentUser?.displayName || 'مستخدم ورقلة' }</h2>
          <p className="text-slate-400 mt-1 text-xs font-bold">إليك ملخص سريع للأعمال الإدارية وحالة الأرشفة اليوم</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="بحث سريع برقم الكتاب أو الموضوع..." 
            className="w-72 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                </div>
                <div className={`${stat.bg} ${stat.color} p-4 rounded-xl transition-transform group-hover:scale-110 shadow-sm`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-6 px-10 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-sm">آخر المراسلات والأرشفة الرسمية</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.length > 0 ? documents.slice(0, 5).map((doc) => (
              <div key={doc.id} onClick={() => onOpenDoc?.(doc)} className="p-6 px-10 hover:bg-slate-50 transition-colors flex items-center gap-6 cursor-pointer group">
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-black text-slate-800 text-[13px] truncate leading-tight">{doc.subject}</h4>
                    <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg">{doc.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                    <span>{doc.refNumber}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{doc.sender}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-slate-300 italic text-xs">لا توجد وثائق مؤرشفة حالياً</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm h-fit">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">
             <AlertTriangle size={18} className="text-emerald-600" /> تنبيهات النظام
          </h3>
          <div className="p-6 text-center text-slate-300 text-[10px] font-bold">
            بانتظار وصول إشعارات أو مهام حقيقية من زملائك في المنشأة.
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;