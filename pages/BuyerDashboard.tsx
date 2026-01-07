
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBuyingTips, generateNeuralSpeech } from './geminiService.ts';
import { UserProfile, Conversation } from './types.ts';
import { Icons } from '../constants.tsx';

const PROCUREMENT_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 340 },
  { name: 'Wed', value: 210 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 390 },
  { name: 'Sat', value: 680 },
  { name: 'Sun', value: 520 },
];

const BuyerDashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [tips, setTips] = useState<string>("Analyzing market sourcing potential...");
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [balance, setBalance] = useState(0);

  const currency = useMemo(() => {
    const loc = user.location.toLowerCase();
    if (loc.includes('kenya')) return 'KSh';
    if (loc.includes('nigeria')) return '₦';
    if (loc.includes('south africa')) return 'R';
    if (loc.includes('ghana')) return 'GH₵';
    return '$';
  }, [user.location]);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const result = await getBuyingTips(user.location);
        setTips(result);
      } catch (err) {
        setTips("Strategic market data is currently being recalibrated. Please check back shortly.");
      } finally {
        setLoading(false);
      }
    };
    fetchTips();

    const savedBalance = localStorage.getItem(`farmlink_balance_${user.email}`);
    if (savedBalance) setBalance(Number(savedBalance));

    const savedOrders = localStorage.getItem(`farmlink_orders_${user.email}`);
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedConvs = localStorage.getItem('farmlink_conversations');
    if (savedConvs) {
      setConversations(JSON.parse(savedConvs).slice(0, 3));
    }
  }, [user.location, user.email]);

  const speakTips = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await generateNeuralSpeech(tips);
    } catch (err) {
      console.error("Neural uplink failed:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      <section className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Procurement <span className="text-indigo-600">Terminal</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg italic">
            Command center for {user.name} | Sourcing across Africa.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 pr-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 group cursor-default">
          <div className="relative">
            <div className="absolute -inset-1 bg-indigo-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={user.avatar} alt="Profile" className="relative w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 object-cover shadow-inner group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1 opacity-70">Authenticated Node</p>
            <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">{user.farmName || "Global Procurement Ltd"}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Icons.MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.location}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Active Sourcing', val: orders.length.toString(), icon: Icons.Search, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Purchasing Power', val: `${currency} ${balance.toLocaleString()}`, icon: Icons.Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Inbound Logistics', val: '0 Units', icon: Icons.Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Verified Sellers', val: '0', icon: Icons.Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all duration-500 group cursor-default shadow-xl hover:-translate-y-1`}>
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden group hover:border-indigo-500/20 transition-all duration-700">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Sourcing Volume Matrix</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Rolling 7-Day Procurement Stream (MT)</p>
            </div>
          </div>
          <div className="h-[400px] w-full min-h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <AreaChart data={PROCUREMENT_DATA}>
                <defs>
                  <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#colorProc)" strokeWidth={4} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-scan-slow"></div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-[0_24px_50px_rgba(79,70,229,0.3)] flex flex-col group transition-all duration-700 hover:shadow-[0_32px_70px_rgba(79,70,229,0.4)]">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <Icons.Sparkles className="w-8 h-8 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight leading-none">AI Intel</h3>
                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-[0.2em] mt-1">Sourcing Strategy</p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex-1 relative group/tips overflow-hidden">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                </div>
              ) : (
                <>
                  <div className="text-base font-medium leading-relaxed italic text-indigo-50 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                    {tips.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
                  </div>
                  <button onClick={speakTips} className={`absolute bottom-4 right-4 p-3 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 shadow-lg ${isSpeaking ? 'animate-pulse glow-green' : 'opacity-0 group-hover/tips:opacity-100'}`}>
                    <Icons.AudioWave className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            <button className="mt-10 w-full py-5 bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-indigo-50 active:scale-95 transition-all duration-300 futuristic-btn">
               Refresh Market Analysis
            </button>
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
