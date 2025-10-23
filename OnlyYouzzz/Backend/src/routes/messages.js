const express = require('express');
const { authRequired } = require('../middleware/auth');
const { ObjectId } = require('mongodb');
const router = express.Router();

function getConversationsCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('conversations');
}

function getMessagesCollection(app) {
  const client = app.locals.mongoClient;
  if (!client) throw new Error('MongoClient non initialisé');
  return client.db(process.env.DB_NAME || 'onlyyouzzz').collection('messages');
}

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

// Lister les conversations de l'utilisateur connecté (avec infos du correspondant et dernier message)
router.get('/threads', authRequired, async (req, res) => {
  try {
    const convs = getConversationsCollection(req.app);
    const msgs = getMessagesCollection(req.app);
    const users = getUsersCollection(req.app);
    const productsCol = getProductsCollection(req.app);

    const list = await convs
      .find({ participants: req.user.sub })
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    const threadIds = list.map((c) => String(c._id));
    const peerIds = list
      .map((c) => (c.participants || []).find((p) => p !== req.user.sub))
      .filter(Boolean);

    const peers = await users
      .find({ _id: { $in: peerIds.map((id) => new ObjectId(id)) } })
      .toArray();
    const idToPeer = new Map(peers.map((u) => [String(u._id), u]));

    // Préparer les produits associés aux conversations (si productId est présent)
    const productIds = Array.from(
      new Set(
        (list || [])
          .map((c) => c.productId)
          .filter((id) => id && ObjectId.isValid(id))
          .map((id) => String(id))
      )
    );
    let idToProduct = new Map();
    if (productIds.length) {
      const products = await productsCol
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1, imageUrl: 1, price: 1 })
        .toArray();
      idToProduct = new Map(
        products.map((p) => [String(p._id), { id: String(p._id), name: p.name, imageUrl: p.imageUrl || null, price: p.price }])
      );
    }

    // Récupérer le dernier message pour chaque thread en un appel
    const lastByThread = new Map();
    const lastMsgs = await msgs
      .aggregate([
        { $match: { threadId: { $in: threadIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$threadId',
            id: { $first: '$_id' },
            senderId: { $first: '$senderId' },
            content: { $first: '$content' },
            createdAt: { $first: '$createdAt' },
          },
        },
      ])
      .toArray();
    for (const m of lastMsgs) {
      lastByThread.set(String(m._id), {
        id: String(m.id),
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
      });
    }

    const result = await Promise.all(list.map(async (c) => {
      const peerId = (c.participants || []).find((p) => p !== req.user.sub);
      const peer = peerId ? idToPeer.get(String(peerId)) : null;
      const lastReadAt = (c.lastReadBy && c.lastReadBy[req.user.sub]) ? c.lastReadBy[req.user.sub] : new Date(0);
      const unreadCount = await msgs.countDocuments({ threadId: String(c._id), senderId: { $ne: req.user.sub }, createdAt: { $gt: lastReadAt } });
      const product = c.productId && ObjectId.isValid(c.productId) ? idToProduct.get(String(c.productId)) : null;
      return {
        id: String(c._id),
        peer: peer
          ? {
              id: String(peer._id),
              name: peer.name,
              email: peer.email,
              avatarUrl: peer.avatarUrl || null,
            }
          : null,
        product,
        lastMessage: lastByThread.get(String(c._id)) || null,
        updatedAt: c.updatedAt,
        unreadCount,
        peerLastReadAt: (c.lastReadBy && peerId && c.lastReadBy[peerId]) ? c.lastReadBy[peerId] : null,
      };
    }));

    return res.status(200).json(result);
  } catch (e) {
    console.error('list threads error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Marquer une conversation comme lue par l'utilisateur courant
router.put('/threads/:id/read', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const convs = getConversationsCollection(req.app);
    const conv = await convs.findOne({ _id: new ObjectId(id), participants: req.user.sub });
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    await convs.updateOne(
      { _id: new ObjectId(id) },
      { $set: { [`lastReadBy.${req.user.sub}`]: new Date(), updatedAt: new Date() } }
    );
    return res.status(204).end();
  } catch (e) {
    console.error('mark read error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer (ou créer) une conversation entre l'utilisateur connecté et peerId
router.post('/threads', authRequired, async (req, res) => {
  try {
    const { peerId } = req.body || {};
    if (!peerId) return res.status(400).json({ error: 'peerId manquant' });
    const convs = getConversationsCollection(req.app);
    let conv = await convs.findOne({ participants: { $all: [req.user.sub, peerId] }, type: 'direct' });
    if (!conv) {
      const doc = { type: 'direct', participants: [req.user.sub, peerId], createdAt: new Date(), updatedAt: new Date() };
      const { insertedId } = await convs.insertOne(doc);
      conv = { _id: insertedId, ...doc };
    }
    return res.status(200).json({ id: String(conv._id) });
  } catch (e) {
    console.error('create/get thread error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lister les messages d'une conversation
router.get('/threads/:id/messages', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    const convs = getConversationsCollection(req.app);
    const conv = await convs.findOne({ _id: new ObjectId(id), participants: req.user.sub });
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    const msgs = getMessagesCollection(req.app);
    const list = await msgs.find({ threadId: id }).sort({ createdAt: 1 }).toArray();
    return res.status(200).json({
      thread: {
        id: String(conv._id),
        participants: conv.participants,
        lastReadBy: conv.lastReadBy || {},
      },
      messages: list.map(m => ({ id: String(m._id), senderId: m.senderId, content: m.content, createdAt: m.createdAt })),
    });
  } catch (e) {
    console.error('list messages error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un message dans une conversation
router.post('/threads/:id/messages', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body || {};
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message vide' });
    const convs = getConversationsCollection(req.app);
    const conv = await convs.findOne({ _id: new ObjectId(id), participants: req.user.sub });
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    const msgs = getMessagesCollection(req.app);
    const doc = { threadId: id, senderId: req.user.sub, content: content.trim(), createdAt: new Date() };
    const { insertedId } = await msgs.insertOne(doc);
    await convs.updateOne({ _id: new ObjectId(id) }, { $set: { updatedAt: new Date() } });
    return res.status(201).json({ id: String(insertedId), ...doc });
  } catch (e) {
    console.error('send message error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;


