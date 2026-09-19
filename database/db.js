const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'game.db');
const shmPath = dbPath + '-shm';
const walPath = dbPath + '-wal';

// 1. Supprimer l'ancienne base de données et ses fichiers de cache s'ils existent au démarrage
[dbPath, shmPath, walPath].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
    } catch (err) {
      console.warn(`Impossible de supprimer ${file} :`, err.message);
    }
  }
});

// 2. Créer une nouvelle instance de base de données propre
const db = new Database(dbPath);

// 3. Activer les clés étrangères
db.pragma('foreign_keys = ON');

// 4. Activer le mode WAL et un délai d'attente pour encaisser les 50 utilisateurs simultanés
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// 5. Charger et exécuter automatiquement le fichier schemas.sql
const schemaPath = path.join(__dirname, 'schemas.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  console.log("📂 Base de données réinitialisée et schéma appliqué avec succès !");
} else {
  console.error("❌ Fichier schemas.sql introuvable dans le dossier database/");
}

module.exports = db;