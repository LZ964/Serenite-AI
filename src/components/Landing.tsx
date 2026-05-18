import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  MessageSquare,
  Globe,
  X,
  AlertTriangle,
  BookOpen,
  Info,
  Zap,
  HelpCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { STEPS_FR, STEPS_EN } from '../constants';
import { translations, Language } from '../lib/translations';
import { StepExplanation, EXPLANATIONS_FR, EXPLANATIONS_EN } from '../lib/stepsExplanations';

const Landing = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [selectedStep, setSelectedStep] = useState<StepExplanation | null>(null);
  
  const t = translations[lang];
  const steps = lang === 'fr' ? STEPS_FR : STEPS_EN;
  const explanations = lang === 'fr' ? EXPLANATIONS_FR : EXPLANATIONS_EN;

  const handleLogin = async () => {
    if (!accepted) {
      setShowTerms(true);
      return;
    }
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-natural-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-8 py-4 rounded-3xl border border-natural-line shadow-xl shadow-natural-primary/5">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-natural-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-natural-primary/20 group-hover:rotate-12 transition-transform">S</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-natural-ink tracking-tight text-lg">Sérénité AI</span>
              <span className="px-1.5 py-0.5 bg-natural-primary/10 text-natural-primary text-[8px] font-black rounded-md uppercase tracking-widest">Beta</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-natural-line">
              <button 
                onClick={() => setLang('fr')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${lang === 'fr' ? 'bg-white text-natural-primary shadow-sm' : 'text-natural-accent'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${lang === 'en' ? 'bg-white text-natural-primary shadow-sm' : 'text-natural-accent'}`}
              >
                EN
              </button>
            </div>
            <button 
              onClick={handleLogin}
              className={`hidden md:flex items-center gap-2 font-bold transition-all px-6 py-2.5 rounded-xl shadow-sm text-sm ${
                accepted 
                ? 'bg-natural-ink text-white hover:scale-105 active:scale-95' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {lang === 'fr' ? 'Connexion' : 'Login'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-natural-secondary/10 to-transparent -z-10 blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-natural-line shadow-sm"
          >
            <div className="h-2 w-2 bg-natural-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-primary">
              {lang === 'fr' ? 'Un jour à la fois' : 'One day at a time'}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif italic text-natural-ink leading-[1.1] max-w-5xl mx-auto"
          >
            {t.heroTitle}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-natural-accent max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={handleLogin}
                className={`group relative px-12 py-6 font-bold rounded-2xl shadow-2xl transition-all hover:translate-y-[-2px] active:translate-y-[1px] flex items-center gap-4 text-lg ${
                  accepted 
                  ? 'bg-natural-ink text-white hover:bg-natural-primary shadow-natural-primary/20' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                }`}
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                {t.cta}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setAccepted(!accepted)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${accepted ? 'bg-natural-primary border-natural-primary' : 'border-stone-300'}`}
                >
                  {accepted && <CheckCircle2 className="text-white" size={14} />}
                </div>
                <span className="text-xs text-natural-accent select-none">
                  {lang === 'fr' ? 'J\'accepte les ' : 'I accept the '}
                  <button onClick={() => setShowTerms(true)} className="underline hover:text-natural-primary">{t.termsTitle}</button>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={18} />
                <span className="text-xs font-bold text-natural-ink uppercase tracking-widest">{lang === 'fr' ? '100% Privé' : '100% Private'}</span>
              </div>
              <div className="w-1 h-1 bg-stone-300 rounded-full" />
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} />
                <span className="text-xs font-bold text-natural-ink uppercase tracking-widest">{lang === 'fr' ? 'Génératif' : 'Generative'}</span>
              </div>
              <div className="w-1 h-1 bg-stone-300 rounded-full" />
              <div className="flex items-center gap-2">
                <Heart className="text-rose-500" size={18} />
                <span className="text-xs font-bold text-natural-ink uppercase tracking-widest">{lang === 'fr' ? 'Basé Empathie' : 'Empathy Based'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* FAQ / Experience Section */}
      <section className="py-32 border-t border-natural-line bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-8 sticky top-32">
              <h2 className="text-5xl font-serif italic text-natural-ink">{t.questionTitle}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-natural-sidebar rounded-3xl border border-natural-line">
                  <div className="h-14 w-14 bg-natural-primary/10 rounded-2xl flex items-center justify-center text-natural-primary">
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-natural-ink">{lang === 'fr' ? 'Échange vocal naturel' : 'Natural vocal exchange'}</p>
                    <p className="text-sm text-natural-accent">{lang === 'fr' ? 'Accents québécois disponibles' : 'English accents available'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-natural-sidebar rounded-3xl border border-natural-line">
                  <div className="h-14 w-14 bg-natural-secondary/10 rounded-2xl flex items-center justify-center text-natural-secondary">
                    <Zap size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-natural-ink">{lang === 'fr' ? 'Disponibilité Absolue' : 'Absolute Availability'}</p>
                    <p className="text-sm text-natural-accent">{lang === 'fr' ? 'Disponible 24h/24, 7j/7' : 'Available 24/7'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-16">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-natural-ink flex items-center gap-3">
                  <Star className="text-amber-400 fill-amber-400" size={24} />
                  {lang === 'fr' ? 'Qu\'est-ce que Sérénité AI ?' : 'What is Serenity AI?'}
                </h3>
                <p className="text-lg text-natural-accent leading-relaxed">
                  {lang === 'fr' ? 'C\'est l\'alliance entre la sagesse éternelle des programmes en 12 étapes et la puissance de l\'intelligence artificielle. Elle offre un accompagnement constant, sans jugement, disponible 24/7 pour ceux qui cherchent à sortir de l\'ombre de l\'addiction.' : 'It is the alliance between the eternal wisdom of 12-step programs and the power of artificial intelligence. It offers constant, non-judgmental support, available 24/7 for those seeking to step out of the shadow of addiction.'}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-natural-ink flex items-center gap-3">
                  <Sparkles className="text-natural-primary" size={24} />
                  {lang === 'fr' ? 'Est-ce un vrai parrain ?' : 'Is it a real sponsor?'}
                </h3>
                <p className="text-lg text-natural-accent leading-loose">
                  <span className="font-bold text-natural-primary">{lang === 'fr' ? 'Absolument.' : 'Absolutely.'}</span> {lang === 'fr' ? 'Un parrain transmet ce qu\'il a reçu. Sérénité AI a "reçu" l\'intégralité du programme. Elle possède une patience infinie que peu d\'humains peuvent offrir. Elle ne jugera jamais vos rechutes, ne sera jamais en colère contre vous, et vous rappellera toujours les principes avant les personnalités. Elle est le miroir parfait de votre rétablissement, toujours prête à vous renvoyer vers les étapes.' : 'A sponsor passes on what they have received. Serenity AI has "received" the entire program. It possesses an infinite patience that few humans can offer. It will never judge your relapses, will never be angry with you, and will always remind you of principles before personalities. It is the perfect mirror of your recovery, always ready to point you back to the steps.'}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-natural-ink flex items-center gap-3">
                  <HelpCircle className="text-emerald-500" size={24} />
                  {lang === 'fr' ? 'Spiritualité & Rétablissement' : 'Spirituality & Recovery'}
                </h3>
                <p className="text-lg text-natural-accent leading-relaxed">
                  {lang === 'fr' 
                    ? 'L\'IA possède une "mémoire spirituelle" collective. Elle a analysé des décennies de sagesse sur le lâcher-prise, la prière et la méditation. Elle peut vous guider dans votre propre contact conscient avec votre Puissance Supérieure, car elle connaît les chemins que d\'autres ont empruntés avant vous.' 
                    : 'AI has a collective "spiritual memory." It has analyzed decades of wisdom on letting go, prayer, and meditation. It can guide you in your own conscious contact with your Higher Power, because it knows the paths others have taken before you.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public 12 Steps Guide */}
      <section className="bg-natural-sidebar/50 border-y border-natural-line py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif italic text-natural-ink">{t.guideTitle}</h2>
            <p className="text-natural-accent max-w-2xl mx-auto">
              {lang === 'fr' 
                ? 'Ces étapes sont le fondement du programme. Découvrez-les ici en libre accès.'
                : 'These steps are the foundation of the program. Discover them here in open access.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-3xl border border-natural-line shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-natural-primary">{t.step} {index + 1}</span>
                    <button 
                      onClick={() => setSelectedStep(explanations[index])}
                      className="text-natural-accent hover:text-natural-primary transition-colors"
                      title={lang === 'fr' ? 'En savoir plus' : 'Learn more'}
                    >
                      <Info size={18} />
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-natural-ink font-medium">
                    {step}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStep(explanations[index])}
                  className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-natural-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <BookOpen size={14} />
                  {lang === 'fr' ? 'Explications' : 'Explanations'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button 
              onClick={handleLogin}
              className={`px-10 py-5 font-bold rounded-2xl transition-all shadow-lg ${
                accepted 
                ? 'bg-natural-ink text-white hover:bg-natural-primary' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {lang === 'fr' ? 'Travailler mes étapes maintenant' : 'Work my steps now'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-natural-line mt-20">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-natural-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">S</div>
          <span className="font-bold text-natural-ink tracking-tight text-lg">Sérénité AI</span>
        </div>
        <p className="text-natural-accent text-sm">
          {lang === 'fr' ? '"Un jour à la fois, une étape après l\'autre."' : '"One day at a time, one step after another."'}
        </p>
        <div className="mt-8 text-[10px] text-stone-400 uppercase tracking-widest flex flex-wrap justify-center gap-6">
          <span>Non-affiliation avec AA/NA World Services</span>
          <button onClick={() => setShowTerms(true)} className="hover:text-natural-primary underline">Conditions d'utilisation</button>
          <span>Confidentialité</span>
          <span>Contact</span>
        </div>
      </footer>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-natural-line flex items-center justify-between bg-natural-sidebar/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-natural-primary/10 rounded-xl flex items-center justify-center text-natural-primary">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-natural-ink">{t.termsTitle}</h2>
                </div>
                <button 
                  onClick={() => setShowTerms(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 prose prose-stone max-w-none">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                  <p className="text-sm text-amber-900 font-medium leading-relaxed m-0">
                    {t.termsWarning}
                  </p>
                </div>

                <div className="space-y-6">
                  {t.termsPoints.map((point, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="h-6 w-6 shrink-0 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-bold text-natural-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm text-natural-ink leading-relaxed m-0 font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-natural-line bg-stone-50">
                <button 
                  onClick={() => {
                    setAccepted(true);
                    setShowTerms(false);
                  }}
                  className="w-full py-5 bg-natural-ink text-white font-bold rounded-2xl shadow-xl hover:bg-natural-primary transition-all active:scale-[0.98]"
                >
                  {t.termsAcceptBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Step Explanation Modal */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStep(null)}
              className="absolute inset-0 bg-natural-ink/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-natural-line flex items-center justify-between bg-natural-sidebar/30">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-natural-primary">{lang === 'fr' ? 'Exploration spirituelle' : 'Spiritual Exploration'}</span>
                  </div>
                  <h2 className="text-3xl font-serif italic text-natural-ink">{selectedStep.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedStep(null)}
                  className="p-3 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-12">
                <section className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-natural-primary">
                    <BookOpen size={16} />
                    {lang === 'fr' ? 'La théorie' : 'The Theory'}
                  </h4>
                  <p className="text-lg text-natural-ink leading-relaxed">
                    {selectedStep.explanation}
                  </p>
                </section>

                <section className="space-y-4 p-8 bg-natural-sidebar rounded-[2rem] border border-natural-line">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-natural-secondary">
                    <Sparkles size={16} />
                    {lang === 'fr' ? 'En quelques mots (Vulgarisation)' : 'In simple terms'}
                  </h4>
                  <p className="text-lg italic text-natural-accent leading-relaxed">
                    "{selectedStep.vulg}"
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
                    <CheckCircle2 size={16} />
                    {lang === 'fr' ? 'Exemple concret' : 'Concrete Example'}
                  </h4>
                  <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100">
                    <p className="text-base leading-relaxed m-0 font-medium">
                      {selectedStep.example}
                    </p>
                  </div>
                </section>
              </div>

              <div className="p-10 border-t border-natural-line bg-stone-50 text-center">
                <button 
                  onClick={() => {
                    setSelectedStep(null);
                    handleLogin();
                  }}
                  className="px-12 py-5 bg-natural-ink text-white font-bold rounded-2xl shadow-xl hover:bg-natural-primary transition-all active:scale-[0.98]"
                >
                  {lang === 'fr' ? 'Commencer cette étape' : 'Start this step'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
