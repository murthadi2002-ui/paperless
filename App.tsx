
import React, { useState, useMemo } from 'react';
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
import { MOCK_DOCUMENTS, MOCK_FOLDERS, MOCK_PROJECTS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_POSITIONS, CURRENT_USER } from './constants';
import { Document, Folder, Attachment, Project, Department, User, Organization, Position, WorkflowTask, DocStatus } from './types';

const App: React.FC = () => {
  // Auth State - Bypassed for now as requested
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
  
  const [autoOpenFiles, setAutoOpenFiles] = useState(true);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [employees, setEmployees] = useState<User[]>(MOCK_EMPLOYEES);
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS);
  
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Deletion State
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'doc' | 'folder' | 'attachment' | 'project', parentId?: string } | null>(null);

  const handleLogin = (user: User, org: Organization) => {
    setCurrentUser(user);
    setCurrentOrg(org);
    setUserRoleView(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentOrg(null);
  };

  // Fixed handleAddDocument to directly use the document object as it's now correctly formed in AddDocumentModal
  const handleAddDocument = (newDoc: Document) => setDocuments([newDoc, ...documents]);

  const handleOpenUnit = (doc: Document) => {
    setCurrentDocument(doc);
    setActiveView('details');
  };

  const handleAddTask = (docId: string, task: WorkflowTask) => {
    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, tasks: [...(d.tasks || []), task], status: DocStatus.IN_PROGRESS } : d
    ));
    if (currentDocument?.id === docId) {
      setCurrentDocument(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), task], status: DocStatus.IN_PROGRESS } : null);
    }
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'doc') {
      setDocuments(prev => prev.map(d => d.id === confirmDelete.id ? { ...d, deletedAt: new Date().toISOString() } : d));
      setActiveView('list');
    } else if (confirmDelete.type === 'folder') {
      setFolders(prev => prev.map(f => f.id === confirmDelete.id ? { ...f, deletedAt: new Date().toISOString() } : f));
    } else if (confirmDelete.type === 'attachment' && confirmDelete.parentId) {
      const updatedDocs = documents.map(d => 
        d.id === confirmDelete.parentId 
        ? { ...d, attachments: d.attachments.filter(at => at.id !== confirmDelete.id) } 
        : d
      );
      setDocuments(updatedDocs);
      if (currentDocument?.id === confirmDelete.parentId) {
        setCurrentDocument(prev => prev ? { ...prev, attachments: prev.attachments.filter(at => at.id !== confirmDelete.id) } : null);
      }
    } else if (confirmDelete.type === 'project') {
      setProjects(prev => prev.filter(p => p.id !== confirmDelete.id));
      setActiveProjectView('list');
    }
    setConfirmDelete(null);
  };

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
          onUpdateSubject={(newSub) => setDocuments(prev => prev.map(d => d.id === currentDocument.id ? { ...d, subject: newSub } : d))}
          onAddAttachment={(at) => setDocuments(prev => prev.map(d => d.id === currentDocument.id ? { ...d, attachments: [...d.attachments, at] } : d))}
          onDeleteAttachment={(atId) => setConfirmDelete({ id: atId, type: 'attachment', parentId: currentDocument.id })}
          onAddTask={handleAddTask}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard documents={activeDocs} onOpenDoc={handleOpenUnit} />;
      case 'documents': 
        return (
          <DocumentList 
            documents={activeDocs} folders={activeFolders} projects={projects}
            onAddFolder={(f) => setFolders([...folders, f])} 
            onOpenUnit={handleOpenUnit}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            onTogglePin={(id) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d))}
          />
        );
      case 'my-tasks': return <EmployeePortal documents={activeDocs} onOpenDoc={handleOpenUnit} />;
      case 'messages': return <MessagingPage documents={activeDocs} folders={activeFolders} onArchiveFile={()=>{}} />;
      case 'projects':
        if (activeProjectView === 'details' && currentProject) return <ProjectDetailsView project={currentProject} documents={activeDocs} folders={activeFolders} onBack={()=>{setActiveProjectView('list');setCurrentProject(null)}} onOpenDoc={handleOpenUnit} />;
        return (
          <ProjectList 
            projects={projects} documents={activeDocs} 
            onSelectProject={(p)=>{setCurrentProject(p);setActiveProjectView('details')}} 
            onAddProject={()=>setIsAddProjectModalOpen(true)}
            onDeleteProject={(id) => setConfirmDelete({ id, type: 'project' })}
          />
        );
      case 'invites': return <InviteManagement departments={departments} employees={employees} setEmployees={setEmployees} positions={positions} />;
      case 'settings': 
        return (
          <SettingsPage 
            deletedDocs={deletedDocs} deletedFolders={deletedFolders} 
            autoOpenFiles={autoOpenFiles} setAutoOpenFiles={setAutoOpenFiles} 
            onRestoreDoc={(doc)=>setDocuments(documents.map(d=>d.id===doc.id?{...d,deletedAt:null}:d))} 
            onRestoreFolder={(f)=>setFolders(folders.map(fo=>fo.id===f.id?{...fo,deletedAt:null}:fo))} 
            departments={departments} setDepartments={setDepartments}
            onDeleteDepartment={(id)=>setDepartments(departments.filter(d=>d.id!==id))} 
          />
        );
      default: return <Dashboard documents={activeDocs} onOpenDoc={handleOpenUnit} />;
    }
  };

  // If not logged in, show Auth Page
  if (!currentUser || !currentOrg) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');setActiveProjectView('list')}} 
      onAddClick={()=>setIsAddModalOpen(true)}
      onLogout={handleLogout}
      organizationName={currentOrg.name}
    >
      <div className="fixed bottom-6 left-6 z-[100] flex gap-2">
         <button onClick={() => setUserRoleView(userRoleView === 'admin' ? 'employee' : 'admin')} className="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-2xl hover:bg-slate-700 transition-all border border-slate-600">
           تبديل البوابة: {userRoleView === 'admin' ? 'المدير' : 'الموظف'}
         </button>
      </div>

      {userRoleView === 'employee' && activeTab === 'dashboard' ? (
        <EmployeePortal documents={documents} onOpenDoc={handleOpenUnit} />
      ) : renderContent()}

      <AddDocumentModal isOpen={isAddModalOpen} onClose={()=>setIsAddModalOpen(false)} onAdd={handleAddDocument} folders={folders} />
      <CreateProjectModal isOpen={isAddProjectModalOpen} onClose={()=>setIsAddProjectModalOpen(false)} onSave={(p)=>setProjects([...projects,p])} />

      <ConfirmModal 
        isOpen={!!confirmDelete} 
        title={confirmDelete?.type === 'doc' ? 'حذف الوثيقة' : confirmDelete?.type === 'folder' ? 'حذف الأضبارة' : 'حذف'}
        message="هل أنت متأكد من هذا الإجراء؟ سيتم نقل العنصر لسلة المهملات."
        confirmLabel="نعم، حذف" cancelLabel="إلغاء"
        onConfirm={executeDelete} onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
};
export default App;
