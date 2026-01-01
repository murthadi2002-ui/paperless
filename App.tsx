
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
import { MOCK_DOCUMENTS, MOCK_FOLDERS, MOCK_PROJECTS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, CURRENT_USER } from './constants';
import { Document, Folder, Attachment, Project, Department, User, WorkflowTask, DocStatus } from './types';

const App: React.FC = () => {
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
  
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Deletion State
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'doc' | 'folder' } | null>(null);

  const handleAddDocument = (newDoc: Document) => setDocuments([{...newDoc, tasks: []}, ...documents]);

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
    } else {
      setFolders(prev => prev.map(f => f.id === confirmDelete.id ? { ...f, deletedAt: new Date().toISOString() } : f));
    }
    setConfirmDelete(null);
  };

  const handleDuplicateDoc = (doc: Document) => {
    const newDoc: Document = {
      ...doc,
      id: Math.random().toString(36).substr(2, 9),
      subject: `${doc.subject} (نسخة)`,
      refNumber: `${doc.refNumber}-COPY`,
      date: new Date().toISOString().split('T')[0],
      tasks: [],
      status: DocStatus.NEW
    };
    setDocuments([newDoc, ...documents]);
  };

  const handleRenameDoc = (id: string) => {
    const newName = prompt('أدخل الاسم الجديد للكتاب:');
    if (newName && newName.trim()) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, subject: newName } : d));
    }
  };

  const handleRenameFolder = (id: string) => {
    const newName = prompt('أدخل الاسم الجديد للأضبارة:');
    if (newName && newName.trim()) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    }
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
          onAddAttachment={(at) => {
            const updated = documents.map(d => d.id === currentDocument.id ? {...d, attachments: [...d.attachments, at]} : d);
            setDocuments(updated);
            setCurrentDocument(updated.find(d => d.id === currentDocument.id) || null);
          }}
          onAddTask={handleAddTask}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard documents={activeDocs} onOpenDoc={handleOpenUnit} />;
      case 'documents': 
        return (
          <DocumentList 
            documents={activeDocs} 
            folders={activeFolders} 
            projects={projects}
            onAddFolder={(f) => setFolders([...folders, f])} 
            onOpenUnit={handleOpenUnit}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            onRenameDoc={handleRenameDoc}
            onRenameFolder={handleRenameFolder}
            onDuplicateDoc={handleDuplicateDoc}
            onTogglePin={(id) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d))}
          />
        );
      case 'my-tasks': return <EmployeePortal documents={activeDocs} onOpenDoc={handleOpenUnit} />;
      case 'messages': return <MessagingPage documents={activeDocs} folders={activeFolders} onArchiveFile={()=>{}} />;
      case 'projects':
        if (activeProjectView === 'details' && currentProject) return <ProjectDetailsView project={currentProject} documents={activeDocs} folders={activeFolders} onBack={()=>{setActiveProjectView('list');setCurrentProject(null)}} onOpenDoc={handleOpenUnit} />;
        return <ProjectList projects={projects} documents={activeDocs} onSelectProject={(p)=>{setCurrentProject(p);setActiveProjectView('details')}} onAddProject={()=>setIsAddProjectModalOpen(true)} />;
      case 'invites': return <InviteManagement departments={departments} employees={employees} setEmployees={setEmployees} />;
      case 'settings': return <SettingsPage deletedDocs={deletedDocs} deletedFolders={deletedFolders} autoOpenFiles={autoOpenFiles} setAutoOpenFiles={setAutoOpenFiles} onRestoreDoc={(doc)=>setDocuments(documents.map(d=>d.id===doc.id?{...d,deletedAt:null}:d))} onRestoreFolder={(f)=>setFolders(folders.map(fo=>fo.id===f.id?{...fo,deletedAt:null}:fo))} departments={departments} setDepartments={setDepartments} onDeleteDepartment={(id)=>setDepartments(departments.filter(d=>d.id!==id))} />;
      default: return <Dashboard documents={activeDocs} onOpenDoc={handleOpenUnit} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(t)=>{setActiveTab(t);setActiveView('list');setActiveProjectView('list')}} onAddClick={()=>setIsAddModalOpen(true)}>
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
        title={confirmDelete?.type === 'doc' ? 'حذف الوثيقة' : 'حذف الأضبارة'}
        message={confirmDelete?.type === 'doc' ? 'هل أنت متأكد من نقل هذا الكتاب إلى سلة المهملات؟' : 'سيتم نقل الأضبارة وجميع ارتباطاتها لسلة المهملات.'}
        confirmLabel="نعم، حذف"
        cancelLabel="إلغاء"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
        requireTextConfirmation={true}
      />
    </Layout>
  );
};
export default App;
