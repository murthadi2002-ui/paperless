import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, FileText, FileDown, FileUp, MoreVertical, Paperclip, Folder as FolderIcon, FolderPlus, Trash2, Star, Copy, Edit3, Clock, Lock, ArrowRight, Filter, ChevronRight, Info, Move, X, Briefcase, Save } from 'lucide-react';
import { DocType, DocStatus, Document, Folder, Project, User } from '../types';
import CreateFolderModal from './CreateFolderModal';

interface DocumentListProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onAddFolder: (folder: Folder) => void;
  onOpenUnit: (doc: Document) => void;
  onDeleteDoc: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onDuplicateDoc?: (doc: Document) => void;
  onDuplicateFolder?: (folder: Folder) => void;
  onRenameDoc?: (id: string, name: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onMoveDoc?: (docId: string, folderId: string, projectId: string) => Promise<void>;
  onCopyDoc?: (docId: string, folderId: string, projectId: string) => Promise<void>;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  currentUser: User | null;
}

const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  options: { label: string; icon: any; onClick: () => void; danger?: boolean; separator?: boolean }[];
}> = ({ x, y, onClose, options }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="fixed z-[300] bg-white border border-slate-200 rounded-xl shadow-2xl py-2 w-52 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden"
      style={{ top: y, left: x - 208 }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((opt, i) => (
        <React.Fragment key={i}>
          {opt.separator && <hr className="my-1 border-slate-50" />}
          <button
            onClick={() => { opt.onClick(); onClose(); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-black transition-colors ${opt.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="flex-1 text-right">{opt.label}</span>
            <opt.icon size={14} className="mr-2" />
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, folders, projects, onAddFolder, onOpenUnit, onDeleteDoc, onDeleteFolder,
  onDuplicateDoc, onDuplicateFolder, onRenameDoc, onRenameFolder,
  onMoveDoc, onCopyDoc,
  selectedProjectId, setSelectedProjectId, activeFolderId, setActiveFolderId, currentUser
}) => {
  const [viewMode, setViewMode] = useState<'types' | 'folders' | 'confidential' | 'pinned'>('types');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'doc' | 'folder'; id: string } | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<Document | null>(null);
  const [moveCopyModal, setMoveCopyModal] = useState<{ docId: string; mode: 'move' | 'copy' } | null>(null);

  // منطق نافذة النقل والنسخ
  const [targetProjectId, setTargetProjectId] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('');

  const handleContextMenu = (e: React.MouseEvent, type: 'doc' | 'folder', id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id });
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.refNumber.includes(searchTerm);
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesProject = selectedProjectId === 'all' || doc.projectId === selectedProjectId;
      const matchesFolder = activeFolderId ? doc.folderId === activeFolderId : true;
      const isConfidentialMatch = viewMode === 'confidential' ? doc.isConfidential === true : doc.isConfidential !== true;

      if (viewMode === 'pinned') return doc.isPinned && matchesSearch;
      return matchesType && matchesSearch && matchesProject && matchesFolder && isConfidentialMatch;
    });
  }, [documents, viewMode, selectedProjectId, filterType, searchTerm, activeFolderId]);

  const filteredFolders = useMemo(() => {
    return folders.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProjectId === 'all' || f.projectId === selectedProjectId;
      const matchesType = viewMode === 'confidential' ? f.isConfidential === true : f.isConfidential !== true;
      return matchesSearch && matchesProject && matchesType;
    });
  }, [folders, selectedProjectId, searchTerm, viewMode]);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  const getContextMenuOptions = () => {
    if (!contextMenu) return [];
    
    if (contextMenu.type === 'folder') {
      const folder = folders.find(f => f.id === contextMenu.id);
      return [
        { label: 'فتح الإضبارة', icon: ChevronRight, onClick: () => setActiveFolderId(contextMenu.id) },
        { label: 'إعادة تسمية', icon: Edit3, onClick: () => {
          const newName = prompt('أدخل الاسم الجديد للإضبارة:', folder?.name);
          if (newName && onRenameFolder) onRenameFolder(contextMenu.id, newName);
        }},
        { label: 'تكرار الإضبارة', icon: Copy, onClick: () => folder && onDuplicateFolder?.(folder) },
        { label: 'حذف الإضبارة', icon: Trash2, danger: true, onClick: () => onDeleteFolder(contextMenu.id) }
      ];
    } else {
      const doc = documents.find(d => d.id === contextMenu.id);
      return [
        { label: 'معاينة الكتاب', icon: FileText, onClick: () => doc && onOpenUnit(doc) },
        { label: 'تفاصيل الأرشفة', icon: Info, onClick: () => setShowInfoModal(doc || null) },
        { label: 'إعادة تسمية الموضوع', icon: Edit3, separator: true, onClick: () => {
          const newName = prompt('أدخل الموضوع الجديد:', doc?.subject);
          if (newName && onRenameDoc) onRenameDoc(contextMenu.id, newName);
        }},
        { label: 'نقل إلى إضبارة', icon: Move, onClick: () => setMoveCopyModal({ docId: contextMenu.id, mode: 'move' }) },
        { label: 'نسخ إلى إضبارة', icon: Copy, onClick: () => setMoveCopyModal({ docId: contextMenu.id, mode: 'copy' }) },
        { label: 'عمل نسخة (تكرار)', icon: Copy, onClick: () => doc && onDuplicateDoc?.(doc) },
        { label: 'حذف الكتاب', icon: Trash2, danger: true, separator: true, onClick: () => onDeleteDoc(contextMenu.id) }
      ];
    }
  };

  const handleMoveCopyAction = async () => {
    if (!moveCopyModal || !targetFolderId || !targetProjectId) return;
    if (moveCopyModal.mode === 'move') {
      await onMoveDoc?.(moveCopyModal.docId, targetFolderId, targetProjectId);
    } else {
      await onCopyDoc?.(moveCopyModal.docId, targetFolderId, targetProjectId);
    }
    setMoveCopyModal(null);
    setTargetFolderId('');
    setTargetProjectId('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
          options={getContextMenuOptions()} 
        />
      )}

      {/* نافذة تفاصيل الكتاب */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Info size={16} className="text-emerald-600" /> تفاصيل الأرشفة</h3>
                 <button onClick={() => setShowInfoModal(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18}/></button>
              </div>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الموضوع</p>
                    <p className="text-xs font-black text-slate-700">{showInfoModal.subject}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الرقم المرجعي</p>
                      <p className="text-xs font-black text-slate-700">{showInfoModal.refNumber}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">تاريخ الأرشفة</p>
                      <p className="text-xs font-black text-slate-700">{showInfoModal.date}</p>
                   </div>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">آخر تعديل بواسطة</p>
                    <p className="text-xs font-black text-emerald-600">{(showInfoModal as any).lastModifiedBy || 'مؤسس النظام'}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* نافذة نقل/نسخ الكتاب */}
      {moveCopyModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  {moveCopyModal.mode === 'move' ? <Move size={18} className="text-emerald-600" /> : <Copy size={18} className="text-indigo-600" />}
                  {moveCopyModal.mode === 'move' ? 'نقل الكتاب إلى إضبارة' : 'نسخ الكتاب إلى إضبارة'}
                </h3>
                <button onClick={() => setMoveCopyModal(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18}/></button>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اختر المشروع المستهدف</label>
                   <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none"
                      value={targetProjectId}
                      onChange={(e) => { setTargetProjectId(e.target.value); setTargetFolderId(''); }}
                   >
                      <option value="">اختر مشروع...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اختر الإضبارة المستهدفة</label>
                   <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none disabled:opacity-50"
                      value={targetFolderId}
                      disabled={!targetProjectId}
                      onChange={(e) => setTargetFolderId(e.target.value)}
                   >
                      <option value="">اختر إضبارة من المشروع...</option>
                      {folders.filter(f => f.projectId === targetProjectId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                   </select>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-50 flex gap-3">
                <button 
                   onClick={handleMoveCopyAction}
                   disabled={!targetFolderId || !targetProjectId}
                   className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-[11px] shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                   تأكيد {moveCopyModal.mode === 'move' ? 'النقل' : 'النسخ'}
                </button>
                <button onClick={() => setMoveCopyModal(null)} className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[11px]">إلغاء</button>
             </div>
          </div>
        </div>
      )}

      <CreateFolderModal 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
        onSave={(f) => {
          const folderWithType = { ...f, isConfidential: viewMode === 'confidential' };
          onAddFolder(folderWithType);
        }} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          {activeFolderId ? (
            <button onClick={() => setActiveFolderId(null)} className="pb-2 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-black text-xs transition-all whitespace-nowrap">
              <ArrowRight size={16} /> العودة للأضابير {viewMode === 'confidential' ? 'السرية' : ''}
            </button>
          ) : (
            <>
              <button onClick={() => { setViewMode('types'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 whitespace-nowrap ${viewMode === 'types' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>الكتب المؤرشفة</button>
              <button onClick={() => { setViewMode('folders'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 whitespace-nowrap ${viewMode === 'folders' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>الأضابير الموضوعية</button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => { setViewMode('confidential'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'confidential' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  <Lock size={14} /> وثائق سرية
                </button>
              )}
              <button onClick={() => { setViewMode('pinned'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'pinned' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Star size={14} fill={viewMode === 'pinned' ? 'currentColor' : 'none'} /> وثائق مركزية</button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="pr-10 pl-8 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none appearance-none cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">كل المشاريع</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {((viewMode === 'folders' || viewMode === 'confidential') && !activeFolderId) && (
            <button onClick={() => setIsCreateFolderOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black shadow-lg ${viewMode === 'confidential' ? 'bg-red-600 text-white shadow-red-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}>
              <FolderPlus size={16} /> أضبارة {viewMode === 'confidential' ? 'سرية' : 'جديدة'}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder={`بحث في ${activeFolderId ? activeFolder?.name : (viewMode === 'confidential' ? 'الأرشيف السري' : 'الأرشيف')}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black" />
      </div>

      {(viewMode === 'folders' || viewMode === 'confidential') && !activeFolderId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
           {filteredFolders.map(folder => {
             const docCount = documents.filter(d => d.folderId === folder.id).length;
             return (
               <div 
                  key={folder.id} 
                  onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
                  onClick={() => setActiveFolderId(folder.id)} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative"
                >
                  <div className={`w-20 h-20 rounded-xl ${viewMode === 'confidential' ? 'bg-red-600' : (folder.color || 'bg-emerald-500')} text-white shadow-xl flex items-center justify-center mb-5 transition-transform duration-500`}>
                     {viewMode === 'confidential' ? <Lock size={36} fill="white" /> : <FolderIcon size={36} fill="white" />}
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">{folder.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400">{docCount} كتاب مؤرشف</p>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              onContextMenu={(e) => handleContextMenu(e, 'doc', doc.id)}
              onClick={() => onOpenUnit(doc)} 
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col aspect-square relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${doc.isConfidential ? 'bg-red-50 text-red-600' : (doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600 shadow-inner')}`}>
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-[12px] font-black text-slate-800 leading-snug line-clamp-2">{doc.subject}</h4>
                <p className="text-[10px] font-bold text-slate-400 line-clamp-1">من: {doc.sender}</p>
              </div>
              <div className="pt-3 border-t border-slate-50 mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">#{doc.refNumber}</span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><Clock size={12} /> {doc.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;