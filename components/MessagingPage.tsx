import React, { useState, useRef, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, Send, Mic, FileText, X, ArchiveRestore, MessageSquare, 
  Play, FileIcon, StopCircle, CheckCheck, Paperclip as PaperclipIcon, 
  Pause, ExternalLink, Loader2
} from 'lucide-react';
import { User as UserType, Message, Document, Folder, Attachment, Project } from '../types';

interface MessagingPageProps {
  documents: Document[];
  folders: Folder[];
  projects: Project[];
  employees: UserType[];
  currentUser: UserType;
  onOpenDoc: (doc: Document) => void;
  onAddDocument: (doc: any) => void;
  onOpenAddModalWithFile: (files: Attachment[]) => void;
}

const MessagingPage: React.FC<MessagingPageProps> = ({ employees, currentUser, documents, folders, projects, onOpenDoc, onAddDocument, onOpenAddModalWithFile }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeEmployees = employees.filter(e => e.id !== currentUser.id && e.status === 'active');

  useEffect(() => {
    if (!selectedUserId) return;
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const chatMsgs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(m => 
          (m.senderId === currentUser.id && m.receiverId === selectedUserId) || 
          (m.senderId === selectedUserId && m.receiverId === currentUser.id)
        );
      setMessages(chatMsgs);
    });
    return () => unsub();
  }, [selectedUserId, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedUserId || !inputText.trim()) return;
    await addDoc(collection(db, "messages"), {
      senderId: currentUser.id,
      receiverId: selectedUserId,
      text: inputText,
      timestamp: serverTimestamp(),
      isRead: false
    });
    setInputText('');
  };

  const selectedUser = employees.find(u => u.id === selectedUserId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-transparent -m-8 overflow-hidden text-right font-cairo" dir="rtl">
      <div className="flex flex-1 overflow-hidden bg-transparent">
        <div className="w-64 border-l border-slate-200/40 flex flex-col bg-white shrink-0">
          <div className="p-3 border-b border-slate-100 bg-slate-50/20">
            <h2 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">زملاء العمل الحقيقيين</h2>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={11} />
              <input type="text" placeholder="بحث..." className="w-full pr-7 pl-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold outline-none" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
            {activeEmployees.length > 0 ? activeEmployees.filter(u=>u.name.includes(searchTerm)).map(user => (
              <button key={user.id} onClick={()=>setSelectedUserId(user.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all ${selectedUserId === user.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <img src={user.avatar} className="w-6 h-6 rounded object-cover" alt="" />
                <div className="flex-1 text-right overflow-hidden">
                  <span className="font-black text-[10px] truncate block leading-tight">{user.name}</span>
                  <p className={`text-[7px] font-bold truncate opacity-50 ${selectedUserId === user.id ? 'text-white' : 'text-slate-400'}`}>{user.department || 'عام'}</p>
                </div>
              </button>
            )) : (
              <div className="p-10 text-center text-[8px] text-slate-300 font-bold">لا يوجد زملاء منضمون حالياً</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          {selectedUser ? (
            <>
              <div className="h-10 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-30">
                <div className="flex items-center gap-2">
                  <img src={selectedUser.avatar} className="w-6 h-6 rounded object-cover" alt="" />
                  <div>
                    <h3 className="font-black text-slate-800 text-[10px] leading-none">{selectedUser.name}</h3>
                    <p className="text-[7px] text-emerald-600 font-bold mt-0.5">{selectedUser.status === 'active' ? 'نشط الآن' : 'غير متصل'}</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar bg-transparent">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-2 px-3 rounded-lg border text-[10px] font-bold max-w-[80%] shadow-sm ${isMe ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'}`}>
                        <p className="leading-tight">{msg.text}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[7px] opacity-40">
                          <span>{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}) : '...'}</span>
                          {isMe && <CheckCheck size={8} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 pb-4 pt-1 shrink-0 bg-transparent">
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-white p-1 pr-3 rounded-xl border border-slate-200 shadow-xl">
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="اكتب رسالة..." className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold py-1.5 px-1 resize-none text-right" rows={1} />
                  <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 active:scale-95"><Send size={14} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={32} className="opacity-10 mb-2" />
              <h3 className="font-black text-[10px] uppercase tracking-widest">ابدأ مراسلة زملاء المنشأة الحقيقيين</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MessagingPage;