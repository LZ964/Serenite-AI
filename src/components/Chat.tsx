import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  Info,
  Heart,
  AlertTriangle,
  X,
  Phone,
  Camera,
  CameraOff,
  Eye,
  Star,
  Trophy
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { encryptData, decryptData } from '../lib/encryption';
import { translations, Language } from '../lib/translations';

interface ChatProps {
  user: any;
  userData: any;
  lang: Language;
  trigger?: string | null;
  onTriggerHandled?: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

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
      userId: db.app.options.apiKey ? 'authenticated' : 'not-authenticated', // Minimal auth info for helper
      email: null,
      emailVerified: null,
    },
    operationType,
    path
  }
  // Instead of complex auth info here, we'll try to get it from the app if possible, 
  // but since we're in a component, we'll keep it simple or pass it.
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const Chat: React.FC<ChatProps> = ({ user, userData, lang, trigger, onTriggerHandled }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCrisisInfo, setShowCrisisInfo] = useState(false);
  const [encryptionPin, setEncryptionPin] = useState<string | null>(sessionStorage.getItem('encryption_pin'));
  const [pinInput, setPinInput] = useState('');
  const [sponsorGender, setSponsorGender] = useState<'parrain' | 'marraine'>(userData?.sponsorGender || 'parrain');
  const [inputText, setInputText] = useState('');
  const [showVoiceMode, setShowVoiceMode] = useState(true);
  const [pointNotification, setPointNotification] = useState<{points: number, reason: string} | null>(null);
  const [visionMode, setVisionMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (visionMode) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [visionMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setVisionMode(false);
      alert(lang === 'fr' ? "Impossible d'accéder à la caméra." : "Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = (): { data: string, mimeType: string } | null => {
    if (!videoRef.current || !canvasRef.current || !visionMode) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Use natural video dimensions for aspect ratio
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert to base64 jpeg
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    return {
      data: dataUrl.split(',')[1],
      mimeType: 'image/jpeg'
    };
  };

  useEffect(() => {
    // Handle daily review trigger
    if (trigger === 'daily_review') {
      const reviewMessage: Message = {
        role: 'model',
        content: lang === 'fr' 
          ? "Bonjour. Selon les principes de *Vivre les étapes (AA & NA)*, faisons ensemble ton bilan quotidien. \n\n**Comment a été ta journée aujourd'hui ? Qu'est-ce que tu as fait ? As-tu atteint les objectifs que tu t'étais fixé la veille ?**"
          : "Hello. Following the principles of *Working the steps (AA & NA)*, let's do your daily review together. \n\n**How was your day today? What did you do? Did you reach the goals you set yesterday?**",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, reviewMessage]);
      speak(reviewMessage.content);
      if (onTriggerHandled) onTriggerHandled();
      return;
    }

    // Load history if premium
    if (userData?.isPremium && encryptionPin) {
      loadHistory();
    } else if (userData?.isPremium && !encryptionPin) {
      // Wait for PIN
    } else {
      const welcome: Message = {
        role: 'model',
        content: lang === 'fr' 
          ? "Bonjour. Je suis ton parrain. Nous pouvons discuter un jour à la fois. Comment te sens-tu ?"
          : "Hello. I am your sponsor. We can talk one day at a time. How are you feeling?",
        createdAt: new Date().toISOString()
      };
      setMessages([welcome]);
    }
  }, [userData?.isPremium, trigger, encryptionPin, lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadHistory = async () => {
    if (!encryptionPin) return;
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    let snap;
    try {
      snap = await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'messages');
      return;
    }
    
    const docs: Message[] = [];
    for (const d of snap.docs) {
      const data = d.data();
      const decrypted = decryptData(data.content, encryptionPin);
      if (decrypted) {
        docs.push({
          role: data.role,
          content: decrypted,
          createdAt: data.createdAt
        });
      }
    }

    if (docs.length === 0) {
      const welcome: Message = {
        role: 'model',
        content: lang === 'fr' 
          ? "Bonjour. Je suis ravi de te retrouver. Comment te sens-tu aujourd'hui ?"
          : "Hello. I am glad to see you again. How are you feeling today?",
        createdAt: new Date().toISOString()
      };
      setMessages([welcome]);
    } else {
      setMessages(docs);
    }
  };

  useEffect(() => {
    // Force voices to load in some browsers
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    
    // Selection logic for narrative and expressive voices
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize high-quality/enhanced voices, specifically looking for Canadian French (Quebec)
    const frVoices = voices.filter(v => v.lang.startsWith('fr'));
    const frCaVoices = voices.filter(v => v.lang === 'fr-CA' || v.lang.startsWith('fr-CA'));
    
    let preferredVoice = null;
    if (sponsorGender === 'marraine') {
      // Look for natural female voices (Quebec first)
      preferredVoice = frCaVoices.find(v => (v.name.includes('femme') || v.name.includes('Female')))
                    || frCaVoices[0]
                    || frVoices.find(v => v.name.includes('Google') && (v.name.includes('femme') || v.name.includes('Female')))
                    || frVoices.find(v => v.name.includes('Amelie') || v.name.includes('Hortense') || v.name.includes('Siri'))
                    || frVoices.find(v => v.name.includes('Female'));
    } else {
      // Look for natural male voices (Quebec first)
      preferredVoice = frCaVoices.find(v => (v.name.includes('homme') || v.name.includes('Male')))
                    || frCaVoices[0]
                    || frVoices.find(v => v.name.includes('Google') && (v.name.includes('homme') || v.name.includes('Male')))
                    || frVoices.find(v => v.name.includes('Thomas') || v.name.includes('Paul') || v.name.includes('Siri'))
                    || frVoices.find(v => v.name.includes('Male'));
    }

    // Fallback to any French voice if no specific gender-matched quality voice found
    if (!preferredVoice) {
      preferredVoice = frVoices.find(v => v.name.includes('Google') || v.name.includes('Enhanced')) || frVoices[0];
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // "Narrative and Expressive" adjustments
    // Rate: slightly slower for more empathy/thinking feel (0.85 to 0.95)
    utterance.rate = 0.92; 
    // Pitch: natural human variability
    utterance.pitch = sponsorGender === 'marraine' ? 1.05 : 0.96;
    // Volume: full immersion
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const updateGender = async (gender: 'parrain' | 'marraine') => {
    setSponsorGender(gender);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), { sponsorGender: gender });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      playBeep('stop');
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur (utilisez Chrome ou Safari).");
        return;
      }
      
      playBeep('start');
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'fr' ? 'fr-CA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const playBeep = (type: 'start' | 'stop') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.1);
      }

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio beep error", e);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    // Simple distress detection
    const distressWords = ['suicide', 'tuer', 'finir', 'mourir', 'die', 'kill', 'suicidal'];
    const hasDistress = distressWords.some(word => text.toLowerCase().includes(word));
    if (hasDistress) {
      setShowCrisisInfo(true);
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    if (userData?.isPremium && encryptionPin) {
      const encryptedContent = encryptData(text, encryptionPin);
      try {
        await addDoc(collection(db, 'messages'), {
          userId: user.uid,
          ...userMessage,
          content: encryptedContent
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'messages');
      }
    }

    try {
      // Capture frame if vision mode is on
      const frame = visionMode ? captureFrame() : null;

      // Prepare history for API
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          message: text,
          history,
          images: frame ? [frame] : [],
          currentStep: userData?.currentStep || '1',
          completedSteps: userData?.completedSteps || []
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update points and challenges if the AI awarded them
      if (data.pointsAwarded > 0 || data.newChallenge) {
        const userRef = doc(db, 'users', user.uid);
        const updates: any = {};
        
        if (data.pointsAwarded > 0) {
          updates.points = (userData?.points || 0) + data.pointsAwarded;
          setPointNotification({ points: data.pointsAwarded, reason: data.reason || (lang === 'fr' ? 'Récompense sponsor' : 'Sponsor reward') });
          setTimeout(() => setPointNotification(null), 5000);
        }
        
        if (data.newChallenge) {
          const currentChallenges = userData?.challenges || [];
          updates.challenges = [...currentChallenges, {
            ...data.newChallenge,
            createdAt: new Date().toISOString(),
            status: 'pending'
          }];
        }
        
        try {
          await updateDoc(userRef, updates);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }
      }

      const modelMessage: Message = {
        role: 'model',
        content: data.response,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMessage]);
      speak(data.response);

      if (userData?.isPremium && encryptionPin) {
        const encryptedModelContent = encryptData(data.response, encryptionPin);
        try {
          await addDoc(collection(db, 'messages'), {
            userId: user.uid,
            ...modelMessage,
            content: encryptedModelContent
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'messages');
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'model',
        content: `Erreur: ${error.message}.`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUnlockHistory = () => {
    if (pinInput.length >= 4) {
      setEncryptionPin(pinInput);
      sessionStorage.setItem('encryption_pin', pinInput);
    } else {
      alert("La clé doit comporter au moins 4 caractères.");
    }
  };

  const userAge = userData?.birthDate ? new Date().getFullYear() - new Date(userData.birthDate).getFullYear() : 30;
  
  // Use a more appropriate "older" sponsor based on user age
  const sponsorImage = React.useMemo(() => {
    if (sponsorGender === 'marraine') {
      return userAge < 45 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" // Mature
        : "https://images.unsplash.com/photo-1544717297-fa95b3ee21f3?auto=format&fit=crop&q=80&w=600"; // Elder
    } else {
      return userAge < 45
        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600" // Mature
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"; // Elder
    }
  }, [sponsorGender, userAge]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] bg-white rounded-[2rem] border border-natural-line shadow-xl shadow-natural-primary/5 overflow-hidden relative"
    >
      {/* Full Screen Video Call Mode */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Sponsor Video (Fictional) */}
            <div className="absolute inset-0 w-full h-full bg-stone-900">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <motion.img 
                  animate={{ 
                    scale: isSpeaking ? [1, 1.02, 1] : 1,
                    x: [0, 2, -2, 0],
                    y: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  src={sponsorImage}
                  alt="Sponsor"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                
                {/* Visual feedback for AI Thinking/Watching */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  {isTyping && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-64 h-64 bg-natural-primary/20 rounded-full blur-[80px]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* User Preview (PIP) */}
            <motion.div 
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              className="absolute top-8 right-8 w-64 aspect-video rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-stone-900 group"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest">Toi</span>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-6">
              <button 
                onClick={() => setVisionMode(!visionMode)}
                className={`p-6 rounded-full transition-all ${visionMode ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
              >
                {visionMode ? <Camera size={32} /> : <CameraOff size={32} />}
              </button>

              <button 
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-10 ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-red-500/50 scale-110' 
                    : 'bg-white text-natural-ink hover:scale-105 active:scale-95'
                }`}
              >
                {isListening ? <MicOff size={38} className="animate-pulse" /> : <Mic size={38} />}
              </button>

              <button 
                onClick={() => setIsFullScreen(false)}
                className="p-6 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl"
              >
                <X size={32} />
              </button>
            </div>

            <div className="absolute top-8 left-8 flex items-center gap-4">
              <div className="h-12 w-12 bg-natural-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Heart size={24} />
              </div>
              <div className="text-white">
                <p className="font-bold text-lg">{lang === 'fr' ? `Appel avec ton ${sponsorGender}` : `Call with your sponsor`}</p>
                <p className="text-xs text-white/60 font-mono tracking-widest">LIVE ENCRYPTED</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis Info Modal */}
      <AnimatePresence>
        {showCrisisInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCrisisInfo(false)}
            className="absolute inset-0 z-[110] bg-orange-950/40 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl space-y-6 border-b-8 border-orange-500 max-h-[90vh] overflow-y-auto cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <AlertTriangle size={24} />
                </div>
                <button 
                  onClick={() => setShowCrisisInfo(false)} 
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-natural-accent hover:text-natural-ink"
                >
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-natural-ink">
                {lang === 'fr' ? 'Burning desire - SOS!' : 'Burning desire - SOS!'}
              </h3>
              <p className="text-sm text-natural-accent leading-relaxed">
                {lang === 'fr' 
                  ? "Sérénité AI est là pour t'écouter, mais en cas de crise majeure, rien ne remplace un humain ou les services d'urgence. Ton bien-être est la priorité."
                  : "Serenity AI is here to listen, but in a major crisis, nothing replaces a human or emergency services. Your well-being is the priority."}
              </p>
              <div className="space-y-4">
                <a href="tel:811" className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-natural-line hover:border-orange-500 transition-all group">
                  <div>
                    <p className="font-bold text-natural-ink">Québec : 811</p>
                    <p className="text-[10px] text-natural-accent uppercase tracking-widest">Info-Social</p>
                  </div>
                  <Phone size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </a>
                <a href="tel:18662773553" className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-natural-line hover:border-orange-500 transition-all group">
                  <div>
                    <p className="font-bold text-natural-ink">Québec : 1-866-APPELLE</p>
                    <p className="text-[10px] text-natural-accent uppercase tracking-widest">Aide Suicide</p>
                  </div>
                  <Phone size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </a>
                <a href="tel:988" className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-natural-line hover:border-orange-500 transition-all group">
                  <div>
                    <p className="font-bold text-natural-ink">Canada/USA : 988</p>
                    <p className="text-[10px] text-natural-accent uppercase tracking-widest">Crisis/Suicide Line</p>
                  </div>
                  <Phone size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </a>
              </div>
              <button 
                onClick={() => setShowCrisisInfo(false)}
                className="w-full py-4 text-sm font-bold text-natural-accent hover:text-natural-ink transition-colors"
              >
                {lang === 'fr' ? 'Je vais bien, merci' : 'I am okay, thanks'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encryption Lock Overlay */}
      <AnimatePresence>
        {userData?.isPremium && !encryptionPin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-8 text-center"
          >
            <div className="max-w-xs space-y-6">
              <div className="h-16 w-16 bg-natural-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-natural-primary" />
              </div>
              <h3 className="text-xl font-bold text-natural-ink">{lang === 'fr' ? 'Conversations Chiffrées' : 'Encrypted Conversations'}</h3>
              <p className="text-xs text-natural-accent leading-relaxed">
                {lang === 'fr' 
                  ? 'Afin de garantir que vous seul puissiez lire vos échanges, veuillez définir ou saisir votre clé de confidentialité (utilisez un PIN ou un mot de passe simple).'
                  : 'To ensure that only you can read your exchanges, please set or enter your privacy key (use a simple PIN or password).'
                }
              </p>
              <div className="space-y-4">
                <input 
                  type="password"
                  placeholder={lang === 'fr' ? 'Votre clé secrète...' : 'Your secret key...'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-natural-sidebar border border-natural-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-bold text-center tracking-widest"
                />
                <button 
                  onClick={handleUnlockHistory}
                  className="w-full bg-natural-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-natural-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {lang === 'fr' ? 'Déverrouiller' : 'Unlock'}
                </button>
                <p className="text-[10px] text-natural-accent italic">
                  {lang === 'fr' 
                    ? 'Note: Cette clé n\'est jamais envoyée au serveur. Si vous la perdez, vos anciennes conversations seront illisibles.'
                    : 'Note: This key is never sent to the server. If you lose it, your old conversations will be unreadable.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Header */}
      <div className="p-6 border-b border-natural-line flex items-center justify-between bg-natural-sidebar">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsFullScreen(true)}
              className="group relative h-12 w-12 bg-natural-primary rounded-2xl flex items-center justify-center shadow-lg shadow-natural-primary/20 hover:scale-105 transition-all overflow-hidden"
            >
              <Heart className="h-6 w-6 text-white group-hover:hidden" />
              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/20">
                <Eye size={20} className="text-white" />
              </div>
            </button>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div>
            <h3 className="font-bold text-natural-ink leading-tight">
              {lang === 'fr' 
                ? `Votre ${sponsorGender === 'parrain' ? 'Parrain' : 'Marraine'} Virtuel${sponsorGender === 'marraine' ? 'le' : ''}`
                : `Your Virtual ${sponsorGender === 'parrain' ? 'Sponsor' : 'Sponsor'}`
              }
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <button 
                onClick={() => setIsFullScreen(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:underline"
              >
                {lang === 'fr' ? 'En ligne • Cliquer pour voir' : 'Online • Click to see'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCrisisInfo(true)}
            className="px-3 py-1.5 border border-orange-200 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-orange-100 flex items-center gap-2"
          >
            <AlertTriangle size={14} />
            Burning desire - SOS!
          </button>
          
          <div className="bg-natural-line/50 p-1 rounded-xl flex gap-1 border border-natural-line hidden md:flex">
            <button 
              onClick={() => updateGender('parrain')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${sponsorGender === 'parrain' ? 'bg-white text-natural-primary shadow-sm' : 'text-natural-accent'}`}
            >
              {lang === 'fr' ? 'Parrain' : 'Male'}
            </button>
            <button 
              onClick={() => updateGender('marraine')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${sponsorGender === 'marraine' ? 'bg-white text-natural-primary shadow-sm' : 'text-natural-accent'}`}
            >
              {lang === 'fr' ? 'Marraine' : 'Female'}
            </button>
          </div>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-full transition-all ${voiceEnabled ? 'bg-natural-primary text-white' : 'bg-natural-line text-natural-accent'}`}
            title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {pointNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-natural-ink text-white px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 border-2 border-natural-primary/30 min-w-[280px]"
          >
            <div className="h-12 w-12 bg-natural-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="text-white animate-bounce" size={24} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-white">+{pointNotification.points}</p>
                <span className="text-xs font-bold text-natural-primary uppercase tracking-widest">points</span>
              </div>
              <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest truncate max-w-[200px]">{pointNotification.reason}</p>
            </div>
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-natural-primary rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-natural-sidebar/30"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-natural-primary text-white rounded-tr-none shadow-natural-primary/10' 
                : 'bg-natural-sidebar border border-natural-line rounded-tl-none text-natural-ink'
            }`}>
              <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : 'text-natural-ink/80'}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              <span className={`text-[10px] mt-2 block font-bold uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass rounded-3xl rounded-tl-none px-6 py-4 shadow-xl">
              <div className="flex gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="h-2 w-2 bg-natural-secondary rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 bg-natural-secondary rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 bg-natural-secondary rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Preview Overlay moved to floating position */}
      <AnimatePresence>
        {visionMode && !isFullScreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-24 right-6 z-40 flex flex-col gap-4 pointer-events-none"
          >
            {/* Sponsor Preview */}
            <div className="w-56 aspect-video rounded-2xl overflow-hidden border-2 border-natural-primary shadow-2xl bg-stone-900 relative pointer-events-auto">
              <motion.img 
                animate={{ 
                  scale: isSpeaking ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 5, repeat: Infinity }}
                src={sponsorImage}
                className="w-full h-full object-cover"
                alt="Sponsor"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <div className="h-1.5 w-1.5 bg-natural-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                  {sponsorGender === 'parrain' ? 'Parrain (Live)' : 'Marraine (Live)'}
                </span>
              </div>
            </div>

            {/* User Preview */}
            <div className="w-56 aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black relative pointer-events-auto">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest">Toi</span>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Footer */}
      <div className="p-6 bg-natural-sidebar border-t border-natural-line">
        {showVoiceMode ? (
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {!isListening && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-2"
                >
                  <p className="text-sm font-bold text-natural-ink tracking-wide">
                    {isSpeaking 
                      ? (lang === 'fr' ? `Votre ${sponsorGender} vous parle...` : `Your sponsor is speaking...`)
                      : (lang === 'fr' ? `Prêt à échanger de vive voix ?` : `Ready to talk live?`)
                    }
                  </p>
                  <button 
                    onClick={() => setShowVoiceMode(false)}
                    className="text-[10px] text-natural-primary font-bold uppercase tracking-[0.2em] hover:underline"
                  >
                    {lang === 'fr' ? 'Utiliser le clavier' : 'Use keyboard'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center justify-center gap-8">
              <button 
                onClick={() => setVisionMode(!visionMode)}
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all shadow-xl relative z-10 ${
                  visionMode 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                    : 'bg-natural-line text-natural-accent hover:bg-natural-line/80'
                }`}
              >
                {visionMode ? <CameraOff size={24} /> : <Camera size={24} />}
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Vision</span>
              </button>

              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {(isListening || isSpeaking) && (
                    <>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [1, 2.5, 1.5],
                          opacity: [0.8, 0.4, 0.8],
                          rotate: 360
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute w-44 h-44 bg-gradient-to-tr from-natural-primary via-natural-secondary to-emerald-400 rounded-full blur-[30px] opacity-60 mix-blend-screen"
                      />
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [1.5, 3.0, 1.5],
                          opacity: [0.6, 0.3, 0.6],
                          rotate: -360
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-56 h-56 bg-gradient-to-bl from-natural-secondary via-emerald-400 to-natural-primary rounded-full blur-[40px] opacity-50 mix-blend-screen"
                      />
                    </>
                  )}
                </AnimatePresence>

                <button 
                  onClick={toggleListening}
                  disabled={isSpeaking || isTyping}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-10 ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-red-500/50 scale-110' 
                      : 'bg-natural-primary text-white hover:bg-natural-secondary shadow-natural-primary/40 active:scale-95 disabled:opacity-30'
                  }`}
                >
                  {isListening ? <MicOff size={38} className="animate-pulse" /> : <Mic size={38} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setShowVoiceMode(true)}
                  className="p-4 bg-natural-primary/10 text-natural-primary rounded-2xl hover:bg-natural-primary/20 transition-all shadow-sm"
                  title={lang === 'fr' ? 'Passer au mode vocal' : 'Switch to voice mode'}
                >
                  <Mic size={24} />
                </button>
                <button 
                  onClick={() => setVisionMode(!visionMode)}
                  className={`p-4 rounded-2xl transition-all shadow-sm ${
                    visionMode 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                      : 'bg-natural-line/30 text-natural-accent hover:bg-natural-line/50'
                  }`}
                  title={lang === 'fr' ? 'Activer/Désactiver Vision' : 'Toggle Vision'}
                >
                  {visionMode ? <CameraOff size={24} /> : <Camera size={24} />}
                </button>
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (handleSend(inputText), setInputText(''))}
                  placeholder={t.writeToSponsor}
                  className="w-full bg-white border border-natural-line rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium pr-16"
                />
                <button 
                  onClick={() => { handleSend(inputText); setInputText(''); }}
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-natural-primary text-white rounded-xl shadow-lg shadow-natural-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!userData?.isPremium && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-natural-accent opacity-60">
            <Info size={12} />
            {lang === 'fr' ? 'Les conversations sont sauvegardées en mode Premium' : 'Conversations are saved in Premium mode'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Chat;
