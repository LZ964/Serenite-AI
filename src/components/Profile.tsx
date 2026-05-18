import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Trash2, 
  CreditCard, 
  Calendar, 
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

interface ProfileProps {
  user: any;
  userData: any;
  lang: Language;
  onUpgrade: () => void;
  onPortal: () => void;
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
      userId: db.app.options.apiKey ? 'authenticated' : 'not-authenticated',
      email: null,
      emailVerified: null,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const Profile: React.FC<ProfileProps> = ({ user, userData, lang, onUpgrade, onPortal }) => {
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [sobrietyDate, setSobrietyDate] = useState(userData?.sobrietyDate?.split('T')[0] || '');
  const [recoveryStartDate, setRecoveryStartDate] = useState(userData?.recoveryStartDate?.split('T')[0] || '');
  const [higherPower, setHigherPower] = useState(userData?.higherPower || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const t = translations[lang];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : new Date().toISOString(),
        recoveryStartDate: recoveryStartDate ? new Date(recoveryStartDate).toISOString() : new Date().toISOString(),
        higherPower
      });
      setMessage({ type: 'success', text: lang === 'fr' ? 'Profil mis à jour avec succès.' : 'Profile updated successfully.' });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      setMessage({ type: 'error', text: lang === 'fr' ? 'Erreur lors de la mise à jour.' : 'Error during update.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm(lang === 'fr' ? "Êtes-vous sûr de vouloir supprimer TOUTE la mémoire de votre parrain ? Cette action est irréversible." : "Are you sure you want to delete ALL your sponsor's memory? This action is irreversible.")) {
      return;
    }

    setIsDeletingHistory(true);
    setMessage(null);
    try {
      const q = query(collection(db, 'messages'), where('userId', '==', user.uid));
      let snap;
      try {
        snap = await getDocs(q);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'messages');
        return;
      }
      
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'messages_batch');
      }

      setMessage({ type: 'success', text: lang === 'fr' ? 'Mémoire de l\'IA supprimée.' : 'AI memory deleted.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: lang === 'fr' ? 'Erreur lors de la suppression.' : 'Error during deletion.' });
    } finally {
      setIsDeletingHistory(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 bg-natural-primary/10 rounded-xl flex items-center justify-center text-natural-primary">
          <UserIcon size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-serif text-natural-ink italic">{t.profile}</h2>
          <p className="text-natural-accent text-sm">{lang === 'fr' ? 'Gérez votre compte et vos préférences.' : 'Manage your account and preferences.'}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <section className="bg-white rounded-3xl p-8 border border-natural-line shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-natural-ink flex items-center gap-2">
            <UserIcon size={20} className="text-natural-primary" />
            {lang === 'fr' ? 'Informations personnelles' : 'Personal information'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">{t.displayNameLabel}</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-natural-sidebar border border-natural-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">{t.sobrietyDateLabel}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-accent h-5 w-5" />
                <input 
                  type="date" 
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  className="w-full bg-natural-sidebar border border-natural-line rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
                />
              </div>
              <p className="mt-1 text-[10px] text-natural-accent italic">{lang === 'fr' ? 'Date du dernier jour de consommation.' : 'Date of last day of consumption.'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">{t.recoveryStartDateLabel}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-accent h-5 w-5" />
                <input 
                  type="date" 
                  value={recoveryStartDate}
                  onChange={(e) => setRecoveryStartDate(e.target.value)}
                  className="w-full bg-natural-sidebar border border-natural-line rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
                />
              </div>
              <p className="mt-1 text-[10px] text-natural-accent italic">{lang === 'fr' ? 'Date du début de vos démarches globales.' : 'Date your global journey began.'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">{t.higherPowerLabel}</label>
              <div className="space-y-3">
                <select 
                  value={['Le groupe', 'L\'univers', 'La vie', 'Dieu', 'Le hasard', 'Ma chaise', 'The group', 'The universe', 'Life', 'God', 'Chance', 'My chair'].includes(higherPower) ? higherPower : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setHigherPower(e.target.value);
                  }}
                  className="w-full bg-natural-sidebar border border-natural-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
                >
                  <option value="">{t.notDefined}</option>
                  <option value={lang === 'fr' ? 'Le groupe' : 'The group'}>{lang === 'fr' ? 'Le groupe (AA/NA)' : 'The group (AA/NA)'}</option>
                  <option value={lang === 'fr' ? 'L\'univers' : 'The universe'}>{lang === 'fr' ? 'L\'univers' : 'The universe'}</option>
                  <option value={lang === 'fr' ? 'La vie' : 'Life'}>{lang === 'fr' ? 'La vie / La nature' : 'Life / Nature'}</option>
                  <option value={lang === 'fr' ? 'Dieu' : 'God'}>{lang === 'fr' ? 'Dieu' : 'God'}</option>
                  <option value={lang === 'fr' ? 'Le hasard' : 'Chance'}>{lang === 'fr' ? 'Le hasard' : 'Chance'}</option>
                  <option value={lang === 'fr' ? 'Ma chaise' : 'My chair'}>{lang === 'fr' ? 'Ma chaise de meeting' : 'My meeting chair'}</option>
                  <option value="custom">{lang === 'fr' ? 'Autre (personnalisé)...' : 'Other (custom)...'}</option>
                </select>
                
                {(!['Le groupe', 'L\'univers', 'La vie', 'Dieu', 'Le hasard', 'Ma chaise', 'The group', 'The universe', 'Life', 'God', 'Chance', 'My chair', ''].includes(higherPower) || higherPower === 'custom') && (
                  <input 
                    type="text" 
                    placeholder={lang === 'fr' ? 'Définissez votre puissance supérieure...' : 'Define your higher power...'}
                    value={higherPower === 'custom' ? '' : higherPower}
                    onChange={(e) => setHigherPower(e.target.value)}
                    className="w-full bg-white border border-natural-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
                  />
                )}
                <p className="text-[10px] text-natural-accent italic leading-relaxed">
                  {lang === 'fr' 
                    ? '"Pourvu que ce soit une puissance en laquelle vous pouvez avoir confiance et qui est supérieure à vous-même."'
                    : '"As long as it is a power you can trust and that is greater than yourself."'
                  }
                </p>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-natural-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-natural-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? t.saving : t.saveChanges}
            </button>
          </div>
        </section>

        {/* Subscription & Billing */}
        <section className="bg-white rounded-3xl p-8 border border-natural-line shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-natural-ink flex items-center gap-2 mb-6">
              <CreditCard size={20} className="text-natural-secondary" />
              {t.billing}
            </h3>
            
            <div className={`p-4 rounded-2xl border ${userData?.isPremium ? 'bg-natural-primary/5 border-natural-primary/20' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-natural-ink">{lang === 'fr' ? 'Statut actuel' : 'Current status'}</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${userData?.isPremium ? 'bg-natural-primary text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {userData?.isPremium ? 'Premium' : (lang === 'fr' ? 'Gratuit' : 'Free')}
                </span>
              </div>
              <p className="text-xs text-natural-accent leading-relaxed">
                {userData?.isPremium 
                  ? (lang === 'fr' ? 'Vous bénéficiez de toutes les fonctionnalités premium, y compris la mémoire infinie de votre parrain.' : 'You benefit from all premium features, including infinite memory of your sponsor.')
                  : (lang === 'fr' ? 'Vous utilisez la version gratuite limitée à 10 messages par parrain.' : 'You are using the free version limited to 10 messages per sponsor.')}
              </p>
            </div>
          </div>

          <button 
            onClick={onPortal}
            className="w-full bg-white border border-natural-line text-natural-ink font-bold py-4 rounded-xl hover:bg-natural-sidebar transition-all flex items-center justify-center gap-2 mt-6"
          >
            <CreditCard size={18} className="text-natural-secondary" />
            {t.manageBilling}
          </button>
        </section>

        {/* AI Memory / Privacy */}
        <section className="bg-red-50/50 rounded-3xl p-8 border border-red-100 shadow-sm space-y-6 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                <Trash2 size={20} />
                {lang === 'fr' ? 'Mémoire de l\'IA et Confidentialité' : 'AI Memory and Privacy'}
              </h3>
              <p className="text-sm text-red-600 mt-2 max-w-2xl">
                {lang === 'fr' 
                  ? 'Si vous souhaitez repartir à zéro, vous pouvez supprimer tout l\'historique de vos conversations avec votre parrain virtuel. Cela effacera sa mémoire de vos échanges passés.'
                  : 'If you wish to start fresh, you can delete all your conversation history with your virtual sponsor. This will erase its memory of your past exchanges.'
                }
              </p>
            </div>
            
            <button 
              onClick={handleDeleteHistory}
              disabled={isDeletingHistory}
              className="bg-red-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              <Trash2 size={18} />
              {isDeletingHistory ? (lang === 'fr' ? 'Suppression...' : 'Deleting...') : (lang === 'fr' ? 'Supprimer la mémoire' : 'Delete memory')}
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Profile;
