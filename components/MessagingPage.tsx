
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
  FolderPlus, FilePlus, ExternalLink
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment, Project } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onOpenDoc: (doc: Document) => void;
  onAddDocument: (doc: any) => void;
}

// Circular Progress
const CircularProgress: React.FC<{ progress: number; isDownloading: boolean }> = ({ progress, isDownloading }) => (
  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
    {isDownloading && (
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
    )}
    <Download size={12} className={isDownloading ? 'text-emerald-600' : 'text-slate-400'} />
  </div>
);

// ULTIMATE VOICE PLAYER WITH WORKING SCRUBBING
const VoicePlayer: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    
    const handleLoaded = () => setDuration(audio.duration);
    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 py-0.5 min-w-[180px] ${isMe ? 'text-white' : 'text-emerald-600'}`} dir="ltr">
      <button onClick={togglePlay} className={`p-1.5 rounded-lg transition-all active:scale-90 ${isMe ? 'bg-white/20' : 'bg-emerald-50'}`}>
        {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex-1 flex flex-col gap-0.5">
        <input 
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleScrub}
          onClick={(e) => e.stopPropagation()}
          className={`w-full h-1 rounded-full appearance-none cursor-pointer accent-current ${isMe ? 'bg-white/20' : 'bg-slate-200'}`}
        />
        <div className="flex justify-between text-[7px] font-black opacity-60 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 size={10} className="opacity-40" />
    </div>
  );
};

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders, projects, onOpenDoc, onAddDocument }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMsgMenu, setActiveMsgMenu] = useState<string | null>(null);
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

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

  // Add to existing book states
  const [showAddToBook, setShowAddToBook] = useState<Attachment | null>(null);
  
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

    // Fix for white screen: Convert base64 back to blob for clean window opening
    if (attachment.url.startsWith('data:')) {
      const byteCharacters = atob(attachment.url.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.type });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (win) win.focus();
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handleCreateNewBook = (attachment: Attachment) => {
    // Logic: Pre-fill a new document creation (simplified for this demo by directly adding)
    const newDoc: any = {
      subject: `كتاب مستخرج من المراسلة: ${attachment.name}`,
      refNumber: "MSG-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      sender: "مراسلة داخلية",
      receiver: "الأرشيف",
      type: "داخلي",
      status: "جديد",
      attachments: [attachment],
      tags: ["من المراسلات"],
      tasks: []
    };
    onAddDocument(newDoc);
    setActiveMsgMenu(null);
    alert("تم إنشاء كتاب جديد في الأرشيف العام بنجاح من هذا الملف.");
  };

  const handleAddToBook = async (docId: string, attachment: Attachment) => {
    const targetDoc = documents.find(d => d.id === docId);
    if (targetDoc) {
      await updateDoc(doc(db, "documents", docId), {
        attachments: [...targetDoc.attachments, attachment]
      });
      setShowAddToBook(null);
      setActiveMsgMenu(null);
      alert(`تمت إضافة الملف إلى الكتاب: ${targetDoc.subject}`);
    }
  };

  const handleDownload = (e: React.MouseEvent, file: Attachment) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const link = window.document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.click();
          setTimeout(() => setDownloadingId(null), 800);
          return 100;
        }
        return p + 25;
      });
    }, 80);
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

  // Fix: Added missing handleSendSelectedDocs function
  const handleSendSelectedDocs = async () => {
    if (selectedDocIds.length === 0) return;
    
    // Send each document as a message
    for (const docId of selectedDocIds) {
      const docObj = documents.find(d => d.id === docId);
      if (docObj) {
        await handleSendMessage(`تمت مشاركة وثيقة من الأرشيف: ${docObj.subject}`, {
          id: Math.random().toString(36).substr(2, 5),
          name: docObj.subject,
          type: 'archive/doc',
          size: docObj.refNumber,
          url: docObj.id // Using url to store the doc ID for archive references
        });
      }
    }
    
    setSelectedDocIds([]);
    setShowArchivePicker(false);
  };

  const selectedUser = MOCK_EMPLOYEES.find(u => u.id === selectedUserId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden text-right font-cairo" dir="rtl" onClick={() => setActiveMsgMenu(null)}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-l border-slate-200/60 flex flex-col bg-white shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">قائمة المحادثات</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="بحث..." className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {MOCK_EMPLOYEES.filter(u=>u.name.includes(searchTerm)).map(user => (
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                <img src={user.avatar} className="w-9 h-9 rounded-lg object-cover border border-white" alt="" />
                <div className="flex-1 text-right overflow-hidden">
                  <span className="font-black text-[12px] truncate block">{user.name}</span>
                  <p className={`text-[8px] font-bold truncate opacity-60 ${selectedUserId === user.id ? 'text-white' : 'text-slate-400'}`}>{user.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/20">
          {selectedUser ? (
            <>
              <div className="h-14 px-6 border-b border-slate-200/40 flex items-center justify-between bg-white z-30">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} className="w-9 h-9 rounded-lg object-cover border border-white shadow-sm" alt="" />
                  <div>
                    <h3 className="font-black text-slate-800 text-xs">{selectedUser.name}</h3>
                    <p className="text-[8px] text-emerald-600 font-bold tracking-widest uppercase">متصل الآن</p>
                  </div>
                </div>
              </div>

              {/* Message List - SLIM SPACING */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5 custom-scrollbar">
                {messages.map((msg) => {
                  const isArchive = msg.attachment?.type === 'archive/doc';
                  const isLocal = msg.attachment && msg.attachment.type !== 'archive/doc';
                  const isMe = msg.senderId === CURRENT_USER.id;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div 
                        className={`relative p-2 px-3 rounded-xl border text-[11px] font-bold max-w-[85%] min-w-[100px] shadow-sm transition-all ${isMe ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'}`}
                      >
                        {/* Always Visible Options Menu */}
                        <div className={`absolute top-1 ${isMe ? '-left-8' : '-right-8'} p-1 text-slate-300 hover:text-slate-500 cursor-pointer bg-white/50 backdrop-blur border border-slate-100 rounded-lg shadow-sm z-10`} onClick={(e) => { e.stopPropagation(); setActiveMsgMenu(activeMsgMenu === msg.id ? null : msg.id); }}>
                          <MoreVertical size={12} />
                        </div>

                        {/* Actions Dropdown */}
                        {activeMsgMenu === msg.id && (
                          <div className={`absolute top-8 ${isMe ? 'left-0' : 'right-0'} w-44 bg-white border border-slate-100 rounded-xl shadow-2xl z-[50] py-1 animate-in zoom-in-95 text-right overflow-hidden`}>
                            {isLocal && (
                              <>
                                <button onClick={() => setShowAddToBook(msg.attachment!)} className="w-full px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50">
                                  <FilePlus size={14} className="text-emerald-500" /> إضافة لكتاب موجود
                                </button>
                                <button onClick={() => handleCreateNewBook(msg.attachment!)} className="w-full px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50">
                                  <FolderPlus size={14} className="text-indigo-500" /> إنشاء كتاب جديد منه
                                </button>
                              </>
                            )}
                            <button onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))} className="w-full px-4 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50 flex items-center justify-end gap-2">
                               حذف لدي
                            </button>
                            {isMe && (
                              <button onClick={() => deleteDoc(doc(db, "messages", msg.id))} className="w-full px-4 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2">
                                 <Trash2 size={14} /> حذف للجميع
                              </button>
                            )}
                          </div>
                        )}

                        {/* Attachment Box - SLIM */}
                        {msg.attachment && !msg.isVoice && (
                          <div 
                            onClick={() => handlePreview(msg.attachment!)}
                            className={`mb-1.5 p-2 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}
                          >
                             <div className="flex items-center gap-2 overflow-hidden">
                                <div className={`p-1.5 rounded-lg shadow-sm ${isArchive ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                   {isArchive ? <ArchiveRestore size={14} /> : <FileIcon size={14} />}
                                </div>
                                <div className="text-right overflow-hidden">
                                   <p className="text-[10px] font-black truncate leading-tight">{msg.attachment.name}</p>
                                   <p className="text-[8px] opacity-60 mt-0.5">{isArchive ? 'كتاب من الأرشيف' : msg.attachment.size}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-1 shrink-0">
                                {isLocal && (
                                  <button onClick={(e) => handleDownload(e, msg.attachment!)} className="p-0.5 hover:bg-black/5 rounded">
                                    <CircularProgress progress={downloadProgress} isDownloading={downloadingId === msg.attachment.id} />
                                  </button>
                                )}
                                <ExternalLink size={12} className="opacity-40" />
                             </div>
                          </div>
                        )}

                        {msg.isVoice && msg.attachment && (
                          <VoicePlayer url={msg.attachment.url} isMe={isMe} />
                        )}

                        {!msg.isVoice && <p className="leading-snug">{msg.text}</p>}

                        <div className="mt-1 flex items-center justify-end gap-1 text-[7px] font-black opacity-50 uppercase">
                          <span>
                             {msg.timestamp?.toDate 
                               ? msg.timestamp.toDate().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) 
                               : '...'}
                          </span>
                          {isMe && <CheckCheck size={10} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="px-6 pb-6 pt-2 shrink-0">
                <div className="max-w-4xl mx-auto relative">
                   {isRecording && (
                     <div className="absolute inset-0 bg-emerald-600 rounded-xl flex items-center px-6 gap-4 z-50 text-white shadow-xl">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black flex-1">جاري تسجيل الصوت... {Math.floor(recordTime/60)}:{(recordTime%60).toString().padStart(2,'0')}</span>
                        <button onClick={stopRecording} className="p-2 bg-white text-emerald-600 rounded-xl shadow-lg"><StopCircle size={18} /></button>
                     </div>
                   )}

                  <div className={`flex items-center gap-1.5 bg-white p-1.5 pr-4 rounded-xl border border-slate-200 shadow-xl transition-all ${isRecording ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <button onClick={() => setShowArchivePicker(true)} className="p-2 text-slate-400 hover:text-amber-600" title="الأرشيف"><ArchiveRestore size={18} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-emerald-600" title="ملف خارجي"><PaperclipIcon size={18} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const r = new FileReader();
                        r.onload = (ev) => handleSendMessage(`إرسال ملف: ${file.name}`, { id: Math.random().toString(36).substr(2, 5), name: file.name, type: file.type, size: (file.size/1024).toFixed(1) + 'KB', url: ev.target?.result as string });
                        r.readAsDataURL(file);
                      }
                    }} />
                    
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none outline-none text-[12px] font-bold py-2 px-1 resize-none text-right" rows={1} />
                    
                    <button onClick={startRecording} className="p-2 text-slate-400 hover:text-emerald-600 transition-all"><Mic size={18} /></button>
                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"><Send size={16} /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={48} className="opacity-10 mb-4" />
              <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">اختر زميلاً للمراسلة</h3>
            </div>
          )}
        </div>
      </div>

      {/* Add to Existing Book Modal */}
      {showAddToBook && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-lg max-h-[70vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <h3 className="text-sm font-black text-slate-800">إضافة الملف إلى كتاب مؤرشف</h3>
                 <button onClick={() => setShowAddToBook(null)} className="p-1 hover:bg-slate-50 rounded-xl text-slate-400"><X size={18} /></button>
              </div>
              <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
                 <input 
                  type="text" 
                  placeholder="بحث عن كتاب برقم المرجع أو الموضوع..." 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                 />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {documents.filter(d => d.subject.includes(pickerSearch) || d.refNumber.includes(pickerSearch)).map(docItem => (
                   <div 
                    key={docItem.id} 
                    onClick={() => handleAddToBook(docItem.id, showAddToBook)}
                    className="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-between group"
                   >
                      <div className="text-right">
                         <h4 className="text-[11px] font-black text-slate-800">{docItem.subject}</h4>
                         <p className="text-[9px] font-bold text-slate-400 mt-0.5">المرجع: {docItem.refNumber}</p>
                      </div>
                      <Plus size={14} className="text-slate-300 group-hover:text-emerald-600" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Archive Selection Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">إدراج وثائق مؤرشفة</h3>
                 <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="p-1 hover:bg-slate-50 rounded-xl text-slate-400"><X size={18} /></button>
              </div>

              <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none appearance-none cursor-pointer" value={pickerProjectId} onChange={(e) => { setPickerProjectId(e.target.value); setPickerFolderId(null); }}>
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="text" placeholder={pickerFolderId ? "بحث عن كتاب..." : "بحث عن إضبارة..."} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} />
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                 {!pickerFolderId ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {folders.filter(f => f.projectId === pickerProjectId && f.name.includes(pickerSearch)).map(folder => (
                        <div key={folder.id} onClick={() => { setPickerFolderId(folder.id); setPickerSearch(''); }} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${folder.color || 'bg-emerald-500'} text-white shadow-md`}><FolderIcon size={18} /></div>
                              <div className="text-right">
                                 <h4 className="text-[11px] font-black text-slate-800">{folder.name}</h4>
                                 <p className="text-[8px] font-bold text-slate-400 mt-0.5">{documents.filter(d => d.folderId === folder.id).length} وثيقة</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <button onClick={() => setPickerFolderId(null)} className="text-[10px] font-black text-emerald-600 flex items-center gap-1 mb-2 hover:underline"><ArrowRight size={12}/> العودة للأضابير</button>
                      {documents.filter(d => d.folderId === pickerFolderId && d.subject.includes(pickerSearch)).map(docItem => (
                        <div key={docItem.id} onClick={() => setSelectedDocIds(prev => prev.includes(docItem.id) ? prev.filter(i => i !== docItem.id) : [...prev, docItem.id])} className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}>
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg shadow-sm ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}><FileText size={16} /></div>
                              <div className="text-right"><h4 className="text-[10px] font-black text-slate-800 leading-tight">{docItem.subject}</h4><p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">#{docItem.refNumber}</p></div>
                           </div>
                           <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedDocIds.includes(docItem.id) ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-200'}`}>{selectedDocIds.includes(docItem.id) ? <CheckSquare size={14} /> : <Square size={14} />}</div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                 <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">تم تحديد {selectedDocIds.length} عنصر</span>
                 <div className="flex gap-2">
                    <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="px-5 py-2 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-200">إلغاء</button>
                    <button onClick={handleSendSelectedDocs} disabled={selectedDocIds.length === 0} className="px-8 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 active:scale-95">إرسال للمحادثة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MessagingPage;
