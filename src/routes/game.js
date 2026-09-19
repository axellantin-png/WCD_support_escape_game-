const express = require('express');
const router = express.Router();

// 1. Middleware : Vérification DB
router.use((req, res, next) => {
  const db = req.app.get('db');
  if (!db) {
    return res.status(500).json({ error: "Instance de base de données non configurée." });
  }
  next();
});

// 2. Middleware : Mise à jour de l'activité
router.use((req, res, next) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  if (teamId) {
    try {
      db.prepare("UPDATE teams SET last_active = datetime('now') WHERE id = ?").run(teamId);
    } catch (e) {}
  }
  next();
});

// ==========================================
// 🚀 ROUTE RÉPARÉE : INSCRIPTION DE L'ÉQUIPE
// ==========================================
router.post('/register', (req, res) => {
  const db = req.app.get('db');
  const { team_name } = req.body;

  if (!team_name) return res.status(400).json({ error: 'Nom d’équipe requis' });

  try {
    let team = db.prepare('SELECT * FROM teams WHERE team_name = ?').get(team_name);
    if (!team) {
      const info = db.prepare('INSERT INTO teams (team_name) VALUES (?)').run(team_name);
      team = { id: info.lastInsertRowid, team_name };
    }
    req.session.teamId = team.id;
    res.json({ success: true, team });
  } catch (err) {
    console.error('Erreur inscription :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==========================================
// GESTION DES MISSIONS ET DU SCAN
// ==========================================

// Liste des missions avec séparation (Débloquées / Terminées)
router.get('/missions', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;

  try {
    const missions = db.prepare('SELECT * FROM missions ORDER BY order_index ASC').all();
    let completed_ids = [];
    let unlocked_ids = [];

    if (teamId) {
      const rows = db.prepare('SELECT mission_id, unlocked_at, completed_at FROM team_progress WHERE team_id = ?').all(teamId);
      completed_ids = rows.filter(r => r.completed_at !== null).map(r => r.mission_id);
      unlocked_ids = rows.filter(r => r.unlocked_at !== null).map(r => r.mission_id);
    }

    res.json({ success: true, missions, completed_ids, unlocked_ids });
  } catch (err) {
    console.error('Erreur chargement missions :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Scanner pour DÉBLOQUER une mission
router.post('/scan', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  const { pattern } = req.body;

  if (!teamId) return res.status(401).json({ error: 'Non connecté' });
  if (!pattern) return res.status(400).json({ error: 'Aucun motif fourni' });

  try {
    const mission = db.prepare('SELECT * FROM missions WHERE unlock_pattern = ?').get(pattern);
    if (!mission) return res.json({ success: false, error: 'Motif ou code invalide.' });

    const existing = db.prepare('SELECT id FROM team_progress WHERE team_id = ? AND mission_id = ?').get(teamId, mission.id);
    if (existing) {
      db.prepare("UPDATE team_progress SET unlocked_at = COALESCE(unlocked_at, datetime('now')) WHERE team_id = ? AND mission_id = ?").run(teamId, mission.id);
    } else {
      db.prepare("INSERT INTO team_progress (team_id, mission_id, unlocked_at) VALUES (?, ?, datetime('now'))").run(teamId, mission.id);
    }

    res.json({ success: true, message: `Mission "${mission.title}" débloquée !`, mission_id: mission.id });
  } catch (err) {
    console.error('Erreur scan :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Enregistrer la RÉUSSITE du mini-jeu (Mission 2)
router.post('/missions/complete', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  const { mission_id } = req.body;

  if (!teamId) return res.status(401).json({ error: 'Non connecté' });

  try {
    const existing = db.prepare('SELECT id FROM team_progress WHERE team_id = ? AND mission_id = ?').get(teamId, mission_id);
    if (existing) {
      db.prepare("UPDATE team_progress SET completed_at = datetime('now') WHERE team_id = ? AND mission_id = ?").run(teamId, mission_id);
    } else {
      db.prepare("INSERT INTO team_progress (team_id, mission_id, completed_at) VALUES (?, ?, datetime('now'))").run(teamId, mission_id);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur validation mission :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==========================================
// GESTION DES PHOTOS (MISSION 1)
// ==========================================

router.get('/photos', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  if (!teamId) return res.status(401).json({ error: 'Non connecté' });

  try {
    const photos = db.prepare('SELECT * FROM mission_1 WHERE team_id = ? ORDER BY id DESC').all(teamId);
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/photos', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  const { image_url, ia_category, user_category, label } = req.body;

  if (!teamId) return res.status(401).json({ error: 'Non connecté' });

  try {
    const info = db.prepare(`
      INSERT INTO mission_1 (team_id, image_url, ia_category, user_category, label)
      VALUES (?, ?, ?, ?, ?)
    `).run(teamId, image_url, ia_category, user_category, label);

    // Validation auto de la Mission 1 à 10 photos
    const countRow = db.prepare('SELECT COUNT(*) as total FROM mission_1 WHERE team_id = ?').get(teamId);
    if (countRow.total >= 10) {
      const existing = db.prepare('SELECT id FROM team_progress WHERE team_id = ? AND mission_id = 1').get(teamId);
      if (existing) {
        db.prepare("UPDATE team_progress SET completed_at = datetime('now') WHERE team_id = ? AND mission_id = 1").run(teamId);
      } else {
        db.prepare("INSERT INTO team_progress (team_id, mission_id, completed_at) VALUES (?, 1, datetime('now'))").run(teamId);
      }
    }

    res.json({ success: true, photoId: info.lastInsertRowid, totalPhotos: countRow.total });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/photos/:id', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  const photoId = req.params.id;

  if (!teamId) return res.status(401).json({ error: 'Non connecté' });

  try {
    db.prepare('DELETE FROM mission_1 WHERE id = ? AND team_id = ?').run(photoId, teamId);

    // Révocation de la Mission 1 si < 10 photos
    const countRow = db.prepare('SELECT COUNT(*) as total FROM mission_1 WHERE team_id = ?').get(teamId);
    if (countRow.total < 10) {
      db.prepare("UPDATE team_progress SET completed_at = NULL WHERE team_id = ? AND mission_id = 1").run(teamId);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/photos/:id', (req, res) => {
  const db = req.app.get('db');
  const teamId = req.session.teamId;
  const photoId = req.params.id;
  const { user_category, label } = req.body;

  if (!teamId) return res.status(401).json({ error: 'Non connecté' });

  try {
    const catVal = user_category !== undefined ? user_category : null;
    const labelVal = label !== undefined ? label : null;

    db.prepare(`
      UPDATE mission_1 
      SET user_category = COALESCE(?, user_category),
          label = COALESCE(?, label)
      WHERE id = ? AND team_id = ?
    `).run(catVal, labelVal, photoId, teamId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;