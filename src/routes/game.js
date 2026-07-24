// src/routes/game.js
//
// Deux routes, toutes deux réservées à une équipe connectée (le
// middleware requireAuth pose req.team avant d'arriver ici) :
//
//   GET  /api/game/current   -> l'étape où en est l'équipe
//   POST /api/game/submit    -> l'équipe soumet une réponse pour cette étape
//
// Ce fichier ne connaît AUCUN détail propre à un type d'énigme. Il se
// contente de regarder step.type et d'appeler le module correspondant
// via le registre (src/modules/index.js). C'est ça qui permet d'ajouter
// une énigme sans jamais toucher à ce fichier.

const express = require('express');
const db = require('../../database/db');
const modules = require('../modules');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// ------------------------------------------------------------
// GET /api/game/current
// ------------------------------------------------------------
router.get('/current', (req, res) => {
  const team = req.team;

  if (!team.current_step_id) {
    // Plus d'étape en cours = l'équipe a terminé le scénario.
    return res.json({ finished: true });
  }

  const step = db.getStepById(team.current_step_id);
  if (!step) {
    return res.status(500).json({ error: 'Étape introuvable en base.' });
  }

  res.json({
    id: step.id,
    title: step.title,
    type: step.type,
    content: sanitizeContentForClient(step),
  });
});

// ------------------------------------------------------------
// POST /api/game/submit   body: { value: "..." }
// ------------------------------------------------------------
router.post('/submit', (req, res) => {
  const team = req.team;
  const { value } = req.body;

  if (!team.current_step_id) {
    return res.status(400).json({ error: 'Cette équipe a déjà terminé le scénario.' });
  }

  const step = db.getStepById(team.current_step_id);
  if (!step) {
    return res.status(500).json({ error: 'Étape introuvable en base.' });
  }

  const stepModule = modules[step.type];
  if (!stepModule) {
    // Ça ne devrait arriver qu'en cas d'erreur de saisie dans la base
    // (un type d'étape sans module enregistré) — jamais en usage normal.
    return res.status(500).json({ error: `Aucun module enregistré pour le type "${step.type}".` });
  }

  const result = stepModule.validate(value, step);

  db.logScanAttempt({
    teamId: team.id,
    stepId: step.id,
    submittedValue: value,
    success: result.success,
  });

  if (result.success) {
    db.advanceTeamToStep(team.id, step.next_step_id); // null = fin du scénario
  }

  res.json({
    success: result.success,
    message: result.message || null,
    finished: result.success && step.next_step_id === null,
  });
});

// ------------------------------------------------------------
// content_json contient parfois la solution attendue (expected_code,
// correct_choice_id, expected_answer...). Il ne faut JAMAIS l'envoyer
// telle quelle au navigateur, sinon la réponse est visible dans les
// outils de développement du téléphone. On retire ici les clés connues
// pour contenir une solution avant l'envoi au client.
// ------------------------------------------------------------
const SOLUTION_KEYS = ['expected_code', 'correct_choice_id', 'expected_answer'];

function sanitizeContentForClient(step) {
  const content = JSON.parse(step.content_json);
  const safeContent = { ...content };
  for (const key of SOLUTION_KEYS) {
    delete safeContent[key];
  }
  return safeContent;
}

module.exports = router;