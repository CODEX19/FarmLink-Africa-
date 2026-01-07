
import React, { useState } from 'react';
import { MOCK_LISTINGS, MarketplaceItem } from './Marketplace.tsx';
import { Icons } from '../constants.tsx';

interface SellerProfileProps {
  sellerName: string;
  onBack: () => void;
  onMessage: () => void;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ sellerName, onBack, onMessage }) => {
  const [isVerified, setIsVerified] = useState(true);
  const sellerListings = MOCK_LISTINGS.filter(item => item.seller === sellerName);
  const location = sellerListings[0]?.location || 'Various Regions, Africa';
  
  const getItemIcon = (type: MarketplaceItem['type']) => {
    switch(type) {
      case 'maize': return <Icons.Corn className="w-10 h-10 text-amber-500" />;
      case 'coffee': return <Icons.Leaf className="w-10 h-10 text-emerald-800" />;
      case 'cattle': return <Icons.Cow className="w-10 h-10 text-slate-700" />;
      case 'chicken': return <Icons.Chicken className="w-10 h-10 text-rose-500" />;
      case 'cocoa': return <Icons.Leaf className="w-10 h-10 text-amber-900" />;
      case 'goat': return <Icons.Cow className="w-10 h-10 text-slate-500" />;
      case 'corn': return <Icons.Corn className="w-10 h-10 text-emerald-500" />;
      default: return <Icons.Leaf className="w-10 h-10 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 transition-all active:scale-95 group shadow-sm"
          >
            <Icons.ChevronLeft className="group-hover:-translate-x-1 transition-transform text-slate-500 w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{sellerName}</h2>
              {isVerified && (
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-in zoom-in-50">
                  <Icons.Success className="w-4 h-4" />
                </div>
              )}
              <button 
                onClick={() => setIsVerified(!isVerified)}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Toggle Verification (Demo)
              </button>
            </div>
            <p className="text-slate-500 font-medium italic flex items-center gap-2 mt-1">
              <span className={isVerified ? "text-emerald-500" : "text-slate-400"}>
                {isVerified ? "Verified Node" : "Unverified Node"}
              </span> • {location}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onMessage}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 glow-green flex items-center gap-2"
        >
           <Icons.Message className="w-5 h-5" />
           Message Seller
        </button>
      </header>

      {/* Seller Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
            <Icons.Shop className="w-10 h-10 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{sellerListings.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Listings</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-4">
            <Icons.Star className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{isVerified ? "4.9/5" : "N/A"}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Score</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4">
            <Icons.Calendar className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">Jan '24</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Network Member</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Seller's Catalog</h3>
          <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 mx-6 h-0.5"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sellerListings.map((item) => (
            <div key={item.id} className="glass-card rounded-[2.5rem] p-8 group hover:border-emerald-400 transition-all duration-500 relative flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  {getItemIcon(item.type)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
                  item.category === 'Produce' ? 'border-emerald-100 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'border-amber-100 text-amber-600 bg-amber-50 dark:bg-amber-900/10'
                }`}>
                  {item.category}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{item.title}</h3>
                <div className="space-y-2 mb-8">
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                    <Icons.Package className="w-3.5 h-3.5 opacity-50" /> {item.quantity} Available
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 mt-auto">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Price per unit</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{item.price}</p>
                  </div>
                </div>
                
                <button 
                  onClick={onMessage}
                  className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-lg glow-green active:scale-95"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Contact CTA at bottom */}
      <div className="mt-16 bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to initiate procurement?</h3>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto font-medium">
              Start a secure neural link with {sellerName} to discuss bulk pricing, logistics coordination, or quality verification.
            </p>
            <button 
              onClick={onMessage}
              className="px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95 glow-green uppercase tracking-widest text-xs"
            >
               Open Direct Message
            </button>
         </div>
      </div>
    </div>
  );
};

export default SellerProfile;
