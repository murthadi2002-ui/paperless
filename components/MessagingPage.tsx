
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  collection, onSnapshot, addDoc, query, orderBy, where, serverTimestamp, deleteDoc, doc, updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, Send, Mic, FileText, X, ArchiveRestore, MessageSquare, 
  Play, FileIcon, StopCircle, Briefcase, ChevronRight, ChevronLeft,
  Paperclip as PaperclipIcon, CheckCheck, Download, Clock,
  Folder as FolderIcon, CheckSquare, Square, ArrowRight,
  Upload, Filter, Plus, Pause, Volume2, MoreVertical, Trash2,
  FolderPlus, FilePlus, ExternalLink, Loader2, Edit3
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment, Project } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onOpenDoc: (doc: Document) => void;
  onAddDocument: (doc: any) => void;
  onOpenAddModalWithFile: (files: Attachment[]) => void;
}

// Circular Progress for File Interaction
const CircularProgress: React.FC<{ progress: number; isDownloading: boolean; size?: number }> = ({ progress, isDownloading, size = 4 }) => (
  <div className={`relative flex items-center justify-center w-${size} h-${size} shrink-0`}>
    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
      <circle 
        cx="18" cy="18" r="16" fill="none" 
        className="stroke-emerald-500 transition-all duration-300" 
        strokeWidth="4" 
        strokeDasharray="100.5" 
        strokeDashoffset={100.5 - progress}
        strokeLinecap="round"
      />
    </svg>
    <CheckCheck size={8} className={`${progress === 100 ? 'text-emerald-600 scale-100' : 'text-transparent scale-0'} transition-all duration-300`} />
  </div>
);

