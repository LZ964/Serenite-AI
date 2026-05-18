import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { CheckCircle2, Circle, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

interface StepsProps {
  user: any;
  userData: any;
}

const STEPS = [
  "Nous avons admis que nous étions impuissants devant notre dépendance, que nous avions perdu la maîtrise de notre vie.",
  "Nous en sommes venus à croire qu'une Puissance supérieure à nous-mêmes pouvait nous rendre la raison.",
  "Nous avons décidé de confier notre volonté et notre vie aux soins de Dieu tel que nous L'avons compris.",
  "Nous avons procédé à un inventaire moral, courageux et minutieux de nous-mêmes.",
  "Nous avons avoué à Dieu, à nous-mêmes et à un autre être humain la nature exacte de nos torts.",
  "Nous étions tout à fait prêts à ce que Dieu élimine tous ces défauts de caractère.",
  "Nous Lui avons humblement demandé de faire disparaître nos déficiences.",
  "Nous avons dressé une liste de toutes les personnes que nous avions lésées et nous avons consenti à leur faire amende honorable.",
  "Nous avons fait amende honorable directement envers ces personnes dans toute la mesure du possible, sauf dans les cas où cela leur aurait nui ou aurait nui à d'autres.",
  "Nous avons poursuivi notre inventaire personnel et, dès que nous nous sommes rendu compte que nous avions tort, nous l'avons admis.",
  "Nous avons cherché par la prière et la méditation à améliorer notre contact conscient avec Dieu, tel que nous L'avons compris, Lui demandant seulement de connaître Sa volonté à notre égard et de nous donner la force de l'exécuter.",
  "Ayant connu un éveil spirituel comme résultat de ces étapes, nous avons alors essayé de transmettre ce message à d'autres dépendants et de mettre en pratique ces principes dans tous les domaines de notre vie."
];

const Steps: React.FC<StepsProps> = ({ user, userData }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const q = query(collection(db, 'steps'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const steps = snap.docs.map(d => d.data().stepNumber);
      setCompletedSteps(steps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = async (stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber);
    
    // For simplicity, we just add or we'd have to find the doc to remove it.
    // In this app, we'll focus on adding.
    if (!isCompleted) {
      const stepId = `${user.uid}_step_${stepNumber}`;
      await setDoc(doc(db, 'steps', stepId), {
        userId: user.uid,
        stepNumber,
        completedAt: new Date().toISOString(),
      });
      
      // Reward points and sync steps to user doc
      const newCompleted = [...completedSteps, stepNumber];
      await updateDoc(doc(db, 'users', user.uid), {
        points: (userData.points || 0) + 100,
        completedSteps: newCompleted
      });
      setCompletedSteps(newCompleted);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="mb-10 p-10 bg-natural-sidebar rounded-[2rem] border border-natural-line shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-natural-primary mb-4">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-natural-line">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-serif italic text-natural-ink">Le Guide des 12 Étapes</h2>
          </div>
          <p className="text-natural-accent font-medium leading-relaxed max-w-2xl">Un processus de changement spirituel et émotionnel profond. Travaillez les étapes à votre rythme avec l'aide de votre parrain.</p>
          
          <div className="mt-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-natural-accent mb-3">
              <span>Progression Globale</span>
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
        <BookOpen className="absolute -bottom-10 -right-10 h-48 w-48 text-natural-primary/5 transform rotate-12" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((text, index) => {
          const stepNum = index + 1;
          const isDone = completedSteps.includes(stepNum);
          
          return (
            <button
              key={stepNum}
              onClick={() => toggleStep(stepNum)}
              className={`group w-full flex items-start gap-4 p-6 rounded-[1.5rem] border transition-all text-left relative overflow-hidden ${
                isDone 
                  ? 'bg-natural-primary text-white border-transparent shadow-lg shadow-natural-primary/20' 
                  : 'bg-white border-natural-line hover:border-natural-primary/30 shadow-sm'
              }`}
            >
              <div className="mt-1 relative z-10">
                {isDone ? (
                  <CheckCircle2 className="h-7 w-7 text-white shrink-0" />
                ) : (
                  <div className="h-7 w-7 rounded-full border-2 border-natural-line group-hover:border-natural-primary transition-colors flex items-center justify-center text-[10px] font-bold text-natural-accent">
                    {stepNum}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isDone ? 'text-white/60' : 'text-natural-accent'}`}>
                    Étape {stepNum}
                  </span>
                  {isDone && (
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                      Complétée
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${isDone ? 'text-white font-medium italic' : 'text-natural-ink'}`}>
                  {text}
                </p>
              </div>
              {!isDone && <ChevronRight className="h-5 w-5 text-natural-line group-hover:text-natural-primary transition-colors shrink-0 mt-2 relative z-10" />}
              {isDone && <CheckCircle2 className="absolute -bottom-6 -right-6 h-24 w-24 text-white/5 transform rotate-12" />}
            </button>
          );
        })}
      </div>

      <div className="p-6 bg-natural-secondary/10 rounded-3xl border border-natural-secondary/20 flex gap-4 text-natural-secondary items-center">
        <div className="h-10 w-10 bg-natural-secondary/20 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="text-xs font-medium leading-relaxed">
          Le travail des étapes est souvent plus efficace lorsqu'il est partagé. 
          N'hésitez pas à demander conseil à votre parrain AI sur la façon d'aborder une étape spécifique.
        </p>
      </div>
    </motion.div>
  );
};

export default Steps;
