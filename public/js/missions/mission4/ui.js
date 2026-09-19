/**
 * Constructeur DOM principal
 */

import { WASTES_DATA } from './wastes.js';

export class UIRenderer {
  static renderTemplate(container) {
    container.innerHTML = `
      <div id="eco-ia-mission4">
        <header class="mission4-header">
          <h2>Mission 4 : Le temps de disparition des déchets</h2>
        </header>

        <div class="mode-switcher">
          <button class="mode-btn active" id="btn-mode-normal">Mode Normal</button>
          <button class="mode-btn" id="btn-mode-child">Mode Enfant (Simplifié)</button>
        </div>

        <div id="timeline-target"></div>

        <div class="waste-pool" id="waste-pool">
          <div class="waste-pool-title">Déchets à classer</div>
          <div class="waste-list" id="waste-list"></div>
        </div>

        <div class="controls-container">
          <button id="btn-validate" class="btn-primary" disabled>Valider les estimations</button>
        </div>

        <div id="feedback-target"></div>
      </div>
    `;
  }

  static renderWasteCards(container) {
    container.innerHTML = WASTES_DATA.map(waste => `
      <div class="waste-card" data-waste-id="${waste.id}" tabindex="0">
        <img src="${waste.image}" alt="${waste.name}" class="waste-image" loading="lazy">
        <div class="waste-name">${waste.name}</div>
      </div>
    `).join('');
  }
}