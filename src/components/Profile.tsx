import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Trash2, 
  CreditCard, 
  Calendar, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface ProfileProps {
  user: any;
  userData: any;
}

const Profile: React.FC<ProfileProps> = ({ user, userData }) => {
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [sobrietyDate, setSobrietyDate] = useState(userData?.sobrietyDate?.split('T')[0] || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        sobrietyDate: new Date(sobrietyDate).toISOString()
      });
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer TOUTE la mémoire de votre parrain ? Cette action est irréversible.")) {
      return;
    }

    setIsDeletingHistory(true);
    setMessage(null);
    try {
      const q = query(collection(db, 'messages'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // Also reset request count if needed? User asked to "supprimer la mémoire de son IA".
      // Usually that means chat history.
      
      setMessage({ type: 'success', text: 'Mémoire de l\'IA supprimée.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    } finally {
      setIsDeletingHistory(false);
    }
  };

  const handleBillingPortal = async () => {
    setIsBillingLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Impossible d'ouvrir le portail de facturation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    } finally {
      setIsBillingLoading(false);
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
        <div className="h-16 w-16 bg-natural-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-8 w-8 text-natural-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-serif text-natural-ink italic">Mon Profil</h2>
          <p className="text-natural-accent">Personnalisez votre expérience et gérez votre compte.</p>
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
            <User size={20} className="text-natural-primary" />
            Informations personnelles
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">Nom d'affichage</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-natural-sidebar border border-natural-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-natural-accent mb-2">Date de sobriété</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-accent h-5 w-5" />
                <input 
                  type="date" 
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  className="w-full bg-natural-sidebar border border-natural-line rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-natural-primary transition-all font-medium"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-natural-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-natural-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </section>

        {/* Subscription & Billing */}
        <section className="bg-white rounded-3xl p-8 border border-natural-line shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-natural-ink flex items-center gap-2 mb-6">
              <CreditCard size={20} className="text-natural-secondary" />
              Abonnement et Facturation
            </h3>
            
            <div className={`p-4 rounded-2xl border ${userData?.isPremium ? 'bg-natural-primary/5 border-natural-primary/20' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-natural-ink">Statut actuel</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${userData?.isPremium ? 'bg-natural-primary text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {userData?.isPremium ? 'Premium' : 'Gratuit'}
                </span>
              </div>
              <p className="text-xs text-natural-accent leading-relaxed">
                {userData?.isPremium 
                  ? 'Vous bénéficiez de toutes les fonctionnalités premium, y compris la mémoire infinie de votre parrain.' 
                  : 'Vous utilisez la version gratuite limitée à 10 messages par parrain.'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleBillingPortal}
            disabled={isBillingLoading}
            className="w-full bg-white border border-natural-line text-natural-ink font-bold py-4 rounded-xl hover:bg-natural-sidebar transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <CreditCard size={18} className="text-natural-secondary" />
            {isBillingLoading ? 'Chargement...' : 'Gérer ma facturation'}
          </button>
        </section>

        {/* AI Memory / Privacy */}
        <section className="bg-red-50/50 rounded-3xl p-8 border border-red-100 shadow-sm space-y-6 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                <Trash2 size={20} />
                Mémoire de l'IA et Confidentialité
              </h3>
              <p className="text-sm text-red-600 mt-2 max-w-2xl">
                Si vous souhaitez repartir à zéro, vous pouvez supprimer tout l'historique de vos conversations avec votre parrain virtuel. Cela effacera sa mémoire de vos échanges passés.
              </p>
            </div>
            
            <button 
              onClick={handleDeleteHistory}
              disabled={isDeletingHistory}
              className="bg-red-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              <Trash2 size={18} />
              {isDeletingHistory ? 'Suppression...' : 'Supprimer la mémoire'}
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Profile;
