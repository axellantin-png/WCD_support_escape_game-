import { QUESTIONS } from "./data/questions.js";
import { GameState } from "./components/state.js";
import { UI } from "./components/ui.js";

export default {
  title: "Mission 3 — L'impact des déchets",

  async render(container, onComplete) {
    container.innerHTML = `
      <div class="m3-container">
        
        <!-- LORE INTRO -->
        <div class="m3-intro-lore">
          <div class="m3-lore-sys">▶ Module d'analyse de la biosphère : Activé.</div>
          <p>Savoir repérer un déchet ne suffit pas ; ECO-IA doit comprendre <em>pourquoi</em> il est nocif. Est-il toxique pour les sols ? Risque-t-il d'étouffer un petit mammifère ? Peut-il être recyclé pour éviter de puiser dans nos ressources naturelles ?</p>
          <p>Évaluez les scénarios suivants pour enseigner à l'IA l'impact réel de nos déchets sur la faune et la flore de Verneuil.</p>
        </div>

        <div id="m3-waste-card" class="m3-waste-card"></div>
        <div id="m3-targets-grid" class="m3-targets-grid"></div>
        <div id="m3-console" class="m3-feedback-console hidden"></div>
        
        <div class="m3-actions">
          <button id="m3-action-btn" class="btn m3-btn-primary">Valider</button>
        </div>

        <!-- LORE LE SAVIEZ-VOUS (Toujours visible en bas) -->
        <div id="m3-lore-end" class="m3-lore-end">
          <h3>💡 Le saviez-vous ?</h3>
          <div class="m3-lore-item">
            <strong>📱 L'IA dans notre poche :</strong> Parce qu'une erreur de tri peut contaminer toute une benne recyclable, de jeunes start-ups comme Wastetide développent des applications basées sur l'intelligence artificielle (WasteScan) pour aider les citoyens à scanner leurs propres déchets chez eux et savoir exactement dans quelle poubelle les jeter.
          </div>
          <div class="m3-lore-item">
            <strong>♻️ Le cycle express de l'aluminium :</strong> Si vous jetez une canette en aluminium dans la nature, elle mettra des centaines d'années à rouiller. Mais si vous la triez, elle peut être fondue, refabriquée, remplie, et remise en rayon en seulement 60 jours ! L'aluminium est recyclable à l'infini sans jamais perdre en qualité. De plus, une simple canette recyclée permet d'économiser 95 % de l'énergie qui aurait été nécessaire pour extraire le métal et en fabriquer une neuve. <em>(Sources : The Aluminum Association / Recycleye)</em>
          </div>
          <div class="m3-lore-item">
            <strong>🗑️ L'IA pour sauver le tri :</strong> Parfois, un seul produit toxique jeté dans la mauvaise poubelle (comme une pile au lithium) peut déclencher un incendie dans un camion-poubelle. La start-up américaine Rubicon a développé une IA embarquée dans les camions qui repère les bennes "contaminées" pour alerter les maires et sensibiliser précisément les quartiers qui font des erreurs de tri dangereuses.
          </div>
        </div>

      </div>
    `;

    const state = new GameState(QUESTIONS);
    
    const wasteCardEl = container.querySelector('#m3-waste-card');
    const optionsGridEl = container.querySelector('#m3-targets-grid');
    const consoleEl = container.querySelector('#m3-console');
    const actionBtnEl = container.querySelector('#m3-action-btn');

    // On passe uniquement les éléments nécessaires au UI
    const ui = new UI(wasteCardEl, optionsGridEl, consoleEl, actionBtnEl, (index) => {
      state.selectOption(index);
      updateView();
    });

    const updateView = () => {
      const q = state.getCurrentQuestion();
      ui.renderQuestion(q, state.getProgressText(), state.selectedOptionIndex, state.isValidated);
    };

    actionBtnEl.addEventListener('click', () => {
      if (state.isFinished()) {
        if (typeof onComplete === 'function') {
          onComplete(true, `Mission terminée avec un score de ${state.score}/${QUESTIONS.length}`);
        }
        return;
      }

      if (!state.isValidated) {
        const isCorrect = state.validate();
        updateView(); 
        ui.renderFeedback(isCorrect, state.getCurrentQuestion().explanation);
        
        actionBtnEl.textContent = state.currentIndex === QUESTIONS.length - 1 
          ? "Voir mon résultat" 
          : "Question suivante";
      } else {
        if (state.nextQuestion()) {
          updateView();
        } else {
          ui.renderEndScreen(state.score, QUESTIONS.length);
          actionBtnEl.textContent = "Terminer la mission";
        }
      }
    });

    updateView();
  }
};