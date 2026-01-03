
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Save, Trash2, AlertCircle } from 'lucide-react';
import { DocType, DocStatus, Document, Folder, Attachment } from '../types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doc: Document) => void;
  folders: Folder[];
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd, folders }) => {
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

  // Validation Check
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
    // Add missing tasks property to satisfy the Document interface
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      folderId: formData.folderId || undefined,
      status: DocStatus.NEW,
      attachments: uploadedFiles,
      tags: formData.tags.length > 0 ? formData.tags : ['مؤرشف'],
      tasks: []
    };
    onAdd(newDoc);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header - Slimmed down */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">أرشفة كتاب جديد</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">إنشاء سجل إداري ذكي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الكتاب *</label>
                  <input type="text" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-sm" value={formData.refNumber} onChange={e => setFormData({...formData, refNumber: e.target.value})} placeholder="000/00/00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">التاريخ</label>
                  <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الموضوع الأساسي *</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-base" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="محتوى الكتاب..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الجهة المرسلة *</label>
                  <input type="text" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-sm" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الجهة المستلمة</label>
                  <input type="text" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-sm" value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">ملاحظات إضافية</label>
              <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-sm resize-none" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="اكتب أي ملاحظات إدارية هنا..." />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer group shadow-inner shrink-0 h-40">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-3">
                <Upload size={24} />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">إرفاق المستندات الممسوحة</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PDF, JPG, PNG المدعومة</p>
            </div>
            
            <div className="flex-1 bg-slate-50/30 rounded-[2rem] p-4 border border-slate-100 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3 px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المرفقات الحالية ({uploadedFiles.length})</h5>
                {uploadedFiles.length > 0 && <button type="button" onClick={() => setUploadedFiles([])} className="text-[10px] font-black text-red-400 hover:text-red-600">مسح الكل</button>}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 px-1 custom-scrollbar">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-3 group animate-in slide-in-from-right-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-slate-800">{f.name}</p>
                      <p className="text-[8px] font-bold text-slate-400">{f.size}</p>
                    </div>
                    <button type="button" onClick={() => removeFile(f.id)} className="p-1 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 py-10">
                    <FileText size={32} />
                    <p className="text-[10px] font-bold mt-2">لا توجد ملفات مرفقة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer - Slimmed down */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex-1 flex items-center">
            {!isFormValid ? (
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase animate-pulse">
                <AlertCircle size={14} /> استكمل البيانات والملفات المطلوبة
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase">
                <FileText size={14} /> البيانات جاهزة للأرشفة
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-200 transition-all">إلغاء</button>
            <button onClick={handleSubmit} disabled={!isFormValid || processing} className="px-8 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95">
              <Save size={16} /> إتمام الأرشفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
