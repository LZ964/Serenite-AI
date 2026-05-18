import React from 'react';
import { motion } from 'motion/react';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Trophy, Heart, Star } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface DashboardProps {
  user: any;
  userData: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user, userData }) => {
  const sobrietyDays = userData?.sobrietyDate 
    ? differenceInDays(new Date(), new Date(userData.sobrietyDate)) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-serif italic text-natural-ink mb-2">Bonjour, {user.displayName?.split(' ')[0]}</h2>
        <p className="text-natural-accent font-medium tracking-wide">"Vingt-quatre heures à la fois"</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sobriety Card - Main anchor */}
        <div className="lg:col-span-2 rounded-[2rem] bg-natural-primary p-10 text-white shadow-2xl shadow-natural-primary/20 overflow-hidden relative group min-h-[300px] flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">Progression de Sobriété</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-8xl font-bold tracking-tighter transition-transform group-hover:scale-105 duration-500 block">{sobrietyDays}</span>
              <span className="text-2xl font-medium opacity-80 serif italic">jours</span>
            </div>
            <p className="mt-8 text-white/80 text-sm max-w-sm leading-relaxed italic border-l-2 border-natural-secondary pl-4">
              "Nous ne sommes pas des saints. Le point important est que nous sommes prêts à croître sur le plan spirituel."
            </p>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <Calendar className="absolute top-10 right-10 h-24 w-24 text-white opacity-5 transform -rotate-12" />
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-[2rem] bg-white p-8 border border-natural-line shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
            <div className="h-16 w-16 bg-natural-primary/5 rounded-full flex items-center justify-center mb-4 border border-natural-primary/10">
              <Calendar className="h-8 w-8 text-natural-primary" />
            </div>
            <button 
              onClick={async () => {
                const today = new Date().toISOString().split('T')[0];
                const lastCheck = userData?.lastSobrietyCheck?.split('T')[0];
                if (today !== lastCheck) {
                  await updateDoc(doc(db, 'users', user.uid), {
                    points: (userData.points || 0) + 50,
                    lastSobrietyCheck: new Date().toISOString()
                  });
                } else {
                  alert("Vous avez déjà validé votre journée aujourd'hui.");
                }
              }}
              className="text-base font-bold text-natural-primary hover:text-natural-secondary transition-colors"
            >
              {userData?.lastSobrietyCheck?.split('T')[0] === new Date().toISOString().split('T')[0] ? '✅ Bien fait !' : 'Valider ma journée'}
            </button>
            <span className="text-[10px] text-natural-accent font-bold uppercase tracking-widest mt-2">Récompense: +50 pts</span>
          </div>

          <div className="rounded-[2rem] bg-natural-secondary p-8 text-white shadow-lg shadow-natural-secondary/20 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden relative">
            <div className="relative z-10">
              <Heart className="h-10 w-10 text-white mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold uppercase tracking-widest leading-tight">Mes Gratitudes</p>
              <p className="text-[10px] mt-1 opacity-80">
                {userData?.lastGratitudeAt?.split('T')[0] === new Date().toISOString().split('T')[0] ? 'Journée complétée' : 'Partagez un moment positif'}
              </p>
            </div>
            <Heart className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10" />
          </div>
        </div>
      </div>

      {/* Rewards / Milestones */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Récompenses du parcours
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Première étape complétée', points: 100, achieved: (userData?.completedSteps || []).length > 0 },
            { label: '30 jours de sobriété', points: 300, achieved: sobrietyDays >= 30 },
            { label: '90 jours de sobriété', points: 500, achieved: sobrietyDays >= 90 },
            { label: 'Fidélité au programme (10 jours validés)', points: 100, achieved: (userData?.points || 0) >= 500 },
          ].map((m, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${m.achieved ? 'bg-natural-primary/10 border-natural-primary/20' : 'bg-white border-natural-line opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${m.achieved ? 'bg-natural-primary' : 'bg-natural-accent/30'}`} />
                <span className="text-sm font-medium text-natural-ink">{m.label}</span>
              </div>
              <span className={`text-sm font-bold ${m.achieved ? 'text-natural-primary' : 'text-natural-accent'}`}>+{m.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
