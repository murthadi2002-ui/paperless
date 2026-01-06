import React, { useState, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc as firestoreDoc, query, orderBy, where, 
  setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { db, auth } from './firebase';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import InviteManagement from './components/InviteManagement';
import AddDocumentModal from './components/AddDocumentModal';
import DocumentDetailsView from './components/DocumentDetailsView';
import SettingsPage from './components/SettingsPage';
import ProjectList from './components/ProjectList';
import ProjectDetailsView from './components/ProjectDetailsView';
import CreateProjectModal from './components/CreateProjectModal';
import MessagingPage from './components/MessagingPage';
import EmployeePortal from './components/EmployeePortal';
import ConfirmModal from './components/ConfirmModal';
import AuthPage from './components/AuthPage';

import { Document, Folder, Project, Department, User, Organization, Position, DocStatus, Attachment, WorkflowTask } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeView, setActiveView] = useState<'list' | 'details'>('list');
  const [activeProjectView, setActiveProjectView] = useState<'list' | 'details'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [prefilledAttachments, setPrefilledAttachments] = useState<Attachment[]>([]);
  
  const [autoOpenFiles, setAutoOpenFiles] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'doc' | 'folder' | 'attachment' | 'project', parentId?: string } | null>(null);

  // مراقبة حالة المصادقة
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const userDocRef = firestoreDoc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.organizationId) {
            const orgDoc = await getDoc(firestoreDoc(db, "organizations", userData.organizationId));
            if (orgDoc.exists()) {
              setCurrentOrg(orgDoc.data() as Organization);
            }
          }
          setCurrentUser(userData);
        }
      } else {
        setCurrentUser(null);
        setCurrentOrg(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // جلب البيانات اللحظية حسب المنشأة والمشاريع
  useEffect(() => {
    if (!currentOrg || !currentUser) return;

    // جلب المستندات
    const unsubDocs = onSnapshot(query(collection(db, "documents"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document))));
    
    // جلب الأضابير
    const unsubFolders = onSnapshot(query(collection(db, "folders"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))));

    // جلب المشاريع (ترتيب حسب الأحدث)
    const unsubProjects = onSnapshot(query(collection(db, "projects"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => {
        const projs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        // ترتيب المشاريع حسب التاريخ (الأحدث أولاً)
        const sortedProjs = [...projs].sort((a, b) => {
           const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
           const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
           return dateB - dateA;
        });
        setProjects(sortedProjs);
        
        // فتح آخر مشروع تم إنشاؤه تلقائياً إذا لم يكن هناك مشروع مختار
        if (sortedProjs.length > 0 && selectedProjectId === 'all') {
          setSelectedProjectId(sortedProjs[0].id);
        }
      });

    const unsubUsers = onSnapshot(query(collection(db, "users"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => setEmployees(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User))));

    const unsubDepts = onSnapshot(collection(db, "departments"), 
      (snapshot) => setDepartments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department))));

    return () => {
      unsubDocs(); unsubFolders(); unsubProjects(); unsubUsers(); unsubDepts();
    };
  }, [currentOrg, currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentOrg(null);
    setActiveTab('dashboard');
  };

  // وظيفة "الخروج من المنشأة نهائياً"
  const handleLeaveOrganization = async () => {
    if (!currentUser) return;
    try {
      // 1. تحديث مستند المستخدم في Firestore لمسح ارتباطه بالمنشأة
      const userRef = firestoreDoc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        organizationId: "",
        role: "employee",
        status: "pending", // سيعيده هذا إلى حالة الانتظار/الاختيار
        department: "",
        permissions: []
      });

      // 2. تسجيل الخروج من Firebase للعودة لصفحة الدخول
      await handleLogout();
    } catch (error) {
      console.error("Error leaving organization:", error);
      alert("حدث خطأ أثناء محاولة الخروج من المنشأة.");
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تأمين الوصول اللحظي...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.status === 'pending' && !currentOrg)) {
    return <AuthPage onLogin={(u, o) => { setCurrentUser(u); setCurrentOrg(o); }} />;
  }

  const renderContent = () => {
    const activeDocs = documents.filter(d => !d.deletedAt);
    const activeFolders = folders.filter(f => !f.deletedAt);
    const deletedDocs = documents.filter(d => !!d.deletedAt);
    const deletedFolders = folders.filter(f => !!f.deletedAt);

    if (activeView === 'details' && currentDocument) {
      return (
        <DocumentDetailsView 
          doc={currentDocument} 
          autoOpenFiles={autoOpenFiles}
          onBack={() => { setActiveView('list'); setCurrentDocument(null); }} 
          onDelete={() => setConfirmDelete({ id: currentDocument.id, type: 'doc' })}
          onUpdateSubject={(sub) => updateDoc(firestoreDoc(db, "documents", currentDocument.id), { subject: sub })}
          onAddAttachment={async (at) => await updateDoc(firestoreDoc(db, "documents", currentDocument.id), { attachments: [...currentDocument.attachments, at] })}
          onDeleteAttachment={(atId) => setConfirmDelete({ id: atId, type: 'attachment', parentId: currentDocument.id })}
          onAddTask={(docId, task) => updateDoc(firestoreDoc(db, "documents", docId), { tasks: [...(currentDocument.tasks || []), task], status: DocStatus.IN_PROGRESS })}
          employees={employees}
          currentUser={currentUser}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard documents={activeDocs} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
      
      case 'documents': 
        return (
          <DocumentList 
            documents={activeDocs} folders={activeFolders} projects={projects}
            onAddFolder={async (f) => {
              const folderData = { 
                ...f, 
                projectId: selectedProjectId !== 'all' ? selectedProjectId : null,
                organizationId: currentOrg?.id, 
                createdAt: new Date().toISOString() 
              };
              await addDoc(collection(db, "folders"), folderData);
            }} 
            onOpenUnit={(d) => { setCurrentDocument(d); setActiveView('details'); }}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
            currentUser={currentUser}
          />
        );

      case 'my-tasks': 
        return <EmployeePortal documents={activeDocs} currentUser={currentUser} employees={employees} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
      
      case 'messages': 
        return (
          <MessagingPage 
            documents={activeDocs} folders={activeFolders} projects={projects} 
            employees={employees} currentUser={currentUser}
            onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); setActiveTab('documents'); }}
            onAddDocument={async (d) => await addDoc(collection(db, "documents"), { ...d, organizationId: currentOrg?.id, createdAt: serverTimestamp() })}
            onOpenAddModalWithFile={(files) => { setPrefilledAttachments(files); setIsAddModalOpen(true); }}
          />
        );

      case 'projects':
        if (activeProjectView === 'details' && currentProject) return <ProjectDetailsView project={currentProject} documents={activeDocs} folders={activeFolders} onBack={()=>{setActiveProjectView('list');setCurrentProject(null)}} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
        return (
          <ProjectList 
            projects={projects} documents={activeDocs} currentUser={currentUser}
            onSelectProject={(p)=>{setCurrentProject(p);setActiveProjectView('details')}} 
            onAddProject={()=>setIsAddProjectModalOpen(true)}
            onDeleteProject={(id) => setConfirmDelete({ id, type: 'project' })}
          />
        );

      case 'invites': 
        return (
          <InviteManagement 
            departments={departments} employees={employees} 
            onInvite={async (u) => await setDoc(firestoreDoc(db, "users", u.id), { ...u, organizationId: currentOrg?.id, createdAt: serverTimestamp() })} 
            onUpdateEmployee={async (id, updates) => await updateDoc(firestoreDoc(db, "users", id), updates)}
            positions={positions} 
          />
        );

      case 'settings': 
        return (
          <SettingsPage 
            deletedDocs={deletedDocs} deletedFolders={deletedFolders} 
            autoOpenFiles={autoOpenFiles} setAutoOpenFiles={setAutoOpenFiles} 
            onRestoreDoc={async (docObj)=> await updateDoc(firestoreDoc(db, "documents", docObj.id), { deletedAt: null })} 
            onRestoreFolder={async (fObj)=> await updateDoc(firestoreDoc(db, "folders", fObj.id), { deletedAt: null })} 
            departments={departments}
            onAddDept={async (name) => await addDoc(collection(db, "departments"), { name, employeeCount: 0 })}
            onDeleteDepartment={async (id) => await deleteDoc(firestoreDoc(db, "departments", id))} 
            onLogout={handleLogout}
            onLeaveOrganization={handleLeaveOrganization}
            currentUser={currentUser}
          />
        );
      default: return <Dashboard documents={activeDocs} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');setActiveProjectView('list')}} 
      onAddClick={()=>setIsAddModalOpen(true)}
      onLogout={handleLogout}
      organizationName={currentOrg?.name || "تحميل..."}
      currentUser={currentUser}
    >
      {renderContent()}

      <AddDocumentModal 
        isOpen={isAddModalOpen} 
        onClose={()=>{setIsAddModalOpen(false); setPrefilledAttachments([]);}} 
        onAdd={async (d) => await addDoc(collection(db, "documents"), { ...d, organizationId: currentOrg?.id, createdAt: serverTimestamp() })} 
        folders={folders} 
        projects={projects}
        defaultProjectId={selectedProjectId}
        defaultFolderId={activeFolderId}
        initialAttachments={prefilledAttachments}
      />
      
      <CreateProjectModal 
        isOpen={isAddProjectModalOpen} 
        onClose={()=>setIsAddProjectModalOpen(false)} 
        onSave={async (p) => await addDoc(collection(db, "projects"), { ...p, organizationId: currentOrg?.id, createdAt: new Date().toISOString() })} 
      />

      <ConfirmModal 
        isOpen={!!confirmDelete} 
        title="تأكيد الحذف"
        message="هل أنت متأكد؟ سيتم نقل العنصر إلى سلة المهملات."
        confirmLabel="نعم، حذف" cancelLabel="إلغاء"
        onConfirm={async () => {
          if (!confirmDelete) return;
          if (confirmDelete.type === 'doc') {
            await updateDoc(firestoreDoc(db, "documents", confirmDelete.id), { deletedAt: new Date().toISOString() });
            setActiveView('list');
          } else if (confirmDelete.type === 'folder') {
            await updateDoc(firestoreDoc(db, "folders", confirmDelete.id), { deletedAt: new Date().toISOString() });
          } else if (confirmDelete.type === 'project') {
            await deleteDoc(firestoreDoc(db, "projects", confirmDelete.id));
            setActiveProjectView('list');
          }
          setConfirmDelete(null);
        }} 
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
};

export default App;