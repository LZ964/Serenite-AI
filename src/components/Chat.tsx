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
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface ChatProps {
  user: any;
  userData: any;
}

const Chat: React.FC<ChatProps> = ({ user, userData }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load history if premium
    if (userData?.isPremium) {
      loadHistory();
    } else {
      setMessages([{
        role: 'model',
        content: "Bonjour. Je suis ton parrain. Nous pouvons discuter un jour à la fois. Comment te sens-tu ?",
        createdAt: new Date().toISOString()
      }]);
    }
  }, [userData?.isPremium]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadHistory = async () => {
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => d.data());
    if (docs.length === 0) {
      setMessages([{
        role: 'model',
        content: "Bonjour. Je suis ravi de te retrouver. Comment te sens-tu aujourd'hui ?",
        createdAt: new Date().toISOString()
      }]);
    } else {
      setMessages(docs);
    }
  };

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    if (userData?.isPremium) {
      await addDoc(collection(db, 'messages'), {
        userId: user.uid,
        ...userMessage
      });
    }

    try {
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
          history
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const modelMessage = {
        role: 'model',
        content: data.response,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMessage]);
      speak(data.response);

      if (userData?.isPremium) {
        await addDoc(collection(db, 'messages'), {
          userId: user.uid,
          ...modelMessage
        });
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `Erreur: ${error.message}. Passez peut-être au Premium pour continuer ?`,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] bg-white rounded-[2rem] border border-natural-line shadow-xl shadow-natural-primary/5 overflow-hidden"
    >
      {/* Chat Header */}
      <div className="p-6 border-b border-natural-line flex items-center justify-between bg-natural-sidebar">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 bg-natural-primary rounded-2xl flex items-center justify-center shadow-lg shadow-natural-primary/20">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div>
            <h3 className="font-bold text-natural-ink leading-tight">Votre Parrain Virtuel</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">En ligne • À votre écoute</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-full transition-all ${voiceEnabled ? 'bg-natural-primary text-white' : 'bg-natural-line text-natural-accent'}`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          {!userData?.isPremium && (
            <div className="text-[10px] bg-natural-secondary/15 text-natural-secondary px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-natural-secondary/20">
              {10 - (userData?.requestCount || 0)} Restants
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCFB]"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-natural-primary text-white rounded-tr-none shadow-natural-primary/10' 
                : 'bg-white border border-natural-line rounded-tl-none text-natural-ink'
            }`}>
              <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : 'prose-stone'}`}>
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
            <div className="bg-white border border-natural-line rounded-3xl rounded-tl-none px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 bg-natural-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-natural-primary/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-natural-primary/40 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-natural-line">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all shadow-sm ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' 
                : 'bg-natural-sidebar text-natural-primary hover:bg-natural-primary hover:text-white border border-natural-line'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez ou lancez la discussion vocale..."
              className="w-full pl-6 pr-14 py-4 bg-natural-sidebar border border-natural-line rounded-2xl focus:ring-2 focus:ring-natural-primary outline-none transition-all text-natural-ink placeholder:text-natural-accent/50"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 p-2.5 bg-natural-primary text-white rounded-xl shadow-lg shadow-natural-primary/20 hover:scale-105 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        {!userData?.isPremium && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-natural-accent opacity-60 justify-center">
            <Info size={12} />
            Les conversations sont sauvegardées en mode Premium
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Chat;
