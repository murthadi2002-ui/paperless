
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
import ConfirmModal from './components/ConfirmModal';
import { MOCK_DOCUMENTS, MOCK_FOLDERS, MOCK_PROJECTS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, CURRENT_USER } from './constants';
import { Document, Folder, Attachment, Project, Department, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeView, setActiveView] = useState<'list' | 'details'>('list');
  const [activeProjectView, setActiveProjectView] = useState<'list' | 'details'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  
  // Settings State
  const [autoOpenFiles, setAutoOpenFiles] = useState(true);
  
  // Data States
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [employees, setEmployees] = useState<User[]>(MOCK_EMPLOYEES);
  
  // Selection Context
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Confirmation Modals State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; type: 'doc' | 'folder' | 'project' | 'department' }>({ isOpen: false, id: '', type: 'doc' });
  const [confirmRestore, setConfirmRestore] = useState<{ isOpen: boolean; item: any; type: 'doc' | 'folder' }>({ isOpen: false, item: null, type: 'doc' });

  // Actions
  const handleAddDocument = (newDoc: Document) => setDocuments([newDoc, ...documents]);
  const handleAddFolder = (newFolder: Folder) => setFolders([newFolder, ...folders]);
  const handleAddProject = (newProject: Project) => setProjects([newProject, ...projects]);

  const handleOpenUnit = (doc: Document) => {
    setCurrentDocument(doc);
    setActiveView('details');
  };

  const handleTogglePin = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d));
  };

  const handleDuplicateDoc = (doc: Document) => {
    const newDoc = {
      ...doc,
      id: Math.random().toString(36).substr(2, 9),
      subject: `${doc.subject} (نسخة مكررة)`,
      refNumber: `${doc.refNumber}-نسخة`,
      date: new Date().toISOString().split('T')[0],
      isPinned: false
    };
    setDocuments([newDoc, ...documents]);
  };

  const handleRenameDoc = (id: string, currentName: string) => {
    const newName = prompt('تغيير موضوع الكتاب:', currentName);
    if (newName && newName.trim()) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, subject: newName } : d));
    }
  };

  const handleRenameFolder = (id: string, currentName: string) => {
    const newName = prompt('تغيير اسم الإضبارة:', currentName);
    if (newName && newName.trim()) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    }
  };

  const handleRenameProject = (id: string, currentName: string) => {
    const newName = prompt('تغيير اسم المشروع:', currentName);
    if (newName && newName.trim()) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  };

  const processDelete = () => {
    const { id, type } = confirmDelete;
    if (type === 'doc') {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d));
      if (currentDocument?.id === id) {
        setActiveView('list');
        setCurrentDocument(null);
      }
    } else if (type === 'folder') {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, deletedAt: new Date().toISOString() } : f));
    } else if (type === 'project') {
      setProjects(prev => prev.filter(p => p.id !== id));
      setDocuments(prev => prev.map(d => d.projectId === id ? { ...d, deletedAt: new Date().toISOString() } : d));
      if (currentProject?.id === id) {
        setActiveProjectView('list');
        setCurrentProject(null);
      }
    } else if (type === 'department') {
      if (CURRENT_USER.role !== 'admin') {
        alert('ليس لديك صلاحية لحذف الأقسام');
        return;
      }
      setDepartments(prev => prev.filter(d => d.id !== id));
    }
    setConfirmDelete({ isOpen: false, id: '', type: 'doc' });
  };

  const processRestore = () => {
    const { item, type } = confirmRestore;
    if (type === 'doc') {
      setDocuments(prev => prev.map(d => d.id === item.id ? { ...d, deletedAt: null } : d));
    } else {
      setFolders(prev => prev.map(f => f.id === item.id ? { ...f, deletedAt: null } : f));
    }
    setConfirmRestore({ isOpen: false, item: null, type: 'doc' });
  };

  const handleArchiveReceivedFile = (file: any) => {
    // Open the add document modal with the file pre-attached
    // For now, just a simplified simulation:
    const confirmArchiving = confirm(`هل تريد أرشفة الملف "${file.name}"؟`);
    if (confirmArchiving) {
      setIsAddModalOpen(true);
      // In a real implementation, we would pass the file to the modal's state
    }
  };

  // Breadcrumbs Logic
  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    if (currentProject) {
      crumbs.push({ 
        label: currentProject.name, 
        onClick: () => { setActiveProjectView('details'); setActiveTab('projects'); } 
      });
    }
    if (currentDocument) {
      crumbs.push({ label: currentDocument.subject });
    }
    return crumbs;
  }, [currentProject, currentDocument]);

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
          onDelete={() => setConfirmDelete({ isOpen: true, id: currentDocument.id, type: 'doc' })}
          onAddAttachment={(at) => {
            const updated = documents.map(d => d.id === currentDocument.id ? {...d, attachments: [...d.attachments, at]} : d);
            setDocuments(updated);
            setCurrentDocument(updated.find(d => d.id === currentDocument.id) || null);
          }}
        />
      );
    }

    if (activeTab === 'documents') {
      return (
        <DocumentList 
          documents={activeDocs} 
          folders={activeFolders} 
          projects={projects}
          onAddFolder={handleAddFolder} 
          onOpenUnit={handleOpenUnit}
          onDeleteDoc={(id) => setConfirmDelete({ isOpen: true, id, type: 'doc' })}
          onDeleteFolder={(id) => setConfirmDelete({ isOpen: true, id, type: 'folder' })}
          onRenameDoc={handleRenameDoc}
          onRenameFolder={handleRenameFolder}
          onDuplicateDoc={handleDuplicateDoc}
          onTogglePin={handleTogglePin}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard documents={activeDocs} />;
      case 'messages': return (
        <MessagingPage 
          documents={activeDocs} 
          folders={activeFolders} 
          onArchiveFile={handleArchiveReceivedFile}
        />
      );
      case 'settings': return (
        <SettingsPage 
          deletedDocs={deletedDocs} 
          deletedFolders={deletedFolders} 
          autoOpenFiles={autoOpenFiles}
          setAutoOpenFiles={setAutoOpenFiles}
          onRestoreDoc={(doc) => setConfirmRestore({ isOpen: true, item: doc, type: 'doc' })} 
          onRestoreFolder={(f) => setConfirmRestore({ isOpen: true, item: f, type: 'folder' })} 
          departments={departments}
          setDepartments={setDepartments}
          onDeleteDepartment={(id) => setConfirmDelete({ isOpen: true, id, type: 'department' })}
        />
      );
      case 'invites': return (
        <InviteManagement 
          departments={departments} 
          employees={employees} 
          setEmployees={setEmployees}
        />
      );
      case 'projects':
        if (activeProjectView === 'details' && currentProject) {
          return (
            <ProjectDetailsView 
              project={currentProject}
              documents={activeDocs}
              folders={activeFolders}
              onBack={() => { setActiveProjectView('list'); setCurrentProject(null); }}
              onOpenDoc={handleOpenUnit}
            />
          );
        }
        return (
          <ProjectList 
            projects={projects}
            documents={activeDocs}
            onSelectProject={(p) => { setCurrentProject(p); setActiveProjectView('details'); }}
            onAddProject={() => setIsAddProjectModalOpen(true)}
            onDeleteProject={(id) => setConfirmDelete({ isOpen: true, id, type: 'project' })}
            onRenameProject={handleRenameProject}
          />
        );
      default: return <Dashboard documents={activeDocs} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(t) => { setActiveTab(t); setCurrentProject(null); setCurrentDocument(null); setActiveView('list'); setActiveProjectView('list'); }} 
      onAddClick={() => setIsAddModalOpen(true)}
      breadcrumbs={breadcrumbs}
    >
      {renderContent()}
      <AddDocumentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddDocument} folders={folders.filter(f => !f.deletedAt)} />
      <CreateProjectModal isOpen={isAddProjectModalOpen} onClose={() => setIsAddProjectModalOpen(false)} onSave={handleAddProject} />
      
      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        title={
          confirmDelete.type === 'project' ? "تأكيد حذف المشروع" : 
          confirmDelete.type === 'folder' ? "تأكيد حذف الإضبارة" : 
          confirmDelete.type === 'department' ? "تأكيد حذف القسم" : "تأكيد الحذف"
        }
        message={
          confirmDelete.type === 'project' ? "تحذير: سيتم حذف المشروع وكافة الكتب المرتبطة به. هذا الإجراء خطير جداً." : 
          confirmDelete.type === 'department' ? "تحذير: سيتم حذف هذا القسم نهائياً. يرجى التأكد من نقل الموظفين التابعين له أولاً." :
          "هل أنت متأكد من رغبتك في حذف هذا العنصر؟"
        }
        confirmLabel="نعم، حذف نهائي"
        cancelLabel="تراجع"
        requireTextConfirmation={confirmDelete.type === 'project' || confirmDelete.type === 'folder' || confirmDelete.type === 'department'}
        onConfirm={processDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', type: 'doc' })}
        type="danger"
      />
      <ConfirmModal 
        isOpen={confirmRestore.isOpen} 
        title="استرجاع العنصر"
        message="سيتم استرجاع العنصر إلى مكانه الأصلي في الأرشيف."
        confirmLabel="استرجاع الآن"
        cancelLabel="إلغاء"
        onConfirm={processRestore}
        onCancel={() => setConfirmRestore({ isOpen: false, item: null, type: 'doc' })}
        type="success"
      />
    </Layout>
  );
};

export default App;
