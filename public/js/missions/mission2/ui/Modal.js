/**
 * Popup de fin de niveau affichant le bilan pédagogique.
 */
export class Modal {
  constructor(modalElement) {
    this.modalElement = modalElement;
  }

  showVictory(scenario, onNext) {
    this.modalElement.innerHTML = `
      <div class="modal-content">
        <h2>🎉 Mission Réussie !</h2>
        <p class="pedagogical-text">« ${scenario.pedagogicalMessage} »</p>
        <button id="next-btn" class="btn-primary">Scénario suivant</button>
      </div>
    `;
    this.modalElement.classList.add('visible');

    document.getElementById('next-btn').addEventListener('click', () => {
      this.hide();
      onNext();
    });
  }

  hide() {
    this.modalElement.classList.remove('visible');
    this.modalElement.innerHTML = '';
  }
}