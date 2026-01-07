
import React, { useState } from 'react';
import { Icons } from '../constants.tsx';

interface SignUpProps {
  onSignUp: (role: 'farmer' | 'buyer', details: { firstName: string, lastName: string, email: string, password?: string }) => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

const PolicyModal: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative animate-in zoom-in-95 border border-emerald-500/20 flex flex-col max-h-[85vh]">
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Icons.Leaf className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
          <Icons.ChevronLeft className="w-6 h-6 rotate-90 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
        {content}
      </div>
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl uppercase tracking-widest text-xs"
        >
          Acknowledge Protocol
        </button>
      </div>
    </div>
  </div>
);

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onNavigateToLogin, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInitialize = () => {
    if (agreed) {
      setStep(2);
    }
  };

  const handleIdentityCreation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Security Keys (Passwords) do not match. Protocol alignment failed.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Security Key must be at least 6 characters for neural encryption.");
      return;
    }

    setLoading(true);
    // Directly complete sign-up after identity validation
    setTimeout(() => {
      onSignUp(role, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
    }, 1800);
  };

  const termsContent = (
    <div className="space-y-6">
      <section>
        <h4 className="font-black text-emerald-600 uppercase tracking-widest text-[10px] mb-2">Protocol 01: Yield Sovereignty</h4>
        <p>You maintain 100% digital ownership of your crop data. FarmLink acts only as a neutral gateway for market liquidity. Your soil telemetry is your property.</p>
      </section>
      <section>
        <h4 className="font-black text-emerald-600 uppercase tracking-widest text-[10px] mb-2">Protocol 02: Market Integrity</h4>
        <p>Participation in the global marketplace requires verified yield honesty. Systematic listing of "Ghost Produce" results in immediate neural-link termination.</p>
      </section>
      <section className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-500/20">
        <h4 className="font-black text-emerald-600 uppercase tracking-widest text-[10px] mb-2">Protocol 03: Network Service Fees</h4>
        <p className="font-bold text-slate-800 dark:text-slate-200">
          To maintain the FarmLink Neural Infrastructure and Global Logistics Network, a standard <span className="text-emerald-600 font-black">10% commission fee</span> is applied to every successful transaction executed on the marketplace.
        </p>
        <p className="mt-2 text-[11px] opacity-70 italic">
          This fee covers end-to-end encryption, logistics coordination, and market grounding services.
        </p>
      </section>
    </div>
  );

  const privacyContent = (
    <div className="space-y-6">
      <section>
        <h4 className="font-black text-indigo-500 uppercase tracking-widest text-[10px] mb-2">Neural Encryption</h4>
        <p>All personal identification is processed through localized zero-knowledge proofs. We do not store your biological identity.</p>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-500">
      {activeModal === 'terms' && <PolicyModal title="Terms of Service" content={termsContent} onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PolicyModal title="Privacy Policy" content={privacyContent} onClose={() => setActiveModal(null)} />}

      <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800 rounded-t-[3.5rem] overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_#10b981]" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <button onClick={onBack} className="mb-10 text-xs font-black uppercase text-slate-400 hover:text-emerald-500 flex items-center gap-2 transition-colors tracking-widest">
          <Icons.ChevronLeft className="w-5 h-5" />
          Abort Uplink
        </button>
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Protocol Alignment</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Select your role in the FarmLink ecosystem.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <button 
                onClick={() => setRole('farmer')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'farmer' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-300'}`}
               >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'farmer' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                   <Icons.Leaf className="w-6 h-6" />
                 </div>
                 <span className="font-black text-xs uppercase tracking-widest">Farmer Node</span>
               </button>
               <button 
                onClick={() => setRole('buyer')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'buyer' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}`}
               >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'buyer' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                   <Icons.Shop className="w-6 h-6" />
                 </div>
                 <span className="font-black text-xs uppercase tracking-widest">Buyer Node</span>
               </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveModal('terms')} className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 transition-colors">Terms of Service</button>
                <button onClick={() => setActiveModal('privacy')} className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 transition-colors">Privacy Policy</button>
              </div>

              <div className="bg-slate-50 dark:bg-emerald-900/10 rounded-[2rem] p-6 border border-slate-100 dark:border-emerald-800/50">
                <div className="flex items-start gap-4">
                  <div className="relative mt-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)} 
                      className="peer absolute opacity-0 cursor-pointer w-6 h-6 z-10" 
                    />
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                      <Icons.Success className={`w-4 h-4 text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    I acknowledge that I have analyzed the{' '}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveModal('terms'); }}
                      className="text-emerald-600 underline hover:text-emerald-700 font-black cursor-pointer"
                    >
                      Terms of Service
                    </button>
                    , including the <span className="font-black">10% network commission</span> and the{' '}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveModal('privacy'); }}
                      className="text-emerald-600 underline hover:text-emerald-700 font-black cursor-pointer"
                    >
                      Privacy Policy
                    </button>.
                  </span>
                </div>
              </div>

              <button 
                onClick={handleInitialize}
                disabled={!agreed}
                className={`w-full py-5 text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs ${
                  agreed ? 'bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Initialize {role === 'farmer' ? 'Estate' : 'Procurement'}
                <Icons.ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleIdentityCreation} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Identity Creation</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{role === 'farmer' ? 'Farmer Node' : 'Buyer Node'} uplink active.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in zoom-in-95">
                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-relaxed">
                  Protocol Error: {error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Sarah" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:text-white font-bold" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Okonjo" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:text-white font-bold" 
                  />
               </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural ID (Email)</label>
              <input 
                required 
                type="email" 
                placeholder="sarah@farm.network" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:text-white font-bold" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:text-white font-bold" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Key</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 dark:text-white font-bold" 
                  />
               </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs futuristic-btn"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Complete Registration'}
            </button>

            <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest">
              Back to Protocols
            </button>
          </form>
        )}

        <div className="mt-10 text-center pt-8 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Already authenticated? <button onClick={onNavigateToLogin} className="text-emerald-600 font-bold hover:underline">Sign In</button></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
