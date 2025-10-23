const express = require('express');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Utiliser la mémoire pour éviter toute écriture locale
const upload = multer({ storage: multer.memoryStorage() });

// Config Cloudinary uniquement via triplet .env (Option B)
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function getProductsCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('products');
}

function getUsersCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('users');
}

router.post('/', authRequired, upload.any(), async (req, res) => {
  try {
    const { name, description, price } = req.body || {};
    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    // Vérifier rôle vendeur
    if (req.user?.role !== 'vendeur') {
      return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    if (!isConfigured) {
      return res.status(500).json({ error: 'Cloudinary non configuré (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)' });
    }

    let filePath = null;
    const imageUrls = [];
    const videoUrls = [];
    const files = Array.isArray(req.files) ? req.files : [];
    const uploadFromBuffer = (file, resourceType, folder) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    for (const f of files) {
      const isImage = (f.mimetype || '').startsWith('image');
      const isVideo = (f.mimetype || '').startsWith('video');
      if (!isImage && !isVideo) continue;
      try {
        const up = await uploadFromBuffer(
          f,
          isImage ? 'image' : 'video',
          isImage ? 'onlyyouzzz/products/images' : 'onlyyouzzz/products/videos'
        );
        // @ts-ignore
        const url = up.secure_url;
        if (isImage) imageUrls.push(url); else videoUrls.push(url);
      } catch (err) {
        console.error('cloudinary upload error', err);
        return res.status(500).json({ error: 'Upload Cloudinary échoué' });
      }
    }
    if (!filePath && imageUrls.length) filePath = imageUrls[0];
    const products = getProductsCollection(req.app);
    const doc = {
      sellerId: req.user.sub,
      name,
      description,
      price: Number(price),
      imageUrl: filePath,
      imageUrls,
      videoUrls,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { insertedId } = await products.insertOne(doc);
    return res.status(201).json({ id: String(insertedId), ...doc });
  } catch (e) {
    console.error('create product error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lister tous les produits
router.get('/', async (req, res) => {
  try {
    const products = getProductsCollection(req.app);
    const users = getUsersCollection(req.app);
    const all = await products
      .find({ sold: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();
    // Récupérer les noms de vendeurs pour enrichir la réponse
    const { ObjectId } = require('mongodb');
    const sellerIds = Array.from(new Set(all.map(p => p.sellerId).filter(Boolean)));
    let idToUser = new Map();
    if (sellerIds.length) {
      const sellers = await users
        .find({ _id: { $in: sellerIds.map(id => new ObjectId(id)) } })
        .project({ name: 1, avatarUrl: 1 })
        .toArray();
      idToUser = new Map(sellers.map(u => [String(u._id), u]));
    }
    const mapped = all.map((p) => ({
      id: String(p._id),
      sellerId: p.sellerId,
      sellerName: idToUser.get(String(p.sellerId))?.name || null,
      sellerAvatarUrl: idToUser.get(String(p.sellerId))?.avatarUrl || null,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      imageUrls: p.imageUrls || [],
      videoUrls: p.videoUrls || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return res.status(200).json(mapped);
  } catch (e) {
    console.error('list products error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lister les produits du vendeur courant
router.get('/mine', authRequired, async (req, res) => {
  try {
    if (req.user?.role !== 'vendeur') {
      return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    const products = getProductsCollection(req.app);
    const all = await products
      .find({ sellerId: req.user.sub })
      .sort({ createdAt: -1 })
      .toArray();
    const mapped = all.map((p) => ({
      id: String(p._id),
      sellerId: p.sellerId,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      sold: Boolean(p.sold),
      soldAt: p.soldAt || null,
    }));
    return res.status(200).json(mapped);
  } catch (e) {
    console.error('list my products error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const products = getProductsCollection(req.app);
    const users = getUsersCollection(req.app);
    const p = await products.findOne({ _id: new ObjectId(id) });
    if (!p) return res.status(404).json({ error: 'Produit introuvable' });
    let sellerName = null;
    let sellerAvatarUrl = null;
    if (p.sellerId && ObjectId.isValid(p.sellerId)) {
      const u = await users.findOne({ _id: new ObjectId(p.sellerId) }, { projection: { name: 1, avatarUrl: 1 } });
      sellerName = u?.name || null;
      sellerAvatarUrl = u?.avatarUrl || null;
    }
    return res.status(200).json({
      id: String(p._id),
      sellerId: p.sellerId,
      sellerName,
      sellerAvatarUrl,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      imageUrls: p.imageUrls || [],
      videoUrls: p.videoUrls || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  } catch (e) {
    console.error('get product error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;



