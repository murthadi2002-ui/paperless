
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Save, Trash2, AlertCircle, Briefcase, Folder as FolderIcon, Lock } from 'lucide-react';
import { DocType, DocStatus, Document, Folder, Attachment, Project } from '../types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doc: Document) => void;
  folders: Folder[];
  projects: Project[];
  defaultProjectId?: string;
  defaultFolderId?: string | null;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ 
  isOpen, onClose, onAdd, folders, projects, 
  defaultProjectId = 'all', defaultFolderId = null 
}) => {
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: DocType.INCOMING,
    refNumber: '',
    date: new Date().toISOString().split('T')[0],
    sender: '',
    receiver: '',
    subject: '',
    department: '',
    projectId: '',
    folderId: '',
    tags: [] as string[],
    notes: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);

  // تحديث القيم التلقائية عند فتح النافذة بناءً على سياق التصفح
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        projectId: defaultProjectId !== 'all' ? defaultProjectId : '',
        folderId: defaultFolderId || ''
      }));
    }
  }, [isOpen, defaultProjectId, defaultFolderId]);

  const isFormValid = formData.refNumber.trim() !== '' && 
                      formData.subject.trim() !== '' && 
                      formData.sender.trim() !== '' &&
                      uploadedFiles.length > 0;

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessing(true);
    const newFiles: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const filePromise = new Promise<Attachment>((resolve) => {
        reader.onload = (event) => {
          resolve({
            id: Math.random().toString(36).substr(2, 5),
            name: file.name,
            type: file.type,
            size: (file.size / 1024).toFixed(1) + ' KB',
            url: event.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      });
      newFiles.push(await filePromise);
    }
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setProcessing(false);
  };

  const removeFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // التحقق مما إذا كانت الإضبارة المختارة سرية لتوريث الصفة للكتاب
    const selectedFolder = folders.find(f => f.id === formData.folderId);
    const isConfidential = selectedFolder?.isConfidential || false;

    const cleanDoc: any = {
      type: formData.type,
      refNumber: formData.refNumber,
      date: formData.date,
      sender: formData.sender,
      receiver: formData.receiver || '',
      subject: formData.subject,
      department: formData.department || '',
      notes: formData.notes || '',
      status: DocStatus.NEW,
      attachments: uploadedFiles,
      tags: formData.tags.length > 0 ? formData.tags : ['مؤرشف'],
      tasks: [],
      folderId: formData.folderId || null,
      projectId: formData.projectId || null,
      isPinned: false,
      isConfidential: isConfidential
    };

    onAdd(cleanDoc as Document);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      type: DocType.INCOMING, refNumber: '', date: new Date().toISOString().split('T')[0],
      sender: '', receiver: '', subject: '', department: '', projectId: '', folderId: '',
      tags: [], notes: ''
    });
    setUploadedFiles([]);
  };

  const currentFolder = folders.find(f => f.id === formData.folderId);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200">
        {/* Header - Compact */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white shadow-sm ${currentFolder?.isConfidential ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {currentFolder?.isConfidential ? <Lock size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 leading-tight">أرشفة كتاب {currentFolder?.isConfidential ? 'سري' : 'جديد'}</h2>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{currentFolder?.isConfidential ? 'أمان فائق' : 'سجل إداري ذكي'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {currentFolder?.isConfidential && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertCircle className="text-red-500" size={16} />
              <p className="text-[10px] font-black text-red-700">تنبيه: سيتم وسم هذا الكتاب كـ "سري" تلقائياً لارتباطه بإضبارة سرية.</p>
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الكتاب *</label>
                <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs" value={formData.refNumber} onChange={e => setFormData({...formData, refNumber: e.target.value})} placeholder="000/00/00" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">التاريخ</label>
                <input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الموضوع الأساسي *</label>
              <input type="text" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-black text-sm" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="ما هو محتوى هذا الكتاب؟" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الجهة المرسلة *</label>
                <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الجهة المستلمة</label>
                <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-xs" value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1"><Briefcase size={10}/> المشروع</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                <option value="">عام (بدون مشروع)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1"><FolderIcon size={10}/> الإضبارة</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs" value={formData.folderId} onChange={e => setFormData({...formData, folderId: e.target.value})}>
                <option value="">بدون إضبارة</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id} className={f.isConfidential ? 'text-red-600' : ''}>
                    {f.name} {f.isConfidential ? '(سرية)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 transition-all cursor-pointer group shadow-inner ${currentFolder?.isConfidential ? 'border-red-200 hover:bg-red-50/50 hover:border-red-300' : 'border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'}`}>
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <Upload size={20} className={`text-slate-300 transition-all mb-2 ${currentFolder?.isConfidential ? 'group-hover:text-red-500' : 'group-hover:text-emerald-500'}`} />
              <h4 className="font-black text-slate-700 text-[10px]">إرفاق المستندات الممسوحة</h4>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">المرفقات المختارة ({uploadedFiles.length})</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 group shadow-sm">
                    <div className={`p-1.5 rounded-lg shrink-0 ${currentFolder?.isConfidential ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black truncate text-slate-800">{f.name}</p>
                    </div>
                    <button type="button" onClick={() => removeFile(f.id)} className="p-1 text-slate-300 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex-1">
            {!isFormValid && (
              <div className="text-red-400 text-[9px] font-black uppercase flex items-center gap-1">
                <AlertCircle size={12} /> استكمل البيانات الأساسية والملفات
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-200 transition-all">إلغاء</button>
            <button onClick={handleSubmit} disabled={!isFormValid || processing} className={`px-8 py-2 text-white rounded-lg text-[10px] font-black shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 ${currentFolder?.isConfidential ? 'bg-red-600 shadow-red-100 hover:bg-red-700' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'}`}>
              <Save size={16} /> حفظ الأرشفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
