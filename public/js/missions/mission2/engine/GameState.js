// mission2/engine/GameState.js
import { Board } from './Board.js';
import { MovementEngine } from './MovementEngine.js';
import { FIXED_MAP_50X50 } from './mapData.js';

export class GameState {
  // Optionnel : on peut passer `true` au constructeur si la BDD indique que la mission est déjà finie
  constructor(isMissionAlreadyFinished = false) {
    this.board = new Board(FIXED_MAP_50X50);
    this.targetPos = { x: 27, y: 35 }; // Modifié : 35 au lieu de 36
    this.cars = [];
    this.isCompleted = false;
    
    this.hasUnlockedStorm = isMissionAlreadyFinished || (localStorage.getItem('eco_ia_storm_unlocked') === 'true');
    
    this.setWasteType('sac_plastique');
  }

  getStartingPos(wasteId) {
    switch (wasteId) {
      case 'sac_plastique': return { x: 7, y: 5 };
      case 'canette': return { x: 15, y: 4 };
      case 'trognon': return { x: 24, y: 2 };
      default: return { x: 7, y: 5 };
    }
  }

  setWasteType(wasteId) {
    this.currentWasteId = wasteId;
    this.currentPos = this.getStartingPos(wasteId);
    this.isCompleted = false;
  }

  resetScenario() {
    this.currentPos = this.getStartingPos(this.currentWasteId);
    this.isCompleted = false;
  }

  performAction(actionType, extraData = {}) {
    if (this.isCompleted) return;

    const result = MovementEngine.applyAction(
      this.board, this.currentPos, actionType, this.currentWasteId, extraData
    );
    this.currentPos = result.newPos;
    this.currentPos = MovementEngine.applyWaterCurrent(this.board, this.currentPos);
    this.updateCars();

    // VÉRIFICATION VICTOIRE : Carré 3x3 centré en (27, 35)
    // C'est-à-dire X entre 26 et 28 inclus, Y entre 34 et 36 inclus
    const isTargetReached = (
      this.currentPos.x >= 26 && this.currentPos.x <= 28 &&
      this.currentPos.y >= 34 && this.currentPos.y <= 36 // Modifié : 34 et 36
    );

    if (isTargetReached) {
      this.isCompleted = true;
      this.hasUnlockedStorm = true;
      // On sauvegarde dans le localStorage pour s'en souvenir au prochain rechargement
      localStorage.setItem('eco_ia_storm_unlocked', 'true');
    }
  }

  updateCars() {
    // 1. Apparition des voitures
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const code = this.board.getTileCode(c, r);
        if ((code === 10 || code === 11 || code === 12) && Math.random() < 0.04) {
          this.cars.push({ 
            x: c, y: r, 
            dir: this.board.getRoadDirection(c, r),
            spawnTimer: 0,       // Compteur pour les cases 10, 11, 12
            outOfBoundsTimer: 0  // Compteur pour x >= 50
          });
        }
      }
    }

    // 2. Gestion des déplacements et suppressions
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      
      // -- RÈGLE : Plus de 2 tours sur 10, 11 ou 12 --
      const currentCode = this.board.getTileCode(car.x, car.y);
      if (currentCode === 10 || currentCode === 11 || currentCode === 12) {
        car.spawnTimer++;
      } else {
        car.spawnTimer = 0; // Remise à zéro dès qu'elle quitte ces cases
      }

      if (car.spawnTimer > 2) {
        this.cars.splice(i, 1);
        continue;
      }

      // -- DÉPLACEMENT --
      if (this.board.isRoad(car.x, car.y)) {
         car.dir = this.board.getRoadDirection(car.x, car.y);
      }
      car.x += car.dir.dx;
      car.y += car.dir.dy;

      // -- RÈGLE : x >= 50 toléré 1 tour maximum --
      if (car.x >= 50) {
        car.outOfBoundsTimer++;
        if (car.outOfBoundsTimer > 1) {
          this.cars.splice(i, 1);
          continue;
        }
      } else {
        car.outOfBoundsTimer = 0;
        
        // Si elle sort de la carte ailleurs ou qu'elle quitte la route, on la supprime
        if (this.board.isOutOfBounds(car.x, car.y) || !this.board.isRoad(car.x, car.y)) {
          this.cars.splice(i, 1);
          continue;
        }
      }

      // -- COLLISION AVEC LE DÉCHET --
      if (car.x === this.currentPos.x && car.y === this.currentPos.y) {
        const nextX = this.currentPos.x + car.dir.dx;
        const nextY = this.currentPos.y + car.dir.dy;
        // On autorise la poussée du déchet s'il ne rentre pas dans un mur
        if (nextX >= 0 && nextX < this.board.cols && nextY >= 0 && nextY < this.board.rows && !this.board.isBuilding(nextX, nextY)) {
          this.currentPos = { x: nextX, y: nextY };
        }
      }
    }
  }
}