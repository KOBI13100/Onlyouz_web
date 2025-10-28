const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function getUsersCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) {
    throw new Error('MongoClient non initialisé');
  }
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('users');
}


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, dateOfBirth, gender, username } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    if (!['acheteur', 'vendeur'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const users = getUsersCollection(req.app);
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = {
      name: name || username || email.split('@')[0],
      email: email.toLowerCase(),
      passwordHash,
      role,
      verified: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (typeof dateOfBirth === 'string' && dateOfBirth.trim()) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) doc.dateOfBirth = d.toISOString();
    }
    if (typeof gender === 'string') {
      const g = gender.toLowerCase();
      doc.gender = g.startsWith('homme') ? 'homme' : g.startsWith('femme') ? 'femme' : 'non précisé';
    }

    const { insertedId } = await users.insertOne(doc);

    // aucun profil supplémentaire créé automatiquement

    const token = jwt.sign(
      { sub: String(insertedId), role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Compte créé',
      user: {
        id: String(insertedId),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        verified: false,
        lastSeen: doc.lastSeen,
        avatarUrl: null,
        dateOfBirth: doc.dateOfBirth || null,
        gender: doc.gender || null,
        description: '',
      },
      token,
    });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const users = getUsersCollection(req.app);
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // mettre à jour lastSeen
    await users.updateOne({ _id: user._id }, { $set: { lastSeen: new Date() } });

    const token = jwt.sign(
      { sub: String(user._id), role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    const fresh = await users.findOne({ _id: user._id });
    return res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: String(user._id),
        name: fresh.name,
        email: fresh.email,
        role: fresh.role,
        verified: Boolean(fresh?.verified),
        lastSeen: fresh?.lastSeen,
        avatarUrl: fresh?.avatarUrl || null,
        dateOfBirth: fresh?.dateOfBirth || null,
        gender: fresh?.gender || null,
        description: fresh?.description || '',
      },
      token,
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

// Profil courant (auth requis)
router.get('/me', authRequired, async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const { ObjectId } = require('mongodb');
    const fresh = await users.findOne({ _id: new ObjectId(req.user.sub) });
    if (!fresh) return res.status(404).json({ error: 'Introuvable' });
    return res.status(200).json({
      id: String(fresh._id),
      name: fresh.name,
      email: fresh.email,
      role: fresh.role,
      avatarUrl: fresh.avatarUrl || null,
      verified: Boolean(fresh.verified),
      lastSeen: fresh.lastSeen || null,
      description: fresh.description || '',
      dateOfBirth: fresh.dateOfBirth || null,
      gender: fresh.gender || null,
    });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un utilisateur (public: nom, email, avatar, rôle)
router.get('/user/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const users = getUsersCollection(req.app);
    const u = await users.findOne({ _id: new ObjectId(id) });
    if (!u) return res.status(404).json({ error: 'Introuvable' });
    return res.status(200).json({ id: String(u._id), name: u.name, email: u.email, role: u.role, avatarUrl: u.avatarUrl || null, verified: Boolean(u.verified), lastSeen: u.lastSeen || null });
  } catch (e) {
    console.error('get user error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour du profil (nom, email, avatar, description, dateOfBirth, gender) pour l'utilisateur connecté
router.put('/me', authRequired, upload.single('avatar'), async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const updates = {};
    const { name, email, description, dateOfBirth, gender } = req.body || {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (typeof description === 'string') updates.description = description.slice(0, 1000);
    if (typeof dateOfBirth === 'string' && dateOfBirth.trim()) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) updates.dateOfBirth = d.toISOString();
    }
    if (typeof gender === 'string') {
      const g = gender.toLowerCase();
      if (['homme','femme','non précisé','non precise','non_precise','none',''].includes(g)) {
        updates.gender = g.startsWith('homme') ? 'homme' : g.startsWith('femme') ? 'femme' : 'non précisé';
      }
    }

    // Upload avatar si fourni et Cloudinary configuré (réutilise la conf globale éventuelle)
    if (req.file) {
      const isConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );
      if (!isConfigured) {
        return res.status(500).json({ error: 'Cloudinary non configuré' });
      }
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      const uploadFromBuffer = () => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'onlyyouzzz/avatars', resource_type: 'image' },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      const up = await uploadFromBuffer();
      // @ts-ignore
      updates.avatarUrl = up.secure_url;
    }

    updates.updatedAt = new Date();
    const { ObjectId } = require('mongodb');
    await users.updateOne({ _id: new ObjectId(req.user.sub) }, { $set: updates });
    const fresh = await users.findOne({ _id: new ObjectId(req.user.sub) });
    return res.status(200).json({
      id: String(fresh._id),
      name: fresh.name,
      email: fresh.email,
      role: fresh.role,
      avatarUrl: fresh.avatarUrl || null,
      verified: Boolean(fresh.verified),
      lastSeen: fresh.lastSeen || null,
      description: fresh.description || '',
      dateOfBirth: fresh.dateOfBirth || null,
      gender: fresh.gender || null,
    });
  } catch (error) {
    console.error('update profile error', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour vérification (utilisateur connecté)
router.put('/me/verify', authRequired, async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const { verified } = req.body || {};
    const val = typeof verified === 'boolean' ? verified : true;
    const { ObjectId } = require('mongodb');
    await users.updateOne({ _id: new ObjectId(req.user.sub) }, { $set: { verified: val, updatedAt: new Date() } });
    const fresh = await users.findOne({ _id: new ObjectId(req.user.sub) });
    return res.status(200).json({ verified: Boolean(fresh?.verified) });
  } catch (e) {
    console.error('verify error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Heartbeat: met à jour lastSeen
router.post('/me/heartbeat', authRequired, async (req, res) => {
  try {
    const users = getUsersCollection(req.app);
    const { ObjectId } = require('mongodb');
    const at = new Date();
    await users.updateOne({ _id: new ObjectId(req.user.sub) }, { $set: { lastSeen: at } });
    return res.status(200).json({ lastSeen: at });
  } catch (e) {
    console.error('heartbeat error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});


