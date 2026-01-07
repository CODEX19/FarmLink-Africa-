
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants.tsx';
import { getDeepChatResponse, generateNeuralSpeech } from '../pages/geminiService.ts';

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await getDeepChatResponse(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse || "I am currently processing that request. Please try again." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection to Neural Core lost. Re-attempting sync..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = async (text: string, index: number) => {
    if (isSpeaking !== null) return;
    setIsSpeaking(index);
    try {
      await generateNeuralSpeech(text);
    } catch (err) {
      console.error("Speech uplink failed:", err);
    } finally {
      setIsSpeaking(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden mb-4 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Icons.Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm tracking-tight">Neural Core</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">Thinking Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <Icons.ChevronLeft className="w-6 h-6 rotate-90" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <Icons.Leaf className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-bold leading-relaxed px-4">
                  Welcome to the FarmLink Neural Core. I use advanced reasoning to solve complex agricultural problems. How can I assist your operation today?
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.role === 'ai' && (
                    <button 
                      onClick={() => speak(msg.text, i)}
                      className={`absolute -right-10 top-2 p-2 bg-slate-800 rounded-lg border border-white/10 text-emerald-500 hover:scale-110 transition-all ${isSpeaking === i ? 'animate-pulse glow-green' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Icons.AudioWave className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/5">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Query neural network..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-90 disabled:opacity-50"
              >
                <Icons.Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 hover:scale-110 active:scale-90 transition-all group"
      >
        <div className="relative">
          <Icons.Sparkles className="w-8 h-8 text-emerald-500 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
      </button>
    </div>
  );
};

export default AIChatBot;
