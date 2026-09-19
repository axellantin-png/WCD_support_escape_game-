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

    if (isSuccess && onNextMission) {
      html += `
        <div style="text-align: center; margin-top: 20px;">
          <button id="btn-next-mission" class="btn-primary">Mission Suivante ➔</button>
        </div>
      `;
    }

    this.container.innerHTML = html;

    const btnNext = this.container.querySelector('#btn-next-mission');
    if (btnNext) {
      btnNext.addEventListener('click', () => onNextMission());
    }
  }

  clear() {
    this.container.className = 'feedback-panel';
    this.container.innerHTML = '';
  }
}