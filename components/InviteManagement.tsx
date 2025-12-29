
import React, { useState } from 'react';
import { Search, UserPlus, Shield, Check, X, Clock } from 'lucide-react';

const InviteManagement: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);

  const handleSearch = () => {
    if (!email.includes('@')) return;
    setIsSearching(true);
    // Simulate smart search
    setTimeout(() => {
      setFoundUser({
        name: 'ياسين محمود',
        email: email,
        avatar: `https://picsum.photos/seed/${email}/100`,
      });
      setIsSearching(false);
    }, 800);
  };

  const permissions = [
    'إضافة كتاب', 'تعديل كتاب', 'حذف كتاب', 'عرض الكتب فقط',
    'تغيير حالة الكتاب', 'إغلاق كتاب', 'رفع ملفات', 'تحميل ملفات',
    'إنشاء مشروع', 'عرض تقارير'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">دعوة موظف جديد</h2>
        <p className="text-slate-500 mb-8">قم بالبحث عن موظف عبر البريد الإلكتروني لإرسال دعوة انضمام للشركة</p>

        <div className="relative mb-6">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ادخل البريد الإلكتروني للموظف..." 
            className="w-full pr-4 pl-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button 
            onClick={handleSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            {isSearching ? <span className="animate-spin border-2 border-white border-t-transparent w-4 h-4 rounded-full"></span> : <Search size={20} />}
            بحث
          </button>
        </div>

        {foundUser && (
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <img src={foundUser.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-sm" />
              <div>
                <h4 className="text-lg font-bold text-slate-800">{foundUser.name}</h4>
                <p className="text-slate-500">{foundUser.email}</p>
              </div>
              <div className="mr-auto">
                <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">مستخدم مسجل</span>
              </div>
            </div>

            <div className="border-t border-emerald-100 pt-6">
              <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Shield size={18} />
                تحديد الصلاحيات للموظف
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {permissions.map((perm, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors">
                    <input type="checkbox" className="w-5 h-5 accent-emerald-600 rounded" />
                    <span className="text-sm text-slate-600">{perm}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-8 flex gap-3">
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200">
                  <UserPlus size={20} />
                  إرسال الدعوة الآن
                </button>
                <button onClick={() => setFoundUser(null)} className="text-slate-400 hover:text-slate-600 px-4 font-bold transition-colors">إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">الدعوات المعلقة</h3>
        </div>
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold">
              <th className="p-4">الموظف</th>
              <th className="p-4">الصلاحيات</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-10">
            {[
              { name: 'ليلى أحمد', email: 'laila@comp.com', perms: 5, status: 'انتظار' },
              { name: 'عمر عادل', email: 'omar@comp.com', perms: 12, status: 'انتظار' },
            ].map((invite, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{invite.name}</div>
                  <div className="text-xs text-slate-400">{invite.email}</div>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{invite.perms} صلاحيات</span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                    <Clock size={14} />
                    {invite.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InviteManagement;
