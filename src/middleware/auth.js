// src/middleware/auth.js
//
// Protège les routes de jeu. Attend un header :
//   Authorization: Bearer <token>
// Le token est un JWT obtenu via POST /api/auth/login.
//
// En cas de succès, pose req.team avec la ligne fraîchement relue en
// base (pas seulement le contenu du token) — important pour que
// current_step_id soit toujours à jour, y compris juste après un scan.

const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../../database/db');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Non connecté.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }

  if (payload.kind !== 'team') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const team = db.getTeamById(payload.teamId);
  if (!team) {
    return res.status(401).json({ error: 'Équipe introuvable.' });
  }

  req.team = team;
  next();
}

module.exports = requireAuth;