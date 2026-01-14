import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { 
  Building, UserPlus, LogIn, ShieldCheck, 
  ArrowLeft, ArrowRight, Mail, Lock, 
  User as UserIcon, Globe, 
  CheckCircle2, Sparkles, PlusCircle,
  Chrome, Send, KeyRound, AlertCircle, Loader2,
  Clock, ShieldAlert, CheckCircle, RefreshCw,
  ExternalLink, Copy
} from 'lucide-react';
import { User, Organization } from '../types';

interface AuthPageProps {
  onLogin: (user: User, org: Organization) => void;
}

const LogoP = ({ size = 28 }: { size?: number }) => (
  <div className="bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center font-black" style={{ width: size * 1.8, height: size * 1.8, fontSize: size }}>P</div>
);

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [flowStep, setFlowStep] = useState<'auth' | 'verify' | 'onboarding' | 'create-org' | 'join-org' | 'pending'>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.organizationId) {
            const orgDoc = await getDoc(doc(db, "organizations", userData.organizationId));
            if (orgDoc.exists()) {
              if (userData.status === 'active') {
                onLogin(userData, orgDoc.data() as Organization);
              } else {
                setFlowStep('pending');
              }
            }
          } else {
            setFlowStep('onboarding');
          }
        } else {
          setFlowStep('onboarding');
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, "users", res.user.uid), {
          id: res.user.uid, name, email, avatar: `https://ui-avatars.com/api/?name=${name}&background=10b981&color=fff`,
          role: 'employee', organizationId: '', status: 'pending', joinedDate: new Date().toISOString().split('T')[0]
        });
        setFlowStep('onboarding');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const finalizeCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const orgId = 'org-' + Math.random().toString(36).substr(2, 5);
      // توليد رمز طويل وفريد لضمان عدم التكرار
      const uniqueCode = 'PAPER-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      const orgData: Organization = {
        id: orgId, name: orgName, code: uniqueCode, ownerId: auth.currentUser.uid, createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "organizations", orgId), orgData);
      await setDoc(doc(db, "users", auth.currentUser.uid), { organizationId: orgId, role: 'admin', status: 'active' }, { merge: true });
      const updatedUser = (await getDoc(doc(db, "users", auth.currentUser.uid))).data() as User;
      onLogin(updatedUser, orgData);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const finalizeJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "organizations"), where("code", "==", orgCode.trim()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("رمز المنشأة غير صحيح أو منتهي الصلاحية.");
      const orgData = querySnapshot.docs[0].data() as Organization;
      await setDoc(doc(db, "users", auth.currentUser.uid), { organizationId: orgData.id, status: 'pending' }, { merge: true });
      setFlowStep('pending');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-cairo" dir="rtl">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-[2.2rem] shadow-2xl border border-slate-50 mb-6">
           <LogoP size={28} />
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Paperless</h1>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl">
        {flowStep === 'auth' && (
          <form onSubmit={handleAuthAction} className="space-y-4">
             <h2 className="text-2xl font-black text-slate-800 text-center mb-6">{authMode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}</h2>
             {error && <p className="p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg">{error}</p>}
             {authMode === 'register' && <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none font-bold text-sm" placeholder="الاسم الكامل" />}
             <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none font-bold text-sm" placeholder="البريد الإلكتروني" />
             <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none font-bold text-sm" placeholder="كلمة المرور" />
             <button disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg hover:bg-emerald-700 transition-all">{loading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'login' ? 'دخول' : 'بدء الحساب')}</button>
             <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-xs font-bold text-slate-400 mt-2">{authMode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ دخول'}</button>
          </form>
        )}

        {flowStep === 'onboarding' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-slate-800 text-center mb-4">اختر طريقك في Paperless</h2>
            <button onClick={() => setFlowStep('create-org')} className="p-6 bg-slate-50 border-2 border-emerald-100 rounded-3xl text-right hover:bg-emerald-50 transition-all group">
               <h3 className="font-black text-emerald-800 flex items-center gap-2"><PlusCircle size={18} /> تأسيس منشأة جديدة</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-2">كن مدير النظام الخاص بمنشأتك وادعُ الموظفين.</p>
            </button>
            <button onClick={() => setFlowStep('join-org')} className="p-6 bg-slate-50 border-2 border-indigo-100 rounded-3xl text-right hover:bg-indigo-50 transition-all group">
               <h3 className="font-black text-indigo-800 flex items-center gap-2"><UserPlus size={18} /> الانضمام لمنشأة موجودة</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-2">استخدم رمز الدعوة الممنوح لك من مديرك.</p>
            </button>
          </div>
        )}

        {flowStep === 'create-org' && (
          <form onSubmit={finalizeCreateOrg} className="space-y-4">
             <h2 className="text-xl font-black text-slate-800 text-center">تأسيس منشأتك</h2>
             <input type="text" required value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none font-bold text-sm" placeholder="اسم المنشأة / الشركة" />
             <button disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black">إنشاء المنشأة والبدء</button>
             <button type="button" onClick={() => setFlowStep('onboarding')} className="w-full text-xs font-bold text-slate-400">تراجع</button>
          </form>
        )}

        {flowStep === 'join-org' && (
          <form onSubmit={finalizeJoinOrg} className="space-y-4">
             <h2 className="text-xl font-black text-slate-800 text-center">أدخل رمز الانضمام</h2>
             <input type="text" required value={orgCode} onChange={e => setOrgCode(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none font-bold text-sm tracking-widest text-center" placeholder="PAPER-XXXX-YYYY" />
             <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black">إرسال طلب الانضمام</button>
             <button type="button" onClick={() => setFlowStep('onboarding')} className="w-full text-xs font-bold text-slate-400">تراجع</button>
          </form>
        )}

        {flowStep === 'pending' && (
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50"><Clock size={40} /></div>
             <h2 className="text-lg font-black text-slate-800">طلبك قيد المراجعة</h2>
             <p className="text-[11px] font-bold text-slate-400 leading-relaxed">تم إرسال طلبك لمدير المنشأة. يرجى الانتظار حتى يتم قبولك وتعيين صلاحياتك.</p>
             <button onClick={() => { auth.signOut(); setFlowStep('auth'); }} className="text-xs font-black text-slate-400 hover:text-emerald-600">تسجيل الخروج والعودة</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;