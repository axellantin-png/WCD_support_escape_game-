// mission2/engine/MovementEngine.js

export class MovementEngine {
  /**
   * Applique une action sur le déchet selon son type et la commande choisie
   */
  static applyAction(board, currentPos, actionType, wasteId, extraData = {}) {
    let pos = { ...currentPos };
    let steps = [pos];
    let message = "";

    switch (actionType) {
      case 'vent':
        ({ pos, steps, message } = this.handleWind(board, pos, wasteId, extraData.direction));
        break;

      case 'pluie':
        ({ pos, steps, message } = this.handleRain(board, pos, wasteId));
        break;

      case 'animaux':
        ({ pos, steps, message } = this.handleAnimals(board, pos, wasteId));
        break;

      case 'tempete':
        ({ pos, steps, message } = this.handleStorm(board, pos));
        break;

      default:
        message = "Action inconnue.";
    }

    return { newPos: pos, steps, message };
  }

  // ============================================================
  // 💨 VENT (DIRECTIONNEL VIA D-PAD)
  // ============================================================
  static handleWind(board, startPos, wasteId, dirCode) {
    // NOUVEAU : Si le déchet est dans l'eau (code 2), le vent n'a plus d'effet
    if (board.isWater(startPos.x, startPos.y)) {
      return {
        pos: startPos,
        steps: [startPos],
        message: "💧 Le déchet flotte dans l'eau, le vent n'a aucun effet dessus !"
      };
    }

    // Règle conservée : déchets trop lourds
    if (wasteId === 'canette' || wasteId === 'trognon') {
      return {
        pos: startPos,
        steps: [startPos],
        message: "❌ Ce déchet est trop lourd pour être emporté par le vent !"
      };
    }

    const dirMap = {
      'N': { dx: 0, dy: -1 },
      'S': { dx: 0, dy: 1 },
      'E': { dx: 1, dy: 0 },
      'O': { dx: -1, dy: 0 }
    };

    const dir = dirMap[dirCode] || { dx: 1, dy: 0 };
    let current = { ...startPos };
    const steps = [current];

    for (let i = 0; i < 2; i++) {
      const next = { x: current.x + dir.dx, y: current.y + dir.dy };
      if (this.isValidTile(board, next)) {
        current = next;
        steps.push(current);
      } else {
        break;
      }
    }

    return { pos: current, steps, message: "💨 Une rafale de vent emporte le sac plastique !" };
  }

  // ============================================================
  // 🌧️ PLUIE
  // ============================================================
  static handleRain(board, startPos, wasteId) {
    // Règle spéciale conservée : la canette roule plus loin
    const distance = wasteId === 'canette' ? 2 : 1;
    let current = { ...startPos };
    const steps = [current];

    for (let i = 0; i < distance; i++) {
      const tileCode = board.getTileCode(current.x, current.y);
      let dir = { dx: 0, dy: 0 };

      //  Mouvement selon le sens des cases
      if (tileCode === 3) dir = { dx: 0, dy: -1 }; // 3 = Haut
      else if (tileCode === 4) dir = { dx: 0, dy: 1 }; // 4 = Bas
      else if (tileCode === 5) dir = { dx: -1, dy: 0 }; // 5 = Gauche 
      else if (tileCode === 6) dir = { dx: 1, dy: 0 }; // 6 = Droite 
      else {
        // Si le déchet n'est pas sur une case directionnelle, la pluie ne le bouge plus (ou tu peux remettre un ruissellement par défaut ici)
        break; 
      }

      const next = { x: current.x + dir.dx, y: current.y + dir.dy };
      if (this.isValidTile(board, next)) {
        current = next;
        steps.push(current);
      } else {
        break;
      }
    }

    const msg = wasteId === 'canette'
      ? "⚡ La canette roule avec le courant de la pluie !"
      : "🌧️ L'eau de ruissellement entraîne le déchet.";

    return { pos: current, steps, message: msg };
  }

