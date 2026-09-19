// -- Partie 1 : Suivi des équipes (Existant) --
async function fetchDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard');
    const data = await res.json();

    if (!data.success) return;

    document.getElementById('total-teams').textContent = data.totalTeams;
    document.getElementById('online-teams').textContent = data.onlineTeams;

    const tbody = document.getElementById('teams-table-body');
    tbody.innerHTML = '';

    if (data.teams.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748b;">Aucune équipe inscrite pour le moment.</td></tr>';
      return;
    }

    data.teams.forEach(team => {
      const percent = Math.round((team.completed_count / team.total_missions) * 100);
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${team.team_name}</strong></td>
        <td>
          ${team.is_online 
            ? '<span class="badge-online">🟢 En ligne</span>' 
            : '<span class="badge-offline">⚪ Hors ligne</span>'}
        </td>
        <td>
          <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%;"></div></div>
          <span style="font-size: 0.85rem; margin-left: 8px;">${team.completed_count} /${team.total_missions}</span>
        </td>
        <td><strong>${team.current_mission}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des données admin :", err);
  }
}

// -- Partie 2 : Récupération de la Galerie (Nouveau) --
async function fetchPhotosData() {
  try {
    const res = await fetch('/api/admin/photos');
    const data = await res.json();

    if (!data.success) return;

    const grid = document.getElementById('photos-grid');
    grid.innerHTML = '';

    if (data.photos.length === 0) {
      grid.innerHTML = '<p style="color:#64748b;">Aucune photo n\'a encore été soumise par les équipes.</p>';
      return;
    }

    data.photos.forEach(photo => {
      // Conversion de la date pour l'affichage
      const dateObj = new Date(photo.created_at);
      const timeString = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <img src="${photo.image_url}" alt="Déchet scanné" loading="lazy">
        <div class="photo-info">
          <p><strong>Équipe :</strong> ${photo.team_name}</p>
          <p><strong>Objet :</strong> ${photo.label || 'Non renseigné'}</p>
          <div><span class="tag tag-user">Joueur : ${photo.user_category}</span></div>
          <div><span class="tag tag-ia">IA : ${photo.ia_category}</span></div>
          <p class="date-text">Pris à ${timeString}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des photos :", err);
  }
}

// -- Initialisation et Auto-Refresh --
document.addEventListener('DOMContentLoaded', () => {
  // Premier chargement
  fetchDashboardData();
  fetchPhotosData();

  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchDashboardData();
      fetchPhotosData();
    });
  }

  // Auto-rafraîchissement toutes les 10 secondes (pour les tableaux et les photos)
  setInterval(() => {
    fetchDashboardData();
    fetchPhotosData();
  }, 10000);
});