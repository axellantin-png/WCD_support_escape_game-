// mission2/index.js
import { GameState } from './engine/GameState.js';
import { Renderer } from './ui/Renderer.js';
import { Controls } from './ui/Controls.js';

export default {
  async render(container, onComplete) {
    container.innerHTML = `
      <div id="eco-ia-mission2" style="display: flex; flex-direction: column; gap: 15px; max-width: 480px; margin: 0 auto; padding: 10px;">
        
        <!-- TEXTE D'INTRODUCTION -->
        <div class="mission-intro-card">
          <div class="intro-badge">🛰️ Module de prédiction spatiale : Activé</div>
          <p class="intro-text">
            Un déchet abandonné ne reste jamais immobile. Il est soumis aux éléments : un coup de vent, une forte pluie, ou même le passage d'un animal peuvent le déplacer sur des kilomètres jusqu'aux cours d'eau. Aidez ECO-IA à comprendre la physique des déchets. Simulez leur parcours de A à B en fonction de la météo pour apprendre à l'IA comment bloquer la pollution à la source.
          </p>
        </div>

        <div id="waste-selector-panel"></div>
        
        <div class="game-viewport-container" style="position: relative; overflow: hidden; border-radius: 8px; background: #15803d; width: 100%; aspect-ratio: 1/1; margin: 0 auto; box-shadow: inset 0 0 0 1px #15803d;">
          <div id="game-board" class="game-board-grid" style="display: grid; width: 100%; height: 100%; gap: 0; background: #15803d;"></div>
        </div>
        
        <div id="controls-panel"></div>

        <!-- TEXTE DE CONCLUSION & LE SAVIEZ-VOUS ? -->
        <div class="mission-outro-card">
          <div class="did-you-know-section">
            <h3 class="dyk-title">💡 Le saviez-vous ?</h3>
            
            <div class="dyk-item">
              L'IA contre le vent : Pour éviter que les déchets ne s'envolent dans nos rues, l'intelligence artificielle AMCS Vision AI est aujourd'hui utilisée par des villes pour détecter automatiquement avec des caméras les poubelles qui débordent. Cela permet d'avertir les services de collecte avant qu'un coup de vent ne disperse les déchets.
            </div>

            <div class="dyk-item">
              Le saviez-vous ?</strong> Les déchets voyagent loin. Environ 80 % de la pollution plastique des océans provient directement des terres, transportée par le vent, les égouts et les rivières. En comprenant ces trajectoires, ECO-IA pourra conseiller la mairie sur le placement stratégique des poubelles et des filets de retenue.
            </div>

            <div class="dyk-item">
              Des drones pour traquer les déchets : La start-up Ellipsis Earth utilise des drones couplés à une IA pour cartographier le mouvement des déchets de la terre vers la mer. Lors d'une mission à Sorrente (Italie), leur IA a prouvé que le vent déplaçait les déchets toujours dans la même rue. En déplaçant simplement quelques poubelles de quelques mètres selon les calculs de l'IA, la ville a réduit sa pollution au sol de 45 % !
            </div>

            <div class="dyk-item">
              L'effet "vitre brisée" : Pourquoi un déchet en attire-t-il d'autres ? Les études comportementales montrent qu'un espace déjà propre décourage l'incivilité. Mais si un seul déchet est visible sur le trottoir, la probabilité qu'un autre passant jette le sien au même endroit est multipliée par 3. Un petit coup de vent qui déplace un gobelet peut donc créer une mini-décharge en quelques heures. (Source : Keep America Beautiful)
            </div>

            <div class="dyk-item">
              Le vol long-courrier du plastique : Un sac plastique abandonné en ville peut voler très loin. Des expéditions scientifiques ont retrouvé des sacs plastiques de supermarché intacts au fond de la fosse des Mariannes (à près de 11 000 mètres de profondeur) et accrochés aux roches près du sommet du mont Everest. (Source : National Geographic / Programme des Nations Unies pour l'environnement)
            </div>
          </div>
        </div>

      </div>
    `;

    const boardEl = container.querySelector('#game-board');
    const wasteSelectorEl = container.querySelector('#waste-selector-panel');
    const controlsEl = container.querySelector('#controls-panel');

    const state = new GameState();
    const renderer = new Renderer(boardEl);

    const controls = new Controls(
      wasteSelectorEl,
      controlsEl,
      (actionType, extraData) => {
        state.performAction(actionType, extraData);
        updateUI(false); 
      },
      (wasteId) => {
        state.setWasteType(wasteId);
        updateUI(true);
      },
      () => {
        state.resetScenario();
        updateUI(true);
      }
    );

    function updateUI(rebuildBoard = false) {
      if (rebuildBoard) {
        renderer.renderBoardOnce(state.board, state.getStartingPos(state.currentWasteId), state.targetPos);
      }

      const currentIcon = Controls.WASTE_DEFINITIONS.find(w => w.id === state.currentWasteId)?.icon || '🎈';
      renderer.updateEntities(state.board, state.currentPos, state.cars, currentIcon);
      controls.render(state.currentWasteId, state.hasUnlockedStorm);

      if (state.isCompleted && typeof onComplete === 'function') {
        onComplete(true, "Bravo ! Le déchet a atteint sa destination.");
      }
    }

    renderer.renderBoardOnce(state.board, state.getStartingPos(state.currentWasteId), state.targetPos);
    updateUI(true);
  }
};