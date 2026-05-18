import React, { useState, useEffect, useRef } from 'react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { 
  MessageSquare, 
  Trophy, 
  Calendar, 
  Heart, 
  BookOpen, 
  LogOut, 
  Crown,
  CheckCircle2,
  Mic,
  MessageCircle,
  Menu,
  ChevronRight,
  User as UserIcon,
  Settings,
  CreditCard,
  ChevronDown,
  Star,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './lib/translations';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Steps from './components/Steps';
import Gratitudes from './components/Gratitudes';
import Profile from './components/Profile';
import Landing from './components/Landing';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'steps' | 'gratitudes' | 'profile'>('dashboard');
  const [chatTrigger, setChatTrigger] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    sobrietyDays: '0',
    recoveryStartDate: new Date().toISOString().split('T')[0],
    birthDate: '1990-01-01',
    currentStep: '1'
  });

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [lang, setLang] = useState<Language>('fr');
  const t = translations[lang];

  useEffect(() => {
    // Handle payment success (real or mock)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' || urlParams.get('mock_success') === 'true') {
      const handleSuccess = async () => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, { isPremium: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }
        window.history.replaceState({}, '', window.location.pathname);
      };
      handleSuccess();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let unsubscribeDoc: (() => void) | undefined;

    const initUserData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          return;
        }
        
        if (!userSnap.exists()) {
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            points: 0,
            isPremium: false,
            requestCount: 0,
            completedSteps: [],
            lastSobrietyCheck: new Date().toISOString(),
            sobrietyDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(userRef, initialData);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
          }
          setUserData(initialData);
        }
        
        // Setup real-time listener
        unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserData(data);
            if (data.language) setLang(data.language as Language);
            // Trigger onboarding if fields are missing
            if (!data.recoveryStartDate) {
              setShowOnboarding(true);
            }
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });
      } catch (err) {
        console.error("Init user data error:", err);
        setLoading(false);
      }
    };

    initUserData();
    
    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [user]);

  const toggleLanguage = async () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { language: newLang });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-natural-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-natural-primary border-t-natural-secondary shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
          <p className="text-natural-secondary font-serif italic animate-pulse tracking-wide">{lang === 'fr' ? 'Un jour à la fois...' : 'One day at a time...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Calendar },
    { id: 'chat', label: t.sponsor, icon: MessageCircle },
    { id: 'steps', label: t.steps, icon: Trophy },
    { id: 'gratitudes', label: t.gratitudes, icon: Heart },
  ];

  return (
    <div className="flex min-h-screen bg-natural-bg text-natural-ink font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-natural-ink/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r border-natural-line bg-natural-sidebar flex flex-col z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-natural-primary/20">
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-natural-ink">Sérénité AI</span>
                <span className="px-1.5 py-0.5 bg-natural-primary/10 text-natural-primary text-[8px] font-black rounded-md uppercase tracking-widest">Beta</span>
              </div>
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-natural-secondary">Parrain Virtuel</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-natural-accent hover:text-natural-ink transition-colors"
            aria-label="Fermer le menu"
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 relative group ${
                activeTab === item.id 
                  ? 'bg-natural-primary text-white shadow-lg shadow-natural-primary/20' 
                  : 'text-natural-accent hover:bg-natural-primary/5 hover:text-natural-ink'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-natural-primary group-hover:text-natural-secondary'}`} />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-xl bg-natural-primary/10 -z-10" />
              )}
            </button>
          ))}

          {/* Mini Steps Preview */}
          <div className="mt-8 px-4 py-6 border-t border-natural-line/50">
            <h3 className="text-[10px] font-bold text-natural-accent uppercase tracking-[0.2em] mb-4">Étapes</h3>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                    (userData?.completedSteps || []).includes(i + 1)
                      ? 'bg-natural-primary text-white border-transparent'
                      : 'bg-white text-natural-accent border-natural-line'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto space-y-4">
          <div className="rounded-2xl glass p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-accent">Sobriété</span>
              <Trophy className="h-4 w-4 text-natural-secondary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-natural-ink">{userData?.points || 0}</span>
              <span className="text-[10px] font-bold text-natural-accent uppercase tracking-wider">Points acquis</span>
            </div>
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-natural-accent hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-natural-line flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-natural-primary hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 bg-natural-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <div className="flex flex-col">
                <span className="font-bold text-natural-ink tracking-tight text-sm">Sérénité AI</span>
                <span className="text-[8px] font-black text-natural-primary uppercase tracking-widest">Beta</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block text-natural-accent text-sm font-bold italic opacity-60">
            "{t.oneDayAtATime}"
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 p-2 hover:bg-natural-primary/5 rounded-lg transition-all text-natural-primary font-bold text-xs"
            >
              <Languages size={16} />
              <span className="uppercase">{lang}</span>
            </button>
            {!userData?.isPremium && (
              <button 
                onClick={() => handleUpgrade()}
                disabled={isUpgrading}
                className="text-[10px] font-bold uppercase tracking-widest text-natural-secondary hover:text-white transition-all py-2 px-6 rounded-full border border-natural-secondary bg-natural-secondary/10 hover:bg-natural-secondary shadow-lg shadow-natural-secondary/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpgrading && <div className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />}
                {isUpgrading ? t.loading : t.premium}
              </button>
            )}
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 border-l border-natural-line pl-6 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-natural-ink leading-none">{user.displayName?.split(' ')[0]}</p>
                  <p className="text-[10px] text-natural-secondary font-bold uppercase tracking-widest mt-1">
                    {userData?.isPremium ? 'Premium' : 'Gratuit'}
                  </p>
                </div>
                <div className="relative">
                  <img src={user.photoURL || ''} className="h-10 w-10 rounded-full border-2 border-natural-primary/50 shadow-lg" alt="" referrerPolicy="no-referrer" />
                  {userData?.isPremium && <Crown size={12} className="absolute -top-1 -right-1 text-natural-secondary fill-natural-secondary drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" />}
                </div>
                <ChevronDown size={14} className={`text-natural-accent transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 glass rounded-2xl border border-white/10 shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="p-4 border-b border-natural-line bg-natural-sidebar">
                      <p className="text-sm font-bold text-natural-ink">{user.displayName}</p>
                      <p className="text-xs text-natural-accent truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-natural-accent hover:bg-natural-primary/5 hover:text-natural-ink rounded-xl transition-all"
                      >
                        <UserIcon size={18} />
                        {t.profile}
                      </button>
                      <button 
                        onClick={() => { handleBillingPortal(); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-natural-accent hover:bg-natural-primary/5 hover:text-natural-ink rounded-xl transition-all"
                      >
                        <CreditCard size={18} />
                        {t.billing}
                      </button>
                      <div className="h-px bg-natural-line my-2" />
                      <button 
                        onClick={() => auth.signOut()}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                        {t.logout}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  userData={userData} 
                  lang={lang}
                  onReviewDay={() => { setChatTrigger('daily_review'); setActiveTab('chat'); }} 
                  onSwitchTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'chat' && <Chat user={user} userData={userData} lang={lang} trigger={chatTrigger} onTriggerHandled={() => setChatTrigger(null)} />}
              {activeTab === 'steps' && <Steps user={user} userData={userData} lang={lang} />}
              {activeTab === 'gratitudes' && <Gratitudes user={user} userData={userData} lang={lang} />}
              {activeTab === 'profile' && <Profile user={user} userData={userData} lang={lang} onUpgrade={handleUpgrade} onPortal={handleBillingPortal} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden border-t border-natural-line bg-white px-8 py-4 flex justify-between items-center sticky bottom-0 z-10 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === item.id ? 'text-natural-primary scale-110' : 'text-natural-accent opacity-40'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[9px] uppercase font-bold tracking-[0.15em]">{item.label}</span>
            </button>
          ))}
        </nav>
        {/* Onboarding Modal */}
        <AnimatePresence>
          {showOnboarding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-natural-ink/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-natural-line"
              >
                <div className="text-center space-y-4 mb-8">
                  <div className="h-16 w-16 bg-natural-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-natural-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif italic text-natural-ink">{t.welcomeJourney}</h2>
                  <p className="text-sm text-natural-accent">{t.onboardingDesc}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-3">{t.sobrietyDaysLabel}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={onboardingData.sobrietyDays}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, sobrietyDays: e.target.value }))}
                      className="w-full bg-natural-sidebar border border-natural-line rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-bold text-center text-2xl"
                    />
                    <p className="mt-2 text-[10px] text-center text-natural-accent italic">{lang === 'fr' ? '"Zéro" est un excellent début. Tout commence aujourd\'hui.' : '"Zero" is a great start. Everything begins today.'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-3">{lang === 'fr' ? 'Date de naissance' : 'Birth date'}</label>
                      <input 
                        type="date" 
                        value={onboardingData.birthDate}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full bg-natural-sidebar border border-natural-line rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-3">{t.recoveryStartLabel}</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-natural-accent h-5 w-5" />
                        <input 
                          type="date" 
                          value={onboardingData.recoveryStartDate}
                          onChange={(e) => setOnboardingData(prev => ({ ...prev, recoveryStartDate: e.target.value }))}
                          className="w-full bg-natural-sidebar border border-natural-line rounded-2xl pl-16 pr-6 py-4 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-3">{lang === 'fr' ? 'À quelle étape es-tu ?' : 'What step are you at?'}</label>
                    <select 
                      value={onboardingData.currentStep}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, currentStep: e.target.value }))}
                      className="w-full bg-natural-sidebar border border-natural-line rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-bold"
                    >
                      <option value="0">{lang === 'fr' ? 'Je n\'ai pas commencé' : 'I haven\'t started'}</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{lang === 'fr' ? 'Étape' : 'Step'} {i+1}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={handleOnboardingSubmit}
                    className="w-full bg-natural-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-natural-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    {t.startJourney}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

  async function handleOnboardingSubmit() {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const sobrietyDate = new Date();
      sobrietyDate.setDate(sobrietyDate.getDate() - parseInt(onboardingData.sobrietyDays || '0'));
      
      const completedSteps = [];
      const currentStepNum = parseInt(onboardingData.currentStep);
      for (let i = 1; i < currentStepNum; i++) {
        completedSteps.push(i);
      }

      try {
        await updateDoc(userRef, {
          sobrietyDate: sobrietyDate.toISOString(),
          recoveryStartDate: new Date(onboardingData.recoveryStartDate).toISOString(),
          birthDate: onboardingData.birthDate,
          currentStep: onboardingData.currentStep,
          completedSteps: completedSteps
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }

      // Also create entries in 'steps' collection for completed steps
      for (const step of completedSteps) {
        const stepId = `${user.uid}_step_${step}`;
        try {
          await setDoc(doc(db, 'steps', stepId), {
            userId: user.uid,
            stepNumber: step,
            completedAt: new Date().toISOString(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `steps/${stepId}`);
        }
      }

      setShowOnboarding(false);
    } catch (err) {
      console.error("Onboarding error:", err);
      alert(lang === 'fr' ? "Erreur lors de la sauvegarde." : "Error during save.");
    }
  }

  async function handleUpgrade() {
    if (isUpgrading) return;
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid }),
      });
      
      const session = await response.json();
      
      if (session.url) {
        // Stripe doesn't allow iframes. We must detect if we are in one.
        const inIframe = window.self !== window.top;
        if (inIframe) {
          if (confirm(lang === 'fr' 
            ? "Pour sécuriser votre paiement, la page doit s'ouvrir dans un nouvel onglet. Continuer ?" 
            : "To secure your payment, the page must open in a new tab. Continue?")) {
            window.open(session.url, '_blank');
          }
          setIsUpgrading(false);
          return;
        }
        window.location.href = session.url;
      } else {
        alert(session.error || (lang === 'fr' ? "Une erreur est survenue." : "An error occurred."));
        setIsUpgrading(false);
      }
    } catch (error: any) {
      console.error(error);
      alert(lang === 'fr' ? "Erreur de connexion au service de paiement." : "Error connecting to payment service.");
      setIsUpgrading(false);
    }
  }

  async function handleBillingPortal() {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(lang === 'fr' 
          ? "Accès impossible pour le moment. Avez-vous déjà un abonnement actif ?"
          : "Access impossible at this time. Do you already have an active subscription?");
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'fr' ? "Erreur lors de l'accès au portail de facturation." : "Error accessing billing portal.");
    }
  }
}
