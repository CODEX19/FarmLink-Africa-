
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface LogisticsProps {
  resolution?: 'MOBILE' | 'TABLET' | 'LAPTOP';
}

interface FleetVehicle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'transit' | 'delayed' | 'loading';
  progress: number;
  speed: number;
}

const TelemetryLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const potentialLogs = [
    "Uplink: Satellite Link Alpha Stable",
    "Node: Lagos-H5 Operational",
    "Fleet: V-442 weight sensor calibrated",
    "Weather: Optimal corridor identified",
    "AI: Route optimization complete",
    "Hub: Cold storage capacity 88%",
    "Log: Driver #92 biometric verified",
    "Telemetry: Fuel efficiency +12%",
    "GPS: Coordinate drift corrected",
    "Cargo: Temp stabilized at 4°C"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${potentialLogs[Math.floor(Math.random() * potentialLogs.length)]}`, 
        ...prev
      ].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {logs.map((log, i) => (
        <div key={i} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-500/60 animate-in slide-in-from-bottom-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
          {log}
        </div>
      ))}
    </div>
  );
};

const FleetTrackerMap = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    { id: 'V-442', name: 'Lagos-Abuja Express', lat: 30, lng: 40, status: 'transit', progress: 45, speed: 65 },
    { id: 'V-108', name: 'Kano Supply Link', lat: 70, lng: 20, status: 'transit', progress: 12, speed: 82 },
    { id: 'V-892', name: 'Coastal Cold-Chain', lat: 20, lng: 80, status: 'delayed', progress: 88, speed: 0 },
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(vehicles[0]);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status !== 'transit') return v;
        const newProgress = (v.progress + 0.5) % 100;
        // Move slightly in a diagonal path for visual effect
        return { 
          ...v, 
          progress: newProgress,
          lat: v.lat + (Math.random() - 0.5) * 0.2,
          lng: v.lng + (Math.random() - 0.5) * 0.2
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl group">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Futuristic Map Paths (Abstracted UI Map) */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M10,20 Q30,10 50,40 T90,30" stroke="#10b981" fill="none" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M20,80 Q40,60 60,90 T80,70" stroke="#6366f1" fill="none" strokeWidth="0.5" strokeDasharray="1 1" />
        <circle cx="50" cy="50" r="30" stroke="white" fill="none" strokeWidth="0.1" />
        <circle cx="50" cy="50" r="45" stroke="white" fill="none" strokeWidth="0.05" />
      </svg>

      {/* Fleet Nodes */}
      {vehicles.map(v => (
        <div 
          key={v.id}
          className={`absolute transition-all duration-1000 cursor-pointer ${selectedVehicle?.id === v.id ? 'z-50' : 'z-10'}`}
          style={{ left: `${v.lng}%`, top: `${v.lat}%` }}
          onClick={() => setSelectedVehicle(v)}
        >
          <div className="relative">
            {v.status === 'transit' && (
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping"></div>
            )}
            <div className={`p-2 rounded-xl border ${selectedVehicle?.id === v.id ? 'bg-emerald-500 border-white shadow-[0_0_20px_#10b981]' : 'bg-slate-900 border-white/10 opacity-70'} transition-all hover:scale-125`}>
              <Icons.Truck className={`w-5 h-5 ${selectedVehicle?.id === v.id ? 'text-white' : 'text-emerald-500'}`} />
            </div>
            {selectedVehicle?.id === v.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 border border-white/10 px-3 py-1 rounded-lg shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95">
                <p className="text-[8px] font-black text-white uppercase tracking-widest">{v.name}</p>
                <p className="text-[7px] text-emerald-400 font-bold">{v.speed} KM/H • {Math.round(v.progress)}% COMPLETE</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Interactive Hub Points */}
      <div className="absolute top-1/4 left-1/4 group/hub">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
        <div className="absolute -top-10 -left-1/2 opacity-0 group-hover/hub:opacity-100 transition-opacity bg-slate-900/90 p-2 rounded-lg border border-white/10 whitespace-nowrap">
          <p className="text-[8px] font-black text-white">HUB_LAGOS_NORTH</p>
        </div>
      </div>
      <div className="absolute bottom-1/3 right-1/4 group/hub">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]"></div>
        <div className="absolute -top-10 -left-1/2 opacity-0 group-hover/hub:opacity-100 transition-opacity bg-slate-900/90 p-2 rounded-lg border border-white/10 whitespace-nowrap">
          <p className="text-[8px] font-black text-white">HUB_NAIROBI_EAST</p>
        </div>
      </div>

      {/* UI Overlay: Live Telemetry */}
      <div className="absolute top-8 left-8 right-8 z-30 pointer-events-none flex justify-between items-start">
        <div className="space-y-4 pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Matrix Relay</p>
            <p className="text-lg font-black text-white tracking-tighter">AFRICA_GLOBAL_SYNC</p>
          </div>
          <TelemetryLog />
        </div>

        {selectedVehicle && (
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-2xl pointer-events-auto animate-in slide-in-from-right-10 w-64">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Icons.Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Active Vessel</p>
                <p className="font-black text-white leading-none tracking-tight">{selectedVehicle.id}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Status</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{selectedVehicle.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Speed</span>
                <span className="text-[10px] font-black text-white">{selectedVehicle.speed} KM/H</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Payload</span>
                <span className="text-[10px] font-black text-white">Maize (Grade A)</span>
              </div>
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Progress</span>
                  <span className="text-[9px] font-black text-white">{Math.round(selectedVehicle.progress)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${selectedVehicle.progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scanning Line Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1 bg-emerald-500/20 shadow-[0_0_20px_#10b981] animate-scan-slow opacity-30"></div>
      </div>
    </div>
  );
};

const Logistics: React.FC<LogisticsProps> = ({ resolution = 'LAPTOP' }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [weight, setWeight] = useState(500);
  const [distance, setDistance] = useState(120);
  const isMobile = resolution === 'MOBILE';

  const estimatedCost = Math.round((weight * 0.5) + (distance * 2.5));

  const fleetNodes = [
    { name: 'Lagos North Hub', capacity: '88%', status: 'Peak', color: 'bg-rose-500' },
    { name: 'Abuja Central', capacity: '42%', status: 'Active', color: 'bg-emerald-500' },
    { name: 'Kano Storage', capacity: '15%', status: 'Optimal', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right duration-700 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Neural Logistics</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Real-time telemetry and fleet synchronization across the continent.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">Global Relay Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Main Tracking View */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="h-[500px] md:h-[600px]">
            <FleetTrackerMap />
          </div>

          {/* AI Route Calculator */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6 w-full">
              <div className="flex items-center gap-4 mb-4">
                <Icons.Sparkles className="w-8 h-8" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Neural Calculator</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payload Weight (KG)</label>
                  <input 
                    type="range" min="100" max="10000" step="100" 
                    value={weight} onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full accent-emerald-500" 
                  />
                  <p className="text-right font-black text-slate-700 dark:text-slate-300">{weight.toLocaleString()} KG</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Distance (KM)</label>
                  <input 
                    type="range" min="10" max="2000" step="10" 
                    value={distance} onChange={(e) => setDistance(parseInt(e.target.value))}
                    className="w-full accent-indigo-500" 
                  />
                  <p className="text-right font-black text-slate-700 dark:text-slate-300">{distance.toLocaleString()} KM</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 bg-slate-950 p-8 rounded-[2.5rem] text-white flex flex-col justify-center text-center border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Estimated Cost</p>
              <h4 className="text-4xl font-black tracking-tighter">₦ {estimatedCost.toLocaleString()}</h4>
              <p className="text-[8px] font-bold text-white/40 mt-4 uppercase">AI Optimized Fleet Rates</p>
            </div>
          </div>
        </div>

        {/* Sidebar Ops */}
        <div className="space-y-8 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <Icons.Globe className="w-6 h-6" />
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">Network Nodes</h4>
             </div>
             <div className="space-y-6">
                {fleetNodes.map(hub => (
                  <div key={hub.name} className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{hub.name}</p>
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                        hub.status === 'Peak' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                      }`}>
                        {hub.status}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full transition-all duration-1000 ${hub.color}`} style={{ width: hub.capacity }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/5">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
            <h4 className="font-black text-2xl mb-8 flex items-center gap-4 relative z-10">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                 <Icons.Wrench className="w-6 h-6 brightness-200" />
               </div>
               Active Fleet
            </h4>
            <div className="space-y-4 relative z-10">
               <button onClick={() => setShowRequestModal(true)} className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] flex items-center justify-between transition-all group/btn active:scale-95 shadow-lg">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center transition-transform group-hover/btn:scale-110">
                     <Icons.Package className="w-8 h-8 brightness-200" />
                   </div>
                   <div className="text-left">
                     <p className="font-bold text-base leading-none text-white">Heavy Haulage</p>
                     <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mt-2">10-Ton Limit</p>
                   </div>
                 </div>
                 <Icons.ChevronRight className="w-5 h-5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
               </button>
               <button onClick={() => setShowRequestModal(true)} className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] flex items-center justify-between transition-all group/btn active:scale-95 shadow-lg">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center transition-transform group-hover/btn:scale-110">
                     <Icons.Truck className="w-8 h-8 brightness-200" />
                   </div>
                   <div className="text-left">
                     <p className="font-bold text-base leading-none text-white">Cold Stream</p>
                     <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mt-2">Climate Control</p>
                   </div>
                 </div>
                 <Icons.ChevronRight className="w-5 h-5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
               </button>
            </div>
            
            <button onClick={() => setShowRequestModal(true)} className="w-full mt-10 py-5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-700 transition-all glow-green active:scale-95">
               New Pickup Request
            </button>
          </div>
        </div>
      </div>

      {/* Pickup Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Request Farm Pickup</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crop Type</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold dark:text-white">
                    <option>White Maize</option>
                    <option>Premium Cocoa</option>
                    <option>Arabica Coffee</option>
                    <option>Fresh Vegetables</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Weight (KG)</label>
                  <input type="number" defaultValue={weight} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Farm Gate Address</label>
                <input type="text" placeholder="G.P.S. / Physical Location" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pickup Schedule</label>
                <input type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold dark:text-white" />
              </div>
              
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Calculated Fare</p>
                   <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₦ {estimatedCost.toLocaleString()}</p>
                </div>
                <p className="text-[9px] text-slate-500 font-bold">Includes insurance & neural-link tracking.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { setShowRequestModal(false); alert("Request Broadcasted to Hub Network. Fleet V-442 is being redirected."); }}
                  className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all glow-green active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  Confirm Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logistics;
