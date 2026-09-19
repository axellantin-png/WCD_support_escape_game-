# 🌍 World Clean Up Day – ECO-IA (Verneuil-sur-Seine)

Application interactive web conçue pour accompagner un **World Clean Up Day** citoyen à Verneuil-sur-Seine. L'application combine une chasse aux déchets physique et une aventure ludique et pédagogique pour entraÎ·ner **ECO-IA**, une intelligence artificielle fictive dédiée à la protection de l'environnement.

---

## 📖 L'Histoire

Bienvenue au centre de contrôle environnemental de **Verneuil-sur-Seine**.  
Face aux défis écologiques, la ville déploie un outil inédit : **ECO-IA**, une Intelligence Artificielle conçue pour repÉ·rer la pollution, protéger la biodiversité·´ et optimiser le nettoyage des espaces publics.  

Mais une IA naî®·t sans connaissances. En tant qu'**Entraî®·neur Officiel**, chaque équipe de terrain doit l'aider à apprendre grâ¢·ce à des données, des photos, des simulations et des analyses.

---

## 🚀 Les 4 Missions du Jeu

1. **♻ï»¿ Reconnaî®·tre les déchets (Mission 1) :** Prendre en photo et classifier 10 types de déchets ou éléments naturels rencontrÉ·s sur le terrain pour nourrir la base de vision artificielle d'ECO-IA.
2. **🚚 Le déplacement des déchets (Mission 2) :** Un mini-jeu de simulation pour comprendre comment les déchets se déplacent dans les parcs en fonction de la météo, du vent et des animaux.
3. **🌍 L'impact des déchets (Mission 3) :** Un quiz interactif sur l'impact environnemental des déchets et les règles de recyclabilité·´.
4. **⏳ Le temps des déchets (Mission 4) :** Un atelier de frise chronologique (avec mode Normal et mode Enfant) pour découvrir la durée réelle de décomposition des matériaux dans la nature.

---

## 🛠ï»¿ Stack Technique

- **Backend :** Node.js, Express, `express-session`
- **Base de données :** SQLite (`better-sqlite3`)
- **Frontend :** HTML5, CSS3, JavaScript Vanilla (ES Modules)
- **Sé·´curité·´ & Outils :** Gestion des sessions par équipe, espace d'administration dédié.

---

## 📂 Architecture du Projet

```text
.
├── admin
│   ├── dashbord.js
│   └── index.html
├── database
│   ├── db.js
│   ├── game.db
│   └── schemas.sql
├── illustrations/        # Logos et visuels du projet
├── public
│   ├── css/              # Styles par mission et global
│   ├── images/           # Assets des déchets (trognons, bouteilles, etc.)
│   ├── index.html        # Page principale de l'application
│   ├── js/
│   │   ├── app.js        # Logique principale et gestion des écrans
│   │   ├── missions/     # Modules JS pour chaque mission (1 à 4)
│   │   └── scanner.js    # Module de scan QR code / motifs
│   └── modules/
├── src/
│   ├── config.js
│   ├── middleware/       # Authentification admin & session
│   └── routes/           # Routes API (jeu, auth, admin)
├── server.js             # Point d'entré·´e du serveur Node.js
└── package.json
```

---

## ⚙ï»¿ Installation et Lancement

### 1. Prérequis

Assure-toi d'avoir installé **Node.js** (version 16+ recommandÉ·e) sur ta machine.

### 2. Installation des dépendances

Ouvre un terminal à la racine du projet et exé·´cute :

```bash
npm install
```

### 3. Lancement du serveur

Dé·´marre l'application en mode local :

```bash
npm start
```

(ou `node server.js`)

Le serveur se lancera par défaut sur l'adresse : **http://localhost:3000**

---

## 🔒 Espace Administration

Un tableau de bord administrateur est accessible pour suivre la progression des équipes connectÉ·es et analyser les données récoltÉ·es sur le terrain :

- **URL :** http://localhost:3000/admin

---

## 👥 Auteurs & Remerciements

Projet développé dans le cadre du **World Clean Up Day** pour la ville de **Verneuil-sur-Seine**.

---

## ℹï»¿ Informations complémentaires

Si tu as besoin d'ajouts spécifiques (consignes de déploiement sur serveur distant, variables d'environnement, crédits équipe/cré·´ateur, etc.), n'hé·´site pas à les ajouter dans cette section.