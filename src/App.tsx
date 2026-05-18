import React, { useState, useEffect, useRef } from 'react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Steps from './components/Steps';
import Gratitudes from './components/Gratitudes';
import Profile from './components/Profile';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'steps' | 'gratitudes' | 'profile'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isUpgrading, setIsUpgrading] = useState(false);

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
        const userSnap = await getDoc(userRef);
        
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
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }
        
        // Setup real-time listener
        unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }
          setLoading(false);
        }, (err) => {
          console.error("Snapshot error:", err);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-natural-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-natural-primary border-t-transparent shadow-lg" />
          <p className="text-natural-accent font-serif italic">Un jour à la fois...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Heart className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900">Sérénité AI</h1>
            <p className="mt-2 text-stone-600">Votre compagnon sur le chemin du rétablissement.</p>
          </div>
          
          <button
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="" />
            Se connecter avec Google
          </button>
          
          <p className="text-center text-xs text-stone-400">
            En continuant, vous acceptez nos principes de bienveillance et de respect.
          </p>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Bilan', icon: Calendar },
    { id: 'chat', label: 'Parrain', icon: MessageCircle },
    { id: 'steps', label: 'Étapes', icon: BookOpen },
    { id: 'gratitudes', label: 'Gratitudes', icon: Heart },
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
              <span className="text-lg font-bold tracking-tight text-natural-ink">Sérénité AI</span>
              <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest text-natural-accent">Parrain Virtuel</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-natural-accent hover:text-natural-ink"
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1.5 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-natural-primary text-white shadow-md shadow-natural-primary/20' 
                  : 'text-natural-accent hover:bg-white hover:text-natural-ink'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-natural-primary/60'}`} />
              {item.label}
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
          <div className="rounded-2xl bg-white border border-natural-line p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-accent">Sobriété</span>
              <Trophy className="h-4 w-4 text-natural-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-natural-primary">{userData?.points || 0}</span>
              <span className="text-[10px] font-medium text-natural-accent uppercase tracking-wider">Points acquis</span>
            </div>
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-natural-accent hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-natural-line flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-natural-primary hover:bg-natural-primary/5 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 bg-natural-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">S</div>
              <span className="font-bold text-natural-ink tracking-tight text-sm">Sérénité AI</span>
            </div>
          </div>
          <div className="hidden lg:block text-natural-accent text-sm font-medium italic">
            "Le point important est que nous sommes prêts à croître"
          </div>
          
          <div className="flex items-center gap-6">
            {!userData?.isPremium && (
              <button 
                onClick={() => handleUpgrade()}
                disabled={isUpgrading}
                className="text-[10px] font-bold uppercase tracking-widest text-natural-secondary hover:text-natural-primary transition-colors py-2 px-4 rounded-full border border-natural-secondary/30 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpgrading && <div className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />}
                {isUpgrading ? 'Chargement...' : 'Passer au Premium'}
              </button>
            )}
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 border-l border-natural-line pl-6 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-natural-ink leading-none">{user.displayName?.split(' ')[0]}</p>
                  <p className="text-[10px] text-natural-accent uppercase tracking-widest mt-1">
                    {userData?.isPremium ? 'Premium' : 'Gratuit'}
                  </p>
                </div>
                <div className="relative">
                  <img src={user.photoURL || ''} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" alt="" />
                  {userData?.isPremium && <Crown size={12} className="absolute -top-1 -right-1 text-natural-secondary fill-natural-secondary" />}
                </div>
                <ChevronDown size={14} className={`text-natural-accent transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-white rounded-2xl border border-natural-line shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-4 border-b border-natural-line bg-natural-sidebar/50">
                      <p className="text-sm font-bold text-natural-ink">{user.displayName}</p>
                      <p className="text-xs text-natural-accent truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-natural-accent hover:bg-natural-primary/5 hover:text-natural-primary rounded-xl transition-all"
                      >
                        <UserIcon size={18} />
                        Mon Profil
                      </button>
                      <button 
                        onClick={() => { handleBillingPortal(); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-natural-accent hover:bg-natural-primary/5 hover:text-natural-primary rounded-xl transition-all"
                      >
                        <CreditCard size={18} />
                        Facturation
                      </button>
                      <div className="h-px bg-natural-line my-2" />
                      <button 
                        onClick={() => auth.signOut()}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                        Déconnexion
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
              {activeTab === 'dashboard' && <Dashboard user={user} userData={userData} />}
              {activeTab === 'chat' && <Chat user={user} userData={userData} />}
              {activeTab === 'steps' && <Steps user={user} userData={userData} />}
              {activeTab === 'gratitudes' && <Gratitudes user={user} userData={userData} />}
              {activeTab === 'profile' && <Profile user={user} userData={userData} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden border-t border-natural-line bg-white/95 backdrop-blur-md px-8 py-3 flex justify-between items-center sticky bottom-0 z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === item.id ? 'text-natural-primary scale-110' : 'text-natural-accent opacity-60'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] uppercase font-bold tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );

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
         window.location.href = session.url;
      } else {
        alert(session.error || "Une erreur est survenue. Vérifiez que la clé STRIPE_SECRET_KEY est bien configurée dans les Secrets.");
        setIsUpgrading(false);
      }
    } catch (error: any) {
      console.error(error);
      alert("Erreur de connexion au service de paiement.");
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
        // Fallback for non-premium if we want, but billing portal usually requires customer
        alert("Accès impossible pour le moment. Avez-vous déjà un abonnement actif ?");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'accès au portail de facturation.");
    }
  }
}
