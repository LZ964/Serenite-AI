import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { differenceInDays, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar, Trophy, Heart, Star, BookOpen, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

interface DashboardProps {
  user: any;
  userData: any;
  lang: Language;
  onReviewDay: () => void;
  onSwitchTab: (tab: 'dashboard' | 'chat' | 'steps' | 'gratitudes' | 'profile') => void;
}

interface JFTData {
  title: string;
  summary: string;
  content: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, userData, lang, onReviewDay, onSwitchTab }) => {
  const [jft, setJft] = useState<JFTData | null>(null);
  const [showFullJft, setShowFullJft] = useState(false);
  const [loadingJft, setLoadingJft] = useState(true);
  const t = translations[lang];

  const sobrietyDays = userData?.sobrietyDate 
    ? differenceInDays(new Date(), new Date(userData.sobrietyDate)) 
    : 0;

  const totalRecoveryDays = userData?.recoveryStartDate
    ? differenceInDays(new Date(), new Date(userData.recoveryStartDate))
    : 0;

  useEffect(() => {
    fetch('/api/jft')
      .then(res => res.json())
      .then(data => {
        if (data.title) setJft(data);
      })
      .catch(err => console.error('Error fetching JFT:', err))
      .finally(() => setLoadingJft(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-4">
        <div className="h-10 w-10 bg-natural-primary/10 rounded-xl flex items-center justify-center text-natural-primary">
          <Calendar size={24} />
        </div>
        <h2 className="text-4xl font-serif italic text-natural-ink mb-2">{t.hello}, {user.displayName?.split(' ')[0]}</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sobriety Card - Main anchor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-natural-primary p-10 text-white shadow-xl shadow-natural-primary/10 overflow-hidden relative group min-h-[300px] flex flex-col justify-center border border-natural-line/20">
            <div className="relative z-10">
              <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">{t.recoveryProgress}</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black tracking-tighter transition-transform group-hover:scale-105 duration-500 block">{sobrietyDays}</span>
                <span className="text-2xl font-medium opacity-80 serif italic">{t.days}</span>
              </div>
              <div className="mt-2 text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Star size={12} className="text-natural-secondary" />
                {totalRecoveryDays} {t.sinceStart}
              </div>
              <p className="mt-8 text-white/90 text-sm max-w-sm leading-relaxed italic border-l-2 border-natural-secondary pl-6">
                {lang === 'fr' 
                  ? '"Nous ne sommes pas des saints. Le point important est que nous sommes prêts à croître sur le plan spirituel."'
                  : '"We are not saints. The point is that we are willing to grow along spiritual lines."'
                }
              </p>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <Calendar className="absolute top-10 right-10 h-24 w-24 text-white opacity-5 transform -rotate-12" />
          </div>

          {/* Chat Starter - New Requirement */}
          <div className="rounded-[2rem] glass p-8 shadow-sm border border-natural-line group">
            <h3 className="text-sm font-bold text-natural-ink uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-natural-primary" />
              {t.thoughtInMind}
            </h3>
            <div 
              onClick={() => onSwitchTab('chat')}
              className="w-full bg-natural-sidebar border border-natural-line rounded-2xl p-4 text-natural-accent text-sm cursor-text hover:border-natural-primary/30 transition-all flex items-center justify-between"
            >
              {t.writeToSponsor}
              <div className="h-8 w-8 bg-natural-primary/10 rounded-xl flex items-center justify-center">
                <ChevronDown size={16} className="text-natural-primary -rotate-90" />
              </div>
            </div>
          </div>

          {/* Just for Today Section */}
          <div className="rounded-[2rem] glass p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-natural-ink flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-natural-secondary" />
                {t.justForToday}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-natural-secondary opacity-80">
                {format(new Date(), 'd MMMM yyyy', { locale: lang === 'fr' ? fr : enUS })}
              </span>
            </div>

            {loadingJft ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-natural-line rounded w-3/4"></div>
                <div className="h-4 bg-natural-line rounded w-full"></div>
                <div className="h-4 bg-natural-line rounded w-5/6"></div>
              </div>
            ) : jft ? (
              <div className="space-y-4">
                <h4 className="font-serif italic text-natural-ink font-bold text-xl">{jft.title}</h4>
                <p className="text-natural-ink/70 text-sm leading-relaxed">
                  {jft.summary}
                </p>
                
                <div className="border-t border-natural-line pt-4">
                  <button 
                    onClick={() => setShowFullJft(!showFullJft)}
                    className="flex items-center gap-2 text-natural-secondary text-[10px] font-bold uppercase tracking-widest hover:text-natural-primary transition-all"
                  >
                    {showFullJft ? (
                      <>{lang === 'fr' ? "Fermer l'intégrale" : 'Close full text'} <ChevronUp size={14} /></>
                    ) : (
                      <>{lang === 'fr' ? "Lire l'intégrale" : 'Read full text'} <ChevronDown size={14} /></>
                    )}
                  </button>

                  <AnimatePresence>
                    {showFullJft && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div 
                          className="mt-6 prose prose-sm max-w-none text-natural-ink/80 italic font-serif leading-loose"
                          dangerouslySetInnerHTML={{ __html: jft.content }}
                        />
                        <div className="mt-8 p-4 bg-natural-sidebar rounded-xl border border-natural-line text-center">
                          <p className="text-[10px] font-bold text-natural-accent uppercase tracking-widest">Source: naquebec.org</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <p className="text-sm text-natural-accent italic">Réflexion du jour non disponible pour le moment.</p>
            )}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-[2rem] glass p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-natural-primary/5 group cursor-pointer" onClick={onReviewDay}>
            <div className="h-16 w-16 bg-natural-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-natural-primary/20 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8 text-natural-primary" />
            </div>
            <p className="text-base font-bold text-natural-ink mb-1 group-hover:text-natural-primary transition-colors">
              {t.exchangeWithSponsor}
            </p>
            <span className="text-[10px] text-natural-accent font-bold uppercase tracking-[0.2em] mt-2 block">{t.dailyReview}</span>
          </div>

          <div 
            onClick={() => onSwitchTab('gratitudes')}
            className="rounded-[2rem] bg-natural-primary p-8 text-white shadow-lg shadow-natural-primary/10 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden relative transition-all hover:scale-[1.02]"
          >
            <div className="relative z-10">
              <Heart className="h-10 w-10 text-white mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] leading-tight">{t.gratitudes}</p>
              <p className="text-[10px] mt-2 font-bold opacity-70 uppercase tracking-widest">
                {userData?.lastGratitudeAt?.split('T')[0] === new Date().toISOString().split('T')[0] 
                  ? (lang === 'fr' ? 'Journée complétée' : 'Day completed') 
                  : (lang === 'fr' ? 'Partager mon positif' : 'Share my positive')}
              </p>
            </div>
            <Heart className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10" />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Challenges Section */}
      {userData?.challenges && userData.challenges.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-natural-ink">
            <Trophy className="h-5 w-5 text-natural-primary" />
            {lang === 'fr' ? 'Défis de ton parrain' : 'Sponsor Challenges'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.challenges.map((c: any, i: number) => (
              <div 
                key={i} 
                className={`p-6 rounded-[2rem] border transition-all ${c.status === 'completed' ? 'glass border-emerald-500/20' : 'bg-natural-sidebar border-natural-line hover:border-natural-primary/30 group'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] ${c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-natural-primary/10 text-natural-primary'}`}>
                    {c.status === 'completed' ? (lang === 'fr' ? 'Réussi' : 'Completed') : (lang === 'fr' ? 'En cours' : 'Active')}
                  </div>
                  <span className="text-xs font-black text-natural-primary">+{c.points} pts</span>
                </div>
                <h4 className="text-sm font-bold text-natural-ink mb-2">{c.title}</h4>
                <p className="text-[10px] text-natural-accent italic">
                  {lang === 'fr' ? 'Parle-en à ton parrain quand c\'est fait.' : 'Talk to your sponsor when it\'s done.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rewards / Milestones */}
      <section className="mt-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-natural-ink">
          <Star className="h-5 w-5 text-natural-secondary" />
          {t.rewards}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: lang === 'fr' ? 'Première étape complétée' : 'First step completed', points: 100, achieved: (userData?.completedSteps || []).length > 0 },
            { label: lang === 'fr' ? '30 jours de sobriété' : '30 days sober', points: 300, achieved: sobrietyDays >= 30 },
            { label: t.sobriety90, points: 500, achieved: sobrietyDays >= 90 },
            { label: t.loyalty, points: 100, achieved: (userData?.points || 0) >= 500 },
          ].map((m, i) => (
            <div key={i} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${m.achieved ? 'glass border-natural-primary/20' : 'bg-white/5 border-natural-line opacity-40'}`}>
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${m.achieved ? 'bg-natural-secondary shadow-[0_0_8px_rgba(100,116,139,0.2)]' : 'bg-natural-line'}`} />
                <span className="text-sm font-bold text-natural-ink tracking-wide">{m.label}</span>
              </div>
              <span className={`text-sm font-black ${m.achieved ? 'text-natural-primary' : 'text-natural-accent'}`}>+{m.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
