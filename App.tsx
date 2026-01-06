
import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc as firestoreDoc, query, orderBy, where, 
  setDoc, getDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Import Loader2 from lucide-react
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

import { Document, Folder, Project, Department, User, Organization, Position, WorkflowTask, DocStatus, Attachment } from './types';

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
  const [userRoleView, setUserRoleView] = useState<'admin' | 'employee'>('admin'); 
  
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

  // إدارة حالة الجلسة الحقيقية
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser && firebaseUser.emailVerified) {
        const userDoc = await getDoc(firestoreDoc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.organizationId && userData.status === 'active') {
            const orgDoc = await getDoc(firestoreDoc(db, "organizations", userData.organizationId));
            if (orgDoc.exists()) {
              setCurrentUser(userData);
              setCurrentOrg(orgDoc.data() as Organization);
              setUserRoleView(userData.role);
            }
          } else {
            setCurrentUser(userData); // مستخدم بدون منشأة أو معلق
          }
        }
      } else {
        setCurrentUser(null);
        setCurrentOrg(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentOrg) return;
    const handleError = (err: any) => console.error("Firestore Error:", err);

    // ربط البيانات بالمنشأة الحالية فقط للأمان
    const qDocs = query(collection(db, "documents"), where("organizationId", "==", currentOrg.id));
    const unsubDocs = onSnapshot(qDocs, 
      (snapshot) => setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document))),
      handleError
    );
    
    const qFolders = query(collection(db, "folders"), where("organizationId", "==", currentOrg.id));
    const unsubFolders = onSnapshot(qFolders, 
      (snapshot) => setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))),
      handleError
    );

    const qProjects = query(collection(db, "projects"), where("organizationId", "==", currentOrg.id));
    const unsubProjects = onSnapshot(qProjects, 
      (snapshot) => setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project))),
      handleError
    );

    const qUsers = query(collection(db, "users"), where("organizationId", "==", currentOrg.id));
    const unsubUsers = onSnapshot(qUsers, 
      (snapshot) => setEmployees(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User))),
      handleError
    );

    const unsubDepts = onSnapshot(collection(db, "departments"), 
      (snapshot) => setDepartments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department))),
      handleError
    );
    
    const unsubPos = onSnapshot(collection(db, "positions"), 
      (snapshot) => setPositions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Position))),
      handleError
    );

    return () => {
      unsubDocs(); unsubFolders(); unsubProjects(); unsubUsers(); unsubDepts(); unsubPos();
    };
  }, [currentOrg]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentOrg(null);
  };

  const handleAddDocument = async (newDoc: any) => {
    if (!currentOrg) return;
    const { id, ...docData } = newDoc;
    const cleanData = JSON.parse(JSON.stringify(docData));
    await addDoc(collection(db, "documents"), { 
      ...cleanData, 
      organizationId: currentOrg.id,
      createdAt: serverTimestamp() 
    });
  };

  const handleAddFolder = async (folder: any) => {
    if (!currentOrg) return;
    const { id, ...data } = folder;
    const folderData = { 
      ...data, 
      organizationId: currentOrg.id,
      projectId: selectedProjectId !== 'all' ? selectedProjectId : (data.projectId || null) 
    };
    const cleanData = JSON.parse(JSON.stringify(folderData));
    await addDoc(collection(db, "folders"), { ...cleanData, createdAt: serverTimestamp() });
  };

  const handleAddProject = async (project: any) => {
    if (!currentOrg) return;
    const { id, ...data } = project;
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await addDoc(collection(db, "projects"), { 
      ...cleanData, 
      organizationId: currentOrg.id,
      createdAt: serverTimestamp() 
    });
    setSelectedProjectId(docRef.id);
  };

  const handleLogin = (user: User, org: Organization) => {
    setCurrentUser(user);
    setCurrentOrg(org);
    setUserRoleView(user.role);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تحميل الجلسة الآمنة...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !currentOrg) return <AuthPage onLogin={handleLogin} />;

  const renderContent = () => {
    const activeDocs = documents.filter(d => !d.deletedAt);
    const activeFolders = folders.filter(f => !f.deletedAt);
    const deletedDocs = documents.filter(d => !!d.deletedAt);
    const deletedFolders = folders.filter(f => !!f.deletedAt);

    if (activeView === 'details' && currentDocument) {
      const liveDoc = documents.find(d => d.id === currentDocument.id) || currentDocument;
      return (
        <DocumentDetailsView 
          doc={liveDoc} 
          autoOpenFiles={autoOpenFiles}
          onBack={() => { setActiveView('list'); setCurrentDocument(null); }} 
          onDelete={() => setConfirmDelete({ id: liveDoc.id, type: 'doc' })}
          onUpdateSubject={(sub) => updateDoc(firestoreDoc(db, "documents", liveDoc.id), { subject: sub })}
          onAddAttachment={async (at) => await updateDoc(firestoreDoc(db, "documents", liveDoc.id), { attachments: [...liveDoc.attachments, at] })}
          onDeleteAttachment={(atId) => setConfirmDelete({ id: atId, type: 'attachment', parentId: liveDoc.id })}
          onAddTask={(docId, task) => updateDoc(firestoreDoc(db, "documents", docId), { tasks: [...(liveDoc.tasks || []), task], status: DocStatus.IN_PROGRESS })}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard documents={activeDocs} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
      case 'documents': 
        return (
          <DocumentList 
            documents={activeDocs} folders={activeFolders} projects={projects}
            onAddFolder={handleAddFolder} 
            onOpenUnit={(d) => { setCurrentDocument(d); setActiveView('details'); }}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            onTogglePin={async (id) => {
              const d = documents.find(doc => doc.id === id);
              if(d) await updateDoc(firestoreDoc(db, "documents", id), { isPinned: !d.isPinned });
            }}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
          />
        );
      case 'my-tasks': return <EmployeePortal documents={activeDocs} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
      case 'messages': return (
        <MessagingPage 
          documents={activeDocs} 
          folders={activeFolders} 
          projects={projects} 
          onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); setActiveTab('documents'); }}
          onAddDocument={handleAddDocument}
          onOpenAddModalWithFile={(files) => { setPrefilledAttachments(files); setIsAddModalOpen(true); }}
        />
      );
      case 'projects':
        if (activeProjectView === 'details' && currentProject) return <ProjectDetailsView project={currentProject} documents={activeDocs} folders={activeFolders} onBack={()=>{setActiveProjectView('list');setCurrentProject(null)}} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
        return (
          <ProjectList 
            projects={projects} documents={activeDocs} 
            onSelectProject={(p)=>{setCurrentProject(p);setActiveProjectView('details')}} 
            onAddProject={()=>setIsAddProjectModalOpen(true)}
            onDeleteProject={(id) => setConfirmDelete({ id, type: 'project' })}
          />
        );
      case 'invites': 
        return (
          <InviteManagement 
            departments={departments} employees={employees} 
            onInvite={(u) => setDoc(firestoreDoc(db, "users", u.id), { ...u, createdAt: serverTimestamp() })} 
            onUpdateEmployee={(id, updates) => updateDoc(firestoreDoc(db, "users", id), updates)}
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
            onAddDept={(name) => addDoc(collection(db, "departments"), { name, employeeCount: 0 })}
            onDeleteDepartment={async (id) => deleteDoc(firestoreDoc(db, "departments", id))} 
            onLogout={handleLogout}
          />
        );
      default: return <Dashboard documents={activeDocs} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');setActiveProjectView('list')}} 
      onAddClick={()=>setIsAddModalOpen(true)}
      onLogout={handleLogout}
      organizationName={currentOrg.name}
    >
      {currentUser?.role === 'admin' && (
        <div className="fixed bottom-6 left-6 z-[100] flex gap-2">
           <button onClick={() => setUserRoleView(userRoleView === 'admin' ? 'employee' : 'admin')} className="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-2xl hover:bg-slate-700 transition-all border border-slate-600">
             البوابة الحالية: {userRoleView === 'admin' ? 'المدير' : 'الموظف'}
           </button>
        </div>
      )}

      {userRoleView === 'employee' && activeTab === 'dashboard' ? (
        <EmployeePortal documents={documents} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />
      ) : renderContent()}

      <AddDocumentModal 
        isOpen={isAddModalOpen} 
        onClose={()=>{setIsAddModalOpen(false); setPrefilledAttachments([]);}} 
        onAdd={handleAddDocument} 
        folders={folders} 
        projects={projects}
        defaultProjectId={selectedProjectId}
        defaultFolderId={activeFolderId}
        initialAttachments={prefilledAttachments}
      />
      <CreateProjectModal isOpen={isAddProjectModalOpen} onClose={()=>setIsAddProjectModalOpen(false)} onSave={handleAddProject} />

      <ConfirmModal 
        isOpen={!!confirmDelete} 
        title={confirmDelete?.type === 'doc' ? 'حذف الوثيقة' : confirmDelete?.type === 'folder' ? 'حذف الأضبارة' : 'حذف'}
        message="هل أنت متأكد؟ سيتم نقل العنصر لسلة المهملات."
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
