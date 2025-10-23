const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Charger les variables d'environnement AVANT d'importer les routes
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const paymentsRoutes = require('./routes/payments');
const vendorsRoutes = require('./routes/vendors');
const messagesRoutes = require('./routes/messages');
const shippingRoutes = require('./routes/shipping');

const app = express();

// Middlewares de base
app.use(express.json());
app.use(cors({ origin: '*'}));

// Route de test
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/shipping', shippingRoutes);

// Fichiers statiques pour les uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

module.exports = app;


