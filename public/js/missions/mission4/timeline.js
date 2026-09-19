/**
 * Rendu et gestion des zones de la frise chronologique
 */

import { TIMELINE_SLOTS, CHILD_MODE_SLOTS } from './wastes.js';

export class TimelineManager {
  constructor(container) {
    this.container = container;
  }

  render(isChildMode = false) {
    const slots = isChildMode ? CHILD_MODE_SLOTS : TIMELINE_SLOTS;
    
    this.container.className = `timeline-container ${isChildMode ? 'child-mode' : ''}`;
    this.container.innerHTML = slots.map(slot => `
      <div class="timeline-slot" data-slot-id="${slot.id}">
        <div class="slot-header">${slot.label}</div>
        <div class="slot-content"></div>
      </div>
    `).join('');
  }
}