/**
 * Logique d'état du jeu (State Management & Validation)
 */

import { WASTES_DATA, TIMELINE_SLOTS, CHILD_MODE_SLOTS } from './wastes.js';

export class GameState {
  constructor() {
    this.isChildMode = false;
    this.placements = new Map(); // wasteId -> slotId
  }

  setMode(isChild) {
    this.isChildMode = isChild;
    this.placements.clear();
  }

  placeWaste(wasteId, slotId) {
    if (slotId) {
      this.placements.set(wasteId, slotId);
    } else {
      this.placements.delete(wasteId);
    }
  }

  isAllPlaced() {
    return this.placements.size === WASTES_DATA.length;
  }

  validate() {
    const results = [];
    let allCorrect = true;

    const slotsList = this.isChildMode ? CHILD_MODE_SLOTS : TIMELINE_SLOTS;

    WASTES_DATA.forEach(waste => {
      const userSlotId = this.placements.get(waste.id);
      const targetCorrectId = this.isChildMode ? waste.childCategoryId : waste.correctSlotId;

      const isCorrect = userSlotId === targetCorrectId;
      if (!isCorrect) allCorrect = false;

      const userSlot = slotsList.find(s => s.id === userSlotId);
      const correctSlot = slotsList.find(s => s.id === targetCorrectId);

      results.push({
        waste,
        isCorrect,
        userSlotLabel: userSlot ? userSlot.label : 'Non placé',
        correctSlotLabel: correctSlot ? correctSlot.label : 'Inconnu'
      });
    });

    return { allCorrect, results };
  }
}