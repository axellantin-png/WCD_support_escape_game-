export default {
  title: "Reconnaître les déchets",

  categories: [
    { id: 'naturel', label: '🍃 Élément naturel' },
    { id: 'recyclable', label: '♻️ Déchet recyclable' },
    { id: 'non_recyclable', label: '🗑️ Déchet non recyclable' }
  ],

  suggestedLabels: [
    "mégot de cigarette",
    "bouteille en plastique",
    "canette",
    "barquette",
    "mouchoir",
    "débris",
    "feuille",
    "branche"
  ],

  photosCaptured: [],

  async render(container, onSubmit, gameState) {
    this.container = container;
    this.onSubmit = onSubmit;
    this.gameState = gameState || window.gameState || { mission1: { photos: [] } };

    await this.fetchPhotos();
    this.renderUI();
  },

  async fetchPhotos() {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();

      if (data.success && Array.isArray(data.photos)) {
        this.photosCaptured = data.photos;
        this.syncToGameState();
        return;
      }
    } catch (e) {
      console.warn("API photos non disponible, chargement depuis l'état local.", e);
    }

    if (this.gameState?.mission1?.photos) {
      this.photosCaptured = [...this.gameState.mission1.photos];
    }
  },

  syncToGameState() {
    if (this.gameState?.mission1) {
      this.gameState.mission1.photos = [...this.photosCaptured];
    }
  },

  renderUI() {
    const isCompleted = this.photosCaptured.length >= 10;

    this.container.innerHTML = `
      <div class="mission-wrapper">
        
        <!-- TEXTE D'INTRODUCTION -->
        <div class="mission-intro-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-left: 5px solid #0288d1; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-size: 0.85rem; font-weight: bold; color: #0288d1; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">🛰️ Module de vision artificielle : Activé</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #333333; margin: 0;">
            Pour qu'ECO-IA puisse un jour détecter les déchets de manière autonome avec des caméras, elle doit d'abord apprendre à quoi ils ressemblent. Un algorithme a besoin de milliers d'images pour différencier une bouteille en plastique d'une feuille morte, ou un mégot d'un caillou. Photographiez vos trouvailles et étiquetez-les avec précision. Vous êtes les yeux d'ECO-IA !
          </p>
        </div>

        <p class="instructions">
          Prenez en photo <strong>10 déchets différents</strong> ramassés ou éléments naturels croisés. 
          Vérifiez sa <strong>catégorie</strong> et son <strong>nom spécifique</strong> !
        </p>

        <div style="background: ${isCompleted ? '#dcfce7' : '#f0f9ff'}; border: 1px solid ${isCompleted ? '#16a34a' : '#0284c7'}; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 15px; font-weight: bold; color: ${isCompleted ? '#15803d' : '#0369a1'};">
          Progression : ${this.photosCaptured.length} / 10 photos ${isCompleted ? '🎉 (Mission Validée !)' : ''}
        </div>

        <div class="upload-zone" style="margin: 20px 0; text-align: center;">
          <label for="camera-input" class="btn" style="display: inline-block; cursor: pointer; background: #0284c7; padding: 12px 20px; border-radius: 8px; color: white; font-weight: bold;">
            📷 Prendre une photo
          </label>
          <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;">
        </div>

        <h3>Déchets analysés</h3>
        <div id="photos-gallery" class="gallery-container" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
          ${this.photosCaptured.length === 0 ? '<p style="color: #64748b; font-style: italic;">Aucune photo prise pour le moment.</p>' : ''}
        </div>

        <!-- TEXTE DE CONCLUSION & LE SAVIEZ-VOUS ? UNIFORMISÉS -->
        <div class="mission-outro-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-left: 5px solid #10b981; border-radius: 8px; padding: 15px; margin-top: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 15px;">
          <div style="font-size: 0.85rem; font-weight: bold; color: #059669; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">📸 Base de données visuelle synchronisée</div>
          
          <p style="font-size: 0.95rem; line-height: 1.5; color: #333333; margin: 0;">
            <strong>Le saviez-vous ?</strong> La nature ne digère pas tout à la même vitesse. 
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; border-top: 1px solid #eceff1; padding-top: 15px;">
            <h3 style="font-size: 1.05rem; font-weight: bold; color: #1f2937; margin: 0 0 5px 0;">💡 Le saviez-vous ?</h3>
            
            <div style="font-size: 0.9rem; line-height: 1.4; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6;">
              <strong>Le pouvoir de nuisance d'un seul mégot :</strong> Un mégot mal identifié et laissé au sol peut polluer jusqu'à 500 litres d'eau à lui tout seul. En France, on estime que des milliards de mégots sont jetés par terre chaque année. (Onnaing.fr)
            </div>

            <div style="font-size: 0.9rem; line-height: 1.4; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6;">
              <strong>La réalité dépasse la fiction :</strong> Des projets similaires à ECO-IA existent déjà ! La start-up française Lixo équipe aujourd'hui de vrais camions-poubelles avec des caméras intelligentes. Leur IA analyse les déchets collectés en temps réel avec 95 % de précision pour aider les villes à améliorer le tri. (Lixo)
            </div>

            <div style="font-size: 0.9rem; line-height: 1.4; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6;">
              <strong>Des robots recycleurs :</strong> Dans certains centres de tri, des entreprises comme Recycleye utilisent la vision par intelligence artificielle pour piloter des bras robotisés (comme le QualiBot) capables d'identifier et de trier les matériaux sur les tapis roulants bien plus vite que l'œil humain.
            </div>

            <div style="font-size: 0.9rem; line-height: 1.4; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6;">
              <strong>L'IA qui audite nos poubelles :</strong> La start-up britannique Greyparrot a créé un modèle qui analyse les déchets sur les tapis roulants des usines à la vitesse de l'éclair. En 2022, leur IA a analysé 32 milliards de déchets. Elle a découvert que 20 à 30 % des déchets mis dans la poubelle de recyclage par les habitants n'ont rien à y faire et bloquent le système.
            </div>

            <div style="font-size: 0.9rem; line-height: 1.4; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6;">
              <strong>La preuve par l'image :</strong> L'application Litterati a permis à des citoyens de photographier des millions de déchets avec l'IA pour identifier les marques les plus polluantes. Aux Pays-Bas, ces données ont permis de prouver qu'une marque locale de bonbons représentait 20% des déchets d'un quartier, forçant l'entreprise à changer ses emballages !
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    this.renderGalleryItems();
  },

  bindEvents() {
    const input = document.getElementById('camera-input');
    if (input) {
      input.onchange = (e) => this.handleImageUpload(e);
    }

    const btnValidate = document.getElementById('btn-validate-mission1');
    if (btnValidate) {
      btnValidate.onclick = () => {
        this.onSubmit(true, "Mission 1 validée ! ECO-IA a appris grâce à vos corrections.");
      };
    }
  },

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        const randomCat = this.categories[Math.floor(Math.random() * this.categories.length)].id;
        const randomLabel = this.suggestedLabels[Math.floor(Math.random() * this.suggestedLabels.length)];

        const photoData = {
          image_url: compressedBase64,
          ia_category: randomCat,
          user_category: randomCat,
          label: randomLabel
        };

        try {
          const res = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(photoData)
          });
          const data = await res.json();

          const newPhoto = {
            id: (data.success && data.photoId) ? data.photoId : Date.now(),
            ...photoData
          };

          this.photosCaptured.push(newPhoto);
          this.syncToGameState();
          this.renderUI();
        } catch (err) {
          console.error("Erreur d'enregistrement serveur photo :", err);
        }
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  },

  renderGalleryItems() {
    const gallery = document.getElementById('photos-gallery');
    if (!gallery || this.photosCaptured.length === 0) return;

    gallery.innerHTML = '';

    this.photosCaptured.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card-photo';
      card.style = "border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; display: flex; gap: 12px; align-items: flex-start;";

      card.innerHTML = `
        <img src="${item.image_url}" style="width: 85px; height: 85px; object-fit: cover; border-radius: 6px;">

        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <div>
            <label style="font-size: 0.75rem; font-weight: bold; color: #475569;">Catégorie :</label>
            <select class="select-category" data-id="${item.id}" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #94a3b8; font-size: 0.85rem;">
              ${this.categories.map(cat => `
                <option value="${cat.id}" ${cat.id === item.user_category ? 'selected' : ''}>
                  ${cat.label}
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 0.75rem; font-weight: bold; color: #475569;">Nom de l'élément / déchet :</label>
            <input type="text" 
                   class="input-label" 
                   data-id="${item.id}" 
                   value="${item.label || ''}" 
                   placeholder="Ex: canette, feuille..." 
                   style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #94a3b8; font-size: 0.85rem; box-sizing: border-box;">
          </div>
        </div>

        <button class="btn-delete" data-id="${item.id}" style="background: none; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer; padding: 0;">🗑️</button>
      `;

      gallery.appendChild(card);
    });

    // Modification de la catégorie
    document.querySelectorAll('.select-category').forEach(select => {
      select.onchange = async (e) => {
        const id = e.target.getAttribute('data-id');
        const value = e.target.value;

        const photo = this.photosCaptured.find(p => String(p.id) === String(id));
        if (photo) {
          photo.user_category = value;
          this.syncToGameState();
        }

        try {
          await fetch(`/api/photos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_category: value })
          });
        } catch (err) {
          console.error("Erreur modification catégorie :", err);
        }
      };
    });

    // Modification du nom (label) avec temporisation
    document.querySelectorAll('.input-label').forEach(input => {
      let timeout = null;
      input.oninput = (e) => {
        clearTimeout(timeout);
        const id = e.target.getAttribute('data-id');
        const value = e.target.value;

        const photo = this.photosCaptured.find(p => String(p.id) === String(id));
        if (photo) {
          photo.label = value;
          this.syncToGameState();
        }

        timeout = setTimeout(async () => {
          try {
            await fetch(`/api/photos/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ label: value })
            });
          } catch (err) {
            console.error("Erreur modification label :", err);
          }
        }, 500);
      };
    });

    // Suppression
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute('data-id');

        this.photosCaptured = this.photosCaptured.filter(p => String(p.id) !== String(id));
        this.syncToGameState();
        this.renderUI();

        try {
          await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        } catch (err) {
          console.error("Erreur suppression photo :", err);
        }
      };
    });
  }
};