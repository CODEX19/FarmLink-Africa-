
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from './types.ts';
import { Icons } from '../constants.tsx';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Amina",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar"
];

const CameraModal: React.FC<{
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 512 }, height: { ideal: 512 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        
        // Draw centered square crop
        const startX = (videoRef.current.videoWidth - size) / 2;
        const startY = (videoRef.current.videoHeight - size) / 2;
        
        context.drawImage(videoRef.current, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Digital Snapshot</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Icons.ChevronLeft className="w-6 h-6 rotate-90 text-slate-400" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col items-center">
          {error ? (
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-center p-8">
              <p className="text-slate-500 font-bold">{error}</p>
            </div>
          ) : (
            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-black border-4 border-emerald-500/20 shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-[20px] border-slate-900/10 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full pointer-events-none animate-pulse"></div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-8 w-full flex gap-4">
             <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
             >
               Cancel
             </button>
             <button 
              onClick={handleCapture}
              disabled={!!error}
              className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
             >
               Capture Frame
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogoutConfirmModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 border border-rose-500/20 text-center">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Icons.Clock className="w-10 h-10 text-rose-500" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Disconnect Node?</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
        Are you sure you want to terminate your current neural session? You will need to re-authenticate to access the global farm network.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={onConfirm}
          className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/10 uppercase tracking-widest text-[10px]"
        >
          Confirm Disconnect
        </button>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState(user);
  const [isSaved, setIsSaved] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAvatarChange = (avatar: string) => {
    setFormData(prev => ({ ...prev, avatar }));
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {showCamera && (
        <CameraModal 
          onClose={() => setShowCamera(false)} 
          onCapture={handleAvatarChange} 
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal 
          onClose={() => setShowLogoutConfirm(false)} 
          onConfirm={onLogout} 
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*" 
      />

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Farm Settings</h2>
          <p className="text-slate-500 font-medium">Manage your digital farm identity and security.</p>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="px-6 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-500 rounded-2xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors border border-rose-100 dark:border-rose-900/30 flex items-center gap-2"
        >
          Disconnect Account
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
             <div className="relative group cursor-pointer mb-6" onClick={triggerFileUpload}>
                <img src={formData.avatar} alt="Profile" className="w-32 h-32 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 shadow-lg group-hover:opacity-80 transition-opacity object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-[2.5rem]">
                   <Icons.Package className="w-8 h-8 text-white" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform"
                >
                  <Icons.Camera className="w-5 h-5" />
                </button>
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name}</h3>
             <p className="text-sm text-slate-400 font-medium">{formData.email}</p>
             
             <div className="grid grid-cols-3 gap-3 mt-8">
                {PREDEFINED_AVATARS.map((avatar, idx) => (
                   <button 
                     key={idx}
                     type="button"
                     onClick={() => handleAvatarChange(avatar)}
                     className={`w-12 h-12 rounded-xl border-2 transition-all overflow-hidden ${formData.avatar === avatar ? 'border-emerald-500 scale-110 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                   >
                      <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
             <button 
              onClick={triggerFileUpload}
              className="mt-6 text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 tracking-widest transition-colors flex items-center gap-2"
             >
                <Icons.Package className="w-4 h-4" />
                Upload Custom File
             </button>
          </div>

          <div className="bg-[#4d7c0f] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
             <Icons.Leaf className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
             <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <Icons.Sparkles className="w-6 h-6" /> Farm Status
             </h4>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-70">Region</span>
                   <span className="text-sm font-black">{formData.location.split(',')[0]}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-70">Role</span>
                   <span className="text-sm font-black">{formData.role === 'farmer' ? 'Elite Farmer' : 'Direct Buyer'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-70">Trust Index</span>
                   <span className="text-sm font-black text-emerald-300">A+ Verified</span>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{formData.role === 'farmer' ? 'Farm Operation' : 'Organization Name'}</label>
                <input 
                  type="text" 
                  value={formData.farmName}
                  onChange={e => setFormData({...formData, farmName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Details</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
            />
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
             <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6">User Preferences</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-3">
                      <Icons.Sun className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Theme</span>
                   </div>
                   <select 
                     value={formData.preferences.theme}
                     onChange={e => handlePreferenceChange('theme', e.target.value)}
                     className="bg-white dark:bg-slate-700 border-none text-xs font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-white cursor-pointer"
                   >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="farmer">Farmer</option>
                   </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-3">
                      <Icons.Message className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Alerts</span>
                   </div>
                   <button 
                     type="button"
                     onClick={() => handlePreferenceChange('notifications', !formData.preferences.notifications)}
                     className={`w-12 h-6 rounded-full transition-colors relative ${formData.preferences.notifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.preferences.notifications ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4">
             {isSaved ? (
               <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in slide-in-from-left-2">
                  <Icons.Success className="w-5 h-5" />
                  Settings Synchronized
               </div>
             ) : <div />}
             <button 
               type="submit"
               className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 glow-green"
             >
               Update Profile
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
