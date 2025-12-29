
import React, { useState, useEffect } from 'react';
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
import ConfirmModal from './components/ConfirmModal';
import { MOCK_DOCUMENTS, MOCK_FOLDERS, MOCK_PROJECTS } from './constants';
import { Document, Folder, Attachment, Project } from './types';

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
  
  // Selection Context
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Confirmation Modals State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; type: 'doc' | 'folder' }>({ isOpen: false, id: '', type: 'doc' });
  const [confirmRestore, setConfirmRestore] = useState<{ isOpen: boolean; item: any; type: 'doc' | 'folder' }>({ isOpen: false, item: null, type: 'doc' });

  // Actions
  const handleAddDocument = (newDoc: Document) => setDocuments([newDoc, ...documents]);
  const handleAddFolder = (newFolder: Folder) => setFolders([newFolder, ...folders]);
  const handleAddProject = (newProject: Project) => setProjects([newProject, ...projects]);

  const handleOpenUnit = (doc: Document) => {
    setCurrentDocument(doc);
    setActiveView('details');
  };

  const handleAddAttachmentToDoc = (attachment: Attachment) => {
    if (!currentDocument) return;
    const updatedDocs = documents.map(d => 
      d.id === currentDocument.id 
      ? { ...d, attachments: [...d.attachments, attachment] } 
      : d
    );
    setDocuments(updatedDocs);
    setCurrentDocument(updatedDocs.find(d => d.id === currentDocument.id) || null);
  };

  const processDelete = () => {
    const { id, type } = confirmDelete;
    if (type === 'doc') {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d));
      if (currentDocument?.id === id) {
        setActiveView('list');
        setCurrentDocument(null);
      }
    } else {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, deletedAt: new Date().toISOString() } : f));
    }
    setConfirmDelete({ isOpen: false, id: '', type: 'doc' });
  };

  const processRestore = () => {
    const { item, type } = confirmRestore;
    if (type === 'doc') {
      const parentFolder = folders.find(f => f.id === item.folderId);
      let targetFolderId = item.folderId;
      if (!parentFolder || parentFolder.deletedAt) {
        let restoredSystemFolder = folders.find(f => f.name === 'إضبارة محذوفة' && !f.deletedAt);
        if (!restoredSystemFolder) {
          const newFolder: Folder = { id: 'folder-restored-' + Date.now(), name: 'إضبارة محذوفة', createdAt: new Date().toISOString(), color: 'bg-slate-700' };
          setFolders(prev => [newFolder, ...prev]);
          targetFolderId = newFolder.id;
        } else targetFolderId = restoredSystemFolder.id;
      }
      setDocuments(prev => prev.map(d => d.id === item.id ? { ...d, deletedAt: null, folderId: targetFolderId } : d));
    } else {
      setFolders(prev => prev.map(f => f.id === item.id ? { ...f, deletedAt: null } : f));
    }
    setConfirmRestore({ isOpen: false, item: null, type: 'doc' });
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
          onDelete={() => setConfirmDelete({ isOpen: true, id: currentDocument.id, type: 'doc' })}
          onAddAttachment={handleAddAttachmentToDoc}
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
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard documents={activeDocs} />;
      case 'settings': return (
        <SettingsPage 
          deletedDocs={deletedDocs} 
          deletedFolders={deletedFolders} 
          autoOpenFiles={autoOpenFiles}
          setAutoOpenFiles={setAutoOpenFiles}
          onRestoreDoc={(doc) => setConfirmRestore({ isOpen: true, item: doc, type: 'doc' })} 
          onRestoreFolder={(f) => setConfirmRestore({ isOpen: true, item: f, type: 'folder' })} 
        />
      );
      case 'invites': return <InviteManagement />;
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
          />
        );
      default: return <Dashboard documents={activeDocs} />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveView('list');
    setActiveProjectView('list');
    setCurrentDocument(null);
    setCurrentProject(null);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange} onAddClick={() => setIsAddModalOpen(true)}>
      {renderContent()}
      <AddDocumentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddDocument} folders={folders.filter(f => !f.deletedAt)} />
      <CreateProjectModal isOpen={isAddProjectModalOpen} onClose={() => setIsAddProjectModalOpen(false)} onSave={handleAddProject} />
      
      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        title="تأكيد النقل لسلة المهملات"
        message="هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم حفظه في سلة المهملات لمدة 60 يوماً قبل حذفه نهائياً."
        confirmLabel="نعم، احذف"
        cancelLabel="تراجع"
        onConfirm={processDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', type: 'doc' })}
        type="danger"
      />
      <ConfirmModal 
        isOpen={confirmRestore.isOpen} 
        title="تأكيد استرجاع العنصر"
        message="سيتم استرجاع هذا العنصر إلى موقعه الأصلي في الأرشيف العام."
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
