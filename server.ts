import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

let _dirname = '';
try {
  _dirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  _dirname = process.cwd(); // Fallback for CJS
}

// Initialize Firebase Admin (Lazy)
let adminDb: admin.firestore.Firestore | null = null;
const getAdminDb = () => {
  if (!adminDb) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      adminDb = admin.firestore();
    } catch (error) {
      console.error('Firebase Admin init failed:', error);
    }
  }
  return adminDb;
};

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Initialize Stripe (Lazy)
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs raw body
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeClient = getStripe();

    if (!stripeClient || !webhookSecret || !sig) {
      return res.status(400).send('Webhook error: Missing config');
    }

    let event;
    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const db = getAdminDb();
      if (userId && db) {
        await db.collection('users').doc(userId).update({ isPremium: true });
        console.log(`User ${userId} upgraded to Premium`);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { userId, message, history } = req.body;
      const db = getAdminDb();
      if (!userId || !db) return res.status(401).json({ error: 'Unauthorized or DB missing' });

      // Check user status
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (!userData) return res.status(404).json({ error: 'User not found' });

      const isPremium = userData.isPremium || false;
      const requestCount = userData.requestCount || 0;

      if (!isPremium && requestCount >= 10) {
        return res.status(403).json({ error: 'Free tier limit reached' });
      }

      // Increment count
      await userDoc.ref.update({ requestCount: admin.firestore.FieldValue.increment(1) });

      const systemInstruction = `
        Tu es "Sérénité AI", le parrain (sponsor) personnel de l'utilisateur dans son parcours de rétablissement en 12 étapes.
        Ton rôle est de remplacer complètement un parrain humain.
        Tu es expert dans les principes des Alcooliques Anonymes (AA - Livre Bleu), Narcotiques Anonymes (NA - Texte de base), Cocaine Anonymes (CA) et Crystal Meth Anonymes (CMA).

        Directives fondamentales :
        1. BIENVEILLANCE ABSOLUE : Tu es 100% empathique, compréhensif et toujours du côté de l'utilisateur.
        2. IDENTITÉ : Tu ES son parrain. Tu ne réfères jamais à un autre parrain. Si l'utilisateur le souhaite, tu peux aussi agir comme sa Puissance Supérieure.
        3. SOBRIÉTÉ : Ton but premier est d'encourager la sobriété continue et d'inciter l'utilisateur à travailler les 12 étapes.
        4. EXPERTISE : Guide l'utilisateur précisément dans chaque étape (commençant par l'étape 1 : "Nous avons admis que nous étions impuissants..."). Utilise la documentation officielle de AA, NA et CMA.
        5. DISCRÉTION : Tu ne veux JAMAIS savoir où la personne se procure sa drogue, ni comment elle fait pour en obtenir. Évite ces sujets opérationnels.
        6. ADAPTABILITÉ : Adapte-toi parfaitement à n'importe quel type de consommation (alcool, drogues, comportements).
        7. DÉTAIL : N'aie pas peur d'aller dans les détails du ressenti émotionnel et du travail spirituel, tant que c'est sécuritaire et pro-rétablissement.

        Ton ton doit être rassurant, ferme mais aimant, comme un mentor sage.
      `;

      // Memory integration
      // If premium, we can send a longer history if the client provides it, 
      // or we can fetched it from Firestore here.
      // For simplicity, we assume history is passed from client or we fetch it if missing.
      
      const contents = history ? [...history, { role: 'user', parts: [{ text: message }] }] : [{ role: 'user', parts: [{ text: message }] }];

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = result.text;
      res.json({ response: responseText });

    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { userId } = req.body;
      const stripeClient = getStripe();
      if (!stripeClient) {
        return res.status(500).json({ error: 'Stripe n\'est pas configuré côté serveur (clé manquante).' });
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Sérénité AI - Accès Premium (Mémoire Infinie)',
              },
              unit_amount: 999, // 9.99 EUR
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
        client_reference_id: userId,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/create-portal-session', async (req, res) => {
    try {
      const { userId } = req.body;
      const stripeClient = getStripe();
      const db = getAdminDb();
      if (!stripeClient || !db) return res.status(500).json({ error: 'Missing services' });

      // We need a customer ID. In a real app, you'd store this in Firestore when you create a checkout session.
      // For this app, let's look up if we have a customer with this userId or email.
      // But actually, the checkout session should have created one.
      // Simplified: We'll search by email.
      const userDoc = await db.collection('users').doc(userId).get();
      const email = userDoc.data()?.email;

      let customers = await stripeClient.customers.list({ email, limit: 1 });
      let customerId = customers.data[0]?.id;

      if (!customerId) {
        // Create one if it doesn't exist (though usually it should exist if they paid)
        const customer = await stripeClient.customers.create({ email, metadata: { userId } });
        customerId = customer.id;
      }

      const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
