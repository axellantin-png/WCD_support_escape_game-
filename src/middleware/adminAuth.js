// src/middleware/adminAuth.js
//
// Même principe que auth.js, mais pour le tableau de bord organisateur.
// Volontairement dans un fichier séparé : les équipes et les
// administrateurs ne doivent jamais pouvoir utiliser le token de l'un
// pour accéder aux routes de l'autre.

const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../../database/db');

function requireAdminAuth(req, res, next) {
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

  if (payload.kind !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const admin = db.getAdminByUsername(payload.username);
  if (!admin) {
    return res.status(401).json({ error: 'Administrateur introuvable.' });
  }

  req.admin = admin;
  next();
}

module.exports = requireAdminAuth;