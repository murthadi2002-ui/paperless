
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, Send, Paperclip, Mic, MoreVertical, 
  FileText, Archive, Check, CheckCheck, User, 
  Download, ArchiveRestore, X, FolderOpen,
  MessageSquare, ChevronLeft, ChevronRight,
  Folder as FolderIcon, Trash2, BellOff, Bell,
  Play, Pause, Volume2
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES, MOCK_MESSAGES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  onArchiveFile: (file: any) => void;
}

const VoiceMessage: React.FC<{ isMine: boolean; timestamp: string; isRead?: boolean }> = ({ isMine, timestamp, isRead }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Waveform visualization bars (Telegram style)
  const bars = [3, 6, 4, 7, 9, 5, 8, 11, 7, 4, 6, 10, 5, 3, 7, 9, 4, 6, 8, 5, 7, 3];

  return (
    <div className={`flex items-center gap-3 min-w-[240px] p-1 animate-in fade-in duration-300`}>
      {/* Telegram Style Play Button */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 shrink-0 ${
          isMine ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'
        }`}
      >
        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} className="mr-[-2px]" fill="currentColor" />}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        {/* Modern Waveform */}
        <div className="flex items-end gap-[2px] h-7 px-1">
          {bars.map((h, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${
                isMine ? 'bg-white/40' : 'bg-emerald-200'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{ 
                height: `${h * 2}px`, 
                opacity: i < 10 && isPlaying ? 1 : 0.5,
                animationDelay: `${i * 0.05}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-[10px] font-black ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>
            <span>0:14</span>
            <span className="opacity-40">/</span>
            <span>0:38</span>
          </div>
          
          <div className={`flex items-center gap-1.5 text-[8px] font-black ${isMine ? 'text-emerald-100/70' : 'text-slate-300'}`}>
            <span>{timestamp}</span>
            {isMine && (isRead ? <CheckCheck size={10} className="text-white" /> : <Check size={10} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders, onArchiveFile }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // App Logic States
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  // Archive Picker States
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [pickerView, setPickerView] = useState<'folders' | 'docs'>('folders');
  const [pickerFolderId, setPickerFolderId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a fixed height to avoid the bottom gap issue in Layout
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedUserId]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedUser = useMemo(() => 
    MOCK_EMPLOYEES.find(u => u.id === selectedUserId), 
  [selectedUserId]);

  const isMuted = selectedUserId ? mutedUserIds.has(selectedUserId) : false;

  const filteredContacts = useMemo(() => 
    MOCK_EMPLOYEES.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [searchTerm]);

  const chatMessages = useMemo(() => {
    let baseMsgs = messages.filter(m => 
      (m.senderId === CURRENT_USER.id && m.receiverId === selectedUserId) ||
      (m.senderId === selectedUserId && m.receiverId === CURRENT_USER.id)
    );

    if (chatSearchQuery.trim()) {
      return baseMsgs.filter(m => m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()));
    }
    return baseMsgs;
  }, [messages, selectedUserId, chatSearchQuery]);

  const handleSendMessage = (text?: string, attachment?: any, archivedDocIds?: string[], isVoice = false) => {
    if (!selectedUserId) return;
    if (!text && !attachment && !isVoice && (!archivedDocIds || archivedDocIds.length === 0)) return;

    const newMsgs: Message[] = [];
    
    if (archivedDocIds && archivedDocIds.length > 0) {
      archivedDocIds.forEach(id => {
        newMsgs.push({
          id: Math.random().toString(36).substr(2, 9),
          senderId: CURRENT_USER.id,
          receiverId: selectedUserId,
          archivedDocId: id,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        });
      });
    }

    if (text || attachment || isVoice) {
      newMsgs.push({
        id: Math.random().toString(36).substr(2, 9),
        senderId: CURRENT_USER.id,
        receiverId: selectedUserId,
        text,
        attachment,
        isVoice,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      });
    }

    setMessages([...messages, ...newMsgs]);
    setInputText('');
    setShowArchivePicker(false);
    setSelectedDocIds([]);
    setPickerFolderId(null);
    setPickerView('folders');
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSendMessage(undefined, undefined, undefined, true);
    } else {
      setIsRecording(true);
    }
  };

  const toggleMute = () => {
    if (!selectedUserId) return;
    const next = new Set(mutedUserIds);
    if (next.has(selectedUserId)) next.delete(selectedUserId);
    else next.add(selectedUserId);
    setMutedUserIds(next);
    setIsChatMenuOpen(false);
  };

  const clearCurrentChat = () => {
    if (!selectedUserId) return;
    if (window.confirm('هل أنت متأكد من مسح كافة الرسائل في هذه المحادثة؟')) {
      setMessages(prev => prev.filter(m => 
        !( (m.senderId === CURRENT_USER.id && m.receiverId === selectedUserId) ||
           (m.senderId === selectedUserId && m.receiverId === CURRENT_USER.id) )
      ));
    }
    setIsChatMenuOpen(false);
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div 
      className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden" 
      onClick={() => { setIsChatMenuOpen(false); }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Contacts */}
        <div className="w-80 border-l border-slate-200/60 flex flex-col bg-slate-50/40 backdrop-blur-sm shrink-0">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-slate-800 tracking-tight">الزملاء</h2>
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-emerald-600">
                <User size={14} />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={13} />
              <input 
                type="text" 
                placeholder="البحث في الفريق..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 bg-white/60 border border-slate-200/80 rounded-lg text-[10px] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pt-1 px-2 space-y-0.5">
            {filteredContacts.map(user => {
              const userIsMuted = mutedUserIds.has(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => { setSelectedUserId(user.id); setIsChatSearchOpen(false); setChatSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    selectedUserId === user.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                      : 'text-slate-500 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={user.avatar} className={`w-9 h-9 rounded-xl border-2 object-cover shadow-sm ${selectedUserId === user.id ? 'border-emerald-400' : 'border-white'}`} alt="" />
                    {user.status === 'active' && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 text-right overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className={`font-black text-[13px] truncate ${selectedUserId === user.id ? 'text-white' : 'text-slate-800'}`}>{user.name}</span>
                        {userIsMuted && <BellOff size={10} className={selectedUserId === user.id ? 'text-emerald-100' : 'text-slate-300'} />}
                      </div>
                      <span className={`text-[8px] font-bold shrink-0 ${selectedUserId === user.id ? 'text-emerald-100' : 'text-slate-300'}`}>{messages.find(m => m.senderId === user.id)?.timestamp || ''}</span>
                    </div>
                    <p className={`text-[9px] font-bold truncate ${selectedUserId === user.id ? 'text-emerald-100/80' : 'text-slate-400'}`}>{user.department}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="h-14 px-6 border-b border-slate-200/60 flex items-center justify-between bg-white/70 backdrop-blur-md z-30 shrink-0">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} className="w-9 h-9 rounded-xl object-cover shadow-sm border-2 border-white" alt="" />
                  <div>
                    <h3 className="font-black text-slate-800 text-xs leading-tight flex items-center gap-2 text-right">
                      {selectedUser.name}
                      {isMuted && <BellOff size={12} className="text-slate-300" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">متصل</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isChatSearchOpen ? (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-0.5 animate-in slide-in-from-left-4">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="البحث..." 
                        className="text-[10px] font-bold outline-none bg-transparent w-32"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                      />
                      <button onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(''); }} className="text-slate-300 hover:text-slate-600"><X size={12} /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsChatSearchOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-all border border-transparent"
                    >
                      <Search size={18} />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsChatMenuOpen(!isChatMenuOpen); }}
                      className={`p-1.5 rounded-lg transition-all border border-transparent ${isChatMenuOpen ? 'bg-white text-slate-800 border-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-800 hover:bg-white hover:border-slate-100'}`}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {isChatMenuOpen && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 origin-top-left">
                        <button 
                          onClick={toggleMute}
                          className="w-full text-right px-4 py-2 text-[10px] font-black text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                        >
                          {isMuted ? <Bell size={14} className="text-emerald-500" /> : <BellOff size={14} className="text-slate-400" />}
                          {isMuted ? 'إلغاء الكتم' : 'كتم التنبيهات'}
                        </button>
                        <button 
                          onClick={clearCurrentChat}
                          className="w-full text-right px-4 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" /> مسح المراسلات
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-8 py-6 space-y-1 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed custom-scrollbar"
              >
                {chatMessages.map((msg, idx) => {
                  const isMine = msg.senderId === CURRENT_USER.id;
                  const archivedDoc = msg.archivedDocId ? documents.find(d => d.id === msg.archivedDocId) : null;
                  const prevMsg = chatMessages[idx - 1];
                  const isSameSender = prevMsg?.senderId === msg.senderId;

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'} ${!isSameSender ? 'mt-4' : 'mt-0.5'} animate-in slide-in-from-bottom-1 duration-200`}>
                      <div className={`max-w-[85%] md:max-w-[75%] group relative`}>
                        <div className={`p-2 px-4 rounded-[1.3rem] shadow-sm text-[13px] relative transition-all ${
                          isMine 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-none'
                        }`}>
                          
                          {msg.isVoice ? (
                            <VoiceMessage isMine={isMine} timestamp={msg.timestamp} isRead={msg.isRead} />
                          ) : (
                            <>
                              {msg.text && (
                                <p className="leading-relaxed font-bold text-right">
                                  {chatSearchQuery ? (
                                    msg.text.split(new RegExp(`(${chatSearchQuery})`, 'gi')).map((part, i) => 
                                      part.toLowerCase() === chatSearchQuery.toLowerCase() 
                                        ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded px-0.5">{part}</mark> 
                                        : part
                                    )
                                  ) : msg.text}
                                </p>
                              )}
                              
                              {archivedDoc && (
                                <div className={`p-1.5 rounded-lg flex items-center gap-2 border mt-1 shadow-inner ${isMine ? 'bg-emerald-700/40 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}>
                                  <div className={`p-1 rounded-md shadow-sm ${isMine ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}><Archive size={12} /></div>
                                  <div className="flex-1 overflow-hidden text-right">
                                    <p className="text-[10px] font-black truncate">{archivedDoc.subject}</p>
                                    <p className={`text-[8px] font-bold ${isMine ? 'text-emerald-100/70' : 'text-slate-400'}`}>#{archivedDoc.refNumber}</p>
                                  </div>
                                  <button className={`p-1 rounded-md transition-all ${isMine ? 'hover:bg-emerald-600 text-white' : 'hover:bg-slate-200 text-slate-400'}`}><FolderOpen size={12} /></button>
                                </div>
                              )}
                              
                              <div className={`mt-1 flex items-center justify-end gap-1 text-[8px] font-black ${isMine ? 'text-emerald-100/60' : 'text-slate-300'}`}>
                                <span>{msg.timestamp}</span>
                                {isMine && (msg.isRead ? <CheckCheck size={10} className="text-white" /> : <Check size={10} />)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Bar: STUCK TO BOTTOM NO PADDING */}
              <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/60 p-2 shrink-0 z-40">
                <div className={`max-w-4xl mx-auto flex items-center gap-2 bg-slate-50/50 p-1 pr-4 rounded-full border border-slate-200 shadow-sm group transition-all focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:bg-white focus-within:border-emerald-500 ${isRecording ? 'ring-2 ring-red-500 border-red-500 bg-red-50/10' : ''}`}>
                  
                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-3 px-4 animate-in fade-in">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-[13px] font-black text-red-600 tracking-wider font-mono">{formatTime(recordingTime)}</span>
                      <p className="text-[11px] font-bold text-slate-400 flex-1">جاري تسجيل البصمة الصوتية...</p>
                      <button onClick={() => setIsRecording(false)} className="text-[11px] font-black text-slate-400 hover:text-red-500 transition-colors">إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-0.5 border-l border-slate-100 pl-1">
                        <button onClick={() => setShowArchivePicker(true)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all" title="الأرشيف"><Archive size={18} /></button>
                        <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer"><Paperclip size={18} /><input type="file" className="hidden" /></label>
                      </div>

                      <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage(inputText))}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2.5 px-2 resize-none max-h-32 custom-scrollbar placeholder:text-slate-300 text-right"
                        rows={1}
                      />
                    </>
                  )}

                  <div className="flex items-center gap-1.5 pr-1 border-r border-slate-100 mr-1">
                    <button 
                      onClick={handleVoiceRecord}
                      className={`p-3 rounded-full transition-all ${
                        isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Mic size={18} />
                    </button>
                    {!isRecording && (
                      <button 
                        onClick={() => handleSendMessage(inputText)}
                        className="p-3 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/20">
              <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-slate-100 mb-8 animate-bounce duration-[4000ms]">
                <MessageSquare size={64} className="opacity-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">المراسلات الإدارية</h3>
              <p className="text-[12px] mt-2 text-slate-400 font-bold max-w-xs text-center">اختر زميلاً من القائمة الجانبية لبدء التواصل ومشاركة الملفات بشكل آمن.</p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Archive Picker Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95">
             <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  {pickerView === 'docs' ? (
                    <button onClick={() => { setPickerView('folders'); setPickerFolderId(null); setSelectedDocIds([]); }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-all"><ChevronRight size={18} /></button>
                  ) : (
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm"><Archive size={16} /></div>
                  )}
                  <div className="text-right">
                    <h4 className="font-black text-slate-800 text-sm">{pickerView === 'folders' ? 'اختيار الإضبارة' : `محتويات: ${folders.find(f => f.id === pickerFolderId)?.name}`}</h4>
                    <p className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">{pickerView === 'folders' ? 'تصفح الأرشيف' : `محدد (${selectedDocIds.length})`}</p>
                  </div>
                </div>
                <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
                {pickerView === 'folders' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {folders.filter(f => !f.deletedAt).map(folder => (
                      <button key={folder.id} onClick={() => { setPickerFolderId(folder.id); setPickerView('docs'); }} className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-right group">
                        <div className={`p-2 rounded-xl shadow-sm ${folder.color || 'bg-slate-100 text-slate-500'} group-hover:bg-emerald-600 group-hover:text-white transition-all`}><FolderIcon size={20} /></div>
                        <div className="flex-1 overflow-hidden"><p className="font-black text-slate-800 text-[13px] truncate">{folder.name}</p></div>
                        <ChevronLeft size={16} className="text-slate-200 group-hover:text-emerald-600 transition-transform" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {documents.filter(d => d.folderId === pickerFolderId).map(doc => (
                      <label key={doc.id} className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group ${selectedDocIds.includes(doc.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                        <div className={`p-1.5 rounded-lg transition-all ${selectedDocIds.includes(doc.id) ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:text-emerald-600'}`}><FileText size={18} /></div>
                        <div className="flex-1 text-right overflow-hidden"><p className={`font-black text-[12px] truncate ${selectedDocIds.includes(doc.id) ? 'text-white' : 'text-slate-800'}`}>{doc.subject}</p></div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedDocIds.includes(doc.id) ? 'bg-white border-white text-emerald-600' : 'border-slate-200 bg-slate-50'}`}>{selectedDocIds.includes(doc.id) && <Check size={12} strokeWidth={4} />}</div>
                        <input type="checkbox" className="hidden" checked={selectedDocIds.includes(doc.id)} onChange={() => toggleDocSelection(doc.id)} />
                      </label>
                    ))}
                  </div>
                )}
             </div>
             
             <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pickerView === 'folders' ? 'تصفح المجلدات' : `تم تحديد ${selectedDocIds.length} وثائق`}</div>
                <div className="flex gap-2">
                   {pickerView === 'docs' && <button onClick={() => handleSendMessage(undefined, undefined, selectedDocIds)} disabled={selectedDocIds.length === 0} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"><Send size={14} /> إرسال المختار</button>}
                   <button onClick={() => { setShowArchivePicker(false); setSelectedDocIds([]); }} className="px-5 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-50 transition-all">إغلاق</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
