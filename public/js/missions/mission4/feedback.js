/**
 * Panneau d'explications pédagogiques d'ECO-IA
 */

export class FeedbackManager {
  constructor(container) {
    this.container = container;
  }

  show(results, isSuccess, onNextMission) {
    this.container.className = 'feedback-panel visible';

    let html = `
      <h3>${isSuccess ? '✅ Base de données mise à jour !' : '⚠️ Des erreurs de calcul subsistent'}</h3>
      <div class="feedback-list">
    `;

    results.forEach(item => {
      const statusClass = item.isCorrect ? 'correct' : 'incorrect';
      const statusIcon = item.isCorrect ? '✓' : '✗';
      
      html += `
        <div class="feedback-item">
          <div class="feedback-item-title ${statusClass}">
            <span>${statusIcon}</span>
            <span>${item.waste.name}</span>
            ${!item.isCorrect ? `(Placé sur "${item.userSlotLabel}" → Réponse : "${item.correctSlotLabel}")` : ''}
          </div>
          <div class="feedback-explanation">
            ${item.waste.explanation}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button id="btn-next-mission" style="background: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          ${isSuccess ? 'Valider et Terminer la mission ➔' : 'Reessayer / Continuer ➔'}
        </button>
      </div>
    `;

    this.container.innerHTML = html;

    // Utilisation d'un écouteur direct sur le bouton nouvellement créé
    const btnNext = this.container.querySelector('#btn-next-mission');
    if (btnNext) {
      btnNext.onclick = (e) => {
        e.preventDefault();
        console.log("Clic sur le bouton de fin de mission 4. Succès =", isSuccess);
        
        if (typeof onNextMission === 'function') {
          onNextMission();
        } else {
          console.error("Erreur : onNextMission n'est pas une fonction !");
        }
      };
    }
  }

  clear() {
    this.container.className = 'feedback-panel';
    this.container.innerHTML = '';
  }
}