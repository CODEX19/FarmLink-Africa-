
import React, { useState } from 'react';
import { Icons } from '../constants.tsx';

interface LoginProps {
  onLogin: (email: string, password?: string) => void;
  onNavigateToSignUp: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignUp, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'login' | 'reset' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (viewMode === 'reset') {
      setTimeout(() => {
        setLoading(false);
        setViewMode('success');
      }, 1500);
    } else if (viewMode === 'login') {
      // Direct Authentication Check
      setTimeout(() => {
        try {
          onLogin(email, password);
        } catch (err: any) {
          setLoading(false);
          if (err.message === "INVALID_CREDENTIALS") {
            setError("Incorrect Security Key. Identity verification failed.");
          } else if (err.message === "NODE_NOT_FOUND") {
            setError("Node not found. Please register to initialize uplink.");
          } else {
            setError("Authentication protocol failure. Try again.");
          }
        }
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <button 
          onClick={viewMode === 'login' ? onBack : () => { setViewMode('login'); setError(null); }} 
          className="mb-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 flex items-center gap-2 transition-all group"
        >
          <Icons.ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {viewMode === 'login' ? 'Abort Uplink' : 'Return to Identity'}
        </button>
        
        {viewMode === 'login' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Re-establish your connection to the FarmLink network.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in zoom-in-95">
                  <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-relaxed">
                    Error: {error}
                  </p>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Access ID (Email)</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@farm.network"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-600 focus:bg-white transition-all text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Security Key (Password)</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-600 focus:bg-white transition-all text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <label className="flex items-center gap-2 cursor-pointer group text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" />
                  <span>Maintain Link</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setViewMode('reset')}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs futuristic-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Authorize Identity'
                )}
              </button>
            </form>

            <div className="mt-10 text-center pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">New Node? <button onClick={onNavigateToSignUp} className="text-emerald-600 font-black hover:text-emerald-700 hover:underline transition-all">Synchronize Now</button></p>
            </div>
          </div>
        )}

        {viewMode === 'reset' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Password Recovery</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enter your Access ID to receive a secure neural reset packet.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Associated Email</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-600 focus:bg-white transition-all text-slate-900 dark:text-white font-bold"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs futuristic-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Dispatch Reset Packet'
                )}
              </button>

              <button 
                type="button"
                onClick={() => setViewMode('login')}
                className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors tracking-widest"
              >
                Cancel Retrieval
              </button>
            </form>
          </div>
        )}

        {viewMode === 'success' && (
          <div className="animate-in fade-in zoom-in-95 duration-700 text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/10">
               <Icons.Success className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Transmission Successful</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10">
              A secure reset sequence has been dispatched to <span className="text-slate-900 dark:text-white font-black">{email || 'your inbox'}</span>. Please follow the instructions to re-establish your link.
            </p>
            <button 
              onClick={() => setViewMode('login')}
              className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl uppercase tracking-[0.2em] text-xs"
            >
              Back to Login Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
