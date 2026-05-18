import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, Circle, ChevronRight, Trophy, AlertCircle, Info, X, Sparkles } from 'lucide-react';

import { STEPS_FR, STEPS_EN } from '../constants';
import { translations, Language } from '../lib/translations';
import { stepDetails } from '../lib/stepDetails';

interface StepsProps {
  user: any;
  userData: any;
  lang: Language;
}

const Steps: React.FC<StepsProps> = ({ user, userData, lang }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const t = translations[lang];
  const stepsList = lang === 'fr' ? STEPS_FR : STEPS_EN;

  const completedSteps = userData?.completedSteps || [];

  const toggleStep = async (stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber);
    
    setLoading(true);
    try {
      if (!isCompleted) {
        const stepId = `${user.uid}_step_${stepNumber}`;
        await setDoc(doc(db, 'steps', stepId), {
          userId: user.uid,
          stepNumber,
          completedAt: new Date().toISOString(),
        });
        
        const newCompleted = [...completedSteps, stepNumber];
        await updateDoc(doc(db, 'users', user.uid), {
          points: (userData.points || 0) + 100,
          completedSteps: newCompleted
        });
      } else {
        // Undo completion
        const newCompleted = completedSteps.filter((s: number) => s !== stepNumber);
        await updateDoc(doc(db, 'users', user.uid), {
          points: Math.max(0, (userData.points || 0) - 100),
          completedSteps: newCompleted
        });
      }
    } catch (error) {
      console.error("Error toggling step:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentDetail = selectedStep ? stepDetails[lang][selectedStep] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`space-y-8 ${loading ? 'pointer-events-none opacity-80' : ''}`}
    >
      <header className="mb-10 p-10 bg-natural-sidebar rounded-[2rem] border border-natural-line shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-natural-primary mb-4">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-natural-line">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-serif italic text-natural-ink">{t.guideTitle}</h2>
          </div>
          <p className="text-natural-accent font-medium leading-relaxed max-w-2xl">{t.guideDesc}</p>
          
          <div className="mt-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-natural-accent mb-3">
              <span>{t.overallProgress}</span>
              <span>{Math.round((completedSteps.length / 12) * 100)}%</span>
            </div>
            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-natural-line shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / 12) * 100}%` }}
                className="h-full bg-natural-primary shadow-lg shadow-natural-primary/20"
              />
            </div>
          </div>
        </div>
        <Trophy className="absolute -bottom-10 -right-10 h-48 w-48 text-natural-primary/5 transform rotate-12" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stepsList.map((text, index) => {
          const stepNum = index + 1;
          const isDone = completedSteps.includes(stepNum);
          
          return (
            <div
              key={stepNum}
              className={`group w-full flex flex-col p-6 rounded-[1.5rem] border transition-all text-left relative overflow-hidden ${
                isDone 
                  ? 'bg-natural-line border-natural-line/50 opacity-80' 
                  : 'bg-white border-natural-line hover:border-natural-primary/30 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <button
                  disabled={isDone}
                  onClick={() => toggleStep(stepNum)}
                  className="mt-1 relative z-10 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-7 w-7 text-natural-primary" />
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-natural-line group-hover:border-natural-primary transition-colors flex items-center justify-center text-[10px] font-bold text-natural-accent">
                      {stepNum}
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isDone ? 'text-natural-ink/40' : 'text-natural-accent'}`}>
                      {t.step} {stepNum}
                    </span>
                    {isDone && (
                      <span className="text-[10px] bg-natural-primary/20 text-natural-primary px-2 py-0.5 rounded-full font-bold">
                        {t.completed}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${isDone ? 'text-natural-ink/60 italic' : 'text-natural-ink'}`}>
                    {text}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-current border-opacity-10 opacity-60 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setSelectedStep(stepNum)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Info size={14} />
                  {t.learnMore}
                </button>
                {isDone ? (
                  <button 
                    onClick={() => toggleStep(stepNum)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-natural-accent hover:text-red-500 transition-all underline decoration-dotted"
                  >
                    {lang === 'fr' ? 'Annuler' : 'Undo'}
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleStep(stepNum)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-natural-primary hover:scale-105 transition-all"
                  >
                    {lang === 'fr' ? 'Marquer terminée' : 'Mark as complete'} <ChevronRight size={14} />
                  </button>
                )}
              </div>
              
              {isDone && <CheckCircle2 className="absolute -bottom-6 -right-6 h-24 w-24 text-natural-ink/5 transform rotate-12" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedStep && currentDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-natural-ink/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-natural-bg w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-natural-bg/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-natural-secondary/10 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-natural-secondary" />
                  </div>
                  <h3 className="text-xl font-serif italic text-natural-ink">{currentDetail.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedStep(null)}
                  className="p-2 hover:bg-natural-primary/5 rounded-full text-natural-accent transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 pt-4 overflow-y-auto space-y-8">
                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-natural-accent mb-4 border-l-2 border-natural-primary pl-4">
                    La Vulgarisation
                  </h4>
                  <p className="text-natural-ink text-base leading-relaxed font-medium italic">
                    "{currentDetail.explanation}"
                  </p>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-natural-accent mb-4 border-l-2 border-natural-secondary pl-4">
                    {t.examples}
                  </h4>
                  <ul className="space-y-4">
                    {currentDetail.examples.map((example, i) => (
                      <li key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-natural-line shadow-sm">
                        <div className="h-5 w-5 bg-natural-secondary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-natural-secondary" />
                        </div>
                        <p className="text-sm font-medium text-natural-ink">{example}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <button 
                  onClick={() => setSelectedStep(null)}
                  className="w-full bg-natural-ink text-white font-bold py-4 rounded-2xl hover:bg-natural-primary transition-all shadow-xl shadow-natural-ink/10"
                >
                  Compris
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 bg-natural-secondary/10 rounded-3xl border border-natural-secondary/20 flex gap-4 text-natural-secondary items-center">
        <div className="h-10 w-10 bg-natural-secondary/20 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="text-xs font-medium leading-relaxed">
          {t.stepsTip}
        </p>
      </div>
    </motion.div>
  );
};

export default Steps;
