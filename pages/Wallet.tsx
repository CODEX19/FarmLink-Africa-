import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Transaction } from './types.ts';
import { Icons } from '../constants.tsx';

// Declare Paystack on the window object for TypeScript
declare global {
  interface Window {
    PaystackPop: any;
    paystack_failed?: boolean;
  }
}

interface Bank {
  name: string;
  code: string;
  active: boolean;
}

interface QuickActionModalProps {
  type: 'airtime' | 'sell' | 'withdraw' | 'topup';
  userEmail: string;
  currentBalance: number;
  currency: string;
  onClose: () => void;
  onSuccess: (msg: string, amount: number) => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ type, userEmail, currentBalance, currency, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0); // 0: input, 1: syncing, 2: gateway
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  
  const [formData, setFormData] = useState({ 
    phone: '', 
    amount: type === 'withdraw' ? '100' : '5000', 
    crop: 'Maize', 
    quantity: '10',
    method: 'Bank Transfer',
    bankAccount: '',
    bankCode: ''
  });

  const amountNum = Number(formData.amount);
  const isOverdraw = type === 'withdraw' && amountNum > currentBalance;
  const isAirtimeOverdraw = type === 'airtime' && amountNum > currentBalance;
  const isBelowLimit = type === 'withdraw' && amountNum < 100;

  // Paystack Configuration
  const PAYSTACK_PUBLIC_KEY = 'pk_live_8b68b1f81441d3e34dab40975f10feef3abeef2d';
  const PAYSTACK_SECRET_KEY = 'sk_live_7906ec9c1d0ad2900e566b3218be79576cce4010';
  const SECRET_AUTH_HEADER = { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` };

  // Fetch Banks List on Mount for Withdrawals
  useEffect(() => {
    if (type === 'withdraw') {
      fetchBanks();
    }
  }, [type]);

  const fetchBanks = async () => {
    setFetchingBanks(true);
    try {
      const response = await fetch('https://api.paystack.co/bank', {
        headers: SECRET_AUTH_HEADER
      });
      const data = await response.json();
      if (data.status && data.data) {
        setBanks(data.data);
      } else {
        setError("Failed to synchronize bank registry node.");
      }
    } catch (err) {
      setError("Network uplink lost during regional registry sync.");
    } finally {
      setFetchingBanks(false);
    }
  };

  /**
   * Integrated Logic: Step 1 (Get Bank Code by Name)
   */
  const getBankCode = async (bankName: string) => {
    try {
      const response = await fetch("https://api.paystack.co/bank", {
        headers: SECRET_AUTH_HEADER
      });
      const data = await response.json();
      
      const bank = data.data.find((b: any) => 
        b.name.toLowerCase().includes(bankName.toLowerCase())
      );

      if (!bank) throw new Error("Financial node (bank) not supported in this region.");
      return bank.code;
    } catch (error: any) {
      console.error("Neural Error: Bank registry query failed.", error.message);
      throw error;
    }
  };

  /**
   * Integrated Logic: Step 2 (Resolve Account)
   * Refined to provide specific error feedback from the gateway.
   */
  const resolveAccount = async (accountNumber: string, bankCode: string) => {
    try {
      const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: SECRET_AUTH_HEADER
      });
      const data = await response.json();

      if (data.status) {
        return {
          account_name: data.data.account_name,
          account_number: data.data.account_number,
          bank_code: bankCode
        };
      } else {
        // Pass through the specific message from Paystack API
        throw new Error(data.message || "Uplink rejected the account credentials.");
      }
    } catch (error: any) {
      console.error("Neural Error: Account resolution failed.", error.message);
      throw error;
    }
  };

  /**
   * Status Verification Logic
   */
  const verifyTransfer = async (transferId: string) => {
    try {
      const response = await fetch(`https://api.paystack.co/transfer/${transferId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
      const data = await response.json();
      console.debug("Telemetry Audit Log:", data); 
      return data;
    } catch (error: any) {
      console.error("Neural Error: Transfer verification failed.", error.message);
      return { status: false, message: "Verification uplink lost." };
    }
  };

  // Effect to resolve bank account automatically when details are sufficient
  useEffect(() => {
    if (type === 'withdraw' && formData.bankAccount.length === 10 && formData.bankCode.length >= 3) {
      const performResolution = async () => {
        setResolving(true);
        setError(null);
        try {
          const result = await resolveAccount(formData.bankAccount, formData.bankCode);
          setResolvedName(result.account_name);
          setError(null); // Clear errors on successful handshake
        } catch (err: any) {
          setError(err.message || "Identity could not be verified on the global ledger.");
          setResolvedName(null);
        } finally {
          setResolving(false);
        }
      };
      performResolution();
    } else {
      setResolvedName(null);
      // Don't clear error here if user is mid-typing, let the check logic handle it
    }
  }, [formData.bankAccount, formData.bankCode]);

  const createTransferRecipient = async () => {
    try {
      const response = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          ...SECRET_AUTH_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "nuban",
          name: resolvedName || "Neural Customer",
          account_number: formData.bankAccount,
          bank_code: formData.bankCode,
          currency: "NGN"
        })
      });
      return await response.json();
    } catch (err) {
      return { status: false, message: "Recipient node creation error." };
    }
  };

  const initiatePaystackTransfer = async (recipientCode: string) => {
    try {
      const response = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          ...SECRET_AUTH_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: "balance",
          amount: Math.floor(amountNum * 100), 
          recipient: recipientCode,
          reason: "capital exit from FarmLink Africa"
        })
      });
      return await response.json();
    } catch (err) {
      return { status: false, message: "Transfer protocol execution failure." };
    }
  };

  const triggerPaystackTopup = () => {
    if (!window.PaystackPop || window.paystack_failed) {
      setError("Regional Gateway Node Blocked. Please disable ad-blockers.");
      setHandshakeStep(0);
      setLoading(false);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: Math.floor(amountNum * 100), 
        currency: 'NGN', 
        ref: `FL-SYNC-${Date.now()}`,
        callback: (response: any) => {
          setLoading(false);
          onSuccess(`${currency}${amountNum.toLocaleString()} synchronized to ledger.`, amountNum);
          onClose();
        },
        onClose: () => {
          setLoading(false);
          setHandshakeStep(0);
        }
      });
      handler.openIframe();
    } catch (err) {
      setError("Sync Handshake Failed.");
      setHandshakeStep(0);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverdraw || isAirtimeOverdraw) {
        setError("Insufficient ledger liquidity for this operation.");
        return;
    }
    if (isBelowLimit) {
        setError("Minimum withdrawal protocol limit is 100 units.");
        return;
    }

    setLoading(true);
    setError(null);
    
    if (type === 'topup') {
      setHandshakeStep(1);
      setTimeout(() => {
        setHandshakeStep(2);
        triggerPaystackTopup();
      }, 1500);
      return;
    }

    if (type === 'withdraw') {
      if (!resolvedName) {
        setError("Please provide a valid, resolved financial node.");
        setLoading(false);
        return;
      }

      // Chain of Neural Ops
      const recipientResult = await createTransferRecipient();
      if (!recipientResult.status) {
        setError(recipientResult.message || "Failed to create recipient node.");
        setLoading(false);
        return;
      }

      const recipientCode = recipientResult.data.recipient_code;

      const transferResult = await initiatePaystackTransfer(recipientCode);
      if (!transferResult.status) {
        setError(transferResult.message || "Protocol rejected by gateway.");
        setLoading(false);
        return;
      }

      const transferId = transferResult.data.id;
      const verificationResult = await verifyTransfer(transferId);
      
      if (verificationResult.status) {
        console.debug("Neural Logic: Verification confirmed.", verificationResult.data.status);
      }

      setLoading(false);
      onSuccess(`Capital Exit of ${currency}${amountNum.toLocaleString()} dispatched to ${resolvedName}.`, amountNum);
      onClose();
      return;
    }

    // Default simulation for airtime/selling
    setTimeout(() => {
      setLoading(false);
      onSuccess('Protocol sequence complete.', amountNum);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 border border-white/10">
        
        <div className={`p-10 text-white relative overflow-hidden ${
          type === 'topup' ? 'bg-emerald-600' : 
          type === 'withdraw' ? 'bg-rose-600' : 'bg-indigo-600'
        }`}>
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tighter uppercase">
              {type === 'topup' ? 'Ledger Sync' : type === 'withdraw' ? 'Capital Exit' : 'Fin-Protocol'}
            </h3>
            <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.3em] mt-2">Secured Node Connection</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="p-10 space-y-6">
          {handshakeStep === 1 ? (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in fade-in">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icons.Sparkles className="w-10 h-10 text-emerald-500 animate-pulse" />
                  </div>
               </div>
               <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Neural Handshake</h4>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Negotiating node permissions...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                   <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {type === 'topup' ? 'Deposit Value' : 'Withdrawal Value'} ({currency})
                </label>
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 focus:border-emerald-500 outline-none font-black text-xl text-slate-900 dark:text-white transition-all shadow-inner"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-black text-slate-400">CREDITS</span>
                  </div>
                </div>
                {type === 'withdraw' && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Limit Threshold: 100 Credits</p>}
              </div>

              {type === 'withdraw' && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Local Hub (Bank)</label>
                    <div className="relative">
                      <select 
                        required 
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none cursor-pointer"
                        value={formData.bankCode} 
                        onChange={e => setFormData({...formData, bankCode: e.target.value})}
                        disabled={fetchingBanks}
                      >
                        <option value="">{fetchingBanks ? 'Syncing registry...' : 'Select Financial Node'}</option>
                        {banks.map(bank => (
                          <option key={bank.code} value={bank.code}>{bank.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <Icons.ChevronLeft className="w-4 h-4 rotate-[270deg]" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                    <input 
                        required 
                        type="text" 
                        maxLength={10}
                        placeholder="0123456789"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 focus:border-emerald-500 outline-none font-bold text-slate-900 dark:text-white shadow-inner"
                        value={formData.bankAccount} 
                        onChange={e => setFormData({...formData, bankAccount: e.target.value})} 
                    />
                  </div>
                  {resolving && <p className="text-[10px] font-black text-emerald-500 animate-pulse uppercase tracking-widest ml-1">Querying central ledger...</p>}
                  {resolvedName && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
                        <Icons.Success className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{resolvedName}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 dark:bg-slate-900 text-slate-500 font-black rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-[10px]">Abort</button>
                <button 
                  type="submit" 
                  disabled={loading || isOverdraw || isBelowLimit || (type === 'withdraw' && !resolvedName)} 
                  className={`flex-1 py-5 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest text-[10px] ${
                    type === 'topup' ? 'bg-emerald-600 hover:bg-emerald-700 glow-green' : 
                    type === 'withdraw' ? 'bg-rose-600 hover:bg-rose-700 glow-rose' : 'bg-slate-900'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Executing...</span>
                    </div>
                  ) : 'Confirm Sync'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Wallet: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeModal, setActiveModal] = useState<'airtime' | 'sell' | 'withdraw' | 'topup' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currency = useMemo(() => {
    const loc = user.location.toLowerCase();
    if (loc.includes('kenya')) return 'KSh';
    if (loc.includes('nigeria')) return '₦';
    if (loc.includes('south africa')) return 'R';
    if (loc.includes('ghana')) return 'GH₵';
    return '$';
  }, [user.location]);

  useEffect(() => {
    const savedBalance = localStorage.getItem(`farmlink_balance_${user.email}`);
    if (savedBalance) setBalance(Number(savedBalance));
    const savedTxs = localStorage.getItem(`farmlink_txs_${user.email}`);
    if (savedTxs) setTransactions(JSON.parse(savedTxs));
  }, [user.email]);

  const triggerSuccess = (msg: string, amount: number) => {
    setToast(msg);
    let newBalance = balance;
    let txType: 'incoming' | 'outgoing' = 'incoming';
    let itemLabel = msg;

    if (msg.toLowerCase().includes('synchronized') || msg.toLowerCase().includes('added')) {
      newBalance += amount;
      txType = 'incoming';
      itemLabel = 'Digital Sourcing (Paystack)';
    } else if (msg.toLowerCase().includes('dispatched') || msg.toLowerCase().includes('withdrawal')) {
      newBalance -= amount;
      txType = 'outgoing';
      itemLabel = 'Capital Disbursement';
    } else if (msg.toLowerCase().includes('recharge')) {
      newBalance -= amount;
      txType = 'outgoing';
      itemLabel = 'Airtime Provisioning';
    }

    setBalance(newBalance);
    localStorage.setItem(`farmlink_balance_${user.email}`, newBalance.toString());
    const newTx: Transaction = {
      id: `FLTX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: txType,
      amount: amount,
      item: itemLabel,
      date: new Date().toISOString(),
      status: 'completed'
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem(`farmlink_txs_${user.email}`, JSON.stringify(updatedTxs));
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {toast && (
        <div className="fixed top-8 right-8 z-[200] bg-slate-900 dark:bg-emerald-950 text-white px-8 py-5 rounded-[2rem] shadow-2xl border border-emerald-500/30 animate-in slide-in-from-right-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <Icons.Success className="w-6 h-6 text-white" />
          </div>
          <p className="font-black text-sm tracking-tight uppercase tracking-widest">{toast}</p>
        </div>
      )}

      {activeModal && (
        <QuickActionModal 
          type={activeModal} 
          userEmail={user.email}
          currentBalance={balance}
          currency={currency}
          onClose={() => setActiveModal(null)} 
          onSuccess={triggerSuccess} 
        />
      )}

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Liquid Assets</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">Sourcing and provisioning your continental credits.</p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2 justify-end">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Node Online
              </p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl flex flex-col justify-between h-[500px] relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
               <div className="w-16 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center backdrop-blur-md">
                 <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                   <Icons.Sparkles className="w-4 h-4 text-amber-500" />
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Farmlink Node ID</p>
                  <p className="text-xs font-mono text-emerald-500">**** **** **** 8842</p>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Current Balance</p>
               <div className="flex items-center justify-between">
                  <h3 className="text-6xl font-black tracking-tighter font-mono flex items-baseline gap-2">
                    <span className="text-2xl text-emerald-500">{currency}</span>
                    {isBalanceVisible ? balance.toLocaleString() : '••••••'}
                  </h3>
                  <button 
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                  >
                    {isBalanceVisible ? <Icons.Eye className="w-5 h-5 opacity-60" /> : <Icons.EyeOff className="w-5 h-5 opacity-60" />}
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <button 
              onClick={() => setActiveModal('topup')}
              className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs glow-green"
            >
              Deposit via Paystack
            </button>
            <button 
              onClick={() => setActiveModal('withdraw')}
              className="w-full py-5 bg-white/5 text-white font-black rounded-3xl border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
           <div 
             onClick={() => setActiveModal('airtime')}
             className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-indigo-400 transition-all duration-500 cursor-pointer flex flex-col justify-between"
           >
              <div>
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Message className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Sync Airtime</h4>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Instant recharge protocol for any African regional network.</p>
              </div>
              <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-10">
                Provision Credits <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
           </div>

           <div 
             onClick={() => setActiveModal('sell')}
             className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-amber-400 transition-all duration-500 cursor-pointer flex flex-col justify-between"
           >
              <div>
                <div className="w-16 h-16 bg-amber-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Leaf className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Trade Assets</h4>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Liquidate produce into wallet credits via the market network.</p>
              </div>
              <div className="flex items-center gap-3 text-amber-600 font-black text-[10px] uppercase tracking-widest mt-10">
                Execute Trade <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
           </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Ledger Registry</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> 
              Live Node Transactions
            </p>
          </div>
          <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
             Download Secure Audit
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/30 dark:bg-slate-950/30">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Flux Hash</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Operation</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
               {transactions.length > 0 ? (
                 transactions.map((tx) => (
                   <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                     <td className="px-10 py-8">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono group-hover:text-emerald-500 transition-colors">#{tx.id}</span>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${tx.type === 'incoming' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                              <span className="font-bold text-lg">{tx.type === 'incoming' ? '↙' : '↗'}</span>
                           </div>
                           <p className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">{tx.item}</p>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </td>
                     <td className="px-10 py-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                           {tx.status}
                        </span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <p className={`text-xl font-black tracking-tighter ${tx.type === 'incoming' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {tx.type === 'incoming' ? '+' : '-'} {currency}{tx.amount.toLocaleString()}
                        </p>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="opacity-20 flex flex-col items-center gap-6">
                         <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center">
                            <Icons.Wallet className="w-12 h-12" />
                         </div>
                         <p className="font-black uppercase tracking-[0.3em] text-xs">Initial ledger sync required...</p>
                      </div>
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Wallet;
