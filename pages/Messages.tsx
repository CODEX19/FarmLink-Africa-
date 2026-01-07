
import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from './types.ts';
import { Icons } from '../constants.tsx';

// Initial state is now empty as requested
const INITIAL_CONVERSATIONS: Conversation[] = [];
const INITIAL_MESSAGES: Message[] = [];

interface MessagesProps {
  isOnline: boolean;
  initialConversationId?: string | null;
  onClearInitial?: () => void;
}

const Messages: React.FC<MessagesProps> = ({ isOnline, initialConversationId, onClearInitial }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConvs = localStorage.getItem('farmlink_conversations');
    const savedMsgs = localStorage.getItem('farmlink_messages_all');
    
    if (savedConvs) {
      const parsedConvs = JSON.parse(savedConvs);
      setConversations(parsedConvs);
      if (parsedConvs.length > 0 && !activeConvId) {
        setActiveConvId(parsedConvs[0].id);
      }
    }
    
    if (savedMsgs) {
      setMessages(JSON.parse(savedMsgs));
    }
  }, []);

  useEffect(() => {
    if (initialConversationId) {
      const exists = conversations.find(c => c.id === initialConversationId);
      if (!exists) {
        const newConv: Conversation = {
          id: initialConversationId,
          participantName: initialConversationId,
          participantAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialConversationId}`,
          lastMessage: 'Starting conversation...',
          timestamp: 'Just now',
          unreadCount: 0
        };
        const updated = [newConv, ...conversations];
        setConversations(updated);
        localStorage.setItem('farmlink_conversations', JSON.stringify(updated));
      }
      setActiveConvId(initialConversationId);
      onClearInitial?.();
    }
  }, [initialConversationId, conversations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId, isAiTyping]);

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  const simulateAiResponse = (convId: string, userMsg: string) => {
    // Only simulate if it's a specific support-like interaction if needed, 
    // but the user wants blank slate initially.
    if (convId !== 'support') return;

    setIsAiTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        conversationId: convId,
        sender: 'Support Team',
        content: `Acknowledged. Analysis of "${userMsg}" complete. Updating node telemetry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: 'delivered'
      };

      setMessages(prev => {
        const updated = [...prev, aiResponse];
        localStorage.setItem('farmlink_messages_all', JSON.stringify(updated));
        return updated;
      });

      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === convId 
            ? { ...c, lastMessage: aiResponse.content, timestamp: 'Now' } 
            : c
        );
        localStorage.setItem('farmlink_conversations', JSON.stringify(updated));
        return updated;
      });

      setIsAiTyping(false);
    }, 2500);
  };

  const send = () => {
    if (!input.trim() || !activeConvId) return;
    const userMsg = input;
    const newMessage: Message = { 
      id: Date.now().toString(), 
      conversationId: activeConvId,
      sender: 'You', 
      content: userMsg, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      isMe: true,
      status: isOnline ? 'delivered' : undefined
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('farmlink_messages_all', JSON.stringify(updatedMessages));

    const updatedConvs = conversations.map(c => 
      c.id === activeConvId 
        ? { ...c, lastMessage: userMsg, timestamp: 'Now' } 
        : c
    );
    setConversations(updatedConvs);
    localStorage.setItem('farmlink_conversations', JSON.stringify(updatedConvs));
    
    setInput('');

    if (activeConvId === 'support') {
      simulateAiResponse(activeConvId, userMsg);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex glass-card rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Contact List */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Direct Comms</h3>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-6 flex items-center gap-4 border-b border-slate-50 dark:border-slate-800/50 transition-all hover:bg-white/60 dark:hover:bg-slate-800/40 ${
                  activeConvId === conv.id ? 'bg-white/80 dark:bg-slate-800/60 border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <div className="relative">
                  <img src={conv.participantAvatar} className="w-12 h-12 rounded-2xl bg-slate-100" alt={conv.participantName} />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-left flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{conv.participantName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{conv.timestamp}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center space-y-4 opacity-40 mt-10">
               <Icons.Message className="w-12 h-12 mx-auto text-slate-300" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No active comms detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConvId ? (
          <>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-4">
                <img src={activeConversation?.participantAvatar} className="w-12 h-12 rounded-2xl bg-slate-100" alt="Active Contact" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">{activeConversation?.participantName}</p>
                  <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Secure Neural Link
                  </p>
                </div>
              </div>
              <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <Icons.Phone className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 dark:bg-slate-900/10 custom-scrollbar">
              {activeMessages.length > 0 ? (
                <>
                  {activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-5 shadow-sm relative transition-all duration-500 ${
                        msg.isMe 
                          ? 'bg-emerald-600 text-white rounded-3xl rounded-tr-none glow-green' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <div className={`text-[9px] mt-2 flex items-center justify-between font-black uppercase tracking-widest ${msg.isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                          <span>{msg.timestamp}</span>
                          {msg.isMe && <span className="ml-2">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAiTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="bg-white dark:bg-slate-800 text-slate-400 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Neural Uplink Active</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <Icons.Message className="w-20 h-20 mb-4 text-slate-300" />
                   <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting First Packet</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Query the farm network..."
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600 shadow-inner text-sm font-bold text-slate-900 dark:text-white"
                />
                <button 
                  onClick={send}
                  className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 futuristic-btn shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAiTyping}
                >
                  <Icons.Send className="w-7 h-7" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
               <div className="w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981] animate-scan-slow"></div>
             </div>
             <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-inner relative z-10">
                <Icons.Globe className="w-16 h-16 text-slate-200 dark:text-slate-800 animate-spin-slow" />
             </div>
             <div className="max-w-md space-y-3 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">No Active Uplinks</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  The neural messaging grid is currently idle. Connect with verified buyers or sellers in the <span className="text-emerald-600 font-black">Marketplace</span> to initialize a secure comms node.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
