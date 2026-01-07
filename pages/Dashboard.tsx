
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAgriInsights, getFastInsights, getNearbyAgriNodes, generateNeuralSpeech } from './geminiService.ts';
import { UserProfile } from './types.ts';
import { Icons } from '../constants.tsx';

const yieldData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
];

interface DashboardProps {
  user: UserProfile;
  isOnline: boolean;
  isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, isOnline, isSyncing }) => {
  const [insight, setInsight] = useState<string>("Syncing farm intelligence...");
  const [fastUpdate, setFastUpdate] = useState<string>("");
  const [nearbyNodes, setNearbyNodes] = useState<{text: string, sources: any[]}>({ text: "", sources: [] });
  const [isInsightLive, setIsInsightLive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [balance, setBalance] = useState(0);

  const getCurrencySymbol = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes('kenya')) return 'KSh';
    if (loc.includes('nigeria')) return '₦';
    if (loc.includes('south africa')) return 'R';
    if (loc.includes('ghana')) return 'GH₵';
    return '$';
  };

  const currency = getCurrencySymbol(user.location);

  useEffect(() => {
    const savedBalance = localStorage.getItem(`farmlink_balance_${user.email}`);
    if (savedBalance) setBalance(Number(savedBalance));

    if (!isOnline) return;

    const fetchAllData = async () => {
      try {
        getFastInsights(user.location, ['Maize']).then(setFastUpdate);
        const insightResult = await getAgriInsights(user.location, ['Maize', 'Vegetables']);
        setInsight(insightResult);
        setIsInsightLive(true);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const nodes = await getNearbyAgriNodes(pos.coords.latitude, pos.coords.longitude);
            setNearbyNodes(nodes);
          });
        }
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      }
    };

    fetchAllData();
  }, [user.location, isOnline, user.email]);

  const speakInsights = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await generateNeuralSpeech(insight);
    } catch (err) {
      console.error("Neural speech error:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
            Hello, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">Monitoring your digital estate in {user.location}.</p>
        </div>
        <div className="flex gap-4">
          {fastUpdate && (
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-right-4">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">Rapid Relay:</span>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 italic">{fastUpdate}</p>
            </div>
          )}
          {isSyncing && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full animate-pulse border border-emerald-100 dark:border-emerald-800 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
               <span className="text-xs font-black uppercase tracking-widest">Neural Sync</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icons.Wallet className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 tracking-widest uppercase">Uplink Active</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Net Capital</p>
          <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">
            {currency} {balance.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
             <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icons.Leaf className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800 tracking-widest uppercase">Optimized</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Soil Biometrics</p>
          <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">94% Efficiency</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 group hover:border-amber-500/30 transition-all duration-500 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-6">
             <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icons.Truck className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800 tracking-widest uppercase">4 En Route</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Regional Logistics</p>
          <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">Verified Stream</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
            <div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">Yield Analytics Spectrum</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ground-Verified Productivity Curve</p>
            </div>
          </div>
          <div className="h-[400px] w-full min-h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }}
                  itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorYield)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] text-white p-10 flex flex-col relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
               <Icons.Sparkles className="w-8 h-8 brightness-200" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking tight leading-none">Neural Insights</h3>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-1">AI STRATEGY NODE</p>
            </div>
          </div>
          <div className="flex-1 relative z-10">
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl mb-6 relative group">
                <div className="text-base font-medium leading-relaxed italic text-emerald-50 whitespace-pre-wrap max-h-[250px] overflow-y-auto custom-scrollbar">
                  {insight}
                </div>
                <button 
                  onClick={speakInsights}
                  className={`absolute bottom-4 right-4 p-2 bg-emerald-500 rounded-xl shadow-lg hover:scale-110 transition-all ${isSpeaking ? 'animate-pulse' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <Icons.AudioWave className="w-4 h-4 text-white" />
                </button>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">N{i}</div>)}
                </div>
                {!isInsightLive && (
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">Sync Pending</span>
                )}
             </div>
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
