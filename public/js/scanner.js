// public/js/scanner.js

let animFrameId = null;
let mediaStream = null;

export async function openScannerModal(onMarkerDetected) {
  let overlay = document.getElementById('scanner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'scanner-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.95); z-index: 2000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px; color: white;
    `;
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="width: 100%; max-width: 400px; text-align: center;">
      <h2 style="margin-bottom: 8px;">Scanner de Couleur</h2>
      <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 20px;">
        Placez la carte de couleur de la mission dans le carré central.
      </p>

      <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 16px; overflow: hidden; background: #000; box-shadow: 0 0 25px rgba(2, 132, 199, 0.3);">
        <video id="color-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover;"></video>
        <canvas id="color-canvas" style="display: none;"></canvas>

        <!-- Carré cible au centre -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border: 3px solid #ffffff; border-radius: 8px; pointer-events: none; box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);"></div>
      </div>

      <div id="scanner-status" style="margin: 15px 0; font-weight: bold; min-height: 24px; color: #38bdf8; font-size: 0.85rem;">
        Initialisation de la caméra...
      </div>

      <button id="btn-scan-color" class="btn" style="margin-bottom: 10px; background: #16a34a; font-size: 1rem; padding: 12px; cursor: pointer;">
        Analyser la couleur
      </button>
      <button id="btn-close-scanner" class="btn-secondary" style="width: 100%; padding: 10px; font-size: 1rem; cursor: pointer;">
        Fermer
      </button>
    </div>
  `;

  overlay.classList.remove('hidden');

  const video = document.getElementById('color-video');
  const canvas = document.getElementById('color-canvas');
  const statusEl = document.getElementById('scanner-status');
  const btnScan = document.getElementById('btn-scan-color');
  const btnClose = document.getElementById('btn-close-scanner');

  btnClose.addEventListener('click', closeScanner);

  // Activation de la caméra
  try {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
    } catch (e1) {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    }

    video.srcObject = mediaStream;
    await video.play();
    statusEl.textContent = "Prêt à scanner. Visez une carte couleur.";
  } catch (camErr) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = "Erreur d'accès à la caméra.";
    return;
  }

  // Clic sur le bouton d'analyse
  btnScan.addEventListener('click', () => {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Analyser les pixels situés au centre exact de l'image
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
    const [r, g, b] = [pixel[0], pixel[1], pixel[2]];

    // Détermination simple de la couleur dominante
    let detectedPattern = null;

    if (g > r && g > b && g > 80) {
      detectedPattern = 'COLOR_GREEN'; // Pour Mission 2
    } else if (b > r && b > g && b > 80) {
      detectedPattern = 'COLOR_BLUE';  // Pour Mission 3
    } else if (r > 150 && g > 100 && b < 100) {
      detectedPattern = 'COLOR_YELLOW'; // Pour Mission 4
    } else {
      statusEl.style.color = '#f87171';
      statusEl.textContent = `Couleur non reconnue (R:${r} G:${g} B:${b}). Réessayez.`;
      return;
    }

    statusEl.style.color = '#4ade80';
    statusEl.textContent = `Couleur détectée ! Validation...`;

    setTimeout(() => {
      closeScanner();
      onMarkerDetected(detectedPattern);
    }, 500);
  });
}

function closeScanner() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  const overlay = document.getElementById('scanner-overlay');
  if (overlay) overlay.classList.add('hidden');
}