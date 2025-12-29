
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
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      folderId: formData.folderId || undefined,
      status: DocStatus.NEW,
      attachments: uploadedFiles,
      tags: formData.tags.length > 0 ? formData.tags : ['مؤرشف']
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
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">أرشفة كتاب جديد</h2>
              <p className="text-xs text-slate-400">يمكنك إرفاق ملف واحد أو عدة ملفات لهذا الكتاب</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-inner">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 mr-1">رقم الكتاب *</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.refNumber} onChange={e => setFormData({...formData, refNumber: e.target.value})} placeholder="000/00/00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 mr-1">التاريخ</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-1">الموضوع *</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="ما هو محتوى الكتاب؟" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 mr-1">الجهة المرسلة *</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 mr-1">المستلم</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-emerald-50 transition-all cursor-pointer group shadow-inner">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <Upload size={32} className="text-slate-400 group-hover:text-emerald-600 mb-4" />
              <h4 className="font-bold text-slate-700">رفع المرفقات *</h4>
              <p className="text-xs text-slate-400 mt-1">يجب رفع ملف واحد على الأقل</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 flex-1 shadow-sm overflow-hidden flex flex-col">
                <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                  {uploadedFiles.map((f) => (
                    <div key={f.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 group">
                      <FileText size={16} className="text-emerald-600" />
                      <p className="text-xs font-bold truncate flex-1">{f.name}</p>
                      <button type="button" onClick={() => removeFile(f.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {!isFormValid && <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse"><AlertCircle size={14} /> يرجى استكمال الحقول المطلوبة والملفات</div>}
          <div className="mr-auto flex gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-200">إلغاء</button>
            <button onClick={handleSubmit} disabled={!isFormValid || processing} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all">
              <Save size={18} className="ml-2" /> إتمام الأرشفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
