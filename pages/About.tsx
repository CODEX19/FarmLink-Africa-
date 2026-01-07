
import React, { useState } from 'react';
import { Icons } from '../constants';

interface AboutProps {
  onLogin: () => void;
  onSignUp: () => void;
  onHowItWorks: () => void;
  isAuthenticated?: boolean;
}

const About: React.FC<AboutProps> = ({ onLogin, onSignUp, onHowItWorks, isAuthenticated = false }) => {
  return (
    <div className={`min-h-screen ${isAuthenticated ? 'bg-transparent' : 'bg-white'}`}>
      {!isAuthenticated && (
        <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
          <div className="flex items-center group cursor-pointer">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">FarmLink<span className="text-[#4d7c0f]">-Africa</span></h1>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Connecting harvest to hands</p>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <button onClick={onLogin} className="text-sm font-bold text-slate-500 hover:text-[#4d7c0f] transition-colors">Sign In</button>
            <button onClick={onSignUp} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">Join Network</button>
          </div>
        </nav>
      )}

      <main className={`max-w-7xl mx-auto px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isAuthenticated ? 'pt-0' : ''}`}>
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6f4ed] border border-[#d1e7dd] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#4d7c0f] animate-pulse"></span>
            <span className="text-[#4d7c0f] text-[10px] font-black uppercase tracking-widest">Empowering 10k+ Farmers</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter">
            The Future of <br/>
            <span className="text-[#4d7c0f]">Agri-Commerce.</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
            Bridging the gap between African fields and global tables through futuristic logistics and AI-driven market intelligence.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {!isAuthenticated && (
              <button onClick={onSignUp} className="px-10 py-5 bg-[#4d7c0f] text-white font-black rounded-2xl hover:bg-[#3f630c] transition-all shadow-2xl hover:scale-105 active:scale-95">
                Start Growing ➔
              </button>
            )}
            <button onClick={onHowItWorks} className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all flex items-center gap-3">
              <Icons.Play className="w-8 h-8" />
              Learn Mechanics
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-[#4d7c0f]/5 rounded-[3rem] rotate-3 group-hover:rotate-1 transition-transform duration-700"></div>
          <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video bg-slate-900">
             <img 
               src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200" 
               className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" 
               alt="Success in African Agriculture" 
             />
          </div>
        </div>
      </main>

      <section className="bg-slate-900 py-24 px-8 rounded-[4rem] my-12 text-white relative overflow-hidden mx-4">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 text-center hover:bg-white/10 transition-colors cursor-default">
            <Icons.Sparkles className="w-16 h-16 mb-6 mx-auto" />
            <h3 className="text-2xl font-black mb-4">AI Liquidity</h3>
            <p className="text-emerald-50/60 text-sm leading-relaxed">Predictive pricing models that ensure you sell at the absolute peak of market demand.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 text-center hover:bg-white/10 transition-colors cursor-default">
            <Icons.Truck className="w-16 h-16 mb-6 mx-auto" />
            <h3 className="text-2xl font-black mb-4">Neural Logistics</h3>
            <p className="text-emerald-50/60 text-sm leading-relaxed">Autonomous-ready fleet management that reduces wastage by 35% through optimal routing.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 text-center hover:bg-white/10 transition-colors cursor-default">
            <Icons.Wallet className="w-16 h-16 mb-6 mx-auto" />
            <h3 className="text-2xl font-black mb-4">Trust Ledger</h3>
            <p className="text-emerald-50/60 text-sm leading-relaxed">Secure, instant payments via integrated regional gateways with full transparency.</p>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
           <Icons.Logo className="w-8 h-8 opacity-40 grayscale" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">FarmLink Africa Hub</p>
        </div>
        <p className="text-slate-300 text-sm font-medium">&copy; 2025 FarmLink Ecosystem.</p>
      </footer>
    </div>
  );
};

export default About;
