
import React, { useState, useMemo } from 'react';
import { Search, FileDown, FileUp, Eye, MoreVertical, Paperclip, Folder as FolderIcon, FolderPlus, ChevronLeft, Trash2, Briefcase, Star, Copy, Edit3, Map, Clock, Plus, LayoutGrid, Filter, ArrowRight } from 'lucide-react';
import { DocType, DocStatus, Document, Folder, Project } from '../types';
import { CURRENT_USER } from '../constants';
import CreateFolderModal from './CreateFolderModal';

interface DocumentListProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onAddFolder: (folder: Folder) => void;
  onOpenUnit: (doc: Document) => void;
  onDeleteDoc: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameDoc?: (id: string, name: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onDuplicateDoc?: (doc: Document) => void;
  onTogglePin?: (id: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, folders, projects, onAddFolder, onOpenUnit, onDeleteDoc, onDeleteFolder,
  onRenameDoc, onRenameFolder, onDuplicateDoc, onTogglePin,
  selectedProjectId, setSelectedProjectId, activeFolderId, setActiveFolderId
}) => {
  const [viewMode, setViewMode] = useState<'types' | 'folders' | 'pinned'>('types');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const canEdit = CURRENT_USER.role === 'admin' || CURRENT_USER.permissions?.includes('تعديل كتاب');
  const canDelete = CURRENT_USER.role === 'admin' || CURRENT_USER.permissions?.includes('حذف كتاب');

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.refNumber.includes(searchTerm);
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesProject = selectedProjectId === 'all' || doc.projectId === selectedProjectId;
      const matchesFolder = activeFolderId ? doc.folderId === activeFolderId : true;
      
      if (viewMode === 'pinned') return doc.isPinned && matchesSearch;
      return matchesType && matchesSearch && matchesProject && matchesFolder;
    });
  }, [documents, viewMode, selectedProjectId, filterType, searchTerm, activeFolderId]);

  const filteredFolders = useMemo(() => {
    return folders.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProjectId === 'all' || f.projectId === selectedProjectId;
      return matchesSearch && matchesProject;
    });
  }, [folders, selectedProjectId, searchTerm]);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl" onClick={() => setActiveMenu(null)}>
      <CreateFolderModal isOpen={isCreateFolderOpen} onClose={() => setIsCreateFolderOpen(false)} onSave={onAddFolder} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
          {activeFolderId ? (
            <button onClick={() => setActiveFolderId(null)} className="pb-2 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-black text-xs transition-all">
              <ArrowRight size={16} /> العودة للأضابير
            </button>
          ) : (
            <>
              <button onClick={() => { setViewMode('types'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 ${viewMode === 'types' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>الكتب المؤرشفة</button>
              <button onClick={() => { setViewMode('folders'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 ${viewMode === 'folders' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>الأضابير الموضوعية</button>
              <button onClick={() => { setViewMode('pinned'); setActiveFolderId(null); }} className={`pb-2 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${viewMode === 'pinned' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Star size={14} fill={viewMode === 'pinned' ? 'currentColor' : 'none'} /> وثائق مركزية</button>
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
          {(viewMode === 'folders' && !activeFolderId) && (
            <button onClick={() => setIsCreateFolderOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-emerald-100">
              <FolderPlus size={16} /> أضبارة جديدة
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder={`بحث في ${activeFolderId ? activeFolder?.name : 'الأرشيف'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black" />
      </div>

      {viewMode === 'folders' && !activeFolderId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
           {filteredFolders.map(folder => {
             const docCount = documents.filter(d => d.folderId === folder.id).length;
             return (
               <div key={folder.id} onClick={() => setActiveFolderId(folder.id)} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative">
                  <div className="absolute top-4 left-4">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === folder.id ? null : folder.id); }} className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg"><MoreVertical size={16} /></button>
                    {activeMenu === folder.id && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-2xl z-20 py-1 animate-in zoom-in-95">
                        {canEdit && <button onClick={(e) => { e.stopPropagation(); onRenameFolder?.(folder.id, folder.name); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Edit3 size={12} /> إعادة تسمية</button>}
                        <button className="w-full text-right px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Copy size={12} /> تكرار الإضبارة</button>
                        {canDelete && <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12} /> حذف نهائي</button>}
                      </div>
                    )}
                  </div>
                  <div className={`w-20 h-20 rounded-[1.8rem] ${folder.color || 'bg-emerald-500'} text-white shadow-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                     <FolderIcon size={36} fill="white" />
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
            <div key={doc.id} onClick={() => onOpenUnit(doc)} className="group bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col aspect-square relative overflow-hidden">
              {doc.isPinned && <div className="absolute top-0 left-0 p-2 bg-amber-400 text-white rounded-br-xl z-10"><Star size={12} fill="white" /></div>}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600 shadow-inner'}`}>
                  {doc.type === DocType.INCOMING ? <FileDown size={20} /> : <FileUp size={20} />}
                </div>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === doc.id ? null : doc.id); }} className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg"><MoreVertical size={18} /></button>
                  {activeMenu === doc.id && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-2xl z-20 py-1 animate-in zoom-in-95">
                      {canEdit && <button onClick={(e) => { e.stopPropagation(); onRenameDoc?.(doc.id, doc.subject); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Edit3 size={12} /> إعادة تسمية</button>}
                      <button onClick={(e) => { e.stopPropagation(); onDuplicateDoc?.(doc); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Copy size={12} /> تكرار الكتاب</button>
                      <button onClick={(e) => { e.stopPropagation(); onTogglePin?.(doc.id); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Star size={12} /> {doc.isPinned ? 'إزالة من المركزية' : 'تثبيت كوثيقة مركزية'}</button>
                      {canDelete && <button onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); setActiveMenu(null); }} className="w-full text-right px-4 py-2.5 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12} /> حذف</button>}
                    </div>
                  )}
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
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                     <span className={`w-2 h-2 rounded-full ${doc.status === DocStatus.NEW ? 'bg-blue-500 shadow-blue-200' : 'bg-emerald-500 shadow-emerald-200'} shadow-lg animate-pulse`}></span>
                     <span className="text-[9px] font-black text-slate-500 tracking-tight">{doc.status}</span>
                   </div>
                   {doc.attachments.length > 0 && <div className="flex items-center gap-1 text-[9px] font-black text-slate-300"><Paperclip size={10} /> {doc.attachments.length}</div>}
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
