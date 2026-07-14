/* ============================================
   SMITECH — main.js
   Comportement partagé : nav au scroll, menu mobile,
   révélation des blocs au scroll. Chargé sur toutes les pages.
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header qui se fonce au scroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // --- Menu mobile (burger) ---
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // --- Révélation des blocs au scroll ---
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // --- Marque le lien de nav actif selon la page courante ---
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

});

/* Petit utilitaire réutilisé par dashboard.js : anime un compteur de 0 à une valeur cible */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}



document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".code-stream-container");
  
  if (!container) return;

  // Les phrases de vision, valeurs et objectifs de Smitech
  const codeSnippets = [
    "La technologie au service du Droit et de la Santé. 🚀",
    "Innover pour protéger, développer pour soigner.",
    "L'informatique au cœur de la transition médicale.",
    "Bâtir l'infrastructure numérique de demain. ✨",
    "Sécuriser vos données, simplifier votre quotidien.",
    "La convergence de la tech, de la justice et du soin.",
    "Des solutions numériques pour un avenir plus sûr.",
    "Simplifier la complexité juridique par l'innovation.",
    "Smitech : L'alliance de l'éthique et de la performance.",
    "Le numérique comme levier de transformation médicale.",
    "Façonner les outils des professionnels de santé. 🧬",
    "La tech d'aujourd'hui pour l'impact de demain.",
    "Une vision transversale et humaine de l'ingénierie.",
    "L'innovation technique guidée par la conformité. ⚖️"
  ];

  // Types de couleurs définis dans ton CSS (bleu, vert lime, ou slate neutre)
  const colors = ["", "lime", "slate"];

  function spawnCodeLine() {
    const el = document.createElement("div");
    el.classList.add("floating-code");
    
    // Sélection aléatoire du texte et de la couleur
    const randomText = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    if (randomColor) el.classList.add(randomColor);
    el.textContent = randomText;

    // Positionnement aléatoire sur la partie droite du quadrillage
    const randomX = Math.random() * 55; // Max 55% de la largeur du conteneur
    const randomY = Math.random() * 70 + 10; // Entre 10% et 80% de la hauteur
    
    el.style.left = `${randomX}%`;
    el.style.top = `${randomY}%`;

    // Variation de la vitesse pour donner un effet de profondeur fluide
    const randomDuration = Math.random() * 2 + 5; // Entre 5s et 7s (un peu plus lent pour pouvoir lire)
    el.style.animationDuration = `${randomDuration}s`;

    container.appendChild(el);

    // Supprime l'élément une fois l'animation terminée pour que le site reste super fluide
    setTimeout(() => {
      el.remove();
    }, randomDuration * 1000);
  }

  // Génère une phrase toutes les 3 secondes (un peu plus d'écart pour laisser le temps de lire)
  setInterval(spawnCodeLine, 3000);
  
  // Premiers lancements immédiats à l'ouverture de la page
  setTimeout(spawnCodeLine, 400);
  setTimeout(spawnCodeLine, 1500);
});

