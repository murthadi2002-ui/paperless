
import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, query, orderBy, where, 
  setDoc, getDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

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

import { CURRENT_USER } from './constants';
import { Document, Folder, Project, Department, User, Organization, Position, WorkflowTask, DocStatus } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(CURRENT_USER);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>({
    id: 'org-1',
    name: 'منشأة تجريبية',
    code: 'PAPER-7X9Y',
    ownerId: 'u1',
    createdAt: new Date().toISOString()
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeView, setActiveView] = useState<'list' | 'details'>('list');
  const [activeProjectView, setActiveProjectView] = useState<'list' | 'details'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [userRoleView, setUserRoleView] = useState<'admin' | 'employee'>('admin'); 
  const [dbError, setDbError] = useState<string | null>(null);
  
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
    if (projects.length > 0 && selectedProjectId === 'all') {
      const latest = [...projects].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )[0];
      if (latest) setSelectedProjectId(latest.id);
    }
  }, [projects]);

  useEffect(() => {
    if (!currentOrg) return;
    const handleError = (err: any) => console.error("Firestore Error:", err);

    const unsubDocs = onSnapshot(query(collection(db, "documents"), orderBy("date", "desc")), 
      (snapshot) => setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document))),
      handleError
    );
    const unsubFolders = onSnapshot(collection(db, "folders"), 
      (snapshot) => setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))),
      handleError
    );
    const unsubProjects = onSnapshot(collection(db, "projects"), 
      (snapshot) => setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project))),
      handleError
    );
    const unsubUsers = onSnapshot(collection(db, "users"), 
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

  const handleAddDocument = async (newDoc: any) => {
    const { id, ...docData } = newDoc;
    const cleanData = JSON.parse(JSON.stringify(docData));
    await addDoc(collection(db, "documents"), { ...cleanData, createdAt: serverTimestamp() });
  };

  const handleAddFolder = async (folder: any) => {
    const { id, ...data } = folder;
    const folderData = { 
      ...data, 
      projectId: selectedProjectId !== 'all' ? selectedProjectId : (data.projectId || null) 
    };
    const cleanData = JSON.parse(JSON.stringify(folderData));
    await addDoc(collection(db, "folders"), { ...cleanData, createdAt: serverTimestamp() });
  };

  const handleAddProject = async (project: any) => {
    const { id, ...data } = project;
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await addDoc(collection(db, "projects"), { ...cleanData, createdAt: serverTimestamp() });
    setSelectedProjectId(docRef.id);
  };

  const handleInviteEmployee = async (user: User) => {
    const { id, ...data } = user;
    await setDoc(doc(db, "users", id), { ...data, createdAt: serverTimestamp() });
  };

  const handleUpdateEmployee = async (userId: string, updates: Partial<User>) => {
    await updateDoc(doc(db, "users", userId), updates);
  };

  const handleAddDept = async (name: string) => {
    await addDoc(collection(db, "departments"), { name, employeeCount: 0 });
  };

  const handleDeleteDepartment = async (id: string, transferToId?: string) => {
    try {
      const deptToDelete = departments.find(d => d.id === id);
      if (!deptToDelete) return;

      if (transferToId) {
        const targetDept = departments.find(d => d.id === transferToId);
        if (targetDept) {
          const batch = writeBatch(db);
          const usersToTransfer = employees.filter(e => e.department === deptToDelete.name);
          
          usersToTransfer.forEach(user => {
            batch.update(doc(db, "users", user.id), { department: targetDept.name });
          });

          batch.update(doc(db, "departments", targetDept.id), { 
            employeeCount: (targetDept.employeeCount || 0) + (deptToDelete.employeeCount || 0) 
          });

          await batch.commit();
        }
      }

      await deleteDoc(doc(db, "departments", id));
    } catch (e) {
      console.error("Delete Dept Error:", e);
    }
  };

  const handleAddTask = async (docId: string, task: WorkflowTask) => {
    const document = documents.find(d => d.id === docId);
    if (document) {
      await updateDoc(doc(db, "documents", docId), {
        tasks: [...(document.tasks || []), task],
        status: DocStatus.IN_PROGRESS
      });
    }
  };

  const handleUpdateSubject = async (docId: string, newSubject: string) => {
    await updateDoc(doc(db, "documents", docId), { subject: newSubject });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'doc') {
        await updateDoc(doc(db, "documents", confirmDelete.id), { deletedAt: new Date().toISOString() });
        setActiveView('list');
      } else if (confirmDelete.type === 'folder') {
        await updateDoc(doc(db, "folders", confirmDelete.id), { deletedAt: new Date().toISOString() });
      } else if (confirmDelete.type === 'project') {
        await deleteDoc(doc(db, "projects", confirmDelete.id));
        setActiveProjectView('list');
      } else if (confirmDelete.type === 'attachment' && confirmDelete.parentId) {
        const docRef = doc(db, "documents", confirmDelete.parentId);
        const document = documents.find(d => d.id === confirmDelete.parentId);
        if (document) {
          await updateDoc(docRef, {
            attachments: document.attachments.filter(a => a.id !== confirmDelete.id)
          });
        }
      }
    } catch (e) { console.error("Error:", e); }
    setConfirmDelete(null);
  };

  const handleLogin = (user: User, org: Organization) => {
    setCurrentUser(user);
    setCurrentOrg(org);
    setUserRoleView(user.role);
  };

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
          onUpdateSubject={(sub) => handleUpdateSubject(liveDoc.id, sub)}
          onAddAttachment={async (at) => await updateDoc(doc(db, "documents", liveDoc.id), { attachments: [...liveDoc.attachments, at] })}
          onDeleteAttachment={(atId) => setConfirmDelete({ id: atId, type: 'attachment', parentId: liveDoc.id })}
          onAddTask={handleAddTask}
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
              if(d) await updateDoc(doc(db, "documents", id), { isPinned: !d.isPinned });
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
            onInvite={handleInviteEmployee} 
            onUpdateEmployee={handleUpdateEmployee}
            positions={positions} 
          />
        );
      case 'settings': 
        return (
          <SettingsPage 
            deletedDocs={deletedDocs} deletedFolders={deletedFolders} 
            autoOpenFiles={autoOpenFiles} setAutoOpenFiles={setAutoOpenFiles} 
            onRestoreDoc={async (docObj)=> await updateDoc(doc(db, "documents", docObj.id), { deletedAt: null })} 
            onRestoreFolder={async (fObj)=> await updateDoc(doc(db, "folders", fObj.id), { deletedAt: null })} 
            departments={departments} 
            onAddDept={handleAddDept}
            onDeleteDepartment={handleDeleteDepartment} 
          />
        );
      default: return <Dashboard documents={activeDocs} />;
    }
  };

  if (!currentUser || !currentOrg) return <AuthPage onLogin={handleLogin} />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');setActiveProjectView('list')}} 
      onAddClick={()=>setIsAddModalOpen(true)}
      onLogout={() => { setCurrentUser(null); setCurrentOrg(null); }}
      organizationName={currentOrg.name}
    >
      {dbError && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center justify-between animate-pulse">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
             <p className="text-[11px] font-black text-red-700">{dbError}</p>
           </div>
           <button onClick={() => window.location.reload()} className="text-[10px] font-black text-red-800 underline">تحديث الصفحة</button>
        </div>
      )}

      <div className="fixed bottom-6 left-6 z-[100] flex gap-2">
         <button onClick={() => setUserRoleView(userRoleView === 'admin' ? 'employee' : 'admin')} className="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-2xl hover:bg-slate-700 transition-all border border-slate-600">
           البوابة الحالية: {userRoleView === 'admin' ? 'المدير' : 'الموظف'}
         </button>
      </div>

      {userRoleView === 'employee' && activeTab === 'dashboard' ? (
        <EmployeePortal documents={documents} onOpenDoc={(d) => { setCurrentDocument(d); setActiveView('details'); }} />
      ) : renderContent()}

      <AddDocumentModal 
        isOpen={isAddModalOpen} 
        onClose={()=>setIsAddModalOpen(false)} 
        onAdd={handleAddDocument} 
        folders={folders} 
        projects={projects}
        defaultProjectId={selectedProjectId}
        defaultFolderId={activeFolderId}
      />
      <CreateProjectModal isOpen={isAddProjectModalOpen} onClose={()=>setIsAddProjectModalOpen(false)} onSave={handleAddProject} />

      <ConfirmModal 
        isOpen={!!confirmDelete} 
        title={confirmDelete?.type === 'doc' ? 'حذف الوثيقة' : confirmDelete?.type === 'folder' ? 'حذف الأضبارة' : 'حذف'}
        message="هل أنت متأكد؟ سيتم نقل العنصر لسلة المهملات."
        confirmLabel="نعم، حذف" cancelLabel="إلغاء"
        onConfirm={executeDelete} onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
};
export default App;
