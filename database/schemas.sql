-- Schéma de la base de données — Escape game urbain
-- SQLite. À exécuter une seule fois pour créer database/game.db :
--   sqlite3 database/game.db < database/schema.sql

PRAGMA foreign_keys = ON;

-- ============================================================
-- STEPS : le scénario. Une ligne = une étape de l'histoire.
-- ============================================================
CREATE TABLE steps (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_index   INTEGER NOT NULL,           -- ordre d'affichage / de référence
  title         TEXT NOT NULL,
  type          TEXT NOT NULL,              -- 'qr_scan', 'code_entry', 'riddle', ...
  content_json  TEXT NOT NULL,              -- config propre au type (voir modules/README.md)
  next_step_id  INTEGER REFERENCES steps(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TEAMS : un compte par équipe, créé à l'avance par l'organisateur.
-- ============================================================
CREATE TABLE teams (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  username          TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,          -- bcrypt
  team_name         TEXT NOT NULL,
  current_step_id   INTEGER REFERENCES steps(id) ON DELETE SET NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- SCAN_LOGS : historique de chaque tentative (réussie ou non).
-- Sert à la fois à valider la progression et à alimenter le
-- tableau de bord organisateur en temps réel.
-- ============================================================
CREATE TABLE scan_logs (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id           INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  step_id           INTEGER NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  submitted_value   TEXT,                   -- ce que le joueur a envoyé
  success           INTEGER NOT NULL CHECK (success IN (0, 1)),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index : le tableau de bord et la validation filtrent très
-- souvent par équipe ou par étape — ces index évitent un scan
-- complet de la table même avec beaucoup de tentatives.
CREATE INDEX idx_scan_logs_team ON scan_logs(team_id);
CREATE INDEX idx_scan_logs_step ON scan_logs(step_id);

-- ============================================================
-- ADMINS : comptes des organisateurs, séparés des équipes.
-- ============================================================
CREATE TABLE admins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  username       TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL
);

-- ============================================================
-- Données d'exemple — utile pour tester avant d'avoir le vrai
-- scénario. À supprimer ou commenter avant le jour J.
-- ============================================================

INSERT INTO steps (order_index, title, type, content_json, next_step_id) VALUES
  (1, 'Le départ', 'qr_scan',
   '{"expected_code":"DEPART-001"}', NULL),
  (2, 'La place centrale', 'code_entry',
   '{"expected_answer":"1789"}', NULL);

-- Chaînage : l'étape 1 mène à l'étape 2
UPDATE steps SET next_step_id = 2 WHERE id = 1;

-- Mot de passe de démo : "demo1234" (à remplacer par un vrai hash bcrypt)
INSERT INTO teams (username, password_hash, team_name, current_step_id) VALUES
  ('equipe1', '$2b$10$REMPLACER_PAR_UN_VRAI_HASH_BCRYPT', 'Les Aventuriers', 1);

INSERT INTO admins (username, password_hash) VALUES
  ('admin', '$2b$10$REMPLACER_PAR_UN_VRAI_HASH_BCRYPT');