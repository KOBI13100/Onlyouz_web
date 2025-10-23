const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { authRequired } = require('../middleware/auth');

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

// Liste de tous les vendeurs, avec filtre optionnel par nom/email (?name=)
router.get('/', async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const products = getProductsCollection(req.app);
    const name = (req.query.name || '').toString().trim();
    const sort = (req.query.sort || '').toString(); // 'popular' | 'new' | ''

    // Tri par popularité: basé sur le nombre de produits par vendeur (desc)
    if (sort === 'popular') {
      const agg = await products.aggregate([
        { $group: { _id: '$sellerId', productsCount: { $sum: 1 } } },
        { $sort: { productsCount: -1 } },
      ]).toArray();

      const sellerIds = agg.map(a => a._id).filter(Boolean);
      const sellers = await users.find({ _id: { $in: sellerIds.map(id => new ObjectId(id)) }, role: 'vendeur' }).project({ name: 1, email: 1, avatarUrl: 1, verified: 1, lastSeen: 1, description: 1, dateOfBirth: 1 }).toArray();
      const idToUser = new Map(sellers.map(u => [String(u._id), u]));

      let result = agg.map(a => {
        const u = idToUser.get(String(a._id));
        return u ? {
          id: String(u._id),
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl || null,
          productsCount: a.productsCount,
          verified: Boolean(u.verified),
          lastSeen: u.lastSeen || null,
          description: u.description || '',
          dateOfBirth: u.dateOfBirth || null,
        } : null;
      }).filter(Boolean);

      // Filtre par nom/email si fourni
      if (name) {
        const re = new RegExp(name, 'i');
        result = result.filter(v => re.test(v.name || '') || re.test(v.email || ''));
      }

      return res.status(200).json(result);
    }

    // Sinon: liste standard triée
    const filter = { role: 'vendeur' };
    if (name) {
      filter.$or = [
        { name: { $regex: name, $options: 'i' } },
        { email: { $regex: name, $options: 'i' } },
      ];
    }

    const sortStage = sort === 'new' ? { createdAt: -1 } : { name: 1 };

    const items = await users
      .find(filter)
      .project({ name: 1, email: 1, avatarUrl: 1, createdAt: 1, verified: 1, lastSeen: 1, description: 1, dateOfBirth: 1 })
      .sort(sortStage)
      .toArray();

    const result = items.map(u => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || null,
      verified: Boolean(u.verified),
      lastSeen: u.lastSeen || null,
      description: u.description || '',
      dateOfBirth: u.dateOfBirth || null,
    }));

    return res.status(200).json(result);
  } catch (e) {
    console.error('list vendors error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Nombre total de vendeurs
router.get('/count', async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const total = await users.countDocuments({ role: 'vendeur' });
    return res.status(200).json({ total });
  } catch (e) {
    console.error('count vendors error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Top vendeurs par nombre de produits
router.get('/top', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 20));
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const products = getProductsCollection(req.app);
    const users = getUsersCollection(req.app);

    const agg = await products.aggregate([
      { $group: { _id: '$sellerId', productsCount: { $sum: 1 } } },
      { $sort: { productsCount: -1 } },
      { $skip: offset },
      { $limit: limit },
    ]).toArray();

    const sellerIds = agg.map(a => a._id).filter(Boolean);
    const sellers = await users.find({ _id: { $in: sellerIds.map(id => new ObjectId(id)) }, role: 'vendeur' }).project({ name:1,email:1,avatarUrl:1,verified:1,lastSeen:1,description:1,dateOfBirth:1 }).toArray();
    const idToUser = new Map(sellers.map(u => [String(u._id), u]));

    const result = agg.map(a => {
      const u = idToUser.get(String(a._id));
      return u ? {
        id: String(u._id),
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl || null,
        productsCount: a.productsCount,
        verified: Boolean(u.verified),
        lastSeen: u.lastSeen || null,
        description: u.description || '',
        dateOfBirth: u.dateOfBirth || null,
      } : null;
    }).filter(Boolean);

    return res.status(200).json(result);
  } catch (e) {
    console.error('top vendors error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
// Détails vendeur + produits
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const users = getUsersCollection(req.app);
    const products = getProductsCollection(req.app);
    const user = await users.findOne({ _id: new ObjectId(id), role: 'vendeur' }, { projection: { name:1,email:1,avatarUrl:1,verified:1,lastSeen:1,description:1,dateOfBirth:1 } });
    if (!user) return res.status(404).json({ error: 'Vendeur introuvable' });
    const items = await products.find({ sellerId: id, sold: { $ne: true } }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      verified: Boolean(user.verified),
      lastSeen: user.lastSeen || null,
      description: user.description || '',
      dateOfBirth: user.dateOfBirth || null,
      products: items.map(p => ({
        id: String(p._id),
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
      })),
    });
  } catch (e) {
    console.error('vendor detail error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Suivre un vendeur
router.post('/:id/follow', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const users = getUsersCollection(req.app);
    const meId = req.user.sub;
    if (meId === id) return res.status(400).json({ error: 'Action non autorisée' });
    await users.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { followers: meId } },
      { upsert: false }
    );
    const doc = await users.findOne({ _id: new ObjectId(id) }, { projection: { followers: 1 } });
    const count = Array.isArray(doc?.followers) ? doc.followers.length : 0;
    return res.status(200).json({ followers: count, following: true });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Se désabonner d'un vendeur
router.post('/:id/unfollow', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const users = getUsersCollection(req.app);
    const meId = req.user.sub;
    await users.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { followers: meId } },
      { upsert: false }
    );
    const doc = await users.findOne({ _id: new ObjectId(id) }, { projection: { followers: 1 } });
    const count = Array.isArray(doc?.followers) ? doc.followers.length : 0;
    return res.status(200).json({ followers: count, following: false });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le compteur d'abonnés et l'état follow (public; "following" seulement si authentifié)
router.get('/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const users = getUsersCollection(req.app);
    const doc = await users.findOne({ _id: new ObjectId(id) }, { projection: { followers: 1 } });
    const followers = Array.isArray(doc?.followers) ? doc.followers : [];
    const count = followers.length;
    const following = req.user && followers.includes(req.user.sub) ? true : false;
    return res.status(200).json({ followers: count, following });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});


