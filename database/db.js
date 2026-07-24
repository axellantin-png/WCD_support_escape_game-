// database/db.js
//
// Connexion unique à la base SQLite + toutes les requêtes réutilisables.
// Le reste du projet (routes, modules) ne doit jamais écrire de SQL
// directement ailleurs que dans ce fichier — ça garde toute la logique
// d'accès aux données à un seul endroit, facile à retrouver et à modifier.
//
// On utilise better-sqlite3 : une librairie SYNCHRONE (pas de callbacks,
// pas de promesses). Ça peut surprendre dans du Node.js, mais pour ce
// projet c'est le bon choix : les requêtes SQLite sont de l'ordre de la
// microseconde, donc bloquer l'event loop le temps d'une requête n'a
// aucun impact perceptible, même avec 500 utilisateurs. En échange, le
// code reste beaucoup plus simple à lire et à maintenir qu'avec des
// requêtes asynchrones.
//
//   npm install better-sqlite3

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'game.db');
const db = new Database(DB_PATH);

// Nécessaire pour que les contraintes REFERENCES et ON DELETE CASCADE
// du schema.sql soient réellement appliquées (SQLite ne les active pas
// par défaut).
db.pragma('foreign_keys = ON');

// Mode WAL : permet à des lectures (les joueurs qui consultent leur
// étape) de se faire pendant qu'une écriture est en cours (un scan qui
// s'enregistre), sans se bloquer mutuellement. Recommandé dès qu'on a
// plusieurs utilisateurs simultanés.
db.pragma('journal_mode = WAL');

// ============================================================
// Équipes
// ============================================================

const stmtGetTeamByUsername = db.prepare(
  'SELECT * FROM teams WHERE username = ?'
);
function getTeamByUsername(username) {
  return stmtGetTeamByUsername.get(username);
}

const stmtGetTeamById = db.prepare('SELECT * FROM teams WHERE id = ?');
function getTeamById(id) {
  return stmtGetTeamById.get(id);
}

const stmtAdvanceTeam = db.prepare(
  'UPDATE teams SET current_step_id = ? WHERE id = ?'
);
function advanceTeamToStep(teamId, stepId) {
  stmtAdvanceTeam.run(stepId, teamId);
}

// Vue d'ensemble pour le tableau de bord organisateur : chaque équipe
// avec le titre de l'étape où elle en est.
const stmtAllTeamsProgress = db.prepare(`
  SELECT teams.id, teams.team_name, teams.username,
         steps.id AS step_id, steps.title AS step_title, steps.order_index
  FROM teams
  LEFT JOIN steps ON steps.id = teams.current_step_id
  ORDER BY steps.order_index DESC, teams.team_name ASC
`);
function getAllTeamsProgress() {
  return stmtAllTeamsProgress.all();
}

// ============================================================
// Étapes (scénario)
// ============================================================

const stmtGetStepById = db.prepare('SELECT * FROM steps WHERE id = ?');
function getStepById(id) {
  return stmtGetStepById.get(id);
}

const stmtGetAllSteps = db.prepare(
  'SELECT * FROM steps ORDER BY order_index ASC'
);
function getAllSteps() {
  return stmtGetAllSteps.all();
}

// ============================================================
// Historique des tentatives (scan_logs)
// ============================================================

const stmtLogAttempt = db.prepare(`
  INSERT INTO scan_logs (team_id, step_id, submitted_value, success)
  VALUES (@teamId, @stepId, @submittedValue, @success)
`);
function logScanAttempt({ teamId, stepId, submittedValue, success }) {
  stmtLogAttempt.run({
    teamId,
    stepId,
    submittedValue: submittedValue ?? null,
    success: success ? 1 : 0,
  });
}

const stmtHistoryForTeam = db.prepare(`
  SELECT * FROM scan_logs WHERE team_id = ? ORDER BY created_at ASC
`);
function getScanHistoryForTeam(teamId) {
  return stmtHistoryForTeam.all(teamId);
}

// ============================================================
// Administrateurs
// ============================================================

const stmtGetAdminByUsername = db.prepare(
  'SELECT * FROM admins WHERE username = ?'
);
function getAdminByUsername(username) {
  return stmtGetAdminByUsername.get(username);
}

module.exports = {
  db, // exposé au cas où un besoin ponctuel nécessite une requête ad hoc
  getTeamByUsername,
  getTeamById,
  advanceTeamToStep,
  getAllTeamsProgress,
  getStepById,
  getAllSteps,
  logScanAttempt,
  getScanHistoryForTeam,
  getAdminByUsername,
};