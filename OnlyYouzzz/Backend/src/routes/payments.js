const express = require('express');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

function getUsersCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('users');
}

function getProductsCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('products');
}

function getOrdersCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('orders');
}

// Crée une session de paiement Stripe Checkout
router.post('/checkout', async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
    }
    const stripe = require('stripe')(stripeSecret);

    const { productId, shipping } = req.body || {};
    if (!productId || !ObjectId.isValid(String(productId))) {
      return res.status(400).json({ error: 'productId requis' });
    }

    // Récupérer le produit pour sécuriser prix et vendeur côté serveur
    const products = getProductsCollection(req.app);
    const users = getUsersCollection(req.app);
    const p = await products.findOne({ _id: new ObjectId(String(productId)) });
    if (!p) return res.status(404).json({ error: 'Produit introuvable' });
    const unitAmount = Math.round(Number(p.price) * 100);
    if (!p.sellerId) return res.status(400).json({ error: 'Vendeur inconnu pour ce produit' });
    const seller = await users.findOne({ _id: new ObjectId(String(p.sellerId)) });
    if (!seller) return res.status(404).json({ error: 'Vendeur introuvable' });
    const destinationAccount = seller.stripeAccountId;
    if (!destinationAccount) {
      return res.status(400).json({ error: 'Le vendeur n\'a pas encore configuré ses paiements Stripe.' });
    }

    const origin = req.headers.origin || req.headers.referer || process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

    // Extraire buyerId si le client est authentifié
    let buyerId = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        if (payload && payload.sub) buyerId = String(payload.sub);
      } catch {}
    }

    const applicationFeeAmount = Math.max(0, Math.round(unitAmount * 0.10)); // 10% de commission

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: p.name,
              images: p.imageUrl ? [p.imageUrl] : undefined,
            },
          },
        },
      ],
      success_url: `${origin}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${String(p._id)}?canceled=1`,
      metadata: {
        productId: String(p._id),
        sellerId: String(p.sellerId),
        buyerId: buyerId || '',
        // shipping metadata minimal pour re-créer l'envoi après paiement
        shipping_method: shipping?.method || '', // 'relay' | 'home'
        shipping_relay_id: shipping?.relay?.id || '',
        shipping_address_postalCode: shipping?.address?.postalCode || '',
        shipping_address_city: shipping?.address?.city || '',
        shipping_address_country: shipping?.address?.country || '',
      },
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: destinationAccount },
      },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    console.error('stripe checkout error', e);
    return res.status(500).json({ error: 'Erreur création session Stripe' });
  }
});

// Récupérer les détails d'une session de paiement
router.get('/session', async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
    }
    const stripe = require('stripe')(stripeSecret);
    const id = (req.query.id || '').toString();
    if (!id) return res.status(400).json({ error: 'id requis' });
    const session = await stripe.checkout.sessions.retrieve(id, { expand: ['payment_intent', 'line_items'] });

    // On renvoie un payload simplifié
    return res.status(200).json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata || {},
      line_items: session.line_items || null,
    });
  } catch (e) {
    console.error('stripe session error', e);
    return res.status(500).json({ error: 'Erreur récupération session' });
  }
});

