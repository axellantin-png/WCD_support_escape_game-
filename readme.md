# 🏛️ City Escape - PWA & Serveur Local

Un système d'information léger, robuste et facile à entretenir pour organiser un **Escape Game à l'échelle d'une ville**.

Les joueurs progressent dans l'histoire en scannant des QR codes disséminés dans la ville. L'expérience se fait directement depuis une Progressive Web App (PWA) sans redirection ni installation via un App Store.

***

## 🎯 Fonctionnalités clés

- **📱 Application Web PWA :** Fonctionne directement dans le navigateur du smartphone. La caméra est intégrée pour scanner les QR codes sans quitter l'application.
- **👥 Gestion par équipe :** Connexion rapide via un nom/code d'équipe. Gestion de session par token local (pas de création de compte requise).
- **🗺️ Progression dynamique :** Vérification en temps réel des QR codes scannés selon l'étape actuelle de l'équipe.
- **⚡ Architecture légère & autonome :** Conçu pour tourner sur un simple PC de bureau servant de serveur local, capable d'accueillir jusqu'à **500 joueurs simultanés**.
- **🛠️ Maintenance ultra-simple :** Base de données dans un fichier unique, configuration d'étapes en JSON ou DB, aucun service tiers payant requis.

***

## 🏗️ Architecture du projet

Le projet est conçu avec une stack technique minimale pour garantir une stabilité maximale le jour J :

```text
             [ Smartphones (4G/5G) ]
                        │
                        ▼
            [ Tunnel HTTPS / Domaine ]
     (Cloudflare Tunnel / ngrok / Port Forward)
                        │
                        ▼
         ┌──────────────┴──────────────┐
         │       Nginx (Reverse Proxy) │  <-- Gestion SSL & Cache Média
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌──────────────┴──────────────┐
         │     Node.js + Express.js    │  <-- Serveur Applicatif & API
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌──────────────┴──────────────┐
         │        SQLite (DB)          │  <-- Fichier unique (Équipes, Progression)
         └─────────────────────────────┘
```

### Stack technique

- **Frontend :** HTML5 / CSS3 / JavaScript Vanilla (ou framework léger), Web API Camera (html5-qrcode / jsQR).
- **Backend :** Node.js avec Express.js.
- **Gestionnaire de processus :** PM2 (redémarrage automatique en cas de crash).
- **Base de données :** SQLite3 (stockage local sur fichier).
- **Reverse Proxy :** Nginx (gestion des certificats HTTPS obligatoires pour l'accès caméra).

## 📂 Structure du projet

```text
city-escape/
├── config/
│   └── scenario.json        # Configuration des étapes, indices et QR codes
├── public/                  # Assets du Frontend (PWA)
│   ├── css/
│   ├── js/
│   │   ├── app.js           # Logique de l'application & PWA
│   │   └── scanner.js       # Module de scan QR Code
│   ├── media/               # Images, sons et médias du jeu
│   ├── index.html           # Interface utilisateur unique
│   └── manifest.json        # Fichier Manifest PWA
├── src/
│   ├── controllers/         # Logique des routes (Scan, Équipe, Progression)
│   ├── database/            # Fichier SQLite & migrations
│   │   └── db.sqlite
│   ├── middlewares/         # Authentification par token d'équipe
│   ├── routes/              # Définition des endpoints API
│   └── app.js               # Entrée du serveur Express
├── nginx/
│   └── city-escape.conf     # Exemple de configuration Nginx
├── process.yml              # Fichier de configuration PM2
├── package.json
└── README.md
```

## 🚀 Installation & démarrage rapide

### Prérequis

- Node.js (v18 ou supérieur)
- Nginx (pour le reverse proxy HTTPS)
- Un outil de tunneling (ex: Cloudflare Tunnel) pour rendre votre PC joignable depuis l'extérieur en HTTPS.

### 1. Installation des dépendances

```bash
git clone https://github.com/votre-user/city-escape.git
cd city-escape
npm install
```

### 2. Initialisation de la base de données

```bash
npm run db:init
```

### 3. Lancement du serveur en développement

```bash
npm run dev
```

### 4. Lancement en production avec PM2

```bash
npm install -g pm2
pm2 start process.yml
```

## 🌐 Exposition HTTPS sur Internet

La caméra des smartphones nécessite impérativement une connexion HTTPS sécurisée.

- Configurez Nginx en Reverse Proxy pour pointer vers le port local de Node.js (ex: localhost:3000).
- Utilisez Cloudflare Tunnel (recommandé pour sa simplicité et sa gratuité) pour relier votre Nginx local à votre nom de domaine sans ouvrir de ports sur votre box internet :

```bash
cloudflared tunnel run city-escape
```

## 🎮 Déroulement du jeu (côté joueur)

1. **Rejoindre :** L'équipe flashe un premier QR code de départ ou entre son nom d'équipe. Un token de session est enregistré dans le navigateur.
2. **Jouer :** L'écran affiche l'histoire et l'énigme de l'étape actuelle.
3. **Scanner :** L'équipe trouve le QR code physique dans la ville et le scanne depuis l'application.
4. **Valider :**
   - **Bon QR :** Validation instantanée, passage à l'étape suivante.
   - **Mauvais QR :** Message d'erreur ou indice.

## 🛠️ Maintenance & sauvegarde

- **Sauvegarder la progression :** Copiez simplement le fichier `src/database/db.sqlite`.
- **Modifier le scénario :** Éditez directement `config/scenario.json` ou la table des étapes en base de données sans réinstruire le code de l'application.
- **Surcharge / Crash :** PM2 relance automatiquement le serveur si un problème survient.

## 📜 Licence

Projet sous licence MIT. Libre réutilisation et adaptation pour vos propres escape games !
