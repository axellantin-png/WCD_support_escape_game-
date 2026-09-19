const express = require('express');
const session = require('express-session');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Initialisation de la base de données
const dbPath = path.join(__dirname, 'database', 'game.db');
const db = new Database(dbPath);

// Exécuter le schéma SQL s'il existe
const schemaPath = path.join(__dirname, 'database', 'schemas.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Rendre 'db' accessible dans toutes les routes via req.app.get('db')
app.set('db', db);

// 2. Middlewares Express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fichiers statiques (dossier public et assets admin)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin-assets', express.static(path.join(__dirname, 'admin')));

// Configuration des sessions
app.use(session({
  secret: 'votre_secret_escape_game',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// 3. Déclarer les routes
const gameRoutes = require('./src/routes/game');
const adminRoutes = require('./src/routes/admin');

// On monte les routes du jeu directement sur /api (/api/register, /api/missions, /api/scan)
app.use('/api', gameRoutes);
app.use('/api/admin', adminRoutes);

// Route pour l'interface administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 4. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur Escape Game lancé sur : http://localhost:${PORT}`);
});