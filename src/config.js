// src/config.js
//
// Un seul endroit pour toute la configuration sensible ou variable
// selon l'environnement. Rien d'autre dans le projet ne doit lire
// process.env directement — ça évite d'oublier une variable ou de
// se retrouver avec des valeurs par défaut incohérentes éparpillées.

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,

  // Clé utilisée pour signer les tokens de connexion. À définir dans
  // .env pour la production — la valeur par défaut ci-dessous ne sert
  // qu'en développement local et ne doit jamais être utilisée le jour J.
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-a-changer',

  // Durée de validité d'une session. 12h couvre large une journée
  // d'activité sans obliger les équipes à se reconnecter en cours de jeu.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
};