document.addEventListener("DOMContentLoaded", () => {
  const chatTrigger = document.getElementById("chatTrigger");
  const chatContainer = document.querySelector(".chatbot-container");
  const chatMessages = document.getElementById("chatMessages");
  const chatOptions = document.getElementById("chatOptions");

  if (!chatTrigger || !chatMessages || !chatOptions) return;

  // 1. Base de données des questions / réponses / liens de Smitech
  const chatFlow = {
    start: {
      message: "Bonjour ! Je suis l'assistant virtuel de Smitech. Que souhaitez-vous découvrir aujourd'hui ? 👋",
      options: ["Où postuler ?", "Les filières", "L'équipe", "Le Dashboard"]
    },
    "Où postuler ?": {
      message: "Nous sommes constamment à la recherche de nouveaux talents en Droit, Informatique et Santé ! Vous pouvez soumettre votre candidature directement sur notre espace de recrutement dédié.",
      link: { text: "Rejoindre l'équipe (Postuler) 📝", url: "postuler.html" },
      options: ["Retour au menu principal"]
    },
    "Les filières": {
      message: "Smitech fait converger trois expertises majeures pour bâtir les outils de demain :<br><br>⚖️ <strong>Droit</strong> (Structures et pactes)<br>💻 <strong>Tech</strong> (Développement et serveurs)<br>🧬 <strong>Santé</strong> (Parcours de soins & Kiné)",
      options: ["Voir nos projets", "Retour au menu principal"]
    },
    "L'équipe": {
      message: "Découvrez l'organigramme complet ainsi que le profil GitHub de nos membres fondateurs sur notre page dédiée à l'équipe !",
      link: { text: "Consulter la page Équipe 👥", url: "equipe.html" },
      options: ["Retour au menu principal"]
    },
    "Le Dashboard": {
      message: "Notre plateforme centralise l'accès aux différents outils de l'entreprise. Vous pouvez explorer notre espace de pilotage en direct.",
      link: { text: "Ouvrir le Dashboard 📊", url: "dashboard.html" },
      options: ["Retour au menu principal"]
    },
    "Voir nos projets": {
      message: "Nos équipes travaillent de manière itérative sur des marketplaces sécurisées et des solutions connectées adaptées à nos domaines clés.",
      link: { text: "Consulter l'onglet Projets 📂", url: "projets.html" },
      options: ["Retour au menu principal"]
    },
    "Retour au menu principal": {
      message: "Pas de soucis ! Dites-moi ce qui vous intéresse :",
      options: ["Où postuler ?", "Les filières", "L'équipe", "Le Dashboard"]
    }
  };

  // 2. Ouvrir / Fermer la fenêtre
  chatTrigger.addEventListener("click", () => {
    const isOpen = chatContainer.classList.toggle("open");
    // Initialise le premier message si le chat est vide
    if (isOpen && chatMessages.children.length === 0) {
      triggerBotResponse("start");
    }
  });

  // 3. Fonction pour ajouter une bulle de texte
  function appendMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("chat-msg", sender);
    msg.innerHTML = text;
    chatMessages.appendChild(msg);
    // Défilement automatique vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 4. Fonction pour générer les boutons d'options
  function displayOptions(optionsList) {
    chatOptions.innerHTML = ""; // On nettoie les anciennes options
    optionsList.forEach(optionText => {
      const btn = document.createElement("button");
      btn.classList.add("option-chip");
      btn.textContent = optionText;
      btn.addEventListener("click", () => handleUserChoice(optionText));
      chatOptions.appendChild(btn);
    });
  }

  // 5. Gérer le clic de l'utilisateur
  function handleUserChoice(choice) {
    // Affiche le choix de l'utilisateur dans le fil
    appendMessage(choice, "user");
    
    // Simule un court temps de réflexion du robot (plus humain)
    chatOptions.innerHTML = "<span style='font-size:12px; color:var(--text-mute); padding:4px;'>SmiBot réfléchit...</span>";
    
    setTimeout(() => {
      triggerBotResponse(choice);
    }, 600);
  }

  // 6. Déclencher la réponse du robot
  function triggerBotResponse(key) {
    const data = chatFlow[key];
    if (!data) return;

    // Affiche le message texte principal
    appendMessage(data.message, "bot");

    // Si la réponse contient un lien d'action (ex: vers postuler.html)
    if (data.link) {
      const lastBotMsg = chatMessages.lastChild;
      const actionBtn = document.createElement("a");
      actionBtn.href = data.link.url;
      actionBtn.classList.add("chat-action-btn");
      actionBtn.innerHTML = `${data.link.text} &rarr;`;
      lastBotMsg.appendChild(actionBtn);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Affiche les nouveaux choix disponibles
    displayOptions(data.options);
  }
});