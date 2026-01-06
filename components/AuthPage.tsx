
import React, { useState } from 'react';
import { 
  Building, UserPlus, LogIn, ShieldCheck, 
  ArrowLeft, ArrowRight, Mail, Lock, 
  User as UserIcon, Globe, 
  CheckCircle2, Sparkles, PlusCircle,
  Chrome, Send, KeyRound, AlertCircle, Loader2,
  // Added missing Clock import
  Clock
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
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [flowStep, setFlowStep] = useState<'auth' | 'onboarding' | 'create-org' | 'join-org' | 'pending'>('auth');
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // محاكاة الاتصال بـ Firebase Auth
    setTimeout(() => {
      setLoading(false);
      if (authMode === 'login') {
        // إذا كان مستخدماً سابقاً يدخل مباشرة (محاكاة)
        // إذا كان أول مرة، ننتقل للـ Onboarding
        setFlowStep('onboarding');
      } else {
        setFlowStep('onboarding');
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFlowStep('onboarding');
    }, 1000);
  };

  const finalizeCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newOrg: Organization = {
        id: 'org-' + Math.random().toString(36).substr(2, 5),
        name: orgName,
        code: 'PAPER-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        ownerId: 'u-current',
        createdAt: new Date().toISOString()
      };
      const user: User = {
        id: 'u-current',
        name: name || 'مستخدم جديد',
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        role: 'admin',
        organizationId: newOrg.id,
        status: 'active'
      };
      onLogin(user, newOrg);
    }, 1500);
  };

  const finalizeJoinOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFlowStep('pending');
    }, 1500);
  };

  const renderAuthForm = () => (
    <div className="w-full max-w-md bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-800">
          {authMode === 'login' ? 'مرحباً بك مجدداً' : authMode === 'register' ? 'إنشاء حساب جديد' : 'استعادة الحساب'}
        </h2>
        <p className="text-xs font-bold text-slate-400 mt-2">
          {authMode === 'login' ? 'سجل دخولك للوصول إلى أرشيفك الإداري' : 'ابدأ رحلة الأرشفة الذكية مع Paperless'}
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-3.5 border border-slate-200 rounded-xl flex items-center justify-center gap-3 font-black text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Chrome size={18} className="text-blue-500" />
          المتابعة باستخدام حساب Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-slate-100"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase">أو عبر البريد</span>
          <div className="flex-1 h-[1px] bg-slate-100"></div>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم الكامل</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all" placeholder="أدخل اسمك..." />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all" placeholder="email@company.com" />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => setAuthMode('forgot')} className="text-[9px] font-black text-emerald-600 hover:underline">نسيت كلمة السر؟</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all" placeholder="••••••••" />
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'login' ? 'دخول' : authMode === 'register' ? 'إنشاء الحساب' : 'إرسال رابط الاستعادة')}
            {!loading && <Send size={14} />}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs font-bold text-slate-400">
            {authMode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-emerald-600 mr-2 hover:underline"
            >
              {authMode === 'login' ? 'سجل الآن' : 'سجل دخولك'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div className="flex flex-col md:flex-row gap-8 animate-in zoom-in-95 duration-500">
      <button 
        onClick={() => setFlowStep('create-org')}
        className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-right flex flex-col items-start gap-6 w-full max-w-xs"
      >
        <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
          <PlusCircle size={32} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-2">تأسيس منشأة جديدة</h3>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">كن مديراً لنظامك الخاص، أنشئ الأقسام وادعُ موظفيك للأرشفة.</p>
        </div>
        <ArrowLeft className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" />
      </button>

      <button 
        onClick={() => setFlowStep('join-org')}
        className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-right flex flex-col items-start gap-6 w-full max-w-xs"
      >
        <div className="p-5 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
          <UserPlus size={32} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-2">الانضمام لمنشأة</h3>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">لديك رمز دعوة؟ انضم لفريق عملك وابدأ أرشفة الوثائق الموكلة إليك.</p>
        </div>
        <ArrowLeft className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-cairo" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full -mr-64 -mt-64 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/20 rounded-full -ml-64 -mb-64 blur-3xl"></div>

      <div className="mb-12 text-center z-10 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-[2.2rem] shadow-2xl shadow-emerald-100/50 border border-slate-50 mb-6">
           <LogoP size={28} />
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Paperless</h1>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">نظام الأرشفة الإدارية الذكي</p>
      </div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        {flowStep === 'auth' && renderAuthForm()}
        {flowStep === 'onboarding' && renderOnboarding()}
        
        {flowStep === 'create-org' && (
          <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-bottom-8 relative overflow-hidden">
             <button onClick={() => setFlowStep('onboarding')} className="absolute left-6 top-8 p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><ArrowRight size={18} /></button>
             <h2 className="text-xl font-black text-slate-800 mb-8">تفاصيل المنشأة الجديدة</h2>
             <form onSubmit={finalizeCreateOrg} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم المنشأة / المؤسسة</label>
                   <div className="relative">
                      <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input type="text" required value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm" placeholder="مثال: شركة الفاو الهندسية" />
                   </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                   <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-700 leading-relaxed">بصفتك مؤسس المنشأة، ستحصل تلقائياً على صلاحيات مدير النظام الكاملة.</p>
                </div>
                <button disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70">
                   {loading ? <Loader2 className="animate-spin" size={18} /> : 'تأسيس والبدء بالأرشفة'}
                </button>
             </form>
          </div>
        )}

        {flowStep === 'join-org' && (
          <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-bottom-8 relative overflow-hidden">
             <button onClick={() => setFlowStep('onboarding')} className="absolute left-6 top-8 p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><ArrowRight size={18} /></button>
             <h2 className="text-xl font-black text-slate-800 mb-8">الانضمام لفريق عمل</h2>
             <form onSubmit={finalizeJoinOrg} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">رمز الانضمام (Join Code)</label>
                   <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input type="text" required value={orgCode} onChange={e => setOrgCode(e.target.value)} className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-black text-sm tracking-widest text-center" placeholder="PAPER-XXXX" />
                   </div>
                </div>
                <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
                   {loading ? <Loader2 className="animate-spin" size={18} /> : 'إرسال طلب الانضمام'}
                </button>
             </form>
          </div>
        )}

        {flowStep === 'pending' && (
          <div className="w-full max-w-md bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-500 text-center space-y-8">
             <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-amber-50/50">
                <Clock size={48} />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-800">طلبك قيد المراجعة</h2>
                <p className="text-[11px] font-bold text-slate-400 mt-4 leading-relaxed">لقد تم إرسال طلب الانضمام لمدير المنشأة بنجاح. يرجى التواصل معه لقبول طلبك لتتمكن من الوصول إلى الأرشيف.</p>
             </div>
             <div className="pt-4 border-t border-slate-50">
                <button onClick={() => setFlowStep('auth')} className="text-xs font-black text-slate-400 hover:text-emerald-600 transition-colors">تسجيل الخروج والعودة</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
