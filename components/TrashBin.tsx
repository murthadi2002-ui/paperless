
import React from 'react';
import { Trash2, RotateCcw, FileText, Layers, Folder as FolderIcon, AlertCircle, Calendar } from 'lucide-react';
import { Document, Folder } from '../types';

interface TrashBinProps {
  deletedDocs: Document[];
  deletedFolders: Folder[];
  onRestoreDoc: (doc: Document) => void;
  onRestoreFolder: (folder: Folder) => void;
}

const TrashBin: React.FC<TrashBinProps> = ({ deletedDocs, deletedFolders, onRestoreDoc, onRestoreFolder }) => {
  const totalItems = deletedDocs.length + deletedFolders.length;

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <Trash2 size={48} className="opacity-10 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">سلة المهملات فارغة</h3>
        <p className="text-sm mt-1">لا توجد عناصر محذوفة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4">
        <AlertCircle size={20} className="text-amber-600" />
        <p className="text-xs text-amber-700 font-bold">تُحذف الملفات نهائياً بعد 60 يوماً من تاريخ الحذف تلقائياً.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deleted Folders */}
        {deletedFolders.map((folder) => (
          <div key={folder.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`p-2.5 rounded-xl ${folder.color || 'bg-slate-400'} text-white shadow-sm`}>
                <FolderIcon size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-800 text-sm truncate">{folder.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold">
                   <Calendar size={10} /> حُذف في: {folder.deletedAt ? new Date(folder.deletedAt).toLocaleDateString('ar-EG') : '-'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => onRestoreFolder(folder)}
              className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="استرجاع"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        ))}

        {/* Deleted Docs */}
        {deletedDocs.map((doc) => (
          <div key={doc.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400`}>
                {doc.isSleeve ? <Layers size={20} /> : <FileText size={20} />}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-800 text-sm truncate">{doc.subject}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold">
                   <span className="bg-slate-200 px-1.5 rounded text-slate-500">{doc.refNumber}</span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span>{doc.deletedAt ? new Date(doc.deletedAt).toLocaleDateString('ar-EG') : '-'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onRestoreDoc(doc)}
              className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="استرجاع"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashBin;
