
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  collection, onSnapshot, addDoc, query, orderBy, where, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, Send, Mic, FileText, X, ArchiveRestore, MessageSquare, 
  Play, FileIcon, StopCircle, Briefcase, ChevronRight, ChevronLeft,
  Paperclip as PaperclipIcon, CheckCheck, Download, Clock
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment } from '../types';
import { CURRENT_USER, MOCK_EMPLOYEES } from '../constants';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  onArchiveFile: (file: any) => void;
}

const MessagingPage: React.FC<MessagingPageProps> = ({ documents, folders }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Firestore Messages Listener
  useEffect(() => {
    if (!selectedUserId) return;

    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

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
    setInputText('');
  };

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
                    <div className={`p-3 px-4 rounded-[1.4rem] shadow-sm text-[12px] font-bold max-w-[75%] ${msg.senderId === CURRENT_USER.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[8px] font-black opacity-60">
                        {/* Fix: Check if timestamp has toDate (Firestore Timestamp) or is a string (Mock data) */}
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
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 pr-4 rounded-full border border-slate-200 shadow-2xl">
                  <button onClick={() => setShowArchivePicker(!showArchivePicker)} className="p-2 text-slate-400 hover:text-amber-600"><ArchiveRestore size={18} /></button>
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2.5 px-2 resize-none text-right" rows={1} />
                  <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 disabled:opacity-50"><Send size={18} /></button>
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
    </div>
  );
};
export default MessagingPage;
