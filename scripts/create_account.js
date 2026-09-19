// scripts/create-account.js
//
// Usage :
//   node scripts/create-account.js team equipe1 motdepasse "Les Aventuriers"
//   node scripts/create-account.js admin admin motdepasse
//
// Évite de devoir calculer un hash bcrypt à la main pour créer les
// comptes avant l'événement — c'est le seul endroit du projet où on
// écrit dans les tables teams / admins en dehors de l'application.

const bcrypt = require('bcrypt');
const { db } = require('../database/db');

const [, , kind, username, password, teamName] = process.argv;

function usage() {
  console.log('Usage :');
  console.log('  node scripts/create-account.js team <username> <password> <team_name>');
  console.log('  node scripts/create-account.js admin <username> <password>');
  process.exit(1);
}

if (!kind || !username || !password) usage();
if (kind === 'team' && !teamName) usage();
if (!['team', 'admin'].includes(kind)) usage();

const passwordHash = bcrypt.hashSync(password, 10);

if (kind === 'team') {
  db.prepare(
    'INSERT INTO teams (username, password_hash, team_name, current_step_id) VALUES (?, ?, ?, ?)'
  ).run(username, passwordHash, teamName, 1); // démarre à l'étape 1 par défaut
  console.log(`Équipe "${teamName}" créée (identifiant : ${username}).`);
} else {
  db.prepare(
    'INSERT INTO admins (username, password_hash) VALUES (?, ?)'
  ).run(username, passwordHash);
  console.log(`Compte admin créé (identifiant : ${username}).`);
}