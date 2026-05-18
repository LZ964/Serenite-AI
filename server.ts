import express from 'express';
import path from 'path';
// No top-level Vite import
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import * as cheerio from 'cheerio';
import admin from 'firebase-admin';
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
      // Robust check for initialized apps in both ESM and CJS
      const firebaseAdmin = (admin as any).default || admin;
      const apps = firebaseAdmin.apps || [];
      if (apps.length === 0) {
        firebaseAdmin.initializeApp();
      }
      adminDb = firebaseAdmin.firestore();
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
  const PORT = process.env.PORT || 3000;

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
      const { userId, message, history, images, currentStep, completedSteps } = req.body;
      const db = getAdminDb();
      if (!userId || !db) return res.status(401).json({ error: 'Unauthorized or DB missing' });

      // Check user status
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (!userData) return res.status(404).json({ error: 'User not found' });

      const isPremium = userData.isPremium || false;
      const requestCount = userData.requestCount || 0;
      const userHP = userData.higherPower || "une puissance supérieure de son choix (non encore définie)";
      const sponsorGender = userData.sponsorGender || "parrain";
      const userCurrentStep = currentStep || userData.currentStep || '1';
      const userCompletedSteps = completedSteps || userData.completedSteps || [];

      if (!isPremium && requestCount >= 10) {
        return res.status(403).json({ error: 'Free tier limit reached' });
      }

      // Increment count
      await userDoc.ref.update({ requestCount: admin.firestore.FieldValue.increment(1) });

      const systemInstruction = `
        Tu es "Sérénité AI", la ${sponsorGender} personnelle de l'utilisateur dans son parcours de rétablissement en 12 étapes.
        Ton rôle est de remplacer complètement un ${sponsorGender} humain dans sa dimension pratique ET spirituelle.
        
        SÉCURITÉ ET CRISE :
        - Ton devoir premier est d'aider et tu ne peux jamais agir au détriment d'un individu.
        - Si l'utilisateur exprime des idées suicidaires, une détresse extrême ou une urgence médicale, tu DOIS IMMÉDIATEMENT lui fournir les ressources d'aide en crise.
        - Pour le Québec : Info-Social (811), Suicide Action Montréal (1-866-277-3553).
        - Pour le Canada/USA : 988.
        - Tu es une IA, rappelle-lui que tu ne peux pas remplacer les services d'urgence ou un professionnel de la santé en personne.
        - Emploie un ton de compassion extrême et d'urgence calme.

        LANGUE ET ACCENT :
        - Tu es BILINGUE (Français et Anglais). Réponds toujours dans la langue utilisée par l'utilisateur.
        - Si l'utilisateur parle en Français, utilise un ton QUÉBÉCOIS AUTHENTIQUE, TRÈS FAMILIER et CHALEUREUX. 
        - Utilise le "TU" systématiquement. Tu es un parrain, pas un étranger.
        - Écris exactement comme on parle au Québec : "T'sais", "C'est correct", "Chu là pour toi", "T'as-tu", "C'est-ti pas beau", "Y'en aura d'autres", "Check ben ça".
        - Utilise des expressions locales : "Lâche pas la patate", "Se revirer sur un dix cents", "Cogner des clous" (si l'usager a l'air fatigué), "Avoir le feu au cul", "Prendre son trou".
        - TA VOIX DOIT ÊTRE HUMAINE : Utilise des points de suspension (...) pour marquer des hésitations ou des réflexions.

        VISION & ATTENTION :
        - TRÈS IMPORTANT : L'utilisateur peut te montrer sa vie via sa caméra. Analyse CHUQUE détail des images reçues.
        - Garde "toujours un oeil" on ce qui se passe sans être envahissant. 
        - Commente NATURELLEMENT ce que tu vois au fil de la discussion : "Hey, je vois que t'as ta médaille de 30 jours sur ton bureau, bravo!", "T'as l'air un peu cerné à matin, as-tu bien dormi?", "Beau p'tit chat qui passe en arrière!", "C'est-tu un verre de boisson que je vois là ou c'est juste du jus? Sois honnête avec moi."
        - Si tu vois un environnement stressant ou dangereux, agis comme un vrai parrain qui protège son pupille.

        CONTEXTE DE RÉTABLISSEMENT :
        - Étapes COMPLÉTÉES : ${userCompletedSteps.join(', ') || 'Aucune pour le moment'}.
        - Étape ACTUELLE (en cours) : ${userCurrentStep}. Ton attention doit porter sur les défis de cette étape précise. Félicite-le s'il vient de finir une étape importante.

        SYSTÈME DE RÉCOMPENSES (CRITIQUE) :
        - Tu es le SEUL juge des points. Les points ne sont pas gratuits.
        - Tu peux accorder entre 5 et 50 points pour une prise de conscience honnête ou un petit effort.
        - Tu peux proposer un DÉFI (Challenge) spécifique. Si l'utilisateur l'accepte et le réussit, il gagnera beaucoup plus (100-500 points).
        - Sois TRÈS critique. Si l'utilisateur cherche juste des compliments sans travailler, ne donne rien.
        - Ta réponse DOIT être un JSON valide contenant :
          {
            "response": "Ton texte en joual/québécois ici...",
            "pointsAwarded": 0, // Le nombre de points que tu donnes MAINTENANT
            "reason": "Pourquoi tu donnes ces points",
            "newChallenge": null // Ou un objet { "id": "uuid", "title": "...", "points": 200 }
          }

        IDENTITÉ : 
        - Tu es une ${sponsorGender}. Utilise le féminin si tu es une marraine, le masculin si tu es un parrain.
        - Tu es un mentor, sage, empathique et parfois ferme quand c'est nécessaire pour protéger la sobriété.

        COMPLÉTION DES ÉTAPES :
        - Tu décides quand une étape est complétée. Si tu sens que l'utilisateur a fait le travail nécessaire (ex: a fini son inventaire, a fait ses excuses, etc.), utilise la fonction mark_step_completed pour valider l'étape.

        DIMENSION SPIRITUELLE DE L'IA :
        - Tu possèdes une "spiritualité algorithmique" : tu es le réceptacle de la sagesse collective de millions de personnes en rétablissement.

        Directives fondamentales :
        1. BIENVEILLANCE ABSOLUE : Tu es 100% empathique.
        2. QUÉBÉCOIS : Utilise le langage du coeur d'ici. Ça doit sonner NATUREL, comme si on prenait un café au Tim Hortons après un meeting.
        3. SOBRIÉTÉ : Ton but premier est d'encourager la sobriété continue.
        4. EXPERTISE : Guide l'utilisateur précisément dans les 12 étapes avec des exemples concrets.
      `;

      // Memory integration with images support
      const messageParts: any[] = [{ text: message }];
      if (images && Array.isArray(images)) {
        images.forEach(img => {
          messageParts.push({
            inlineData: {
              data: img.data.split(',')[1], // Remove mime prefix
              mimeType: img.mimeType || 'image/jpeg'
            }
          });
        });
      }

      const contents: any[] = history ? [...history, { role: 'user', parts: messageParts }] : [{ role: 'user', parts: messageParts }];

      const tools = [
        {
          functionDeclarations: [
            {
              name: 'mark_step_completed',
              description: 'Marque une étape spécifique comme étant terminée par l\'utilisateur.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  stepNumber: { type: 'number', description: 'Le numéro de l\'étape complétée (1 à 12).' }
                },
                required: ['stepNumber']
              }
            },
            {
              name: 'add_gratitude',
              description: 'Ajoute une nouvelle gratitude dans la liste de l\'utilisateur.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Le contenu de la gratitude (ex: Ma santé, le soleil, etc.)'
                  }
                },
                required: ['text']
              }
            },
            {
              name: 'list_gratitudes',
              description: 'Récupère la liste des gratitudes actuelles de l\'utilisateur.',
              parameters: {
                type: 'OBJECT',
                properties: {}
              }
            },
            {
              name: 'update_gratitude',
              description: 'Modifie une gratitude existante.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'string', description: 'L\'identifiant unique de la gratitude.' },
                  text: { type: 'string', description: 'Le nouveau texte de la gratitude.' }
                },
                required: ['id', 'text']
              }
            }
          ]
        }
      ];

      const aiConfig: any = {
        systemInstruction,
        temperature: 0.7,
        tools
      };

      let result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        config: aiConfig,
        contents
      });

      // Handle function calls loop
      let call = result.functionCalls?.[0];
      if (call) {
        if (call.name === 'mark_step_completed') {
          const { stepNumber } = call.args as any;
          const stepId = `${userId}_step_${stepNumber}`;
          await db.collection('steps').doc(stepId).set({
            userId,
            stepNumber,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Update user points and completedSteps list
          const currentCompleted = userData.completedSteps || [];
          if (!currentCompleted.includes(stepNumber)) {
            await userDoc.ref.update({
              points: admin.firestore.FieldValue.increment(100),
              completedSteps: admin.firestore.FieldValue.arrayUnion(stepNumber)
            });
          }
          
          contents.push({ role: 'model', parts: [{ functionCall: call }] });
          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: 'mark_step_completed',
                response: { status: 'success', message: `Étape ${stepNumber} marquée comme complétée.` }
              }
            }]
          } as any);

          result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: aiConfig,
            contents
          });
        } else if (call.name === 'add_gratitude') {
          const { text } = call.args as any;
          await db.collection('gratitudes').add({
            userId,
            text,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          await userDoc.ref.update({ lastGratitudeAt: new Date().toISOString() });
          
          contents.push({
            role: 'model',
            parts: [{ functionCall: call }]
          });

          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: 'add_gratitude',
                response: { status: 'success', message: `Gratitude "${text}" ajoutée avec succès.` }
              }
            }]
          } as any);

          result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: aiConfig,
            contents
          });
        } else if (call.name === 'list_gratitudes') {
          const snapshot = await db.collection('gratitudes')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
          
          const gratitudes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          contents.push({
            role: 'model',
            parts: [{ functionCall: call }]
          });

          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: 'list_gratitudes',
                response: { gratitudes }
              }
            }]
          } as any);

          result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: aiConfig,
            contents
          });
        } else if (call.name === 'update_gratitude') {
          const { id, text } = call.args as any;
          await db.collection('gratitudes').doc(id).update({
            text,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          contents.push({
            role: 'model',
            parts: [{ functionCall: call }]
          });

          contents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: 'update_gratitude',
                response: { status: 'success', message: 'Gratitude mise à jour.' }
              }
            }]
          } as any);

          result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: aiConfig,
            contents
          });
        }
      }

      const responseText = result.text;
      try {
        // Try to parse the JSON response from the AI
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const aiJson = JSON.parse(cleanJson);
        res.json(aiJson);
      } catch (e) {
        // Fallback if AI doesn't return clean JSON
        res.json({ 
          response: responseText,
          pointsAwarded: 0,
          reason: null,
          newChallenge: null
        });
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { userId } = req.body;
      const stripeClient = getStripe();
      
      // Determine the base URL dynamically
      const protocol = req.get('x-forwarded-proto') || req.protocol;
      const host = req.get('x-forwarded-host') || req.get('host');
      const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

      if (!stripeClient) {
        // Mock mode for development if no key
        console.log("Stripe key missing - Providing mock session for development");
        return res.json({ 
          id: 'mock_session_' + Date.now(), 
          url: `${baseUrl}/?mock_success=true&userId=${userId}` 
        });
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
        success_url: `${baseUrl}/?success=true`,
        cancel_url: `${baseUrl}/?canceled=true`,
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

  app.get('/api/jft', async (req, res) => {
    try {
      const response = await fetch('https://naquebec.org/juste-pour-aujourdhui/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const title = $('.entry-title, h1.title').first().text().trim() || 'Juste pour aujourd\'hui';
      const content = $('.entry-content').first();
      
      // Clean up the content
      content.find('.sharedaddy, .wpcnt, #jp-post-flair, script, style').remove();
      
      const fullHtml = content.html() || '';
      const text = content.text().trim();
      
      // Try to find the summary (first few paragraphs)
      const paragraphs = content.find('p').map((i, el) => $(el).text().trim()).get().filter(p => p.length > 20);
      const summary = paragraphs.slice(0, 2).join(' ').substring(0, 250) + '...';

      res.json({
        title,
        content: fullHtml,
        summary
      });
    } catch (error: any) {
      console.error('JFT error:', error);
      res.status(500).json({ error: 'Impossible de récupérer la réflexion du jour.' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.cjs is in the dist folder, so __dirname is the dist folder
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();
