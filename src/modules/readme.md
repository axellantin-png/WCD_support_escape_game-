# Modules d'énigmes — comment ça marche

Chaque énigme du jeu a un `type` (stocké dans `steps.type` en base). Ce type détermine
deux choses, complètement indépendantes l'une de l'autre :

1. **Comment l'énigme s'affiche** au joueur → un module côté client (`public/modules/`)
2. **Comment la réponse du joueur est validée** → un module côté serveur (`src/modules/`)

Le reste de l'application (routeur, base de données, scanner QR, tableau de bord) ne
connaît jamais le détail d'un type précis. Il consulte juste un registre et appelle
la bonne fonction. Ça veut dire qu'ajouter une énigme ne touche **jamais** au code
existant — seulement des fichiers nouveaux.

## Exemple : les modules déjà présents

| type          | Ce que fait l'énigme                          |
|---------------|------------------------------------------------|
| `qr_scan`     | Le joueur scanne un QR code dans la ville       |
| `code_entry`  | Le joueur saisit un code trouvé sur place       |
| `photo`       | Le joueur envoie une photo comme preuve         |

## Ajouter un nouveau type d'énigme — la checklist

Prenons un exemple concret : une énigme `riddle` où le joueur doit répondre à une
question à choix multiple.

### 1. Créer le module d'affichage (client)

Fichier : `public/modules/riddle.js`

```js
// Doit exporter une seule fonction : render(step, onSubmit)
// - step      : l'objet étape venant de la base (title, content_json, etc.)
// - onSubmit  : fonction à appeler avec la réponse du joueur, ex. onSubmit("B")
// Retourne un élément DOM à insérer dans la page.

export function render(step, onSubmit) {
  const config = JSON.parse(step.content_json);
  const container = document.createElement('div');
  container.innerHTML = `<h2>${step.title}</h2><p>${config.question}</p>`;

  config.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.label;
    btn.onclick = () => onSubmit(choice.id);
    container.appendChild(btn);
  });

  return container;
}
```

### 2. Enregistrer le module client

Fichier : `public/modules/index.js` — ajouter une ligne :

```js
import { render as renderRiddle } from './riddle.js';

export const modules = {
  qr_scan: /* ... */,
  code_entry: /* ... */,
  riddle: { render: renderRiddle },   // <-- nouvelle ligne
};
```

### 3. Créer le module de validation (serveur)

Fichier : `src/modules/riddle.js`

```js
// Doit exporter une seule fonction : validate(submittedValue, step)
// - submittedValue : ce que le client a envoyé (ex. "B")
// - step           : l'étape en base (contient content_json avec la bonne réponse)
// Retourne { success: bool, message?: string }

function validate(submittedValue, step) {
  const config = JSON.parse(step.content_json);
  const success = submittedValue === config.correct_choice_id;
  return {
    success,
    message: success ? null : "Ce n'est pas la bonne réponse, réessayez.",
  };
}

module.exports = { validate };
```

### 4. Enregistrer le module serveur

Fichier : `src/modules/index.js` :

```js
const riddle = require('./riddle');

const modules = {
  qr_scan: require('./qrScan'),
  code_entry: require('./codeEntry'),
  riddle,                              // <-- nouvelle ligne
};

module.exports = modules;
```

### 5. Créer l'étape en base

Dans `steps`, ajouter une ligne avec :
- `type` = `"riddle"`
- `content_json` = configuration propre à ce type, par exemple :

```json
{
  "question": "Quelle est la couleur du cheval blanc d'Henri IV ?",
  "choices": [
    { "id": "A", "label": "Noir" },
    { "id": "B", "label": "Blanc" },
    { "id": "C", "label": "Marron" }
  ],
  "correct_choice_id": "B"
}
```

C'est tout. Aucune autre ligne du projet n'a besoin d'être modifiée.

## Règles à respecter pour qu'un module reste simple à reprendre

- **Un module = un fichier**, autonome. Il ne doit pas importer d'autres modules.
- **Pas de nouvelle dépendance externe** sauf si vraiment nécessaire — chaque
  dépendance ajoutée est un risque de plus pour la maintenance à long terme.
- **`content_json` porte toute la configuration** propre au type d'énigme. Le schéma
  de la base de données, lui, ne change jamais quand on ajoute un type.
- **Le nom du type** (`riddle`, `qr_scan`, ...) doit être identique des deux côtés
  (client et serveur) et dans la colonne `steps.type` — c'est la seule chose qui les
  relie.
- Teste toujours un nouveau module isolément (une étape de test dédiée) avant de
  l'intégrer au scénario final.