// Marquer un produit comme vendu (supprimer l'annonce) après confirmation de paiement
router.post('/mark-sold', async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
    }
    const stripe = require('stripe')(stripeSecret);
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId requis' });

    // Récupérer la session et vérifier le paiement
    const session = await stripe.checkout.sessions.retrieve(String(sessionId), { expand: ['payment_intent'] });
    const paid = (session.payment_status === 'paid') || (session.status === 'complete');
    if (!paid) return res.status(400).json({ error: 'Paiement non confirmé' });

    const productId = session?.metadata?.productId;
    const sellerId = session?.metadata?.sellerId;
    let buyerId = session?.metadata?.buyerId || null;
    if (!productId || !ObjectId.isValid(String(productId))) return res.status(400).json({ error: 'productId manquant dans la session' });

    // Vérifications de cohérence côté base
    const products = getProductsCollection(req.app);
    const users = getUsersCollection(req.app);
    const p = await products.findOne({ _id: new ObjectId(String(productId)) });
    if (!p) return res.status(200).json({ deleted: true }); // déjà supprimé
    if (sellerId && String(p.sellerId) !== String(sellerId)) {
      return res.status(400).json({ error: 'Incohérence vendeur/produit' });
    }

    // Optionnel: vérifier que le paiement a bien une destination vers le compte Stripe du vendeur
    if (p.sellerId) {
      const u = await users.findOne({ _id: new ObjectId(String(p.sellerId)) });
      const destination = u?.stripeAccountId || null;
      const pi = session.payment_intent;
      // @ts-ignore
      const piDestination = pi && pi.transfer_data ? pi.transfer_data.destination : null;
      if (destination && piDestination && String(destination) !== String(piDestination)) {
        return res.status(400).json({ error: 'Destination de paiement invalide' });
      }
    }

    await products.updateOne(
      { _id: new ObjectId(String(productId)) },
      { $set: { sold: true, soldAt: new Date(), updatedAt: new Date() } }
    );

    // Enregistrer la commande (historique acheteur)
    try {
      // Essayer d'identifier l'acheteur via Authorization si présent
      if (!buyerId) {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (token) {
          try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
            if (payload && payload.sub) buyerId = String(payload.sub);
          } catch {}
        }
      }

      const orders = getOrdersCollection(req.app);
      const amount = session.amount_total || null;
      const currency = session.currency || 'eur';
      const orderDoc = {
        buyerId: buyerId || null,
        sellerId: sellerId || null,
        productId: String(productId),
        amount,
        currency,
        sessionId: session.id,
        createdAt: new Date(),
        productSnapshot: {
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl || null,
          description: p.description || '',
        },
        shipping: {
          method: session?.metadata?.shipping_method || '',
          relayId: session?.metadata?.shipping_relay_id || '',
          address: {
            postalCode: session?.metadata?.shipping_address_postalCode || '',
            city: session?.metadata?.shipping_address_city || '',
            country: session?.metadata?.shipping_address_country || '',
          },
        },
      };
      const insertRes = await orders.insertOne(orderDoc);

      // Créer un envoi lié si des infos de livraison existent
      try {
        const shippingMethod = (session?.metadata?.shipping_method || '').toLowerCase();
        if (shippingMethod === 'relay' || shippingMethod === 'home') {
          const shipments = req.app.locals.mongoClient
            .db(process.env.DB_NAME || 'onlyyouzzz')
            .collection('shipments');
          await shipments.insertOne({
            orderId: String(insertRes.insertedId),
            productId: String(productId),
            buyerId: buyerId || null,
            sellerId: sellerId || null,
            carrier: 'mondialrelay',
            method: shippingMethod,
            status: 'pending',
            trackingNumber: null,
            labelUrl: null,
            shippingData: {
              relayId: session?.metadata?.shipping_relay_id || '',
              address: {
                postalCode: session?.metadata?.shipping_address_postalCode || '',
                city: session?.metadata?.shipping_address_city || '',
                country: session?.metadata?.shipping_address_country || '',
              },
            },
            createdAt: new Date(),
          });
        }
      } catch (e) {
        console.error('shipment insert error', e);
      }
    } catch (e) {
      console.error('order insert error', e);
    }

    return res.status(200).json({ sold: true, productId: String(productId) });
  } catch (e) {
    console.error('mark-sold error', e);
    return res.status(500).json({ error: 'Erreur suppression produit' });
  }
});

// Historique d'achats de l'acheteur connecté
router.get('/my-orders', authRequired, async (req, res) => {
  try {
    const buyerId = req.user?.sub;
    if (!buyerId) return res.status(401).json({ error: 'Non autorisé' });
    const orders = getOrdersCollection(req.app);
    const docs = await orders.find({ buyerId }).sort({ createdAt: -1 }).toArray();
    const result = docs.map(o => ({
      id: String(o._id),
      buyerId: o.buyerId || null,
      sellerId: o.sellerId || null,
      productId: o.productId,
      amount: o.amount,
      currency: o.currency,
      sessionId: o.sessionId,
      createdAt: o.createdAt,
      product: o.productSnapshot || null,
    }));
    return res.status(200).json(result);
  } catch (e) {
    console.error('my-orders error', e);
    return res.status(500).json({ error: 'Erreur récupération achats' });
  }
});

// Démarrer/continuer l'onboarding Stripe Connect pour un vendeur
router.post('/connect/onboard', authRequired, async (req, res) => {
  try {
    if (req.user?.role !== 'vendeur') {
      return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
    }
    const stripe = require('stripe')(stripeSecret);

    const users = getUsersCollection(req.app);
    const me = await users.findOne({ _id: new ObjectId(req.user.sub) });
    if (!me) return res.status(404).json({ error: 'Utilisateur introuvable' });

    let accountId = me.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: 'individual',
        metadata: { userId: String(me._id) },
      });
      accountId = account.id;
      await users.updateOne({ _id: me._id }, { $set: { stripeAccountId: accountId, updatedAt: new Date() } });
    }

    const origin = req.headers.origin || req.headers.referer || process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/mon-espace/paiement?refresh=1`,
      return_url: `${origin}/mon-espace/paiement?success=1`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: link.url, accountId });
  } catch (e) {
    console.error('stripe onboard error', e);
    return res.status(500).json({ error: 'Erreur création lien d\'onboarding' });
  }
});

// Obtenir le statut Stripe Connect du vendeur
router.get('/connect/status', authRequired, async (req, res) => {
  try {
    if (req.user?.role !== 'vendeur') {
      return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    const users = getUsersCollection(req.app);
    const me = await users.findOne({ _id: new ObjectId(req.user.sub) });
    if (!me) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (!me.stripeAccountId) return res.status(200).json({ connected: false, charges_enabled: false, payouts_enabled: false, accountId: null });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const stripe = require('stripe')(stripeSecret);
    const account = await stripe.accounts.retrieve(me.stripeAccountId);
    const payload = {
      connected: true,
      accountId: account.id,
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
      requirements_due: Array.isArray(account.requirements?.currently_due) ? account.requirements.currently_due : [],
    };
    return res.status(200).json(payload);
  } catch (e) {
    console.error('stripe status error', e);
    return res.status(500).json({ error: 'Erreur récupération statut Stripe' });
  }
});

module.exports = router;


