
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Icons } from '../constants';

interface CommunityMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  location: string;
  isMe?: boolean;
}

const INITIAL_MESSAGES: CommunityMessage[] = [
  { id: 'm1', sender: 'Kwame Mensah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame', content: 'Anyone seeing the price jump for white maize in Kumasi?', timestamp: '10:15 AM', location: 'Kumasi, Ghana' },
  { id: 'm2', sender: 'Elena Ruto', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', content: 'The rains were late so supply is tight. Better to hold your stock.', timestamp: '10:18 AM', location: 'Eldoret, Kenya' },
  { id: 'm3', sender: 'Zainab Bello', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab', content: 'Checking in from Kaduna. Soil moisture levels are looking great for the new cycle!', timestamp: '10:22 AM', location: 'Kaduna, Nigeria' },
];

interface CommunityHubProps {
  user: UserProfile;
  resolution?: 'MOBILE' | 'TABLET' | 'LAPTOP';
}

const CommunityHub: React.FC<CommunityHubProps> = ({ user, resolution = 'LAPTOP' }) => {
  const [messages, setMessages] = useState<CommunityMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState('West Africa');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isMobile = resolution === 'MOBILE';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: CommunityMessage = {
      id: Date.now().toString(),
      sender: user.name,
      avatar: user.avatar,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: user.location,
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const handleReport = (id: string) => {
    setReportingId(id);
    setTimeout(() => {
      setReportingId(null);
      alert("Safety protocol: Message flagged for network moderation.");
    }, 1000);
  };

  const getTrendIcon = (tag: string) => {
    if (tag.includes('Maize')) return <Icons.Corn className="w-8 h-8" />;
    if (tag.includes('Drought')) return <Icons.CloudSun className="w-8 h-8" />;
    if (tag.includes('Logistics')) return <Icons.Truck className="w-8 h-8" />;
    return <Icons.Sparkles className="w-8 h-8" />;
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Neural Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg italic mt-1">Peer-to-peer network for Africa's elite farmers.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full md:w-fit overflow-x-auto custom-scrollbar">
          {['West Africa', 'East Africa', 'Southern Hub'].map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeChannel === channel ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </header>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-10 ${isMobile ? 'h-auto' : 'h-[750px]'}`}>
        {/* Main Chat Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3.5rem] flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex justify-between items-center relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <div>
                <p className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">{activeChannel} Channel</p>
                <p className="text-[10px] font-bold text-slate-400">1,248 Verified Nodes Linked</p>
              </div>
            </div>
            {!isMobile && (
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800"></div>)}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar bg-slate-50/20 dark:bg-slate-950/20 relative z-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-5 group ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  <img src={msg.avatar} className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white dark:border-slate-800" alt={msg.sender} />
                </div>
                <div className={`flex-1 space-y-3 ${msg.isMe ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">{msg.sender}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">• {msg.location}</span>
                  </div>
                  <div className={`relative inline-block max-w-[90%] md:max-w-[80%] p-6 rounded-[2.5rem] shadow-xl transition-all duration-500 group-hover:scale-[1.01] ${
                    msg.isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none glow-indigo' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    <p className="text-base font-medium leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-between mt-5 gap-6">
                       <p className={`text-[9px] font-black uppercase tracking-widest ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                         {msg.timestamp}
                       </p>
                       {!msg.isMe && (
                         <button 
                          onClick={() => handleReport(msg.id)}
                          className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-xl transition-all ${
                            reportingId === msg.id 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          {reportingId === msg.id ? 'Flagging...' : 'Report Content'}
                        </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 relative z-20">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query the hub network..." 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-base shadow-inner text-slate-900 dark:text-white"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3">
                   <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                      <Icons.Camera className="w-6 h-6 grayscale opacity-60" />
                   </button>
                </div>
              </div>
              <button 
                onClick={handleSend}
                className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center hover:bg-indigo-700 futuristic-btn shadow-2xl group transition-all"
              >
                <Icons.Send className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className={`space-y-8 ${isMobile ? '' : 'flex flex-col'}`}>
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/5">
            <div className="absolute -right-16 -bottom-16 opacity-5 group-hover:opacity-10 transition-all duration-1000 w-64 h-64 group-hover:scale-110">
               <Icons.Leaf className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-8 tracking-tighter">Neural Trends</h3>
              <div className="space-y-6">
                {[
                  { tag: '#MaizeSurge', trend: '+12% Local Price', icon: Icons.Corn },
                  { tag: '#DroughtWatch', trend: 'Critical Level', icon: Icons.CloudSun },
                  { tag: '#LogisticsHub', trend: 'Fleet Optimal', icon: Icons.Truck },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5 bg-white/5 p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/item">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                       <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight group-hover/item:text-indigo-400 transition-colors">{item.tag}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{item.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">Network Elite</h3>
            <div className="space-y-6">
              {[
                { name: 'Baba Tunde', crops: 'Cocoa Node', points: '2.4k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Baba' },
                { name: 'Grace M.', crops: 'Maize Node', points: '1.8k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace' },
                { name: 'Oumar Diallo', crops: 'Logistics Elite', points: '1.2k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={c.avatar} className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm" alt={c.name} />
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tight">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{c.crops}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800">⭐ {c.points}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              View Global Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
