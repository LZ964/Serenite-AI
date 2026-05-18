import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Heart, Send, Sparkles, Quote, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GratitudesProps {
  user: any;
  userData: any;
}

const Gratitudes: React.FC<GratitudesProps> = ({ user, userData }) => {
  const [gratitudes, setGratitudes] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    loadGratitudes();
  }, []);

  const loadGratitudes = async () => {
    try {
      const q = query(
        collection(db, 'gratitudes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setGratitudes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!input.trim()) return;

    try {
      const newGratitude = {
        userId: user.uid,
        text: input,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'gratitudes'), newGratitude);
      
      // Update user points + lastGratitude date
      await updateDoc(doc(db, 'users', user.uid), {
        points: (userData.points || 0) + 20,
        lastGratitudeAt: new Date().toISOString()
      });

      setInput('');
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 3000);
      loadGratitudes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <header className="text-center space-y-4">
        <div className="mx-auto h-20 w-20 bg-natural-secondary/10 rounded-[2rem] flex items-center justify-center text-natural-secondary mb-6 border border-natural-secondary/20 shadow-sm relative overflow-hidden">
          <Heart className="h-10 w-10 relative z-10" />
          <div className="absolute inset-0 bg-natural-secondary/5 blur-xl group-hover:blur-2xl transition-all" />
        </div>
        <h2 className="text-4xl font-serif italic text-natural-ink">Journal de Gratitude</h2>
        <p className="text-natural-accent font-medium max-w-lg mx-auto leading-relaxed">
          Prendre le temps de reconnaître ce qui est positif dans notre vie renforce notre rétablissement et notre esprit.
        </p>
      </header>

      {/* Input Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-natural-line shadow-xl shadow-natural-primary/5 transition-all focus-within:ring-2 focus-within:ring-natural-secondary focus-within:border-transparent">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-natural-secondary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Sparkles size={16} />
            Aujourd'hui, j'ai de la gratitude pour...
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez quelque chose qui vous a fait sourire ou qui vous a aidé aujourd'hui..."
            className="w-full h-32 p-6 bg-natural-sidebar rounded-3xl border-none outline-none resize-none text-natural-ink placeholder:text-natural-accent/40 font-medium italic"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-natural-accent font-bold uppercase tracking-wider bg-natural-sidebar px-4 py-2 rounded-full">
              Récompense : +20 points de sobriété
            </span>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-natural-secondary text-white px-10 py-3.5 rounded-2xl font-bold shadow-lg shadow-natural-secondary/20 hover:scale-105 disabled:opacity-50 transition-all active:scale-95"
            >
              Envoyer
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-5 bg-natural-primary/10 border border-natural-primary/20 rounded-[1.5rem] text-natural-primary text-center font-bold text-sm flex items-center justify-center gap-3 shadow-sm"
          >
            <Sparkles size={18} />
            Gratitude enregistrée ! +20 points ajoutés à votre compte.
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-natural-accent uppercase tracking-[0.3em] flex items-center gap-3">
          <div className="h-px flex-1 bg-natural-line" />
          Mon Historique
          <div className="h-px flex-1 bg-natural-line" />
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[1,2,3,4].map(i => <div key={i} className="h-32 w-full bg-natural-sidebar animate-pulse rounded-[1.5rem] border border-natural-line" />)}
          </div>
        ) : gratitudes.length === 0 ? (
          <div className="p-16 text-center text-natural-accent font-medium italic bg-natural-sidebar rounded-[2.5rem] border-2 border-dashed border-natural-line">
            Votre historique de gratitudes apparaîtra ici.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gratitudes.map((g) => (
              <motion.div
                layout
                key={g.id}
                className="bg-white p-7 rounded-[1.5rem] border border-natural-line shadow-sm relative group hover:border-natural-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold text-natural-accent uppercase mb-4 tracking-wider">
                  <Calendar size={14} className="text-natural-secondary" />
                  {format(new Date(g.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </div>
                <p className="text-natural-ink font-medium leading-relaxed italic text-sm">"{g.text}"</p>
                <div className="absolute -bottom-2 -right-2 text-natural-secondary/10 group-hover:text-natural-secondary/20 transition-all transform group-hover:scale-110">
                  <Heart size={64} fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Gratitudes;
