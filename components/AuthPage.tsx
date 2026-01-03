
import React, { useState } from 'react';
import { 
  Building, UserPlus, LogIn, ShieldCheck, 
  ArrowLeft, ArrowRight, Mail, Lock, 
  User as UserIcon, Globe, 
  CheckCircle2, Sparkles, PlusCircle
} from 'lucide-react';
import { User, Organization } from '../types';

interface AuthPageProps {
  onLogin: (user: User, org: Organization) => void;
}

const LogoP = ({ size = 28 }: { size?: number }) => (
  <div 
    className="bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center font-black"
    style={{ width: size * 1.8, height: size * 1.8, fontSize: size }}
  >
    P
  </div>
);

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'choice' | 'create-org' | 'join-org' | 'login'>('choice');
  const [loading, setLoading] = useState(false);

  // Form States
  const [orgName, setOrgName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newOrg: Organization = {
        id: 'org-' + Math.random().toString(36).substr(2, 5),
        name: orgName,
        code: 'PAPER-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        ownerId: 'u-admin',
        createdAt: new Date().toISOString()
      };
      const adminUser: User = {
        id: 'u-admin',
        name: userName,
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        role: 'admin',
        organizationId: newOrg.id,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      onLogin(adminUser, newOrg);
    }, 1500);
  };

  const handleJoinOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockOrg: Organization = {
        id: 'org-existing',
        name: 'منشأة تجريبية',
        code: orgCode,
        ownerId: 'u-owner',
        createdAt: new Date().toISOString()
      };
      const employeeUser: User = {
        id: 'u-' + Math.random().toString(36).substr(2, 5),
        name: userName,
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        role: 'employee',
        organizationId: mockOrg.id,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      onLogin(employeeUser, mockOrg);
    }, 1500);
  };

  const CardChoice = ({ icon: Icon, title, desc, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-right flex flex-col items-start gap-6 w-full max-w-sm"
    >
      <div className={`p-5 rounded-[1.8rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${color}`}>
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-xs font-bold text-slate-400 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-xs opacity-0 group-hover:opacity-100 transition-all">
        بدء العملية الآن <ArrowLeft size={16} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-cairo" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full -mr-64 -mt-64 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full -ml-64 -mb-64 blur-3xl"></div>

      {/* Header Logo */}
      <div className="mb-16 text-center z-10 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-[2.5rem] shadow-2xl shadow-emerald-100 border border-slate-50 mb-6">
           <LogoP size={28} />
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Paperless</h1>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">نظام الأرشفة الإدارية الذكي</p>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        {step === 'choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
            <CardChoice 
              icon={PlusCircle} 
              title="تأسيس منشأة جديدة" 
              desc="إذا كنت مديراً وتريد إنشاء نظام أرشفة خاص بمؤسستك وتحديد الهيكل التنظيمي."
              onClick={() => setStep('create-org')}
              color="bg-emerald-50 text-emerald-600"
            />
            <CardChoice 
              icon={UserPlus} 
              title="الالتحاق بفريق عمل" 
              desc="إذا كنت موظفاً وتلقيت دعوة من مديرك، ستحتاج إلى رمز المنشأة."
              onClick={() => setStep('join-org')}
              color="bg-emerald-50 text-emerald-600"
            />
          </div>
        )}

        {(step === 'create-org' || step === 'join-org' || step === 'login') && (
          <div className="w-full max-w-lg bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 relative overflow-hidden">
             <button onClick={() => setStep('choice')} className="absolute left-8 top-12 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><ArrowRight size={20} /></button>
             
             <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-800">
                  {step === 'create-org' ? 'تأسيس المنشأة' : step === 'join-org' ? 'انضمام للفريق' : 'تسجيل الدخول'}
                </h2>
             </div>

             <form onSubmit={step === 'create-org' ? handleCreateOrg : handleJoinOrg} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
                   <input type="email" required className="w-full pr-6 pl-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 font-bold transition-all" placeholder="name@company.com" />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 mt-4"
                >
                  {loading ? 'جاري التحميل...' : 'دخول'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
