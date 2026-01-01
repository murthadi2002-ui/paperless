
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
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'doc' | 'folder' | 'attachment' | 'project', parentId?: string } | null>(null);

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
      setActiveView('list');
    } else if (confirmDelete.type === 'folder') {
      setFolders(prev => prev.map(f => f.id === confirmDelete.id ? { ...f, deletedAt: new Date().toISOString() } : f));
    } else if (confirmDelete.type === 'attachment' && confirmDelete.parentId) {
      // حذف مرفق من كتاب محدد
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

  const handleUpdateDocSubject = (id: string, newSubject: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, subject: newSubject } : d));
    if (currentDocument?.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, subject: newSubject } : null);
    }
  };

  const handleAddAttachmentToDoc = (docId: string, attachment: Attachment) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, attachments: [...d.attachments, attachment] } : d));
    if (currentDocument?.id === docId) {
      setCurrentDocument(prev => prev ? { ...prev, attachments: [...prev.attachments, attachment] } : null);
    }
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
          onUpdateSubject={(newSub) => handleUpdateDocSubject(currentDocument.id, newSub)}
          onAddAttachment={(at) => handleAddAttachmentToDoc(currentDocument.id, at)}
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
            documents={activeDocs} 
            folders={activeFolders} 
            projects={projects}
            onAddFolder={(f) => setFolders([...folders, f])} 
            onOpenUnit={handleOpenUnit}
            onDeleteDoc={(id) => setConfirmDelete({ id, type: 'doc' })}
            onDeleteFolder={(id) => setConfirmDelete({ id, type: 'folder' })}
            onRenameDoc={(id, oldName) => {
              const newName = prompt('تعديل اسم الكتاب:', oldName);
              if (newName) handleUpdateDocSubject(id, newName);
            }}
            onRenameFolder={(id, oldName) => {
              const newName = prompt('تعديل اسم الإضبارة:', oldName);
              if (newName) setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
            }}
            onDuplicateDoc={handleDuplicateDoc}
            onTogglePin={(id) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d))}
          />
        );
      case 'my-tasks': return <EmployeePortal documents={activeDocs} onOpenDoc={handleOpenUnit} />;
      case 'messages': return <MessagingPage documents={activeDocs} folders={activeFolders} onArchiveFile={()=>{}} />;
      case 'projects':
        if (activeProjectView === 'details' && currentProject) return <ProjectDetailsView project={currentProject} documents={activeDocs} folders={activeFolders} onBack={()=>{setActiveProjectView('list');setCurrentProject(null)}} onOpenDoc={handleOpenUnit} />;
        return (
          <ProjectList 
            projects={projects} 
            documents={activeDocs} 
            onSelectProject={(p)=>{setCurrentProject(p);setActiveProjectView('details')}} 
            onAddProject={()=>setIsAddProjectModalOpen(true)}
            onDeleteProject={(id) => setConfirmDelete({ id, type: 'project' })}
            onRenameProject={(id, oldName) => {
              const newName = prompt('تعديل اسم المشروع:', oldName);
              if (newName) setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
            }}
          />
        );
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
        title={
          confirmDelete?.type === 'doc' ? 'حذف الوثيقة' : 
          confirmDelete?.type === 'folder' ? 'حذف الأضبارة' : 
          confirmDelete?.type === 'attachment' ? 'حذف المرفق' : 
          'حذف المشروع'
        }
        message={
          confirmDelete?.type === 'doc' ? 'هل أنت متأكد من نقل هذا الكتاب إلى سلة المهملات؟' : 
          confirmDelete?.type === 'folder' ? 'سيتم نقل الأضبارة وجميع ارتباطاتها لسلة المهملات.' : 
          confirmDelete?.type === 'attachment' ? 'هل أنت متأكد من حذف هذا الملف المرفق نهائياً من سجل الكتاب؟' : 
          'هل أنت متأكد من حذف هذا المشروع نهائياً؟ سيؤدي ذلك لفك ارتباط كافة الوثائق به.'
        }
        confirmLabel="نعم، حذف"
        cancelLabel="إلغاء"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
        requireTextConfirmation={confirmDelete?.type !== 'attachment'}
      />
    </Layout>
  );
};
export default App;
