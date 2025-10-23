const express = require('express');
const { ObjectId } = require('mongodb');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

function getShipmentsCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('shipments');
}

// Recherche de points relais (mock si MR non configuré)
router.post('/relays', async (req, res) => {
  try {
    const { country = 'FR', postalCode = '75001', city } = req.body || {};
    const hasMrCreds = Boolean(process.env.MR_API_KEY && process.env.MR_API_SECRET);

    if (!hasMrCreds) {
      // Mock de 5 points relais
      const pc = String(postalCode || '').padStart(5, '0');
      const payload = Array.from({ length: 5 }).map((_, i) => ({
        id: `MRMOCK-${pc}-${i + 1}`,
        name: `Point Relais #${i + 1}`,
        address1: `${10 + i} Rue Exemple`,
        address2: '',
        postalCode: pc,
        city: city || 'Paris',
        country,
        openingHours: 'Lun-Sam 09:00-19:00',
      }));
      return res.status(200).json({ relays: payload, source: 'mock' });
    }

    // TODO: Intégration réelle Mondial Relay (SOAP WSI2_PointRelais_Recherche)
    // Pour l'instant, renvoyer un placeholder pour éviter l'échec.
    return res.status(200).json({ relays: [], source: 'mondial-relay', note: 'Intégration réelle à implémenter (credentials présents)' });
  } catch (e) {
    console.error('relay search error', e);
    return res.status(500).json({ error: 'Erreur recherche points relais' });
  }
});

// Liste des envois pour le vendeur connecté
router.get('/my-seller', authRequired, async (req, res) => {
  try {
    const shipments = getShipmentsCollection(req.app);
    const docs = await shipments.find({ sellerId: req.user.sub }).sort({ createdAt: -1 }).toArray();
    const result = docs.map(s => ({
      id: String(s._id),
      orderId: s.orderId || null,
      productId: s.productId || null,
      buyerId: s.buyerId || null,
      sellerId: s.sellerId || null,
      carrier: s.carrier || 'mondialrelay',
      method: s.method || 'relay',
      status: s.status || 'pending',
      trackingNumber: s.trackingNumber || null,
      labelUrl: s.labelUrl || null,
      createdAt: s.createdAt,
    }));
    return res.status(200).json(result);
  } catch (e) {
    console.error('list shipments error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste des envois pour l'acheteur connecté
router.get('/my-buyer', authRequired, async (req, res) => {
  try {
    const shipments = getShipmentsCollection(req.app);
    const docs = await shipments.find({ buyerId: req.user.sub }).sort({ createdAt: -1 }).toArray();
    const result = docs.map(s => ({
      id: String(s._id),
      orderId: s.orderId || null,
      productId: s.productId || null,
      buyerId: s.buyerId || null,
      sellerId: s.sellerId || null,
      carrier: s.carrier || 'mondialrelay',
      method: s.method || 'relay',
      status: s.status || 'pending',
      trackingNumber: s.trackingNumber || null,
      labelUrl: s.labelUrl || null,
      createdAt: s.createdAt,
    }));
    return res.status(200).json(result);
  } catch (e) {
    console.error('list buyer shipments error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour statut/tracking par le vendeur
router.post('/:id/update', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const { status, trackingNumber, labelUrl } = req.body || {};
    const shipments = getShipmentsCollection(req.app);
    const s = await shipments.findOne({ _id: new ObjectId(id) });
    if (!s) return res.status(404).json({ error: 'Envoi introuvable' });
    if (String(s.sellerId || '') !== String(req.user.sub || '')) return res.status(403).json({ error: 'Non autorisé' });
    const update = { updatedAt: new Date() };
    if (status) update.status = status;
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (labelUrl) update.labelUrl = labelUrl;
    await shipments.updateOne({ _id: s._id }, { $set: update });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('shipment update error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Détails d'un envoi (vendeur ou acheteur)
router.get('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const shipments = getShipmentsCollection(req.app);
    const s = await shipments.findOne({ _id: new ObjectId(id) });
    if (!s) return res.status(404).json({ error: 'Envoi introuvable' });
    const isSeller = String(s.sellerId || '') === String(req.user.sub || '');
    const isBuyer = String(s.buyerId || '') === String(req.user.sub || '');
    if (!isSeller && !isBuyer) return res.status(403).json({ error: 'Non autorisé' });
    return res.status(200).json({
      id: String(s._id),
      orderId: s.orderId || null,
      productId: s.productId || null,
      buyerId: s.buyerId || null,
      sellerId: s.sellerId || null,
      carrier: s.carrier || 'mondialrelay',
      method: s.method || 'relay',
      status: s.status || 'pending',
      trackingNumber: s.trackingNumber || null,
      labelUrl: s.labelUrl || null,
      shippingData: s.shippingData || null,
      createdAt: s.createdAt,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;


