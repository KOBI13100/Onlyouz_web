const app = require('./app');
const { createMongoClient } = require('./config/database');

const PORT = process.env.PORT || 8000;

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://julessore13_db_user:yyle2FS4cHKVSdMK@cluster0.wrrdgda.mongodb.net/';
  let httpServer;
  let mongoClient;

  try {
    mongoClient = createMongoClient(mongoUri);
    await mongoClient.connect();
    console.log('✅ Connexion MongoDB réussie');

    app.locals.mongoClient = mongoClient;

    httpServer = app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Échec de connexion à MongoDB:', error.message);
    process.exit(1);
  }

  function handleShutdown(signal) {
    console.log(`\n${signal} reçu, arrêt en cours...`);
    Promise.resolve()
      .then(() => (httpServer ? httpServer.close() : undefined))
      .then(async () => {
        if (mongoClient) {
          await mongoClient.close();
        }
      })
      .finally(() => {
        console.log('✅ Arrêt propre terminé');
        process.exit(0);
      });
  }

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

start();