// REFINED DIGITAL VOICE PLAYER (FIXED NAN/INFINITY)
const VoicePlayer: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Some browsers don't give duration until first play
      if (duration === 0 && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url, duration]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 py-0.5 px-1 rounded-md ${isMe ? 'bg-white/10' : 'bg-slate-50 border border-slate-100'}`} dir="ltr">
      <button 
        onClick={togglePlay} 
        className={`w-5 h-5 flex items-center justify-center rounded-full transition-all active:scale-90 ${isMe ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'}`}
      >
        {playing ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className={`text-[9px] font-black font-mono tracking-tighter flex items-center gap-1 ${isMe ? 'text-white' : 'text-slate-600'}`}>
        <span>{formatTime(duration)}</span>
        <span className="opacity-30">/</span>
        <span className={playing ? 'text-emerald-400' : ''}>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders, projects, onOpenDoc, onAddDocument, onOpenAddModalWithFile }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string } | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // States for document action
  const [showAddToBook, setShowAddToBook] = useState<Attachment | null>(null);
  const [addingToBookId, setAddingToBookId] = useState<string | null>(null);
  const [addProgress, setAddProgress] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [pickerProjectId, setPickerProjectId] = useState<string>('');
  const [pickerFolderId, setPickerFolderId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedUserId) return;
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const chatMsgs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(m => (m.senderId === CURRENT_USER.id && m.receiverId === selectedUserId) || (m.senderId === selectedUserId && m.receiverId === CURRENT_USER.id));
      setMessages(chatMsgs);
    });
    return () => unsub();
  }, [selectedUserId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Close menus on click outside
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleSendMessage = async (textOverride?: string, attachment?: Attachment, isVoice = false) => {
    if (!selectedUserId || (!inputText.trim() && !attachment && !isVoice)) return;
    await addDoc(collection(db, "messages"), {
      senderId: CURRENT_USER.id,
      receiverId: selectedUserId,
      text: textOverride || inputText,
      timestamp: serverTimestamp(),
      isRead: false,
      attachment: attachment || null,
      isVoice
    });
    if (!attachment) setInputText('');
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.type === 'archive/doc') {
      const docObj = documents.find(d => d.id === attachment.url);
      if (docObj) onOpenDoc(docObj);
      return;
    }
    if (attachment.url.startsWith('data:')) {
      const byteCharacters = atob(attachment.url.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.type });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handleAddToExistingBook = async (docId: string, attachment: Attachment) => {
    setAddingToBookId(docId);
    setAddProgress(0);
    const interval = setInterval(() => {
      setAddProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 25;
      });
    }, 80);

    const targetDoc = documents.find(d => d.id === docId);
    if (targetDoc) {
      await updateDoc(doc(db, "documents", docId), {
        attachments: [...targetDoc.attachments, attachment]
      });
      setTimeout(() => {
        setAddingToBookId(null);
        setShowAddToBook(null);
        setContextMenu(null);
      }, 600);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent menu from going off-screen
    let x = e.clientX;
    let y = e.clientY;
    const menuWidth = 160;
    const menuHeight = 220;
    
    if (x + menuWidth > window.innerWidth) x -= menuWidth;
    if (y + menuHeight > window.innerHeight) y -= menuHeight;

    setContextMenu({ x, y, msgId });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async (event) => {
          await handleSendMessage("بصمة صوتية", {
            id: Math.random().toString(36).substr(2, 5),
            name: "record.webm",
            type: "audio/webm",
            size: "صوت",
            url: event.target?.result as string
          }, true);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = window.setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const selectedUser = MOCK_EMPLOYEES.find(u => u.id === selectedUserId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden text-right font-cairo" dir="rtl">
      <div className="flex flex-1 overflow-hidden bg-transparent">
        {/* Sidebar */}
        <div className="w-64 border-l border-slate-200/40 flex flex-col bg-white shrink-0">
          <div className="p-3 border-b border-slate-100 bg-slate-50/20">
            <h2 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">الموظفون</h2>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={11} />
              <input type="text" placeholder="بحث..." className="w-full pr-7 pl-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
            {MOCK_EMPLOYEES.filter(u=>u.name.includes(searchTerm)).map(user => (
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <img src={user.avatar} className="w-6 h-6 rounded object-cover" alt="" />
                <div className="flex-1 text-right overflow-hidden">
                  <span className="font-black text-[10px] truncate block leading-tight">{user.name}</span>
                  <p className={`text-[7px] font-bold truncate opacity-50 ${selectedUserId === user.id ? 'text-white' : 'text-slate-400'}`}>{user.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          {selectedUser ? (
            <>
              <div className="h-10 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-30">
                <div className="flex items-center gap-2">
                  <img src={selectedUser.avatar} className="w-6 h-6 rounded object-cover" alt="" />
                  <div>
                    <h3 className="font-black text-slate-800 text-[10px] leading-none">{selectedUser.name}</h3>
                    <p className="text-[7px] text-emerald-600 font-bold mt-0.5">نشط</p>
                  </div>
                </div>
              </div>

              {/* Message List - ULTRA SLIM */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-2 space-y-0.5 custom-scrollbar bg-transparent">
                {messages.map((msg) => {
                  const isArchive = msg.attachment?.type === 'archive/doc';
                  const isLocal = msg.attachment && msg.attachment.type !== 'archive/doc';
                  const isMe = msg.senderId === CURRENT_USER.id;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div 
                        onContextMenu={(e) => handleContextMenu(e, msg.id)}
                        className={`relative p-1 px-2.5 rounded-lg border text-[9px] font-bold max-w-[80%] min-w-[60px] shadow-sm transition-all cursor-default select-none ${isMe ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'}`}
                      >
                        {/* SLIM Attachment */}
                        {msg.attachment && !msg.isVoice && (
                          <div onClick={() => handlePreview(msg.attachment!)} className={`mb-1 p-1 rounded-md flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-95 ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}>
                             <div className="flex items-center gap-1.5 overflow-hidden">
                                <div className={`p-1 rounded ${isArchive ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                   {isArchive ? <ArchiveRestore size={9} /> : <FileIcon size={9} />}
                                </div>
                                <p className="text-[9px] font-black truncate leading-none">{msg.attachment.name}</p>
                             </div>
                             <ExternalLink size={9} className="opacity-30 shrink-0" />
                          </div>
                        )}

                        {msg.isVoice && msg.attachment && (
                          <VoicePlayer url={msg.attachment.url} isMe={isMe} />
                        )}

                        {!msg.isVoice && <p className="leading-tight">{msg.text}</p>}

                        <div className="mt-0.5 flex items-center justify-end gap-1 text-[6px] font-black opacity-40">
                          <span>{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}) : '...'}</span>
                          {isMe && <CheckCheck size={7} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input - SLIM */}
              <div className="px-6 pb-4 pt-1 shrink-0 bg-transparent">
                <div className="max-w-4xl mx-auto relative">
                   {isRecording && (
                     <div className="absolute inset-0 bg-emerald-600 rounded-xl flex items-center px-4 gap-3 z-50 text-white shadow-xl animate-in slide-in-from-bottom-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black flex-1">تسجيل... {Math.floor(recordTime/60)}:{(recordTime%60).toString().padStart(2,'0')}</span>
                        <button onClick={stopRecording} className="p-1.5 bg-white text-emerald-600 rounded-lg shadow-sm"><StopCircle size={16} /></button>
                     </div>
                   )}
                  <div className={`flex items-center gap-1 bg-white p-0.5 pr-2 rounded-xl border border-slate-200 shadow-xl transition-all ${isRecording ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <button onClick={() => setShowArchivePicker(true)} className="p-1.5 text-slate-400 hover:text-amber-600" title="الأرشيف"><ArchiveRestore size={14} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-emerald-600" title="ملف"><PaperclipIcon size={14} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const r = new FileReader();
                        r.onload = (ev) => handleSendMessage(`ملف: ${file.name}`, { id: Math.random().toString(36).substr(2, 5), name: file.name, type: file.type, size: (file.size/1024).toFixed(1) + 'KB', url: ev.target?.result as string });
                        r.readAsDataURL(file);
                      }
                    }} />
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب..." className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold py-1.5 px-1 resize-none text-right" rows={1} />
                    <button onClick={startRecording} className="p-1.5 text-slate-400 hover:text-emerald-600"><Mic size={14} /></button>
                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 active:scale-95"><Send size={12} /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={32} className="opacity-10 mb-2" />
              <h3 className="font-black text-[8px] uppercase tracking-widest">اختر مراسلة</h3>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM CONTEXT MENU */}
      {contextMenu && (
        <div 
          className="fixed z-[1000] w-40 bg-white border border-slate-100 rounded-lg shadow-2xl py-1 overflow-hidden animate-in zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const msg = messages.find(m => m.id === contextMenu.msgId);
            const hasFile = msg?.attachment && msg.attachment.type !== 'archive/doc';
            const isMe = msg?.senderId === CURRENT_USER.id;
            
            return (
              <div className="flex flex-col text-right">
                {hasFile && (
                  <>
                    <button onClick={() => setShowAddToBook(msg!.attachment!)} className="w-full px-3 py-2 text-[10px] font-black text-slate-700 hover:bg-emerald-50 flex items-center justify-end gap-2 border-b border-slate-50 transition-colors">
                      إضافة لكتاب مؤرشف <FilePlus size={12} className="text-emerald-500" />
                    </button>
                    <button onClick={() => onOpenAddModalWithFile([msg!.attachment!])} className="w-full px-3 py-2 text-[10px] font-black text-slate-700 hover:bg-emerald-50 flex items-center justify-end gap-2 border-b border-slate-50 transition-colors">
                      إنشاء كتاب جديد <FolderPlus size={12} className="text-indigo-500" />
                    </button>
                  </>
                )}
                <button className="w-full px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50 transition-colors">
                  تعديل الرسالة <Edit3 size={12} className="text-slate-400" />
                </button>
                <button onClick={() => setMessages(prev => prev.filter(m => m.id !== contextMenu.msgId))} className="w-full px-3 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50 transition-colors">
                  حذف لدي <X size={12} className="text-slate-400" />
                </button>
                {isMe && (
                  <button onClick={() => deleteDoc(doc(db, "messages", contextMenu.msgId))} className="w-full px-3 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors">
                    حذف لدى الجميع <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add to Existing Book Modal */}
      {showAddToBook && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-sm max-h-[60vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
              <div className="p-3 border-b border-slate-50 flex items-center justify-between shrink-0">
                 <h3 className="text-[10px] font-black text-slate-800">اختيار كتاب أرشيفي</h3>
                 <button onClick={() => setShowAddToBook(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-300"><X size={14} /></button>
              </div>
              <div className="p-2 bg-slate-50 border-b border-slate-50">
                 <input type="text" placeholder="بحث..." className="w-full px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold outline-none" value={pickerSearch} onChange={(e)=>setPickerSearch(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {documents.filter(d => d.subject.includes(pickerSearch) || d.refNumber.includes(pickerSearch)).map(docItem => (
                   <div 
                    key={docItem.id} 
                    onClick={() => !addingToBookId && handleAddToExistingBook(docItem.id, showAddToBook)} 
                    className={`p-2 px-3 bg-white border border-slate-50 rounded-lg transition-all flex items-center justify-between group ${addingToBookId === docItem.id ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer'}`}
                   >
                      <div className="text-right overflow-hidden">
                         <h4 className={`text-[9px] font-black truncate max-w-[200px] ${addingToBookId === docItem.id ? 'text-emerald-700' : 'text-slate-800'}`}>{docItem.subject}</h4>
                         <p className="text-[7px] font-bold text-slate-400 mt-0.5">#{docItem.refNumber}</p>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center">
                        {addingToBookId === docItem.id ? (
                           <CircularProgress progress={addProgress} isDownloading={true} size={4} />
                        ) : (
                           <Plus size={12} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                        )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Archive Selection Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-xl h-[70vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">إرسال وثيقة من الأرشيف</h3>
                 <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="p-1 hover:bg-slate-50 rounded-xl text-slate-400"><X size={16} /></button>
              </div>

              <div className="p-3 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0">
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black outline-none appearance-none cursor-pointer" value={pickerProjectId} onChange={(e) => { setPickerProjectId(e.target.value); setPickerFolderId(null); }}>
                   <option value="">كل المشاريع</option>
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="text" placeholder="بحث..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black outline-none" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} />
              </div>

              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                 {!pickerFolderId ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {folders.filter(f => (!pickerProjectId || f.projectId === pickerProjectId) && f.name.includes(pickerSearch)).map(folder => (
                        <div key={folder.id} onClick={() => { setPickerFolderId(folder.id); setPickerSearch(''); }} className="bg-white p-3 rounded-xl border border-slate-100 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${folder.color || 'bg-emerald-500'} text-white shadow-md`}><FolderIcon size={14} /></div>
                              <div className="text-right">
                                 <h4 className="text-[10px] font-black text-slate-800 leading-none">{folder.name}</h4>
                                 <p className="text-[8px] font-bold text-slate-400 mt-1">{documents.filter(d => d.folderId === folder.id).length} وثيقة</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="space-y-1.5">
                      <button onClick={() => setPickerFolderId(null)} className="text-[10px] font-black text-emerald-600 flex items-center gap-1 mb-2 hover:underline"><ArrowRight size={12}/> العودة للأضابير</button>
                      {documents.filter(d => d.folderId === pickerFolderId && d.subject.includes(pickerSearch)).map(docItem => (
                        <div key={docItem.id} onClick={() => setSelectedDocIds(prev => prev.includes(docItem.id) ? prev.filter(i => i !== docItem.id) : [...prev, docItem.id])} className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}>
                           <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg shadow-sm ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}><FileText size={14} /></div>
                              <div className="text-right"><h4 className="text-[10px] font-black text-slate-800 leading-tight">{docItem.subject}</h4><p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">#{docItem.refNumber}</p></div>
                           </div>
                           <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-200'}`}>{selectedDocIds.includes(docItem.id) ? <CheckSquare size={12} /> : <Square size={12} />}</div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                 <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:bg-slate-200">إلغاء</button>
                 <button 
                  onClick={async () => {
                    for (const id of selectedDocIds) {
                      const d = documents.find(doc => doc.id === id);
                      if (d) await handleSendMessage(`مشاركة كتاب: ${d.subject}`, { id: Math.random().toString(36).substr(2, 5), name: d.subject, type: 'archive/doc', size: d.refNumber, url: d.id });
                    }
                    setSelectedDocIds([]);
                    setShowArchivePicker(false);
                  }} 
                  disabled={selectedDocIds.length === 0} 
                  className="px-6 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black shadow-xl hover:bg-emerald-700 disabled:opacity-50 active:scale-95"
                 >إرسال</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MessagingPage;
