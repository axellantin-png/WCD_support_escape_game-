const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  const db = req.app.get('db');

  try {
    // 1. Récupérer toutes les missions triées par ordre
    const missions = db.prepare('SELECT id, title, order_index FROM missions ORDER BY order_index ASC').all();

    // 2. Récupérer les équipes avec leur statut "En ligne" (activité < 5 min)
    const teams = db.prepare(`
      SELECT 
        id, 
        team_name, 
        created_at,
        last_active,
        CASE 
          WHEN last_active IS NOT NULL AND (strftime('%s', 'now') - strftime('%s', last_active)) < 300 THEN 1 
          ELSE 0 
        END AS is_online
      FROM teams
      ORDER BY id DESC
    `).all();

    // 3. Récupérer la progression
    const progressRows = db.prepare('SELECT team_id, mission_id FROM team_progress').all();

    const progressByTeam = {};
    progressRows.forEach(row => {
      if (!progressByTeam[row.team_id]) progressByTeam[row.team_id] = [];
      progressByTeam[row.team_id].push(row.mission_id);
    });

    // 4. Formater les données pour le dashboard
    const summary = teams.map(team => {
      const completedIds = progressByTeam[team.id] || [];
      const currentMission = missions.find(m => !completedIds.includes(m.id)) || { title: 'Toutes complétées 🎉' };

      return {
        id: team.id,
        team_name: team.team_name,
        is_online: Boolean(team.is_online),
        last_active: team.last_active,
        completed_count: completedIds.length,
        total_missions: missions.length,
        current_mission: currentMission.title,
        completed_ids: completedIds
      };
    });

    res.json({
      success: true,
      totalTeams: teams.length,
      onlineTeams: teams.filter(t => t.is_online).length,
      missions,
      teams: summary
    });
  } catch (err) {
    console.error('Erreur dashboard admin :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer la galerie photo de la Mission 1
router.get('/photos', (req, res) => {
  const db = req.app.get('db');

  try {
    const photos = db.prepare(`
      SELECT 
        m.id, 
        m.image_url, 
        m.ia_category, 
        m.user_category, 
        m.label, 
        m.created_at, 
        t.team_name 
      FROM mission_1 m
      JOIN teams t ON m.team_id = t.id
      ORDER BY m.created_at DESC
    `).all();

    res.json({ success: true, photos });
  } catch (err) {
    console.error('Erreur récupération photos admin :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;