  // ============================================================
  // 🐿️ ANIMAUX
  // ============================================================
  // Remplacer entièrement la méthode handleAnimals
  static handleAnimals(board, startPos, wasteId) {
    // 1. Enlever l'interaction des animaux avec les sacs plastiques
    if (wasteId === 'sac_plastique') {
      return {
        pos: startPos,
        steps: [startPos],
        message: "❌ Les animaux ne s'intéressent pas au plastique."
      };
    }

    const parkZone = board.getParkZoneAt(startPos.x, startPos.y);

    if (parkZone && parkZone.length > 0) {
      // 2. Chance sur 7 de déposer le déchet sur la route adjacente
      if (Math.random() < (1 / 7)) {
        let adjacentRoads = [];
        for (const tile of parkZone) {
          const neighbors = [
            { x: tile.x + 1, y: tile.y }, { x: tile.x - 1, y: tile.y },
            { x: tile.x, y: tile.y + 1 }, { x: tile.x, y: tile.y - 1 }
          ];
          for (const n of neighbors) {
            const code = board.getTileCode(n.x, n.y);
            // Vérifie si c'est une route visée (3, 4, 5 ou 6)
            if ([3, 4, 5, 6].includes(code)) {
              adjacentRoads.push(n);
            }
          }
        }
        
        if (adjacentRoads.length > 0) {
          const roadTile = adjacentRoads[Math.floor(Math.random() * adjacentRoads.length)];
          return {
            pos: roadTile,
            steps: [startPos, roadTile],
            message: "🐾 Un animal a sorti le déchet de l'espace vert et l'a posé sur la route !"
          };
        }
      }

      // S'il n'est pas posé sur la route (6/7 de chances, ou pas de route trouvée)
      const randomTile = parkZone[Math.floor(Math.random() * parkZone.length)];
      return {
        pos: randomTile,
        steps: [startPos, randomTile],
        message: "🐾 Un animal a emporté le déchet plus loin dans le parc !"
      };
    } else {
      return {
        pos: startPos,
        steps: [startPos],
        message: "❌ Il n'y a pas d'animaux par ici (le déchet doit être dans un espace vert)."
      };
    }
  }

  // Dans handleRain, corriger la ligne pour la case 6 :
  // else if (tileCode === 6) dir = { dx: -1, dy: 0 }; // 6 = Gauche (au lieu de Droite)

  // ============================================================
  // ⚡ COURANT D'EAU AUTOMATIQUE (SUR LES CASES RIVIÈRE CODE 2)
  // ============================================================
  static applyWaterCurrent(board, currentPos) {
    if (board.isWater(currentPos.x, currentPos.y)) {
      // NOUVEAU : Décalage vers le haut (dy: -1) avec 1/2 probabilité
      if (Math.random() < 0.5) {
        const next = { x: currentPos.x, y: currentPos.y - 1 };
        if (this.isValidTile(board, next)) {
          return next;
        }
      }
    }
    return currentPos;
  }

  // ============================================================
  // ⚡ TEMPÊTE (TÉLÉPORTATION ALÉATOIRE)
  // ============================================================
  static handleStorm(board, startPos) {
    const validTiles = [];
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        if (board.getTileCode(c, r) !== 0 && !(c === startPos.x && r === startPos.y)) {
          validTiles.push({ x: c, y: r });
        }
      }
    }

    if (validTiles.length === 0) return { pos: startPos, steps: [startPos], message: "Aucune case valide." };

    const randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
    return {
      pos: randomTile,
      steps: [startPos, randomTile],
      message: "⚡ UNE VIOLENTE TEMPÊTE A PROJETÉ LE DÉCHET AILLEURS DANS LA VILLE !"
    };
  }

  static isValidTile(board, pos) {
    if (board.isOutOfBounds(pos.x, pos.y)) return false;
    return board.getTileCode(pos.x, pos.y) !== 0; // Pas de bâtiments (code 0)
  }
}