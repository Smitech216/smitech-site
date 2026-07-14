/* ============================================
   SMITECH — github.js
   Va chercher les dépôts publics d'un compte/organisation GitHub
   et les affiche en cartes. Aucune librairie, juste fetch().

   ⚠️ À FAIRE : remplacez la valeur ci-dessous par votre vrai
   nom d'utilisateur ou d'organisation GitHub.
============================================ */

const GITHUB_ACCOUNT = "smitech216";     // <-- remplacez par votre compte/organisation GitHub réel
const GITHUB_TYPE = "user";            // "org" si c'est une organisation GitHub, "user" si c'est un compte perso

// Dépôts affichés si l'appel à l'API échoue (compte introuvable, pas encore créé, etc.)
const FALLBACK_REPOS = [
  { name: "smitech-site", description: "Site vitrine de Smitech (ce site).", html_url: "#", language: "HTML", stargazers_count: 0 },
  { name: "smitech-marketplace", description: "Marketplace reliant les filières droit et santé.", html_url: "#", language: "JavaScript", stargazers_count: 0 },
  { name: "smitech-tools", description: "Outils internes (RH, fiches de poste, suivi de missions).", html_url: "#", language: "JavaScript", stargazers_count: 0 },
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('repoGrid');
  if (!grid) return;

  const endpoint = GITHUB_TYPE === "org"
    ? `https://api.github.com/orgs/${GITHUB_ACCOUNT}/repos?sort=updated&per_page=20`
    : `https://api.github.com/users/${GITHUB_ACCOUNT}/repos?sort=updated&per_page=20`;

  grid.innerHTML = `<div class="repo-state">Chargement des dépôts GitHub…</div>`;

  fetch(endpoint)
    .then(res => {
      if (!res.ok) throw new Error("compte introuvable ou API indisponible");
      return res.json();
    })
    .then(repos => {
      if (!Array.isArray(repos) || repos.length === 0) {
        renderRepos(FALLBACK_REPOS, true);
        return;
      }
      renderRepos(repos, false);
    })
    .catch(() => {
      renderRepos(FALLBACK_REPOS, true);
    });

  function renderRepos(repos, isFallback) {
    grid.innerHTML = '';

    if (isFallback) {
      const note = document.createElement('div');
      note.className = 'repo-state';
      note.style.gridColumn = '1 / -1';
      note.innerHTML = `Impossible de charger le compte GitHub <code>${GITHUB_ACCOUNT}</code>. Affichage de projets d'exemple — vérifiez la valeur <code>GITHUB_ACCOUNT</code> dans <code>js/github.js</code>.`;
      grid.appendChild(note);
    }

    repos.forEach(repo => {
      const card = document.createElement('a');
      card.className = 'repo-card reveal in';
      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener";
      card.innerHTML = `
        <div>
          <div class="repo-top">
            <h4>${repo.name}</h4>
            <span class="repo-stars">★ ${repo.stargazers_count ?? 0}</span>
          </div>
          <p>${repo.description ?? "Pas de description."}</p>
        </div>
        <div class="repo-meta">
          <span class="repo-lang"><span class="dot"></span>${repo.language ?? "—"}</span>
          <span class="repo-link">Voir sur GitHub →</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. FETCH DYNAMIQUE DES AVATARS GITHUB
  const avatars = document.querySelectorAll(".github-avatar");
  
  avatars.forEach(img => {
    const username = img.getAttribute("data-github");
    const spinner = img.nextElementSibling;
    
    if (username) {
      fetch(`https://api.github.com/users/${username}`)
        .then(response => {
          if (!response.ok) throw new Error();
          return response.json();
        })
        .then(data => {
          img.src = data.avatar_url;
          img.classList.add("loaded");
          if (spinner) spinner.style.display = "none";
        })
        .catch(() => {
          // Fallback : si l'API échoue, on met un avatar par défaut neutre
          img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
          img.classList.add("loaded");
          if (spinner) spinner.style.display = "none";
        });
    }
  });

  // 2. SYSTÈME DE FILTRAGE DES MEMBRES
  const filterButtons = document.querySelectorAll(".filter-btn");
  const memberCards = document.querySelectorAll(".member-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Activer le bon bouton visuellement
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      
      const filterValue = button.getAttribute("data-filter");

      // Filtrer la grille
      memberCards.forEach(card => {
        const cardFiliere = card.getAttribute("data-filiere");
        
        if (filterValue === "all" || cardFiliere === filterValue) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

});