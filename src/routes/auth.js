// src/routes/auth.js
//
// Deux routes, aucune n'exige d'être déjà connecté :
//
//   POST /api/auth/login        -> connexion d'une équipe
//   POST /api/auth/admin/login  -> connexion d'un organisateur
//
// Les comptes sont créés à l'avance en base (voir schema.sql) — il n'y
// a pas de route d'inscription, ce n'est pas nécessaire pour une
// activité d'un jour avec des équipes connues à l'avance.

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../../database/db');

const router = express.Router();

// ------------------------------------------------------------
// POST /api/auth/login   body: { username, password }
// ------------------------------------------------------------
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }

  const team = db.getTeamByUsername(username);
  if (!team || !bcrypt.compareSync(password, team.password_hash)) {
    // Même message que le compte existe ou non : ne donne pas d'indice
    // sur les noms d'équipe valides à qui essaierait au hasard.
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const token = jwt.sign(
    { kind: 'team', teamId: team.id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({ token, teamName: team.team_name });
});

// ------------------------------------------------------------
// POST /api/auth/admin/login   body: { username, password }
// ------------------------------------------------------------
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }

  const admin = db.getAdminByUsername(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const token = jwt.sign(
    { kind: 'admin', username: admin.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({ token });
});

module.exports = router;