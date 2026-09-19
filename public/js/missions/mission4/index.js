/**
 * Point d'entrée principal - Mission 4 ECO-IA
 * Conforme au contrat de module export default { async render(container, onComplete) }
 */

import { UIRenderer } from './ui.js';
import { TimelineManager } from './timeline.js';
import { DragDropManager } from './dragdrop.js';
import { GameState } from './game.js';
import { FeedbackManager } from './feedback.js';

export default {
  async render(container, onComplete) {
    // 1. Déploiement des éléments DOM de base
    UIRenderer.renderTemplate(container);

    const root = container.querySelector('#eco-ia-mission4');

    // AJOUT : Texte d'introduction au début de la mission
    const introHTML = `
      <div class="mission-intro-card" style="margin-bottom: 20px;">
        <div class="intro-badge">🛰️ Module de projection temporelle : Activé</div>
        <p class="intro-text">
          Combien de temps dure une erreur humaine ? ECO-IA ne possède pas encore la notion du temps. Elle doit apprendre qu'un déchet organique disparaît vite, tandis que le plastique ou le verre laisse une cicatrice quasi permanente dans l'environnement. Remettez ces éléments dans le bon ordre chronologique pour configurer l'horloge interne d'ECO-IA.
        </p>
      </div>
    `;
    root.insertAdjacentHTML('afterbegin', introHTML);

    const timelineTarget = root.querySelector('#timeline-target');
    const wasteListTarget = root.querySelector('#waste-list');
    const wastePool = root.querySelector('#waste-pool');
    const feedbackTarget = root.querySelector('#feedback-target');
    const btnValidate = root.querySelector('#btn-validate');
    const ecoMessage = root.querySelector('#eco-ia-text');

    const btnNormal = root.querySelector('#btn-mode-normal');
    const btnChild = root.querySelector('#btn-mode-child');

    // 2. Initialisation des composants
    const gameState = new GameState();
    const timeline = new TimelineManager(timelineTarget);
    const feedback = new FeedbackManager(feedbackTarget);

    const updateGameView = () => {
      timeline.render(gameState.isChildMode);
      UIRenderer.renderWasteCards(wasteListTarget);
      feedback.clear();
      btnValidate.disabled = true;
    };

    updateGameView();

    // 3. Gestionnaire du Drag & Drop
    const dragDrop = new DragDropManager((card, dropTarget) => {
      const wasteId = card.dataset.wasteId;

      // On s'assure d'attraper le slot parent peu importe où l'on dépose
      const slotElement = dropTarget.closest('.timeline-slot');

      if (slotElement) {
        const slotContent = slotElement.querySelector('.slot-content') || slotElement;
        slotContent.appendChild(card);
        gameState.placeWaste(wasteId, slotElement.dataset.slotId);
      } else if (dropTarget.closest('#waste-pool')) {
        wasteListTarget.appendChild(card);
        gameState.placeWaste(wasteId, null);
      }

      card.classList.remove('correct', 'incorrect');
      btnValidate.disabled = !gameState.isAllPlaced();
    });

    dragDrop.init(root);

    // 4. Accessibilité : Mode Clic alternative au Drag & Drop
    let selectedCard = null;
    root.addEventListener('click', (e) => {
      const card = e.target.closest('.waste-card');
      const slot = e.target.closest('.timeline-slot');

      if (card) {
        if (selectedCard) selectedCard.classList.remove('selected');
        if (selectedCard === card) {
          selectedCard = null;
        } else {
          selectedCard = card;
          card.classList.add('selected');
        }
      } else if (slot && selectedCard) {
        const wasteId = selectedCard.dataset.wasteId;
        const slotContent = slot.querySelector('.slot-content') || slot;
        slotContent.appendChild(selectedCard);
        
        // On récupère explicitement l'ID du slot
        gameState.placeWaste(wasteId, slot.dataset.slotId);
        
        selectedCard.classList.remove('selected');
        selectedCard = null;
        btnValidate.disabled = !gameState.isAllPlaced();
      }
    });

    // 5. Gestion des Modes (Normal / Enfant)
    btnNormal.addEventListener('click', () => {
      if (!gameState.isChildMode) return;
      btnNormal.classList.add('active');
      btnChild.classList.remove('active');
      gameState.setMode(false);
      updateGameView();
    });

    btnChild.addEventListener('click', () => {
      if (gameState.isChildMode) return;
      btnChild.classList.add('active');
      btnNormal.classList.remove('active');
      gameState.setMode(true);
      updateGameView();
    });

    // 6. Action de Validation
    btnValidate.addEventListener('click', async () => {
      const { allCorrect, results } = gameState.validate();

      results.forEach(item => {
        const card = root.querySelector(`[data-waste-id="${item.waste.id}"]`);
        if (card) {
          card.classList.remove('correct', 'incorrect');
          card.classList.add(item.isCorrect ? 'correct' : 'incorrect');
        }
      });

      if (ecoMessage) {
        if (allCorrect) {
          ecoMessage.textContent = "Base de données temporelle mise à jour avec succès ! Les durées sont parfaitement cohérentes.";
        } else {
          ecoMessage.textContent = "Certaines estimations semblent incorrectes. Analyse la correction ci-dessous pour m'aider à apprendre.";
        }
      }

      // On affiche le feedback visuel
      feedback.show(results, allCorrect, () => {
        if (typeof onComplete === 'function') {
          onComplete(true, "Mission 4 validée ! L'horloge de décomposition d'ECO-IA est calibrée.");
        }
      });

      // SI TOUT EST CORRECT : Enregistrement BDD et retour au menu
      if (allCorrect) {
        try {
          await fetch('/api/missions/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mission_id: 4 })
          });
          console.log("Mission 4 validée et enregistrée en BDD !");
        } catch (e) {
          console.error("Erreur enregistrement mission 4 :", e);
        }

        setTimeout(() => {
          if (typeof onComplete === 'function') {
            onComplete(true, "Mission 4 validée ! L'horloge de décomposition d'ECO-IA est calibrée.");
          } else {
            window.closeMissionDetail();
          }
        }, 2500);
      }
    });

    // AJOUT : Texte de conclusion & Le saviez-vous ? à la fin de la mission
    const outroHTML = `
      <div class="mission-outro-card" style="margin-top: 25px;">
        <div class="outro-badge">⏱️ Horloge de décomposition synchronisée</div>
        <p class="outro-text">
          <strong>Le saviez-vous ?</strong> La nature ne digère pas tout à la même vitesse. Si une peau de banane disparaît en 3 à 4 semaines, un chewing-gum met 5 ans, une canette en acier 100 ans, un sac plastique 400 ans, et une bouteille en verre peut persister jusqu'à 4000 ans dans la nature.
        </p>

        <div class="did-you-know-section">
          <h3 class="dyk-title">💡 Le saviez-vous ?</h3>
          
          <div class="dyk-item">
            <strong>Le faux espoir de la balayeuse :</strong> Une rue résidentielle classique n'est nettoyée par les agents municipaux qu'une à deux fois par semaine. Si vous laissez tomber un emballage un lundi, il a de grandes chances de croiser la route d'une averse avant le passage de la balayeuse le vendredi. Il suffit d'une seule forte pluie de 15 minutes pour qu'un mégot soit emporté dans les grilles d'égouts, devenant instantanément irrécupérable.
          </div>

          <div class="dyk-item">
            <strong>Le verre, champion de la survie :</strong> Contrairement au plastique, le verre ne libère pas de toxines, mais il est quasi-immortel. Des archéologues retrouvent régulièrement des fioles en verre de l'Empire Romain vieilles de 2 000 ans, parfaitement intactes dans la terre. Une bouteille jetée aujourd'hui en forêt pourrait encore être là en l'an 6000 !
          </div>

          <div class="dyk-item">
            <strong>Le grand mensonge du plastique "biodégradable" :</strong> Attention au greenwashing ! Les gobelets estampillés "plastique compostable" (souvent en PLA, à base de maïs) ne se dégradent absolument pas dans la nature. Ils ont besoin d'être chauffés à 60°C dans un composteur industriel (avec des microbes spécifiques) pour fondre. Jetés dans un parc de la ville, ils mettront des décennies à disparaître, exactement comme un plastique classique. (Source : Programme des Nations Unies pour l'Environnement)
          </div>

          <div class="dyk-item">
            <strong>Le mythe de la peau de banane :</strong> On pense souvent que jeter un trognon de pomme ou une peau de banane dans un buisson est inoffensif. Pourtant, selon les conditions climatiques, une peau de banane peut mettre jusqu'à 2 ans à se décomposer complètement ! De plus, elle attire les animaux sauvages (hérissons, renards) près des routes, augmentant le risque qu'ils se fassent écraser. (Source : Office National des Forêts)
          </div>
        </div>
      </div>
    `;
    root.insertAdjacentHTML('beforeend', outroHTML);
  }
};