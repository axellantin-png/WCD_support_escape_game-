// mission2/ui/Controls.js

export class Controls {
  constructor(wasteSelectorContainer, controlsContainer, onActionTriggered, onWasteChanged, onResetTriggered) {
    this.wasteSelectorEl = wasteSelectorContainer;
    this.controlsEl = controlsContainer;
    this.onAction = onActionTriggered;
    this.onWasteChanged = onWasteChanged;
    this.onReset = onResetTriggered;

    this.currentWasteId = 'sac_plastique';
  }

  static WASTE_DEFINITIONS = [
    { id: 'sac_plastique', name: 'Sac plastique', icon: '🎈', windEff: true, rainEff: true, animalEff: true },
    { id: 'canette', name: 'Canette alu', icon: '🥤', windEff: false, rainEff: true, animalEff: false },
    { id: 'trognon', name: 'Trognon pomme', icon: '🍏', windEff: false, rainEff: true, animalEff: true }
  ];

  render(currentWasteId = 'sac_plastique', hasUnlockedStorm = false) {
    this.currentWasteId = currentWasteId;
    const waste = Controls.WASTE_DEFINITIONS.find(w => w.id === this.currentWasteId) || Controls.WASTE_DEFINITIONS[0];

    // Onglets de sélection du déchet (En haut)
    this.wasteSelectorEl.innerHTML = `
      <div style="display: flex; gap: 6px; background: #cbd5e1; padding: 4px; border-radius: 10px;">
        ${Controls.WASTE_DEFINITIONS.map(w => `
          <button 
            class="tab-waste-btn" 
            data-waste="${w.id}"
            style="
              flex: 1; padding: 8px 4px; border: none; border-radius: 7px;
              background: ${w.id === this.currentWasteId ? '#ffffff' : 'transparent'};
              color: ${w.id === this.currentWasteId ? '#0284c7' : '#475569'};
              font-weight: bold; font-size: 0.8rem; cursor: pointer;
              box-shadow: ${w.id === this.currentWasteId ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'};
            "
          >
            <span style="font-size: 1.1rem;">${w.icon}</span> ${w.name}
          </button>
        `).join('')}
      </div>
    `;

    // Panneau de contrôle des commandes tactiles (Sous la carte)
    this.controlsEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
          
          <!-- D-PAD VENT -->
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: bold; color: #64748b; margin-bottom: 4px;">💨 Vent</span>
            <div style="display: grid; grid-template-columns: repeat(3, 42px); grid-template-rows: repeat(3, 42px); gap: 3px; background: #e2e8f0; padding: 4px; border-radius: 12px;">
              <div></div>
              <button class="btn-dpad ${!waste.windEff ? 'disabled' : ''}" data-action="vent" data-dir="N" ${!waste.windEff ? 'disabled' : ''} style="${this.getDpadStyle(waste.windEff)}">⬆️</button>
              <div></div>

              <button class="btn-dpad ${!waste.windEff ? 'disabled' : ''}" data-action="vent" data-dir="O" ${!waste.windEff ? 'disabled' : ''} style="${this.getDpadStyle(waste.windEff)}">⬅️</button>
              <div style="display: flex; align-items: center; justify-content: center; font-size: 1.1rem; background: #cbd5e1; border-radius: 6px;">💨</div>
              <button class="btn-dpad ${!waste.windEff ? 'disabled' : ''}" data-action="vent" data-dir="E" ${!waste.windEff ? 'disabled' : ''} style="${this.getDpadStyle(waste.windEff)}">➡️</button>

              <div></div>
              <button class="btn-dpad ${!waste.windEff ? 'disabled' : ''}" data-action="vent" data-dir="S" ${!waste.windEff ? 'disabled' : ''} style="${this.getDpadStyle(waste.windEff)}">⬇️</button>
              <div></div>
            </div>
          </div>

          <!-- PLUIE & ANIMAUX -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <button class="action-btn ${!waste.rainEff ? 'disabled' : ''}" data-action="pluie" ${!waste.rainEff ? 'disabled' : ''} style="${this.getBtnStyle('#3b82f6', waste.rainEff)}">
              <span style="font-size: 1.3rem;">🌧️</span>
              <div style="text-align: left;">
                <div style="font-weight: bold; font-size: 0.85rem;">Pluie</div>
                <div style="font-size: 0.68rem; opacity: 0.8;">${waste.rainEff ? 'Ruissellement' : 'Inactif ❌'}</div>
              </div>
            </button>

            <button class="action-btn ${!waste.animalEff ? 'disabled' : ''}" data-action="animaux" ${!waste.animalEff ? 'disabled' : ''} style="${this.getBtnStyle('#22c55e', waste.animalEff)}">
              <span style="font-size: 1.3rem;">🐿️</span>
              <div style="text-align: left;">
                <div style="font-weight: bold; font-size: 0.85rem;">Animaux</div>
                <div style="font-size: 0.68rem; opacity: 0.8;">${waste.animalEff ? 'Attraction' : 'Ignoré ❌'}</div>
              </div>
            </button>

            <button id="btn-reset-level" style="padding: 6px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; font-size: 0.75rem; font-weight: bold; cursor: pointer;">
              🔄 Recommencer
            </button>
          </div>

        </div>

        <!-- BOUTON TEMPÊTE -->
        <button 
          id="btn-storm"
          class="action-btn ${!hasUnlockedStorm ? 'disabled' : ''}"
          data-action="tempete"
          ${!hasUnlockedStorm ? 'disabled' : ''}
          style="
            width: 100%; padding: 12px; border: none; border-radius: 8px;
            background: ${hasUnlockedStorm ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#e2e8f0'};
            color: ${hasUnlockedStorm ? '#ffffff' : '#94a3b8'};
            font-weight: bold; font-size: 0.95rem; cursor: ${hasUnlockedStorm ? 'pointer' : 'not-allowed'};
            display: flex; align-items: center; justify-content: center; gap: 8px;
          "
        >
          <span style="font-size: 1.2rem;">⚡</span> 
          <span>${hasUnlockedStorm ? 'Déclencher la Tempête (Téléportation Aléatoire)' : '⚡ Tempête (Réussissez 1 déchet pour débloquer)'}</span>
        </button>

      </div>
    `;

    this.bindEvents();
  }

  getDpadStyle(enabled) {
    return `
      width: 100%; height: 100%; border: none; border-radius: 6px;
      background: ${enabled ? '#0284c7' : '#94a3b8'}; color: white;
      font-weight: bold; cursor: ${enabled ? 'pointer' : 'not-allowed'};
      opacity: ${enabled ? '1' : '0.4'}; display: flex; align-items: center; justify-content: center;
    `;
  }

  getBtnStyle(color, enabled) {
    return `
      display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: none; border-radius: 8px;
      background: ${enabled ? color : '#f1f5f9'}; color: ${enabled ? '#ffffff' : '#94a3b8'};
      cursor: ${enabled ? 'pointer' : 'not-allowed'}; opacity: ${enabled ? '1' : '0.5'};
    `;
  }

  bindEvents() {
    this.wasteSelectorEl.querySelectorAll('.tab-waste-btn').forEach(btn => {
      btn.onclick = (e) => {
        const wasteId = e.currentTarget.getAttribute('data-waste');
        if (wasteId !== this.currentWasteId && this.onWasteChanged) {
          this.onWasteChanged(wasteId);
        }
      };
    });

    this.controlsEl.querySelectorAll('.action-btn:not(.disabled), .btn-dpad:not(.disabled)').forEach(btn => {
      btn.onclick = (e) => {
        const actionType = e.currentTarget.getAttribute('data-action');
        const dir = e.currentTarget.getAttribute('data-dir');
        if (this.onAction) {
          this.onAction(actionType, { direction: dir, wasteId: this.currentWasteId });
        }
      };
    });

    const btnReset = this.controlsEl.querySelector('#btn-reset-level');
    if (btnReset) {
      btnReset.onclick = () => { if (this.onReset) this.onReset(); };
    }
  }
}