
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
  FolderPlus, FilePlus, ExternalLink, Link as LinkIcon
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment, Project } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onOpenDoc: (doc: Document) => void;
  onAddDocument?: (doc: any) => void;
}

// Circular Download Progress
const CircularProgress: React.FC<{ progress: number; isDownloading: boolean }> = ({ progress, isDownloading }) => (
  <div className="relative flex items-center justify-center w-7 h-7">
    {isDownloading && (
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
        <circle 
          cx="18" cy="18" r="16" fill="none" 
          className="stroke-emerald-500 transition-all duration-300" 
          strokeWidth="3" 
          strokeDasharray="100.5" 
          strokeDashoffset={100.5 - progress}
          strokeLinecap="round"
        />
      </svg>
    )}
    <Download size={13} className={isDownloading ? 'text-emerald-600' : 'text-slate-400'} />
  </div>
);

// REBUILT VOICE PLAYER WITH ACCURATE SCRUBBING
const VoicePlayer: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    
    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  const handleScrub = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !progressBarRef.current || duration === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 py-1 min-w-[200px] ${isMe ? 'text-white' : 'text-emerald-600'}`} dir="ltr">
      <button onClick={togglePlay} className={`p-2 rounded-lg transition-all active:scale-90 ${isMe ? 'bg-white/20' : 'bg-emerald-50'}`}>
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div 
          ref={progressBarRef}
          onClick={handleScrub}
          className={`h-1.5 w-full rounded-full cursor-pointer relative ${isMe ? 'bg-white/20' : 'bg-slate-100'}`}
        >
          <div 
            className={`absolute top-0 left-0 h-full rounded-full pointer-events-none transition-all ${isMe ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-emerald-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-black opacity-60 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 size={12} className="opacity-40" />
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showArchivePicker && projects.length > 0 && !pickerProjectId) {
      const latest = [...projects].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )[0];
      if (latest) setPickerProjectId(latest.id);
    }
  }, [showArchivePicker, projects]);

  useEffect(() => {
    if (!selectedUserId) return;
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const chatMsgs = allMsgs.filter(m => 
        (m.senderId === CURRENT_USER.id && m.receiverId === selectedUserId) ||
        (m.senderId === selectedUserId && m.receiverId === CURRENT_USER.id)
      );
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

  const handleDownloadFile = (e: React.MouseEvent, file: Attachment) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.click();
          setTimeout(() => setDownloadingId(null), 800);
          return 100;
        }
        return p + 20;
      });
    }, 100);
  };

  const handleMessageClick = (msg: Message) => {
    if (!msg.attachment) return;
    
    if (msg.attachment.type === 'archive/doc') {
      // Open in APP Document Viewer (like in archive page)
      const docObj = documents.find(d => d.id === msg.attachment?.url);
      if (docObj) onOpenDoc(docObj);
    } else {
      // Open Natively in browser tab
      window.open(msg.attachment.url, '_blank');
    }
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
          const base64Audio = event.target?.result as string;
          await handleSendMessage("بصمة صوتية", {
            id: Math.random().toString(36).substr(2, 5),
            name: "record.webm",
            type: "audio/webm",
            size: "رسالة صوتية",
            url: base64Audio
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

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: event.target?.result as string
        };
        await handleSendMessage(`إرسال ملف خارجي: ${file.name}`, attachment);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendSelectedDocs = async () => {
    for (const docId of selectedDocIds) {
      const docObj = documents.find(d => d.id === docId);
      if (docObj) {
        await handleSendMessage(`مشاركة وثيقة: ${docObj.subject}`, {
          id: docObj.id,
          name: docObj.subject,
          type: 'archive/doc',
          size: docObj.refNumber,
          url: docId
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
        <div className="w-80 border-l border-slate-200/60 flex flex-col bg-white/40 backdrop-blur-sm shrink-0">
          <div className="p-4 border-b border-slate-200/30">
            <h2 className="text-xs font-black text-slate-800 mb-3 px-1 uppercase tracking-widest">المحادثات</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="بحث..." className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {MOCK_EMPLOYEES.filter(u=>u.name.includes(searchTerm)).map(user => (
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-600 hover:bg-white'}`}>
                <img src={user.avatar} className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm" alt="" />
                <div className="flex-1 text-right overflow-hidden">
                  <span className="font-black text-[12px] truncate block">{user.name}</span>
                  <p className="text-[9px] font-bold truncate opacity-60 uppercase tracking-tight">{user.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/30">
          {selectedUser ? (
            <>
              <div className="h-14 px-6 border-b border-slate-200/40 flex items-center justify-between bg-white/70 backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} className="w-9 h-9 rounded-lg object-cover border border-white shadow-sm" alt="" />
                  <div>
                    <h3 className="font-black text-slate-800 text-xs">{selectedUser.name}</h3>
                    <p className="text-[9px] text-emerald-600 font-bold">متصل</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">
                {messages.map((msg) => {
                  const isArchive = msg.attachment?.type === 'archive/doc';
                  const isLocal = msg.attachment && msg.attachment.type !== 'archive/doc';
                  const isMe = msg.senderId === CURRENT_USER.id;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div 
                        className={`relative p-3.5 px-4 rounded-xl shadow-sm border text-[12px] font-bold max-w-[80%] min-w-[120px] transition-all ${isMe ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'}`}
                      >
                        {/* Always Visible Three Dots Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMsgMenu(activeMsgMenu === msg.id ? null : msg.id); }}
                          className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} p-1.5 text-slate-300 hover:text-slate-500 transition-colors bg-white/50 backdrop-blur rounded-lg shadow-sm border border-slate-100 z-10`}
                        >
                          <MoreVertical size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMsgMenu === msg.id && (
                          <div className={`absolute top-10 ${isMe ? 'left-0' : 'right-0'} w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] py-1 animate-in zoom-in-95 overflow-hidden text-right`}>
                            {isLocal && (
                              <>
                                <button className="w-full px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50">
                                  <FilePlus size={14} className="text-emerald-500" /> إضافة إلى كتاب مؤرشف
                                </button>
                                <button className="w-full px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center justify-end gap-2 border-b border-slate-50">
                                  <FolderPlus size={14} className="text-indigo-500" /> إنشاء كتاب جديد من الملف
                                </button>
                              </>
                            )}
                            <button onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))} className="w-full px-4 py-2.5 text-[10px] font-black text-slate-500 hover:bg-slate-50 flex items-center justify-end gap-2">
                               حذف لدي فقط
                            </button>
                            {isMe && (
                              <button onClick={() => deleteDoc(doc(db, "messages", msg.id))} className="w-full px-4 py-2.5 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2">
                                 <Trash2 size={14} /> حذف لدى الجميع
                              </button>
                            )}
                          </div>
                        )}

                        {/* Attachment View */}
                        {msg.attachment && !msg.isVoice && (
                          <div 
                            onClick={() => handleMessageClick(msg)}
                            className={`mb-3 p-3 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-all active:scale-95 ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}
                          >
                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg shadow-md ${isArchive ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                   {isArchive ? <ArchiveRestore size={18} /> : <FileIcon size={18} />}
                                </div>
                                <div className="text-right overflow-hidden">
                                   <p className="text-[10px] font-black truncate leading-tight">{msg.attachment.name}</p>
                                   <p className="text-[8px] opacity-60 mt-1 uppercase tracking-tighter">{isArchive ? 'كتاب من الأرشيف' : msg.attachment.size}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-1.5 shrink-0">
                                {isLocal && (
                                  <button onClick={(e) => handleDownloadFile(e, msg.attachment!)} className="hover:scale-110 transition-transform">
                                    <CircularProgress progress={downloadProgress} isDownloading={downloadingId === msg.attachment.id} />
                                  </button>
                                )}
                                {isArchive ? <ChevronLeft size={14} className="opacity-40" /> : <ExternalLink size={14} className="opacity-40" />}
                             </div>
                          </div>
                        )}

                        {/* Voice Messaging */}
                        {msg.isVoice && msg.attachment && (
                          <VoicePlayer url={msg.attachment.url} isMe={isMe} />
                        )}

                        {/* Text Message */}
                        {!msg.isVoice && <p className="leading-relaxed text-right">{msg.text}</p>}

                        {/* Timestamp & Status */}
                        <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[8px] font-black opacity-50">
                          <span>
                             {msg.timestamp?.toDate 
                               ? msg.timestamp.toDate().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) 
                               : 'جاري الإرسال...'}
                          </span>
                          {isMe && <CheckCheck size={11} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="px-6 pb-8 pt-2 shrink-0">
                <div className="max-w-4xl mx-auto relative">
                   {isRecording && (
                     <div className="absolute inset-0 bg-emerald-600 rounded-xl flex items-center px-6 gap-4 animate-in slide-in-from-bottom-2 duration-300 z-50 text-white shadow-xl">
                        <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                        <span className="text-[11px] font-black flex-1">جاري تسجيل البصمة الصوتية... {Math.floor(recordTime/60)}:{(recordTime%60).toString().padStart(2,'0')}</span>
                        <button onClick={stopRecording} className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><StopCircle size={20} /></button>
                     </div>
                   )}

                  <div className={`flex items-center gap-1.5 bg-white/95 backdrop-blur p-1.5 pr-4 rounded-xl border border-slate-200 shadow-xl transition-all ${isRecording ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <button onClick={() => setShowArchivePicker(true)} className="p-2.5 text-slate-400 hover:text-amber-600 transition-all" title="إدراج من الأرشيف"><ArchiveRestore size={20} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all" title="إرفاق ملف خارجي"><PaperclipIcon size={20} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleLocalFileUpload} />
                    
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2.5 px-2 resize-none text-right placeholder:text-slate-300" rows={1} />
                    
                    <button onClick={startRecording} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all" title="تسجيل بصمة"><Mic size={20} /></button>
                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"><Send size={18} /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-inner mb-6 border border-slate-100">
                <MessageSquare size={48} className="opacity-10" />
              </div>
              <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">ابدأ محادثة جديدة مع زملائك</h3>
            </div>
          )}
        </div>
      </div>

      {/* Archive Selection Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100"><ArchiveRestore size={20} /></div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800 uppercase">تصفح الكتب المؤرشفة</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">اختر كتاباً أو أكثر لمشاركته في الدردشة</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-4 shrink-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                      className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none appearance-none cursor-pointer"
                      value={pickerProjectId}
                      onChange={(e) => { setPickerProjectId(e.target.value); setPickerFolderId(null); }}
                    >
                       {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input 
                      type="text" 
                      placeholder={pickerFolderId ? "بحث عن وثيقة..." : "بحث عن إضبارة..."} 
                      className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                    />
                 </div>
                 {pickerFolderId && (
                   <button onClick={() => { setPickerFolderId(null); setPickerSearch(''); }} className="flex items-center gap-2 text-xs font-black text-emerald-600 hover:underline">
                     <ArrowRight size={14} /> العودة للأضابير
                   </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/20">
                 {!pickerFolderId ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {folders.filter(f => f.projectId === pickerProjectId && f.name.includes(pickerSearch)).map(folder => (
                        <div 
                          key={folder.id} 
                          onClick={() => { setPickerFolderId(folder.id); setPickerSearch(''); }}
                          className="bg-white p-5 rounded-xl border border-slate-100 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
                        >
                           <div className="flex items-center gap-4 text-right">
                              <div className={`p-3 rounded-lg ${folder.color || 'bg-emerald-500'} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                 <FolderIcon size={20} />
                              </div>
                              <div>
                                 <h4 className="text-[12px] font-black text-slate-800">{folder.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 mt-0.5">{documents.filter(d => d.folderId === folder.id).length} وثيقة مؤرشفة</p>
                              </div>
                           </div>
                           <ChevronLeft size={16} className="text-slate-200" />
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="space-y-3">
                      {documents.filter(d => d.folderId === pickerFolderId && d.subject.includes(pickerSearch)).map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => setSelectedDocIds(prev => prev.includes(doc.id) ? prev.filter(i => i !== doc.id) : [...prev, doc.id])}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedDocIds.includes(doc.id) ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                        >
                           <div className="flex items-center gap-4 text-right">
                              <div className={`p-2.5 rounded-lg shadow-sm ${selectedDocIds.includes(doc.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                 <FileText size={18} />
                              </div>
                              <div className="overflow-hidden">
                                 <h4 className="text-[11px] font-black text-slate-800 truncate">{doc.subject}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">#{doc.refNumber} • {doc.date}</p>
                              </div>
                           </div>
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedDocIds.includes(doc.id) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-200'}`}>
                              {selectedDocIds.includes(doc.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المحدد:</span>
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-emerald-100">{selectedDocIds.length} عنصر</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-200 transition-all">إلغاء</button>
                    <button 
                      onClick={handleSendSelectedDocs} 
                      disabled={selectedDocIds.length === 0}
                      className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                       <Send size={14} /> إرسال للمحادثة
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MessagingPage;
