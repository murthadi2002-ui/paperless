
import React from 'react';
import { FileDown, FileUp, Clock, CheckCircle2, TrendingUp, Search } from 'lucide-react';
import { DocType, Document } from '../types';

interface DashboardProps {
  documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const incomingCount = documents.filter(d => d.type === DocType.INCOMING).length;
  const outgoingCount = documents.filter(d => d.type === DocType.OUTGOING).length;
  const inProgressCount = documents.filter(d => d.status === 'قيد المتابعة').length;
  const closedCount = documents.filter(d => d.status === 'مغلق').length;

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
          <p className="text-slate-500 mt-1">إليك ملخص سريع للأعمال الإدارية اليوم</p>
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
                <span>نظام ذكي متكامل</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">آخر المراسلات</h3>
            <button className="text-emerald-600 text-sm font-bold hover:underline">عرض الكل</button>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className={`p-3 rounded-xl ${doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">{doc.subject}</h4>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{doc.status}</span>
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
          <h3 className="font-bold text-slate-800 mb-6">سجل النشاط</h3>
          <div className="space-y-6">
            {[
              { user: 'سارة خالد', action: 'أضافت كتاباً وارداً جديداً', time: 'منذ 10 دقائق' },
              { user: 'محمد علي', action: 'قام بإغلاق الكتاب رقم #552', time: 'منذ ساعة' },
              { user: 'أحمد محمد', action: 'أنشأ مشروع "برج دبي"', time: 'منذ 3 ساعات' },
              { user: 'سارة خالد', action: 'أرفقت ملفاً جديداً', time: 'منذ 5 ساعات' },
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {activity.user[0]}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-slate-800">{activity.user}</span>{' '}
                    <span className="text-slate-500">{activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
