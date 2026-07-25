/* ============================================
   SMITECH — github.js
   Récupère les dépôts publics GitHub et les affiche en cartes.
   Aucune librairie, juste fetch().

   ⚠️ À FAIRE : remplacez GITHUB_ACCOUNT par le vrai compte/organisation.
============================================ */

const GITHUB_ACCOUNT = "smitech216";
const GITHUB_TYPE = "user"; // "org" si organisation GitHub, "user" si compte perso

const FALLBACK_REPOS = [
  { name: "smitech-site", description: "Site vitrine institutionnel de SMITECH (ce site).", html_url: "#", language: "HTML" },
  { name: "smitech-cloud-core", description: "Brique d'infrastructure cloud mutualisée pour les filières Digital et Software.", html_url: "#", language: "TypeScript" },
  { name: "smitech-ai-toolkit", description: "Bibliothèque interne d'outils d'automatisation et d'analyse de données.", html_url: "#", language: "Python" },
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('repoGrid');
  if (grid) {
    const endpoint = GITHUB_TYPE === "org"
      ? `https://api.github.com/orgs/${GITHUB_ACCOUNT}/repos?sort=updated&per_page=20`
      : `https://api.github.com/users/${GITHUB_ACCOUNT}/repos?sort=updated&per_page=20`;

    grid.innerHTML = `<div class="repo-state">Chargement des dépôts GitHub…</div>`;

    fetch(endpoint)
      .then(res => { if (!res.ok) throw new Error('compte introuvable'); return res.json(); })
      .then(repos => {
        if (!Array.isArray(repos) || repos.length === 0) { renderRepos(FALLBACK_REPOS, true); return; }
        renderRepos(repos, false);
      })
      .catch(() => renderRepos(FALLBACK_REPOS, true));
  }

  function renderRepos(repos, isFallback) {
    grid.innerHTML = '';
    if (isFallback) {
      const note = document.createElement('div');
      note.className = 'repo-state reveal in';
      note.style.gridColumn = '1 / -1';
      note.innerHTML = `Compte GitHub <code>${GITHUB_ACCOUNT}</code> introuvable pour l'instant — projets d'exemple affichés en attendant.`;
      grid.appendChild(note);
    }
    repos.forEach(repo => {
      const card = document.createElement('a');
      card.className = 'repo-card glass reveal in';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.innerHTML = `
        <h4>${repo.name}</h4>
        <p>${repo.description ?? 'Pas de description.'}</p>
        <div class="repo-meta">
          <span>${repo.language ?? '—'}</span>
          <span>Voir sur GitHub →</span>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ---- Avatars GitHub dynamiques (page À propos) ---- */
  document.querySelectorAll('.github-avatar').forEach(img => {
    const username = img.getAttribute('data-github');
    const spinner = img.nextElementSibling;
    if (!username) return;
    fetch(`https://api.github.com/users/${username}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { img.src = data.avatar_url; img.classList.add('loaded'); if (spinner) spinner.style.display = 'none'; })
      .catch(() => { img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`; img.classList.add('loaded'); if (spinner) spinner.style.display = 'none'; });
  });

  /* ---- Filtre filières (si présent sur la page) ---- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const memberCards = document.querySelectorAll('.member-card');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const val = button.getAttribute('data-filter');
      memberCards.forEach(card => {
        card.classList.toggle('hidden', !(val === 'all' || card.getAttribute('data-filiere') === val));
      });
    });
  });
});
