
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, Send, Paperclip, Mic, MoreVertical, 
  FileText, Archive, Check, CheckCheck, User, 
  Download, ArchiveRestore, X, FolderOpen,
  MessageSquare, ChevronLeft, ChevronRight,
  Folder as FolderIcon, Trash2, BellOff, Bell,
  Play, Pause, Volume2, FileIcon, StopCircle,
  Briefcase, Plus, Filter, Info, History, SendHorizontal, Paperclip as PaperclipIcon,
  Clock
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES, MOCK_MESSAGES, MOCK_PROJECTS, MOCK_DOCUMENTS, MOCK_FOLDERS } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  onArchiveFile: (file: any) => void;
}

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders, onArchiveFile }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  
  // Multi-select state
  const [selectedDocsForShare, setSelectedDocsForShare] = useState<Document[]>([]);
  
  // Download Simulation State in Preview
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Archive Picker State
  const [pickerStep, setPickerStep] = useState<'projects' | 'folders' | 'docs'>('projects');
  const [selectedPickerProjectId, setSelectedPickerProjectId] = useState<string | null>(null);
  const [selectedPickerFolderId, setSelectedPickerFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedUserId]);

  const selectedUser = useMemo(() => MOCK_EMPLOYEES.find(u => u.id === selectedUserId), [selectedUserId]);
  const chatMessages = useMemo(() => 
    messages.filter(m => 
      (m.senderId === CURRENT_USER.id && m.receiverId === selectedUserId) ||
      (m.senderId === selectedUserId && m.receiverId === CURRENT_USER.id)
    ), [messages, selectedUserId]
  );

  const handleSendMessage = (textOverride?: string, attachment?: Attachment, isVoice = false) => {
    if (!selectedUserId) return;
    if (!textOverride && !inputText.trim() && !attachment && !isVoice) return;

    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: CURRENT_USER.id,
      receiverId: selectedUserId,
      text: textOverride || inputText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      attachment,
      isVoice
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      clearInterval(recordingInterval.current);
      setIsRecording(false);
      setRecordingTime(0);
      handleSendMessage('رسالة صوتية', undefined, true);
    } else {
      setIsRecording(true);
      recordingInterval.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 5),
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: '#'
      };
      handleSendMessage(`أرفق ملف: ${file.name}`, attachment);
    }
  };

  const shareSelectedBooks = () => {
    if (selectedDocsForShare.length === 0) return;
    
    selectedDocsForShare.forEach(doc => {
      const newMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: CURRENT_USER.id,
        receiverId: selectedUserId!,
        text: `تمت مشاركة أرشيف الكتاب: ${doc.subject}`,
        archivedDocId: doc.id,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      setMessages(prev => [...prev, newMsg]);
    });
    
    setShowArchivePicker(false);
    resetPicker();
    setSelectedDocsForShare([]);
  };

  const toggleDocSelection = (doc: Document) => {
    setSelectedDocsForShare(prev => 
      prev.find(d => d.id === doc.id) 
        ? prev.filter(d => d.id !== doc.id) 
        : [...prev, doc]
    );
  };

  const resetPicker = () => {
    setPickerStep('projects');
    setSelectedPickerProjectId(null);
    setSelectedPickerFolderId(null);
    setPickerSearch('');
  };

  const pickerItems = useMemo(() => {
    const s = pickerSearch.toLowerCase();
    if (pickerStep === 'projects') {
      return MOCK_PROJECTS.filter(p => p.name.toLowerCase().includes(s));
    } else if (pickerStep === 'folders') {
      return MOCK_FOLDERS.filter(f => f.projectId === selectedPickerProjectId && f.name.toLowerCase().includes(s));
    } else if (pickerStep === 'docs') {
      return documents.filter(d => d.folderId === selectedPickerFolderId && d.subject.toLowerCase().includes(s));
    }
    return [];
  }, [pickerStep, pickerSearch, selectedPickerProjectId, selectedPickerFolderId, documents]);

  const simulatePreviewDownload = (id: string) => {
    setDownloadingId(id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadingId(null), 800);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const DownloadIconWithProgress: React.FC<{ size?: number, isDownloading: boolean, progress: number }> = ({ size = 18, isDownloading, progress }) => {
    return (
      <div className="relative flex items-center justify-center">
        {isDownloading && (
          <svg className="absolute w-8 h-8 -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" fill="none" className="stroke-slate-100" strokeWidth="3" />
            <circle 
              cx="18" cy="18" r="17" fill="none" 
              className="stroke-emerald-500 transition-all duration-300" 
              strokeWidth="3" 
              strokeDasharray="106.8" 
              strokeDashoffset={106.8 - (progress * 1.068)}
              strokeLinecap="round"
            />
          </svg>
        )}
        <div className={`transition-all duration-300 ${isDownloading ? 'scale-75 text-emerald-600' : ''}`}>
          {progress === 100 && isDownloading ? <Check size={size} /> : <Download size={size} />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden text-right" dir="rtl">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-l border-slate-200/60 flex flex-col bg-slate-50/40 backdrop-blur-sm shrink-0">
          <div className="p-4 border-b border-slate-200/30">
            <h2 className="text-base font-black text-slate-800 mb-3 px-1">الزملاء</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="بحث..." className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
            {MOCK_EMPLOYEES.filter(u=>u.name.includes(searchTerm)).map(user => (
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-600 hover:bg-white'}`}>
                <img src={user.avatar} className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-sm" alt="" />
                <div className="flex-1 text-right overflow-hidden"><span className="font-black text-[12px] truncate block leading-tight">{user.name}</span><p className={`text-[9px] font-bold truncate opacity-60`}>{user.department}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="h-14 px-6 border-b border-slate-200/40 flex items-center justify-between bg-white/70 backdrop-blur-md z-30 shrink-0">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} className="w-9 h-9 rounded-xl object-cover border-2 border-white" alt="" />
                  <div className="text-right"><h3 className="font-black text-slate-800 text-xs">{selectedUser.name}</h3><p className="text-[9px] text-emerald-600 font-bold">متصل الآن</p></div>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-3 custom-scrollbar">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === CURRENT_USER.id ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
                    <div className={`p-3 px-4 rounded-[1.4rem] shadow-sm text-[12px] font-bold max-w-[75%] ${msg.senderId === CURRENT_USER.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                      {msg.isVoice ? (
                        <div className="flex items-center gap-3 min-w-[180px]"><Play size={16} fill={msg.senderId === CURRENT_USER.id ? "white" : "currentColor"} /><div className="flex-1 h-1 bg-slate-200/40 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-current"></div></div><span className="text-[9px]">0:08</span></div>
                      ) : msg.archivedDocId ? (
                        <div onClick={() => setPreviewDoc(documents.find(d => d.id === msg.archivedDocId) || null)} className="flex flex-col gap-2 p-1 cursor-pointer group">
                           <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all">
                              <div className="p-2 bg-white/20 rounded-lg shadow-inner"><ArchiveRestore size={18} /></div>
                              <div className="flex-1 truncate"><p className="text-[10px] opacity-70 mb-0.5 font-black uppercase">مشاركة أرشيف</p><p className="truncate leading-tight font-black">{msg.text.split(': ')[1]}</p></div>
                              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                           </div>
                        </div>
                      ) : msg.attachment ? (
                        <div className="flex items-center gap-3 p-2 bg-slate-50/10 rounded-xl border border-white/20">
                           <FileIcon size={20} />
                           <div className="flex-1 truncate">
                              <p className="truncate">{msg.attachment.name}</p>
                              <p className="text-[8px] opacity-60 uppercase">{msg.attachment.size}</p>
                           </div>
                           <Download size={14} className="opacity-50" />
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.text}</p>
                      )}
                      <div className={`mt-1 flex items-center justify-end gap-1 text-[8px] font-black opacity-60`}><span>{msg.timestamp}</span>{msg.senderId === CURRENT_USER.id && <CheckCheck size={10} />}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div className="px-6 pb-8 pt-2 bg-transparent shrink-0 z-40 relative">
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 pr-4 rounded-full border border-slate-200 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-emerald-500/10">
                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between px-4 animate-pulse text-red-500 text-xs font-black">
                       <div className="flex items-center gap-2"><StopCircle size={20} /><span>التسجيل جاري... {recordingTime} ثانية</span></div>
                       <button onClick={() => { clearInterval(recordingInterval.current); setIsRecording(false); setRecordingTime(0); }} className="text-slate-400 hover:text-red-500">إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-0.5 border-l border-slate-100 pl-1">
                        <button onClick={() => setShowArchivePicker(!showArchivePicker)} className={`p-2 rounded-full transition-all ${showArchivePicker ? 'bg-amber-100 text-amber-600 shadow-inner' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}><ArchiveRestore size={18} /></button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><PaperclipIcon size={18} /></button>
                      </div>
                      <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2.5 px-2 resize-none max-h-32 text-right placeholder:text-slate-300" rows={1} />
                    </>
                  )}
                  <div className="flex items-center gap-1.5 pr-1 border-r border-slate-100 mr-1">
                    <button onClick={handleVoiceToggle} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Mic size={18} /></button>
                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-3 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 disabled:opacity-50"><Send size={18} /></button>
                  </div>
                </div>

                {/* ARCHIVE PICKER - ENHANCED MULTI-SELECT */}
                {showArchivePicker && (
                  <div className="absolute bottom-full left-6 right-6 mb-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-2xl p-6 animate-in slide-in-from-bottom-4 flex flex-col max-h-[480px] z-50">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                           {pickerStep !== 'projects' && <button onClick={() => setPickerStep(pickerStep === 'docs' ? 'folders' : 'projects')} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><ChevronRight size={16} /></button>}
                           <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><ArchiveRestore size={16} className="text-amber-500" /> إدراج من الأرشيف</h4>
                        </div>
                        <button onClick={() => { setShowArchivePicker(false); resetPicker(); }} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-300 transition-colors"><X size={18} /></button>
                     </div>

                     <div className="relative mb-4">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                           type="text" 
                           placeholder={`بحث في ${pickerStep === 'projects' ? 'المشاريع' : pickerStep === 'folders' ? 'الأضابير' : 'الكتب'}...`}
                           value={pickerSearch}
                           onChange={(e) => setPickerSearch(e.target.value)}
                           className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                        {selectedDocsForShare.length > 0 && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{selectedDocsForShare.length} مختارة</span>
                          </div>
                        )}
                     </div>

                     <div className="flex-1 overflow-y-auto custom-scrollbar px-1 mb-4">
                        <div className={`grid ${pickerStep === 'docs' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                           {pickerItems.map((item: any) => {
                             const isSelected = pickerStep === 'docs' && selectedDocsForShare.find(d => d.id === item.id);
                             return (
                               <div 
                                  key={item.id} 
                                  onClick={() => {
                                     if (pickerStep === 'projects') { setSelectedPickerProjectId(item.id); setPickerStep('folders'); setPickerSearch(''); }
                                     else if (pickerStep === 'folders') { setSelectedPickerFolderId(item.id); setPickerStep('docs'); setPickerSearch(''); }
                                     else toggleDocSelection(item);
                                  }} 
                                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group border ${isSelected ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg hover:border-amber-200'}`}
                               >
                                  <div className={`p-2 rounded-xl shadow-sm ${isSelected ? 'bg-emerald-600 text-white' : (pickerStep === 'projects' ? 'bg-white text-slate-400 group-hover:text-emerald-600' : pickerStep === 'folders' ? (item.color || 'bg-emerald-500') + ' text-white' : 'bg-white text-emerald-600')}`}>
                                     {pickerStep === 'projects' ? <Briefcase size={20} /> : pickerStep === 'folders' ? <FolderIcon size={20} /> : <FileText size={20} />}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                     <p className="text-[11px] font-black text-slate-800 truncate">{pickerStep === 'docs' ? item.subject : item.name}</p>
                                     <p className={`text-[8px] font-bold uppercase tracking-tighter ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {pickerStep === 'projects' ? 'فتح المشروع' : pickerStep === 'folders' ? 'فتح الإضبارة' : (isSelected ? 'تم الاختيار' : 'تحديد للإرسال')}
                                     </p>
                                  </div>
                                  {pickerStep === 'docs' && (
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 group-hover:border-emerald-400'}`}>
                                      {isSelected && <Check size={12} strokeWidth={4} />}
                                    </div>
                                  )}
                               </div>
                             );
                           })}
                           {pickerItems.length === 0 && <div className="col-span-2 py-10 text-center text-slate-400 font-black text-[10px]">لا توجد نتائج مطابقة للبحث</div>}
                        </div>
                     </div>
                     
                     {/* Share Button for Multi-select */}
                     {selectedDocsForShare.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                          <button 
                            onClick={shareSelectedBooks}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Send size={16} /> إرسال الملفات المختارة ({selectedDocsForShare.length})
                          </button>
                          <button onClick={() => setSelectedDocsForShare([])} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-200">إلغاء</button>
                        </div>
                     )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={64} className="opacity-10 mb-4" />
              <h3 className="font-black text-slate-800">اختر زميلاً لبدء التواصل</h3>
            </div>
          )}
        </div>
      </div>

      {/* REFINED SLIM PREVIEW OVERLAY (NAZK STYLE) */}
      {previewDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
              {/* Slim Header */}
              <div className="p-4 px-8 border-b border-slate-100 flex flex-row-reverse items-center justify-between bg-white/95 backdrop-blur-md shrink-0">
                 <div className="flex flex-row-reverse items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg"><ArchiveRestore size={18} /></div>
                    <div>
                       <h4 className="font-black text-slate-800 text-[13px]">معاينة الوثيقة</h4>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">الأرشيف الذكي</p>
                    </div>
                 </div>
                 <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-all"><X size={22} /></button>
              </div>

              {/* Scrollable Content with Slim Design */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]">
                 <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex flex-row-reverse items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">المرجع: {previewDoc.refNumber}</span>
                       <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1"><Clock size={11} /> {previewDoc.date}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 leading-snug">{previewDoc.subject}</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 mb-0.5">جهة الإرسال</p>
                          <p className="text-[11px] font-black text-slate-700 truncate">{previewDoc.sender}</p>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 mb-0.5">الحالة</p>
                          <p className="text-[11px] font-black text-amber-600">{previewDoc.status}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h5 className="font-black text-slate-800 text-[11px] flex flex-row-reverse items-center gap-2 pr-1">المرفقات الرسمية ({previewDoc.attachments.length}) <PaperclipIcon size={12} className="text-emerald-500" /></h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {previewDoc.attachments.map(file => (
                         <div 
                           key={file.id} 
                           onClick={(e) => { e.stopPropagation(); simulatePreviewDownload(file.id); }}
                           className="p-3 bg-white border border-slate-100 rounded-[1.5rem] flex flex-row-reverse items-center gap-3 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group relative overflow-hidden"
                         >
                            <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white rounded-xl shadow-inner transition-all"><FileIcon size={16} /></div>
                            <div className="flex-1 overflow-hidden text-right">
                               <p className="text-[10px] font-black text-slate-800 truncate">{file.name}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{file.size}</p>
                            </div>
                            <DownloadIconWithProgress size={14} isDownloading={downloadingId === file.id} progress={downloadProgress} />
                            
                            {downloadingId === file.id && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
                                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Slim Footer */}
              <div className="p-4 px-8 bg-slate-50 border-t border-slate-100 flex flex-row-reverse gap-3 shrink-0">
                 <button 
                   onClick={() => simulatePreviewDownload('all_preview')}
                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                 >
                    <DownloadIconWithProgress size={16} isDownloading={downloadingId === 'all_preview'} progress={downloadProgress} />
                    تنزيل الكل
                 </button>
                 <button onClick={() => setPreviewDoc(null)} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-100">إغلاق</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MessagingPage;
