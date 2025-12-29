
import React, { useState, useMemo } from 'react';
import { Search, Filter, FileDown, FileUp, Eye, MoreVertical, Paperclip, Folder as FolderIcon, FolderPlus, ChevronLeft, Trash2, Briefcase } from 'lucide-react';
import { DocType, DocStatus, Document, Folder, Project } from '../types';
import CreateFolderModal from './CreateFolderModal';

interface DocumentListProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onAddFolder: (folder: Folder) => void;
  onOpenUnit: (doc: Document) => void;
  onDeleteDoc: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, folders, projects, onAddFolder, onOpenUnit, onDeleteDoc, onDeleteFolder }) => {
  const [viewMode, setViewMode] = useState<'types' | 'folders'>('types');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const lastProject = useMemo(() => {
    return [...projects].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
  }, [projects]);

  const [projectFilterId, setProjectFilterId] = useState<string | 'all' | 'none'>(lastProject?.id || 'all');

  const filteredFolders = useMemo(() => {
    return folders.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (projectFilterId === 'all') return matchesSearch;
      if (projectFilterId === 'none') return !f.projectId && matchesSearch;
      return f.projectId === projectFilterId && matchesSearch;
    });
  }, [folders, projectFilterId, searchTerm]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.refNumber.includes(searchTerm) || 
                           doc.sender.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (viewMode === 'folders' && selectedFolderId) {
        return doc.folderId === selectedFolderId && matchesSearch;
      }

      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesType && matchesSearch;
    });
  }, [documents, viewMode, selectedFolderId, filterType, searchTerm]);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setActiveMenu(null)}>
      <CreateFolderModal 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
        onSave={onAddFolder} 
      />

      <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
        <button 
          onClick={() => { setViewMode('types'); setSelectedFolderId(null); }}
          className={`pb-2 px-4 text-sm font-bold transition-all border-b-2 ${viewMode === 'types' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          التصنيف النوعي
        </button>
        <button 
          onClick={() => setViewMode('folders')}
          className={`pb-2 px-4 text-sm font-bold transition-all border-b-2 ${viewMode === 'folders' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          الأضابير (الأرشيف الموضوعي)
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {viewMode === 'types' ? (
          <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['all', DocType.INCOMING, DocType.OUTGOING, DocType.INTERNAL].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  filterType === type ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {type === 'all' ? 'الكل' : type}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
             {selectedFolderId ? (
               <button 
                onClick={() => setSelectedFolderId(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-2 text-sm font-bold"
               >
                 <ChevronLeft size={18} />
                 عودة للأضابير
               </button>
             ) : (
               <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl p-0.5 border border-emerald-100 shadow-sm">
                 <Briefcase size={16} className="mr-3 ml-1" />
                 <select 
                    value={projectFilterId}
                    onChange={(e) => setProjectFilterId(e.target.value)}
                    className="bg-transparent text-sm font-bold text-emerald-700 px-2 py-1.5 outline-none cursor-pointer"
                 >
                   <option value="all" className="bg-white text-slate-800">كل المشاريع</option>
                   <option value="none" className="bg-white text-slate-800">بدون مشروع (عام)</option>
                   {projects.map(p => (
                     <option key={p.id} value={p.id} className="bg-white text-slate-800">{p.name}</option>
                   ))}
                 </select>
               </div>
             )}
             {!selectedFolderId && (
               <button 
                onClick={() => setIsCreateFolderOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
               >
                 <FolderPlus size={18} />
                 إضبارة جديدة
               </button>
             )}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      {viewMode === 'folders' && !selectedFolderId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          {filteredFolders.map(folder => {
            const docCount = documents.filter(d => d.folderId === folder.id).length;
            const project = projects.find(p => p.id === folder.projectId);
            return (
              <div 
                key={folder.id} 
                onClick={() => setSelectedFolderId(folder.id)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${folder.color || 'bg-emerald-500'} text-white shadow-lg`}>
                    <FolderIcon size={32} />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, folder.id)}
                      className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeMenu === folder.id && (
                      <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); setActiveMenu(null); }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 size={14} />
                          نقل لسلة المهملات
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{folder.name}</h3>
                {project && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 mb-2">
                    <Briefcase size={12} />
                    {project.name}
                  </div>
                )}
                <p className="text-sm text-slate-400 mb-4 line-clamp-1">{folder.description || 'لا يوجد وصف مضاف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {docCount} كتاب مؤرشف
                  </span>
                  <span className="text-[10px] text-slate-400">أنشئت في {new Date(folder.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            );
          })}
          {filteredFolders.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
               <FolderIcon size={48} className="mx-auto opacity-10 mb-4" />
               <p className="font-bold">لا توجد أضابير في هذا التصنيف</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="relative group">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${doc.type === DocType.INCOMING ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {doc.type === DocType.INCOMING ? <FileDown size={24} /> : <FileUp size={24} />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 line-clamp-1 pr-12 lg:pr-0">{doc.subject}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400">رقم: {doc.refNumber}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs font-bold text-slate-400">{doc.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, doc.id)}
                      className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeMenu === doc.id && (
                      <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); setActiveMenu(null); }}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 size={14} />
                          نقل لسلة المهملات
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      doc.status === DocStatus.NEW ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {doc.status}
                    </span>
                    {doc.attachments.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded flex items-center gap-1">
                        <Paperclip size={10} />
                        {doc.attachments.length} مرفقات
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {doc.notes || "لا توجد ملاحظات إضافية."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      <img src="https://picsum.photos/seed/1/32" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                      <img src="https://picsum.photos/seed/2/32" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onOpenUnit(doc)}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Eye size={16} />
                      فتح الكتاب
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
               <Paperclip size={48} className="mx-auto opacity-10 mb-4" />
               <p className="font-bold">لا توجد كتب في هذه الإضبارة</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
