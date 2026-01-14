import React, { useState, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, query, orderBy, where, 
  setDoc, getDoc, serverTimestamp, doc as firestoreDocRef
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const userDocRef = firestoreDocRef(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.organizationId) {
            const orgDoc = await getDoc(firestoreDocRef(db, "organizations", userData.organizationId));
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

  useEffect(() => {
    if (!currentOrg || !currentUser) return;

    const unsubDocs = onSnapshot(query(collection(db, "documents"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document));
        setDocuments(docs);
        if (currentDocument) {
          const updated = docs.find(d => d.id === currentDocument.id);
          if (updated) setCurrentDocument(updated);
        }
      });
    
    const unsubFolders = onSnapshot(query(collection(db, "folders"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))));

    const unsubProjects = onSnapshot(query(collection(db, "projects"), where("organizationId", "==", currentOrg.id)), 
      (snapshot) => {
        const projs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        const sortedProjs = [...projs].sort((a, b) => {
           const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
           const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
           return dateB - dateA;
        });
        setProjects(sortedProjs);
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
  }, [currentOrg, currentUser, currentDocument]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentOrg(null);
    setActiveTab('dashboard');
  };

  const handleDuplicateDoc = async (docObj: Document) => {
    const { id, ...rest } = docObj;
    await addDoc(collection(db, "documents"), {
      ...rest,
      subject: `${docObj.subject} (نسخة)`,
      refNumber: `${docObj.refNumber}-Copy`,
      createdAt: serverTimestamp()
    });
  };

  const handleMoveDoc = async (docId: string, folderId: string, projectId: string) => {
    await updateDoc(firestoreDocRef(db, "documents", docId), { folderId, projectId });
  };

  const handleCopyDoc = async (docId: string, folderId: string, projectId: string) => {
    const originalDoc = documents.find(d => d.id === docId);
    if (!originalDoc) return;
    const { id, ...rest } = originalDoc;
    await addDoc(collection(db, "documents"), {
      ...rest,
      subject: `${originalDoc.subject} (نسخة منقولة)`,
      folderId,
      projectId,
      createdAt: serverTimestamp()
    });
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<User>) => {
    await updateDoc(firestoreDocRef(db, "users", id), updates);
  };

  const handleKickEmployee = async (id: string) => {
    await updateDoc(firestoreDocRef(db, "users", id), {
      organizationId: "",
      status: "pending",
      role: "employee",
      permissions: []
    });
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
          onUpdateSubject={(sub) => updateDoc(firestoreDocRef(db, "documents", currentDocument.id), { subject: sub })}
          onAddAttachment={async (at) => await updateDoc(firestoreDocRef(db, "documents", currentDocument.id), { attachments: [...currentDocument.attachments, at] })}
          onDeleteAttachment={(atId) => setConfirmDelete({ id: atId, type: 'attachment', parentId: currentDocument.id })}
          onAddTask={(docId, task) => updateDoc(firestoreDocRef(db, "documents", docId), { tasks: [...(currentDocument.tasks || []), task], status: DocStatus.IN_PROGRESS })}
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
            onAddFolder={async (f) => await addDoc(collection(db, "folders"), { ...f, projectId: selectedProjectId !== 'all' ? selectedProjectId : null, organizationId: currentOrg?.id, createdAt: new Date().toISOString() })}
            onOpenUnit={(d) => { setCurrentDocument(d); setActiveView('details'); }}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            onRenameDoc={(id, name) => updateDoc(firestoreDocRef(db, "documents", id), { subject: name })}
            onRenameFolder={(id, name) => updateDoc(firestoreDocRef(db, "folders", id), { name })}
            onDuplicateDoc={handleDuplicateDoc}
            onMoveDoc={handleMoveDoc}
            onCopyDoc={handleCopyDoc}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
            currentUser={currentUser}
          />
        );
      case 'invites': 
        return (
          <InviteManagement 
            departments={departments} employees={employees} 
            onUpdateEmployee={handleUpdateEmployee}
            onKickEmployee={handleKickEmployee}
            positions={positions} 
          />
        );
      case 'settings': 
        return (
          <SettingsPage 
            deletedDocs={deletedDocs} deletedFolders={deletedFolders} 
            autoOpenFiles={autoOpenFiles} setAutoOpenFiles={setAutoOpenFiles} 
            onRestoreDoc={async (docObj)=> await updateDoc(firestoreDocRef(db, "documents", docObj.id), { deletedAt: null })} 
            onRestoreFolder={async (fObj)=> await updateDoc(firestoreDocRef(db, "folders", fObj.id), { deletedAt: null })} 
            departments={departments}
            onAddDept={async (name) => await addDoc(collection(db, "departments"), { name, employeeCount: 0 })}
            onDeleteDepartment={async (id) => await deleteDoc(firestoreDocRef(db, "departments", id))} 
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        );
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
      default: return <Dashboard documents={activeDocs} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');}} onAddClick={()=>setIsAddModalOpen(true)} onLogout={handleLogout} organizationName={currentOrg?.name || "تحميل..."} currentUser={currentUser}>
      {renderContent()}
      <AddDocumentModal isOpen={isAddModalOpen} onClose={()=>{setIsAddModalOpen(false); setPrefilledAttachments([]);}} onAdd={async (d) => await addDoc(collection(db, "documents"), { ...d, organizationId: currentOrg?.id, createdAt: serverTimestamp() })} folders={folders} projects={projects} defaultProjectId={selectedProjectId} defaultFolderId={activeFolderId} initialAttachments={prefilledAttachments} />
      <ConfirmModal isOpen={!!confirmDelete} title="تأكيد الحذف" message="هل أنت متأكد؟ سيتم نقل العنصر إلى سلة المهملات." confirmLabel="نعم، حذف" cancelLabel="إلغاء" onConfirm={async () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'doc') {
          await updateDoc(firestoreDocRef(db, "documents", confirmDelete.id), { deletedAt: new Date().toISOString() });
          setActiveView('list');
        } else if (confirmDelete.type === 'folder') {
          await updateDoc(firestoreDocRef(db, "folders", confirmDelete.id), { deletedAt: new Date().toISOString() });
        }
        setConfirmDelete(null);
      }} onCancel={() => setConfirmDelete(null)} />
    </Layout>
  );
};

export default App;