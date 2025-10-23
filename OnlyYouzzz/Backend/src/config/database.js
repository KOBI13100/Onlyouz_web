// Placeholder pour la future logique de connexion MongoDB
// Aucun raccordement effectif ici (initialisation uniquement)
const { MongoClient } = require('mongodb');

function createMongoClient(uri, options = {}) {
  if (!uri) {
    throw new Error('Missing MongoDB connection URI');
  }
  return new MongoClient(uri, { ...options });
}

module.exports = {
  createMongoClient,
};


