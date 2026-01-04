
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  collection, onSnapshot, addDoc, query, orderBy, where, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, Send, Mic, FileText, X, ArchiveRestore, MessageSquare, 
  Play, FileIcon, StopCircle, Briefcase, ChevronRight, ChevronLeft,
  Paperclip as PaperclipIcon, CheckCheck, Download, Clock,
  Folder as FolderIcon, CheckSquare, Square, ArrowRight,
  Upload, Filter, Plus, Pause, Volume2
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment, Project } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  onOpenDoc: (doc: Document) => void;
}

// Voice Player Component
const VoicePlayer: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setProgress((audio.currentTime / audio.duration) * 100);
    audio.onended = () => { setPlaying(false); setProgress(0); };
    return () => { audio.pause(); audioRef.current = null; };
  }, [url]);

  const togglePlay = () => {
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 py-1 min-w-[200px] ${isMe ? 'text-white' : 'text-emerald-600'}`}>
      <button onClick={togglePlay} className={`p-2 rounded-full shadow-sm transition-all active:scale-90 ${isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-emerald-50 hover:bg-emerald-100'}`}>
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={`h-1.5 w-full rounded-full cursor-pointer relative ${isMe ? 'bg-white/20' : 'bg-slate-100'}`} onClick={handleSeek}>
          <div className={`absolute top-0 right-0 h-full rounded-full transition-all ${isMe ? 'bg-white' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-[8px] font-black opacity-60">
           <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
           <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 size={12} className="opacity-40" />
    </div>
  );
};

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders, projects, onOpenDoc }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Archive Picker States
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerProjectId, setPickerProjectId] = useState<string>('');
  const [pickerFolderId, setPickerFolderId] = useState<string | null>(null);
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

  // Voice Functions
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
          await handleSendMessage("رسالة صوتية", {
            id: Math.random().toString(36).substr(2, 5),
            name: "صوت.webm",
            type: "audio/webm",
            size: "بصمة صوتية",
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
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatRecordTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendSelectedDocs = async () => {
    if (selectedDocIds.length === 0 || !selectedUserId) return;
    for (const docId of selectedDocIds) {
      const docObj = documents.find(d => d.id === docId);
      if (docObj) {
        await handleSendMessage(`مشاركة وثيقة مؤرشفة: ${docObj.subject}`, {
          id: docObj.id,
          name: docObj.subject,
          type: 'archive/doc',
          size: docObj.refNumber,
          url: docId // Store ID to link
        });
      }
    }
    setSelectedDocIds([]);
    setShowArchivePicker(false);
  };

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: event.target?.result as string
        };
        await handleSendMessage(`إرسال ملف: ${file.name}`, attachment);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleArchiveLinkClick = (message: Message) => {
    if (message.attachment?.type === 'archive/doc' && message.attachment.url) {
      const docObj = documents.find(d => d.id === message.attachment?.url);
      if (docObj) onOpenDoc(docObj);
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredPickerFolders = useMemo(() => folders.filter(f => f.projectId === pickerProjectId && f.name.toLowerCase().includes(pickerSearch.toLowerCase()) && !f.deletedAt), [folders, pickerProjectId, pickerSearch]);
  const filteredPickerDocs = useMemo(() => documents.filter(d => d.folderId === pickerFolderId && d.subject.toLowerCase().includes(pickerSearch.toLowerCase()) && !d.deletedAt), [documents, pickerFolderId, pickerSearch]);
  const selectedUser = MOCK_EMPLOYEES.find(u => u.id === selectedUserId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden text-right" dir="rtl">
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
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white'}`}>
                <img src={user.avatar} className="w-10 h-10 rounded-xl border-2 border-white object-cover" alt="" />
                <div className="flex-1 text-right overflow-hidden"><span className="font-black text-[12px] truncate block">{user.name}</span><p className="text-[9px] font-bold truncate opacity-60">{user.department}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed">
          {selectedUser ? (
            <>
              <div className="h-14 px-6 border-b border-slate-200/40 flex items-center justify-between bg-white/70 backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} className="w-9 h-9 rounded-xl object-cover border-2 border-white" alt="" />
                  <div className="text-right"><h3 className="font-black text-slate-800 text-xs">{selectedUser.name}</h3><p className="text-[9px] text-emerald-600 font-bold">متصل الآن</p></div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === CURRENT_USER.id ? 'justify-start' : 'justify-end'}`}>
                    <div 
                      className={`p-3 px-4 rounded-[1.4rem] shadow-sm text-[12px] font-bold max-w-[75%] ${msg.senderId === CURRENT_USER.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}
                    >
                      {msg.attachment && !msg.isVoice && (
                        <div 
                          onClick={() => handleArchiveLinkClick(msg)}
                          className={`mb-2 p-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all active:scale-95 ${msg.senderId === CURRENT_USER.id ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}
                        >
                           <div className={`p-2 rounded-lg ${msg.attachment.type === 'archive/doc' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                              {msg.attachment.type === 'archive/doc' ? <ArchiveRestore size={16} /> : <FileIcon size={16} />}
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="text-[10px] font-black truncate">{msg.attachment.name}</p>
                              <p className="text-[8px] opacity-60">{msg.attachment.size}</p>
                           </div>
                           {msg.attachment.type === 'archive/doc' ? <ChevronLeft size={14} className="opacity-40" /> : <Download size={14} className="opacity-40" />}
                        </div>
                      )}

                      {msg.isVoice && msg.attachment && (
                        <VoicePlayer url={msg.attachment.url} isMe={msg.senderId === CURRENT_USER.id} />
                      )}

                      {!msg.isVoice && <p className="leading-relaxed">{msg.text}</p>}

                      <div className="mt-1 flex items-center justify-end gap-1 text-[8px] font-black opacity-60">
                        <span>
                          {msg.timestamp?.toDate 
                            ? msg.timestamp.toDate().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) 
                            : (typeof msg.timestamp === 'string' ? msg.timestamp : '...')}
                        </span>
                        {msg.senderId === CURRENT_USER.id && <CheckCheck size={10} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-8 pt-2 shrink-0">
                <div className="max-w-4xl mx-auto relative">
                   {isRecording && (
                     <div className="absolute inset-0 bg-emerald-600 rounded-full flex items-center px-6 gap-4 animate-in slide-in-from-bottom-2 duration-300 z-10 text-white">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black">جاري تسجيل الرسالة... {formatRecordTime(recordTime)}</span>
                        <div className="flex-1 flex items-center gap-1 justify-center">
                           {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                             <div key={i} className="w-1 bg-white/40 rounded-full animate-bounce" style={{ height: h * 3, animationDelay: `${i * 0.1}s` }}></div>
                           ))}
                        </div>
                        <button onClick={stopRecording} className="p-2 bg-white text-emerald-600 rounded-full shadow-lg hover:scale-110 transition-transform"><StopCircle size={20} /></button>
                     </div>
                   )}

                  <div className={`max-w-4xl mx-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 pr-4 rounded-full border border-slate-200 shadow-2xl transition-all ${isRecording ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <button onClick={() => setShowArchivePicker(true)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="إدراج من الأرشيف"><ArchiveRestore size={20} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="إرفاق ملف من الجهاز"><PaperclipIcon size={20} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleLocalFileUpload} />
                    
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2.5 px-2 resize-none text-right" rows={1} />
                    
                    <button 
                      onClick={startRecording}
                      className={`p-2 transition-all ${isRecording ? 'text-red-500 scale-125' : 'text-slate-400 hover:text-emerald-600'}`} 
                      title="تسجيل رسالة صوتية"
                    >
                      <Mic size={20} />
                    </button>

                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"><Send size={18} /></button>
                  </div>
                </div>
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

      {/* Archive Selection Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
              <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100"><ArchiveRestore size={20} /></div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800">إدراج وثائق من الأرشيف</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">اختر الكتب التي ترغب في مشاركتها في المحادثة</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-4 shrink-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                       <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                       <select 
                        className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none appearance-none"
                        value={pickerProjectId}
                        onChange={(e) => { setPickerProjectId(e.target.value); setPickerFolderId(null); }}
                       >
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                    <div className="relative">
                       <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                       <input 
                        type="text" 
                        placeholder={pickerFolderId ? "بحث عن كتاب..." : "بحث عن إضبارة..."} 
                        className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                       />
                    </div>
                 </div>
                 {pickerFolderId && (
                   <button 
                    onClick={() => { setPickerFolderId(null); setPickerSearch(''); }} 
                    className="flex items-center gap-2 text-xs font-black text-emerald-600 hover:underline animate-in slide-in-from-right-2"
                   >
                     <ArrowRight size={14} /> العودة للأضابير
                   </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                 {!pickerFolderId ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredPickerFolders.map(folder => (
                        <div 
                          key={folder.id} 
                          onClick={() => { setPickerFolderId(folder.id); setPickerSearch(''); }}
                          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex items-center justify-between"
                        >
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${folder.color || 'bg-emerald-500'} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                 <FolderIcon size={20} />
                              </div>
                              <div className="text-right">
                                 <h4 className="text-[12px] font-black text-slate-800">{folder.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{documents.filter(d => d.folderId === folder.id).length} كتاب مؤرشف</p>
                              </div>
                           </div>
                           <ChevronLeft size={16} className="text-slate-200" />
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="space-y-3">
                      {filteredPickerDocs.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => toggleDocSelection(doc.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedDocIds.includes(doc.id) ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-xl ${selectedDocIds.includes(doc.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                 <FileText size={18} />
                              </div>
                              <div className="text-right">
                                 <h4 className="text-[11px] font-black text-slate-800">{doc.subject}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">رقم: {doc.refNumber} • {doc.date}</p>
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
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تم تحديد:</span>
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-emerald-100">{selectedDocIds.length} وثيقة</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-200 transition-all">إلغاء</button>
                    <button 
                      onClick={handleSendSelectedDocs} 
                      disabled={selectedDocIds.length === 0}
                      className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                       <Send size={14} /> إرسال المحدد للمحادثة
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
