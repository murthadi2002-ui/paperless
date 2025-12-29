
import React, { useState, useMemo } from 'react';
import { ChevronRight, Briefcase, FileText, Hash, Calendar, LayoutGrid, Info, Eye, Download, Search, Folder as FolderIcon, ChevronLeft } from 'lucide-react';
import { Project, Document, Folder } from '../types';

interface ProjectDetailsViewProps {
  project: Project;
  documents: Document[];
  folders: Folder[];
  onBack: () => void;
  onOpenDoc: (doc: Document) => void;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project, documents, folders, onBack, onOpenDoc }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // الأضابير المرتبطة بهذا المشروع حصراً
  const projectFolders = useMemo(() => {
    return folders.filter(f => f.projectId === project.id);
  }, [folders, project.id]);

  // الكتب المرتبطة بهذا المشروع
  const projectDocs = useMemo(() => {
    return documents.filter(d => d.projectId === project.id);
  }, [documents, project.id]);

  // التصفية حسب البحث والفاصل المختار
  const filteredContent = useMemo(() => {
    if (selectedFolderId) {
      // عرض الكتب داخل الإضبارة المختارة
      return projectDocs.filter(doc => 
        doc.folderId === selectedFolderId &&
        (doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || doc.refNumber.includes(searchTerm))
      );
    } else {
      // عرض الأضابير التابعة للمشروع
      return projectFolders.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [selectedFolderId, projectFolders, projectDocs, searchTerm]);

  const activeFolder = useMemo(() => 
    folders.find(f => f.id === selectedFolderId), 
    [folders, selectedFolderId]
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 px-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-2 font-bold text-sm">
            <ChevronRight size={20} /> كل المشاريع
          </button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Briefcase size={18} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-800">{project.name}</h2>
               <p className="text-[10px] font-bold text-slate-400">{project.code}</p>
             </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="بحث في المشروع..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Info size={14} /> إحصائيات المشروع
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">وصف المشروع</p>
                <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
              </div>
              <div className="pt-4 border-t border-slate-50 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">الأضابير</span>
                    <span className="text-sm font-bold text-slate-800">{projectFolders.length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">إجمالي الكتب</span>
                    <span className="text-sm font-bold text-slate-800">{projectDocs.length}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full min-h-[600px] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 {selectedFolderId && (
                   <button 
                    onClick={() => setSelectedFolderId(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
                   >
                     <ChevronLeft size={20} />
                   </button>
                 )}
                 <div>
                   <h3 className="text-xl font-bold text-slate-800">
                     {selectedFolderId ? `إضبارة: ${activeFolder?.name}` : "أضابير المشروع"}
                   </h3>
                   <p className="text-slate-400 text-sm mt-1">
                     {selectedFolderId ? "استعراض الكتب داخل هذه الإضبارة" : "اختر إضبارة لاستعراض الكتب بداخلها"}
                   </p>
                 </div>
               </div>
            </div>

            <div className="p-8">
              {!selectedFolderId ? (
                /* عرض الأضابير */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.map((folder: any) => {
                    const docCount = projectDocs.filter(d => d.folderId === folder.id).length;
                    return (
                      <div 
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                           <div className={`p-3 rounded-2xl ${folder.color || 'bg-emerald-500'} text-white shadow-lg`}>
                              <FolderIcon size={24} />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-800">{folder.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{docCount} كتاب مؤرشف</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-end text-emerald-600 group-hover:translate-x-[-4px] transition-transform">
                          <ChevronLeft size={20} />
                        </div>
                      </div>
                    );
                  })}
                  {filteredContent.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                      <FolderIcon size={48} className="mx-auto opacity-10 mb-4" />
                      <p className="font-bold">لا توجد أضابير مرتبطة بهذا المشروع بعد</p>
                    </div>
                  )}
                </div>
              ) : (
                /* عرض الكتب داخل الإضبارة المختارة */
                <div className="space-y-4">
                  {filteredContent.map((doc: any) => (
                    <div 
                      key={doc.id}
                      onClick={() => onOpenDoc(doc)}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${doc.type === 'وارد' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{doc.subject}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                            <span>{doc.refNumber}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-100">
                        <Eye size={16} />
                      </div>
                    </div>
                  ))}
                  {filteredContent.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                      <FileText size={48} className="mx-auto opacity-10 mb-4" />
                      <p className="font-bold">لا توجد كتب مؤرشفة داخل هذه الإضبارة للمشروع المختار</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsView;
