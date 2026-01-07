
import React, { useState, useEffect } from 'react';
import { UserProfile, ViewState, OfflineAction } from './pages/types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import BuyerDashboard from './pages/BuyerDashboard.tsx';
import Wallet from './pages/Wallet.tsx';
import Profile from './pages/Profile.tsx';
import Logistics from './pages/Logistics.tsx';
import Messages from './pages/Messages.tsx';
import About from './pages/About.tsx';
import HowItWorks from './pages/HowItWorks.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import FarmingCalendar from './pages/FarmingCalendar.tsx';
import CommunityHub from './pages/CommunityHub.tsx';
import Marketplace from './pages/Marketplace.tsx';
import SellerProfile from './pages/SellerProfile.tsx';
import AIChatBot from './components/AIChatBot.tsx';
import { Icons } from './constants.tsx';

// Internal type for registry to store passwords
interface RegistryEntry extends UserProfile {
  password?: string;
}

const INITIAL_USER: UserProfile = {
  name: "Sarah Okonjo",
  email: "sarah.farm@example.com",
  farmName: "Green Valley Heights",
  location: "Lagos State, Nigeria",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  role: 'farmer',
  preferences: {
    language: 'English',
    notifications: true,
    theme: 'light',
  }
};

type Resolution = 'MOBILE' | 'TABLET' | 'LAPTOP';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>('about');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [initialConvId, setInitialConvId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>('LAPTOP');

  // Load active session and registry
  useEffect(() => {
    const savedActiveUser = localStorage.getItem('farmlink_active_user');
    if (savedActiveUser) {
      try {
        const parsed = JSON.parse(savedActiveUser);
        setUser(parsed);
        setIsAuthenticated(true);
        setView(parsed.role === 'buyer' ? 'buyer-dashboard' : 'dashboard');
      } catch (e) {
        console.error("Session restoration failed", e);
      }
    }

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setResolution('MOBILE');
      else if (width < 1024) setResolution('TABLET');
      else setResolution('LAPTOP');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);

    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  const processSyncQueue = async () => {
    const queueJson = localStorage.getItem('farmlink_sync_queue');
    if (!queueJson) return;
    try {
      const queue: OfflineAction[] = JSON.parse(queueJson);
      if (queue.length === 0) return;
      setIsSyncing(true);
      for (const action of queue) {
        await new Promise(r => setTimeout(r, 500));
      }
      localStorage.setItem('farmlink_sync_queue', '[]');
      setIsSyncing(false);
      window.dispatchEvent(new Event('farmlink_sync_complete'));
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themes = ['light', 'dark', 'farmer'];
    root.classList.remove(...themes);
    body.classList.remove(...themes);
    root.classList.add(user.preferences.theme);
    body.classList.add(user.preferences.theme);
  }, [user.preferences.theme]);

  const handleLogin = (email: string, password?: string) => {
    const registry: RegistryEntry[] = JSON.parse(localStorage.getItem('farmlink_registry') || '[]');
    const entry = registry.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (entry) {
      // If a password was provided during the login UI flow, verify it
      if (password && entry.password && entry.password !== password) {
        throw new Error("INVALID_CREDENTIALS");
      }
      
      const { password: _, ...userWithoutPassword } = entry;
      setUser(userWithoutPassword);
      localStorage.setItem('farmlink_active_user', JSON.stringify(userWithoutPassword));
      setIsAuthenticated(true);
      setView(entry.role === 'buyer' ? 'buyer-dashboard' : 'dashboard');
    } else {
      throw new Error("NODE_NOT_FOUND");
    }
  };

  const handleSignUp = (role: 'farmer' | 'buyer', details: { firstName: string, lastName: string, email: string, password?: string }) => {
    const registry: RegistryEntry[] = JSON.parse(localStorage.getItem('farmlink_registry') || '[]');
    
    const newUser: RegistryEntry = { 
      ...INITIAL_USER,
      name: `${details.firstName} ${details.lastName}`.trim(),
      email: details.email,
      role,
      password: details.password,
      farmName: role === 'farmer' ? `${details.lastName} Estates` : `${details.lastName} Procurement`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${details.firstName}`,
    };

    // Update Registry
    const updatedRegistry = [...registry.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser];
    localStorage.setItem('farmlink_registry', JSON.stringify(updatedRegistry));
    
    // Set Active Session (omitting password from session)
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('farmlink_active_user', JSON.stringify(userWithoutPassword));
    setIsAuthenticated(true);
    setView(role === 'buyer' ? 'buyer-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('farmlink_active_user');
    setIsAuthenticated(false);
    setView('about');
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('farmlink_active_user', JSON.stringify(newUser));
      
      // Also update the registry so data persists across logins
      const registry: RegistryEntry[] = JSON.parse(localStorage.getItem('farmlink_registry') || '[]');
      const updatedRegistry = registry.map((u) => 
        u.email === newUser.email ? { ...u, ...updates } : u
      );
      localStorage.setItem('farmlink_registry', JSON.stringify(updatedRegistry));
      
      return newUser;
    });
  };

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const handleSellerClick = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setView('seller-profile');
  };
  const handleMessageSeller = (sellerName: string) => {
    setInitialConvId(sellerName);
    setView('messages');
  };

  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-10">
          <div className="relative">
            <div className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full animate-pulse"></div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">FarmLink</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing {resolution} Protocol...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (view === 'login') return <Login onLogin={handleLogin} onNavigateToSignUp={() => setView('signup')} onBack={() => setView('about')} />;
    if (view === 'signup') return <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setView('login')} onBack={() => setView('about')} />;
    if (view === 'how-it-works') return <HowItWorks onBack={() => setView('about')} onSignUp={() => setView('signup')} />;
    return <About onLogin={() => setView('login')} onSignUp={() => setView('signup')} onHowItWorks={() => setView('how-it-works')} />;
  }

  const isMobile = resolution === 'MOBILE';
  const isTablet = resolution === 'TABLET';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isMobile ? 'flex-col' : 'flex-row'} bg-slate-50 dark:bg-slate-950`}>
      {!isMobile && (
        <Sidebar 
          activeView={view === 'seller-profile' ? 'marketplace' : view} 
          onNavigate={setView} 
          onLogout={handleLogout} 
          isExpanded={isSidebarExpanded && !isTablet}
          onToggle={toggleSidebar}
          isOnline={isOnline}
          isSyncing={isSyncing}
          resolution={resolution}
          userRole={user.role}
        />
      )}
      
      <main className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 ease-in-out ${isMobile ? 'pb-28 pt-6 px-4' : isTablet ? 'ml-24 p-8' : isSidebarExpanded ? 'ml-64 p-12' : 'ml-24 p-12'}`}>
        <div className="max-w-7xl mx-auto relative">
          {view === 'dashboard' && <Dashboard user={user} isOnline={isOnline} isSyncing={isSyncing} />}
          {view === 'buyer-dashboard' && <BuyerDashboard user={user} />}
          {view === 'marketplace' && <Marketplace user={user} onSellerClick={handleSellerClick} />}
          {view === 'seller-profile' && selectedSeller && (
            <SellerProfile sellerName={selectedSeller} onBack={() => setView('marketplace')} onMessage={() => handleMessageSeller(selectedSeller)} />
          )}
          {view === 'farming-calendar' && <FarmingCalendar user={user} isOnline={isOnline} />}
          {view === 'community-hub' && <CommunityHub user={user} resolution={resolution} />}
          {view === 'wallet' && <Wallet user={user} />}
          {view === 'logistics' && <Logistics resolution={resolution} />}
          {view === 'messages' && <Messages isOnline={isOnline} initialConversationId={initialConvId} onClearInitial={() => setInitialConvId(null)} />}
          {view === 'profile' && <Profile user={user} onUpdate={handleUpdateUser} onLogout={handleLogout} />}
        </div>
      </main>

      <AIChatBot />

      {isMobile && (
        <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10">
          <nav className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            {[
              { id: user.role === 'buyer' ? 'buyer-dashboard' : 'dashboard', Icon: Icons.Home },
              { id: 'marketplace', Icon: Icons.Shop },
              { id: 'messages', Icon: Icons.Message },
              { id: 'profile', Icon: Icons.User },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${view === item.id ? 'bg-emerald-600 scale-110 shadow-lg glow-green' : 'text-white/40'}`}
              >
                <item.Icon className={`w-6 h-6 ${view === item.id ? 'brightness-200' : 'opacity-40 grayscale transition-all'}`} />
              </button>
            ))}
            <button onClick={() => setView('wallet')} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl -translate-y-4 border-4 border-slate-900 active:scale-90 transition-all">
              <Icons.Wallet className="w-8 h-8 text-slate-900" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
