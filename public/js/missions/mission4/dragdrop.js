/**
 * Gestionnaire du Drag & Drop unifié (Touch & Mouse via Pointer Events)
 */

export class DragDropManager {
  constructor(onDropCallback) {
    this.onDropCallback = onDropCallback;
    this.activeCard = null;
    this.ghostEl = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  init(container) {
    this.container = container;
    this.container.addEventListener('pointerdown', this.handlePointerDown);
  }

  handlePointerDown(e) {
    const card = e.target.closest('.waste-card');
    if (!card || card.classList.contains('locked')) return;

    e.preventDefault();
    this.activeCard = card;

    const rect = card.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;

    // Création du clone (ghost) pour le déplacement fluide
    this.ghostEl = card.cloneNode(true);
    this.ghostEl.classList.add('waste-card-ghost');
    this.ghostEl.style.width = `${rect.width}px`;
    this.ghostEl.style.left = `${rect.left}px`;
    this.ghostEl.style.top = `${rect.top}px`;

    document.body.appendChild(this.ghostEl);
    card.style.opacity = '0.3';

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  }

  handlePointerMove(e) {
    if (!this.ghostEl) return;

    const x = e.clientX - this.offsetX;
    const y = e.clientY - this.offsetY;

    this.ghostEl.style.left = `${x}px`;
    this.ghostEl.style.top = `${y}px`;

    // Détection de survol de zone de dépôt (Slot)
    this.ghostEl.style.display = 'none'; // Masquer temporairement pour elementFromPoint
    const targetUnder = document.elementFromPoint(e.clientX, e.clientY);
    this.ghostEl.style.display = 'block';

    this.clearHoverStates();
    if (targetUnder) {
      const slot = targetUnder.closest('.timeline-slot, .waste-pool');
      if (slot) {
        slot.classList.add('slot-hover');
      }
    }
  }

  handlePointerUp(e) {
    if (!this.activeCard || !this.ghostEl) return;

    this.ghostEl.style.display = 'none';
    const targetUnder = document.elementFromPoint(e.clientX, e.clientY);

    let dropTarget = null;
    if (targetUnder) {
      dropTarget = targetUnder.closest('.timeline-slot, .waste-pool');
    }

    this.clearHoverStates();
    document.body.removeChild(this.ghostEl);
    this.ghostEl = null;
    this.activeCard.style.opacity = '1';

    if (dropTarget && this.onDropCallback) {
      this.onDropCallback(this.activeCard, dropTarget);
    }

    this.activeCard = null;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  }

  clearHoverStates() {
    const slots = this.container.querySelectorAll('.slot-hover');
    slots.forEach(slot => slot.classList.remove('slot-hover'));
  }
}