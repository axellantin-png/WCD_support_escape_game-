-- 1. Désactiver temporairement les clés étrangères pendant la reconstruction
PRAGMA foreign_keys = OFF;

-- 2. Suppression propre de toutes les anciennes tables
DROP TABLE IF EXISTS mission_1;
DROP TABLE IF EXISTS scan_logs;
DROP TABLE IF EXISTS team_progress;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS missions;

-- 3. Réactivation des clés étrangères
PRAGMA foreign_keys = ON;

-- ============================================================
-- MISSIONS : Les étapes du jeu
-- ============================================================
CREATE TABLE missions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_index    INTEGER NOT NULL,
  title          TEXT NOT NULL,
  icon           TEXT NOT NULL DEFAULT '🎯',
  script_name    TEXT NOT NULL,
  is_locked      INTEGER NOT NULL DEFAULT 0,
  unlock_pattern TEXT NOT NULL DEFAULT 'NONE',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TEAMS : Équipes
-- ============================================================
CREATE TABLE teams (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name   TEXT NOT NULL UNIQUE,
  last_active TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TEAM_PROGRESS : Suivi du déblocage et de la réussite
-- ============================================================
CREATE TABLE team_progress (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id      INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  mission_id   INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  unlocked_at  TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  UNIQUE(team_id, mission_id)
);

-- ============================================================
-- SCAN_LOGS : Historique des scans des équipes
-- ============================================================
CREATE TABLE scan_logs (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id           INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  submitted_value   TEXT,
  success           INTEGER NOT NULL CHECK (success IN (0, 1)),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ADMINS & DONNÉES DE LA MISSION 1
-- ============================================================
CREATE TABLE admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE mission_1 (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id       INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  ia_category   TEXT NOT NULL,
  user_category TEXT NOT NULL,
  label         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- DONNÉES PAR DÉFAUT
-- ============================================================
INSERT INTO missions (order_index, title, icon, script_name, is_locked, unlock_pattern) VALUES
  (1, 'Reconnaître les déchets', '♻️', 'mission1.js', 0, 'NONE'),
  (2, 'Le déplacement des déchets', '🚚', 'mission2.js', 1, 'COLOR_GREEN'),
  (3, 'L''impact des déchets', '🌍', 'mission3.js', 1, 'COLOR_BLUE'),
  (4, 'Le temps des déchets', '⏳', 'mission4.js', 1, 'COLOR_YELLOW');