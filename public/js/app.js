// public/js/app.js

import { openScannerModal } from './scanner.js';

window.gameState = window.gameState || {
  teamName: '',
  mission1: { photos: [] }
};

document.addEventListener('DOMContentLoaded', () => {
  const screenRegister = document.getElementById('screen-register');
  const screenMain = document.getElementById('screen-main');
  const formRegister = document.getElementById('form-register');
  const teamNameInput = document.getElementById('team-name');
  const teamBadge = document.getElementById('team-badge');

  const viewList = document.getElementById('view-list');
  const viewDetail = document.getElementById('view-detail');
  const btnBack = document.getElementById('btn-back');
  const btnScanQr = document.getElementById('btn-scan-qr');

  // 1. Inscription d'équipe
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const teamName = teamNameInput.value.trim();
      if (!teamName) return;

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_name: teamName })
        });
        const data = await res.json();

        if (data.success) {
          window.gameState.teamName = teamName;
          if (teamBadge) teamBadge.textContent = teamName;
          
          screenRegister.classList.add('hidden');
          screenMain.classList.remove('hidden');
          await renderMissionsList();
        } else {
          alert(data.error || "Erreur lors de l'inscription.");
        }
      } catch (err) {
        console.error("Erreur réseau inscription :", err);
      }
    });
  }

  // 2. Bouton Retour
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      closeMissionDetail();
    });
  }

  // 3. SCANNER DE TÉLÉPHONE (Utilisation du module externe scanner.js)
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      openScannerModal(async (patternScanned) => {
        await handleScanResult(patternScanned);
      });
    });
  }

  renderMissionsList();
});

// --- TRAITEMENT DU SCAN ---
async function handleScanResult(pattern) {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`🎉 ${data.message}`);
      await renderMissionsList();
    } else {
      alert(`❌ ${data.error || 'Motif inconnu.'}`);
    }
  } catch (err) {
    console.error("Erreur envoi scan :", err);
    alert(`Erreur de communication : ${err.message}`);
  }
}

// Fermeture de la vue mission
function closeMissionDetail() {
  const viewList = document.getElementById('view-list');
  const viewDetail = document.getElementById('view-detail');
  const missionContentArea = document.getElementById('mission-content-area');

  if (viewDetail && viewList) {
    viewDetail.classList.add('hidden');
    viewList.classList.remove('hidden');
  }
  if (missionContentArea) {
    missionContentArea.innerHTML = '';
  }
  renderMissionsList();
}
window.closeMissionDetail = closeMissionDetail;

// Rendu de la liste des missions
async function renderMissionsList() {
  const listContainer = document.getElementById('missions-list');
  if (!listContainer) return;

  try {
    const response = await fetch('/api/missions');
    const data = await response.json();

    if (!data.missions) return;

    listContainer.innerHTML = '';

    data.missions.forEach(mission => {
      const isCompleted = data.completed_ids && data.completed_ids.includes(mission.id);
      const isUnlocked = (data.unlocked_ids && data.unlocked_ids.includes(mission.id)) || mission.order_index === 1 || mission.is_locked === 0;
      const isLocked = !isUnlocked && !isCompleted;

      let badgeHtml = '<span class="mission-badge badge-unlocked">▶️ Disponible</span>';
      let btnHtml = `<button class="btn" style="width: auto; padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="window.startMission(${mission.id}, '${mission.title.replace(/'/g, "\\'")}')">Lancer</button>`;

      if (isCompleted) {
        badgeHtml = '<span class="mission-badge badge-completed">✅ Terminée</span>';
        btnHtml = `<button class="btn" style="width: auto; padding: 8px 16px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="window.startMission(${mission.id}, '${mission.title.replace(/'/g, "\\'")}')">Revoir</button>`;
      } else if (isLocked) {
        badgeHtml = '<span class="mission-badge badge-locked">🔒 Verrouillée</span>';
        btnHtml = `<button class="btn" disabled style="width: auto; padding: 8px 16px; background: #cbd5e1; color: #64748b; border: none; border-radius: 6px; cursor: not-allowed;">Bloqué</button>`;
      }

      const card = document.createElement('div');
      card.className = `mission-card`;
      card.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 14px; border-radius: 10px; margin-bottom: 12px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);";
      card.innerHTML = `
        <div>
          <h3 style="margin: 0; font-size: 1rem; color: #0f172a;">${mission.icon || '🎯'} ${mission.title}</h3>
          ${badgeHtml}
        </div>
        <div>
          ${btnHtml}
        </div>
      `;
      listContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Erreur chargement liste missions:", err);
  }
}

// Lancement d'une mission
window.startMission = async function(missionId, missionTitle = '') {
  const viewList = document.getElementById('view-list');
  const viewDetail = document.getElementById('view-detail');
  const missionContentArea = document.getElementById('mission-content-area');
  const detailTitle = document.getElementById('detail-title');

  if (!missionContentArea || !viewDetail || !viewList) return;

  viewList.classList.add('hidden');
  viewDetail.classList.remove('hidden');
  if (detailTitle) detailTitle.textContent = missionTitle || `Mission ${missionId}`;
  
  missionContentArea.innerHTML = `<p style="text-align:center; padding: 40px; color: #64748b;">Chargement de la mission...</p>`;

  try {
    let missionModule = null;

    if (missionId === 1) {
      const mod = await import('/js/missions/mission1.js');
      missionModule = mod.default;
    } else if (missionId === 2) {
      const mod = await import('/js/missions/mission2/index.js');
      missionModule = mod.default;
    } else if (missionId === 3) {
      const mod = await import('/js/missions/mission3/index.js');
      missionModule = mod.default;
    } else if (missionId === 4) {
      const mod = await import('/js/missions/mission4/index.js');
      missionModule = mod.default;
    }

    if (missionModule && typeof missionModule.render === 'function') {
      await missionModule.render(missionContentArea, async (success, message) => {
        if (success) {
          if (message) alert(`🎉 ${message}`);

          try {
            await fetch('/api/missions/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mission_id: missionId })
            });
          } catch (e) {
            console.error("Erreur validation mission", e);
          }

          closeMissionDetail();
        }
      }, window.gameState);
    } else {
      throw new Error(`Le module de la mission ${missionId} ne possède pas de méthode render().`);
    }

  } catch (err) {
    console.error(`Erreur chargement mission ${missionId} :`, err);
    missionContentArea.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #ef4444;">
        <h3>⚠️ Erreur de chargement</h3>
        <p style="font-size: 0.85rem; margin: 10px 0;">Impossible de charger la mission.</p>
        <button onclick="window.closeMissionDetail()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Retour aux missions</button>
      </div>
    `;
  }
};