
import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, Download, Printer, ZoomIn, ZoomOut, Maximize2, Layers, AlertTriangle } from 'lucide-react';
import { Attachment } from '../types';

interface FileViewerProps {
  openFiles: Attachment[];
  activeFileId: string | null;
  onCloseTab: (id: string) => void;
  onSelectTab: (id: string) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ openFiles, activeFileId, onCloseTab, onSelectTab }) => {
  const [zoom, setZoom] = useState(100);
  const activeFile = openFiles.find(f => f.id === activeFileId);

  if (openFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400 animate-in fade-in duration-500">
        <div className="p-8 bg-white rounded-full shadow-sm mb-6 border border-slate-100">
          <Layers size={64} className="opacity-20" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">مستعرض الملفات فارغ</h2>
        <p className="mt-2 text-slate-500">قم بفتح الملفات من الأرشيف العام لتظهر هنا في تبويبات</p>
      </div>
    );
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  const isPDF = activeFile?.type === 'application/pdf';
  const isDoc = activeFile?.name.match(/\.(docx|doc|xlsx|xls)$/i);

  return (
    <div className="flex flex-col h-full bg-slate-200 animate-in fade-in duration-500">
      {/* Tabs Bar - Minimal & Integrated */}
      <div className="flex items-center gap-1 bg-slate-800 px-4 pt-2 overflow-x-auto no-scrollbar shadow-xl z-20">
        {openFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectTab(file.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-t-xl cursor-pointer transition-all min-w-[140px] max-w-[200px] relative group ${
              activeFileId === file.id 
                ? 'bg-slate-100 text-slate-900 font-bold' 
                : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <div className={`shrink-0 ${activeFileId === file.id ? 'text-emerald-600' : 'text-slate-500'}`}>
              {file.type === 'application/pdf' ? <FileText size={14} /> : <ImageIcon size={14} />}
            </div>
            <span className="text-[11px] truncate flex-1">{file.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onCloseTab(file.id); }}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* Modern Toolbar */}
      <div className="bg-white px-6 py-3 flex items-center justify-between shadow-md z-10 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500" disabled={zoom <= 25}>
              <ZoomOut size={16} />
            </button>
            <div className="px-3 min-w-[60px] text-center"><span className="text-xs font-bold">{zoom}%</span></div>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500" disabled={zoom >= 400}>
              <ZoomIn size={16} />
            </button>
          </div>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"><Maximize2 size={18} /></button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
            <Download size={16} /> تحميل
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"><Printer size={18} /></button>
        </div>
      </div>

      {/* Main View Area - Full Space */}
      <div className="flex-1 overflow-auto flex flex-col items-center p-0 md:p-4 bg-slate-200/50 custom-scrollbar">
        {activeFile ? (
          <div 
            className="transition-all duration-300 shadow-2xl bg-white rounded-sm md:rounded-lg origin-top overflow-hidden"
            style={{ 
              width: `${zoom}%`,
              maxWidth: zoom > 100 ? 'none' : '100%',
              minHeight: '100%'
            }}
          >
            {isPDF ? (
              <embed
                src={activeFile.url}
                type="application/pdf"
                className="w-full h-screen min-h-[900px]"
                key={activeFile.id}
              />
            ) : isDoc ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                <AlertTriangle size={48} className="text-amber-500" />
                <h3 className="text-xl font-bold text-slate-800">مستند (Office)</h3>
                <p className="text-slate-500 max-w-md">لا يمكن عرض مستندات Word/Excel مباشرة في المتصفح لأسباب أمنية. يرجى تحميل الملف لفتحه على جهازك.</p>
                <a href={activeFile.url} download={activeFile.name} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100">تحميل المستند الآن</a>
              </div>
            ) : (
              <img src={activeFile.url} alt={activeFile.name} className="w-full h-auto block" />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">اختر ملفاً للعرض</div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
