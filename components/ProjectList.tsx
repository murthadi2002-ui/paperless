
import React, { useState } from 'react';
import { Search, Plus, Briefcase, FileText, ChevronLeft, MoreVertical, LayoutGrid, List, Trash2, Edit3 } from 'lucide-react';
import { Project, Document, User } from '../types';

interface ProjectListProps {
  projects: Project[];
  documents: Document[];
  currentUser: User | null;
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onDeleteProject?: (id: string) => void;
  onRenameProject?: (id: string, oldName: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, documents, currentUser, onSelectProject, onAddProject, onDeleteProject, onRenameProject }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Use currentUser from props instead of the missing constant
  const canEdit = currentUser?.role === 'admin' || currentUser?.permissions?.includes('تعديل مشروع') || currentUser?.permissions?.includes('إدارة المشاريع');
  const canDelete = currentUser?.role === 'admin' || currentUser?.permissions?.includes('حذف مشروع') || currentUser?.permissions?.includes('إدارة المشاريع');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" onClick={() => setActiveMenu(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المشاريع الهندسية</h2>
          <p className="text-slate-500 mt-1">تتبع الأرشفة والمراسلات لكل مشروع هندسي على حدة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن مشروع..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button 
            onClick={onAddProject}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus size={18} />
            مشروع جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const projectDocs = documents.filter(d => d.projectId === project.id);
          const incomingCount = projectDocs.filter(d => d.type === 'وارد').length;
          const outgoingCount = projectDocs.filter(d => d.type === 'صادر').length;

          return (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Briefcase size={32} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{project.code}</span>
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, project.id)}
                      className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeMenu === project.id && (
                      <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 origin-top-left overflow-hidden">
                        {canEdit && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRenameProject?.(project.id, project.name); setActiveMenu(null); }}
                            className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                          >
                            <Edit3 size={14} /> إعادة تسمية المشروع
                          </button>
                        )}
                        <hr className="my-1 border-slate-50" />
                        {canDelete && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteProject?.(project.id); setActiveMenu(null); }}
                            className="w-full text-right px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 size={14} /> حذف المشروع نهائياً
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">وارد</p>
                    <p className="text-sm font-bold text-slate-800">{incomingCount}</p>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">صادر</p>
                    <p className="text-sm font-bold text-slate-800">{outgoingCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                  <span>فتح المشروع</span>
                  <ChevronLeft size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;
