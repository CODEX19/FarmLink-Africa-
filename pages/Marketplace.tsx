
import React, { useState } from 'react';
import { UserProfile } from './types.ts';
import { Icons } from '../constants.tsx';
import { getNearbyAgriNodes, generateNeuralSpeech } from './geminiService.ts';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: 'Produce' | 'Livestock';
  price: string;
  quantity: string;
  location: string;
  type: 'maize' | 'coffee' | 'cattle' | 'chicken' | 'cocoa' | 'goat' | 'corn';
  seller: string;
}

export const MOCK_LISTINGS: MarketplaceItem[] = [
  { id: '1', title: 'Premium White Maize', category: 'Produce', price: '₦2,400', quantity: '500 KG', location: 'Kaduna, Nigeria', type: 'maize', seller: 'Ahmed Musa' },
  { id: '2', title: 'Organic Arabica Coffee', category: 'Produce', price: 'KSh 12,000', quantity: '50 KG', location: 'Nyeri, Kenya', type: 'coffee', seller: 'Grace Wambui' },
  { id: '3', title: 'Brahman Cattle (M)', category: 'Livestock', price: 'R 15,500', quantity: '1 Unit', location: 'Gauteng, SA', type: 'cattle', seller: 'Johannes Van' },
  { id: '4', title: 'Layer Chickens (Bulk)', category: 'Livestock', price: 'GH₵ 4,200', quantity: '100 Units', location: 'Kumasi, Ghana', type: 'chicken', seller: 'Samuel Appiah' },
  { id: '5', title: 'Grade A Cocoa Beans', category: 'Produce', price: 'GH₵ 8,500', quantity: '200 KG', location: 'Western Region, Ghana', type: 'cocoa', seller: 'Nana Yaw' },
  { id: '6', title: 'Boer Goats', category: 'Livestock', price: 'R 2,800', quantity: '1 Unit', location: 'Free State, SA', type: 'goat', seller: 'Piet Botha' },
  { id: '7', title: 'Fresh Maize Cobs', category: 'Produce', price: '₦1,800', quantity: '200 KG', location: 'Kaduna, Nigeria', type: 'corn', seller: 'Ahmed Musa' },
];

interface MarketplaceProps {
  user: UserProfile;
  onSellerClick: (sellerName: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, onSellerClick }) => {
  const [filter, setFilter] = useState<'All' | 'Produce' | 'Livestock'>('All');
  const [search, setSearch] = useState('');
  const [isBidding, setIsBidding] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [mapNodes, setMapNodes] = useState<{text: string, sources: any[]} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredItems = MOCK_LISTINGS.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.location.toLowerCase().includes(search.toLowerCase()) ||
                          item.seller.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePlaceBid = (id: string) => {
    setIsBidding(id);
    setTimeout(() => {
      setIsBidding(null);
      alert("Bid protocol executed. You will be notified of the outcome.");
    }, 1500);
  };

  const handleBuyNow = (id: string) => {
    setIsBuying(id);
    setTimeout(() => {
      setIsBuying(null);
      alert("Transaction synchronized. Ownership transfer in progress.");
    }, 2000);
  };

  const scanNearbyHubs = async () => {
    if ("geolocation" in navigator) {
      setIsScanning(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const nodes = await getNearbyAgriNodes(pos.coords.latitude, pos.coords.longitude);
          setMapNodes(nodes);
        } catch (err) {
          console.error("Maps grounding failed", err);
        } finally {
          setIsScanning(false);
        }
      }, (err) => {
        console.error("Location access denied", err);
        setIsScanning(false);
        alert("Location access is required for geo-spatial marketplace features.");
      });
    }
  };

  const speakHubs = async () => {
    if (!mapNodes?.text || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await generateNeuralSpeech(mapNodes.text);
    } catch (err) {
      console.error("Neural speech error:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const getItemIcon = (type: MarketplaceItem['type']) => {
    switch(type) {
      case 'maize': return <Icons.Corn className="w-12 h-12" />;
      case 'coffee': return <Icons.Leaf className="w-12 h-12" />;
      case 'cattle': return <Icons.Cow className="w-12 h-12" />;
      case 'chicken': return <Icons.Chicken className="w-12 h-12" />;
      case 'cocoa': return <Icons.Leaf className="w-12 h-12" />;
      case 'goat': return <Icons.Cow className="w-12 h-12" />;
      case 'corn': return <Icons.Corn className="w-12 h-12" />;
      default: return <Icons.Leaf className="w-12 h-12" />;
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Global Marketplace</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg italic mt-1">Sourcing Africa's premium yields through verified nodes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={scanNearbyHubs}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-800 font-black text-xs uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-50"
          >
            <Icons.MapPin className={`w-5 h-5 ${isScanning ? 'animate-bounce' : ''}`} />
            {isScanning ? 'Scanning Matrix...' : 'Nearby Sourcing Hubs'}
          </button>
          {user.role === 'farmer' && (
            <button className="bg-slate-900 dark:bg-emerald-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-95">
              Initialize Listing
            </button>
          )}
        </div>
      </header>

      {mapNodes && (
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden animate-in zoom-in-95 group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                <Icons.Sparkles className="w-6 h-6" /> Local Trade Infrastructure
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={speakHubs}
                  className={`p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all ${isSpeaking ? 'animate-pulse glow-green' : ''}`}
                >
                  <Icons.AudioWave className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => setMapNodes(null)} className="p-2 text-white/60 hover:text-white">✕</button>
              </div>
            </div>
            <p className="text-sm font-medium mb-6 opacity-90 leading-relaxed italic">{mapNodes.text}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mapNodes.sources.map((source: any, i: number) => (
                <a 
                  key={i} 
                  href={source.maps?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{source.maps?.title || "Sourcing Hub"}</span>
                  <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 blur-3xl rounded-full"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 w-full sm:w-fit shadow-xl">
          {['All', 'Produce', 'Livestock'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 sm:flex-none px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative group flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search protocol data..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full focus:outline-none focus:border-emerald-500 shadow-xl font-bold text-sm dark:text-white transition-all"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
            <Icons.Search className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 group border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-500 relative flex flex-col h-full shadow-2xl hover:shadow-emerald-500/5">
            <div className="flex justify-between items-start mb-8">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden p-4">
                {getItemIcon(item.type)}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
                  item.category === 'Produce' ? 'border-emerald-100 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'border-amber-100 text-amber-600 bg-amber-50 dark:bg-amber-900/10'
                }`}>
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tighter">{item.title}</h3>
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Icons.MapPin className="w-4 h-4 opacity-70" /></div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{item.location}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Icons.Package className="w-4 h-4 opacity-70" /></div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{item.quantity} In Stock</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Icons.User className="w-4 h-4 opacity-70" /></div>
                   <button 
                     onClick={() => onSellerClick(item.seller)}
                     className="text-xs text-emerald-600 font-black hover:text-emerald-700 hover:underline transition-all uppercase tracking-widest"
                   >
                     {item.seller}
                   </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 mt-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">UNIT PRICE</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{item.price}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePlaceBid(item.id)} 
                  disabled={isBidding === item.id || isBuying === item.id} 
                  className="py-5 bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center relative overflow-hidden"
                >
                  {isBidding === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ANALYZING...</span>
                    </div>
                  ) : 'PLACE BID'}
                </button>
                <button 
                  onClick={() => handleBuyNow(item.id)} 
                  disabled={isBidding === item.id || isBuying === item.id} 
                  className="py-5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl glow-green active:scale-95 flex items-center justify-center relative overflow-hidden"
                >
                  {isBuying === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>SYNCING...</span>
                    </div>
                  ) : 'BUY NOW'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
