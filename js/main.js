/* ============================================
   SMITECH — main.js
   Ce fichier centralise les comportements communs à l'ensemble du site.
   Il gère la navigation, l'apparition progressive des blocs au scroll,
   la bannière cookies, la traduction, le chatbot SmiBot, le calendrier
   d'événements, le carrousel 3D des services et les anneaux de progression.

   Il joue donc le rôle de « couche d'interaction » du site, en ajoutant
   les animations et interactions sans modifier le HTML de base.
============================================ */

/* Copie de secours des événements (events.json), utilisée si le fetch
   échoue — notamment quand le site est ouvert en local (file://), où les
   navigateurs bloquent le chargement des fichiers JSON par sécurité. */
const FALLBACK_EVENTS = [
  {
    "date": "2026-08-05",
    "title": "Lancement officiel de SMITECH",
    "description": "Annonce de la structuration du groupe en six filières et présentation de notre vision d'entreprise.",
    "time": "14:00",
    "location": "Siège SMITECH — Tunis",
    "image": "assets/logo.png"
  },
  {
    "date": "2026-09-12",
    "title": "Atelier IA et automatisation",
    "description": "Démonstration de nos solutions IA et panels sur l'automatisation des processus métier.",
    "time": "10:00",
    "location": "Campus Tech — Tunis",
    "image": "assets/logo.png"
  },
  {
    "date": "2026-10-21",
    "title": "Journée sécurité Cloud & Cyber",
    "description": "Session pratique sur la protection des infrastructures et l'architecture cloud résiliente.",
    "time": "09:30",
    "location": "Centre de conférence SMITECH",
    "image": "assets/logo.png"
  }
];

function getStoredTranslateLanguage() {
  return localStorage.getItem('smitech-translate-lang') || 'fr';
}

function setStoredTranslateLanguage(lang) {
  localStorage.setItem('smitech-translate-lang', lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'fr';
}

function setGoogleTranslateLanguage(lang) {
  const select = document.querySelector('.goog-te-combo');
  if (!select) return false;
  select.value = lang;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/* ---- Consentement cookies (RGPD) ---- */
const COOKIE_CONSENT_KEY = 'smitech-cookie-consent'; // 'accepted' | 'rejected'

function getCookieConsent() {
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function setCookieConsent(value) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

function setupCookieBanner(onAccept) {
  let banner = document.querySelector('.cookie-banner');

  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    banner.innerHTML = `
      <div class="cookie-banner__text">
        <strong>Respect de votre vie privée</strong>
        <p>Nous utilisons des cookies strictement nécessaires au site, ainsi qu'un service tiers de traduction automatique (Google Translate) activé uniquement si vous l'acceptez. En savoir plus dans notre <a href="cookies.html">politique de cookies</a>.</p>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="btn btn-ghost cookie-refuse">Refuser</button>
        <button type="button" class="btn btn-primary cookie-accept">Accepter</button>
      </div>`;
    document.body.appendChild(banner);

    banner.querySelector('.cookie-accept').addEventListener('click', () => {
      setCookieConsent('accepted');
      banner.classList.remove('visible');
      if (typeof banner._onAccept === 'function') banner._onAccept();
    });
    banner.querySelector('.cookie-refuse').addEventListener('click', () => {
      setCookieConsent('rejected');
      banner.classList.remove('visible');
    });
  }

  banner._onAccept = onAccept;
  requestAnimationFrame(() => banner.classList.add('visible'));
  return banner;
}

function setupGoogleTranslateButton() {
  if (document.querySelector('.translate-toggle')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'translate-toggle';
  button.setAttribute('aria-label', 'Changer la langue');

  let currentLang = getStoredTranslateLanguage();
  let widgetReady = false;
  let widgetLoading = false;

  const renderLabel = () => {
    button.innerHTML = `<span class="translate-toggle__flag">${currentLang === 'en' ? '🇬🇧' : '🇫🇷'}</span><span class="translate-toggle__label"><strong>${currentLang.toUpperCase()}</strong></span>`;
  };
  renderLabel();
  document.body.appendChild(button);

  const initWidget = () => {
    if (widgetReady || widgetLoading) return;
    widgetLoading = true;

    if (!document.getElementById('google_translate_element')) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.className = 'translate-hidden';
      document.body.appendChild(container);
    }

    const buildWidget = () => {
      if (!(window.google && window.google.translate && window.google.translate.TranslateElement)) return;
      if (!widgetReady) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }
      widgetReady = true;
      widgetLoading = false;
      button.classList.remove('translate-toggle--error');
      button.removeAttribute('title');
      setTimeout(() => setGoogleTranslateLanguage(currentLang), 700);
    };

    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      buildWidget();
    } else if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        widgetLoading = false;
        button.classList.add('translate-toggle--error');
        button.setAttribute('title', 'Le service de traduction est momentanément indisponible. Réessayez plus tard.');
      };
      document.body.appendChild(script);
      window.googleTranslateElementInit = buildWidget;
    }
  };

  button.addEventListener('click', () => {
    const consent = getCookieConsent();

    /* La traduction dépend d'un service tiers (Google Translate) : on ne
       le charge qu'après consentement, conformément au RGPD. */
    if (consent !== 'accepted') {
      setupCookieBanner(initWidget);
      return;
    }

    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    setStoredTranslateLanguage(currentLang);
    renderLabel();

    if (!widgetReady) {
      initWidget();
      setTimeout(() => setGoogleTranslateLanguage(currentLang), 1400);
    } else if (!setGoogleTranslateLanguage(currentLang)) {
      setTimeout(() => setGoogleTranslateLanguage(currentLang), 800);
    }
  });

  if (getCookieConsent() === 'accepted') {
    initWidget();
  }
}

document.addEventListener('DOMContentLoaded', () => {


  /* ---- Bannière de consentement cookies : affichée tant qu'aucun choix n'a été fait ---- */
  if (!getCookieConsent()) {
    setupCookieBanner();
  }

  /* ---- Bouton "Modifier mes préférences de cookies" (page cookies.html) ---- */
  const manageCookiesBtn = document.getElementById('manage-cookies-btn');
  if (manageCookiesBtn) {
    manageCookiesBtn.addEventListener('click', () => {
      const banner = setupCookieBanner();
      banner.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }

  /* ---- Header qui se fonce au scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  /* ---- Menu mobile (burger) ---- */
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Marque le lien de nav actif selon la page courante ---- */
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---- Révélation des blocs au scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Bouton retour en haut ---- */
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600));
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---- Compteurs animés (data-count) ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target, parseFloat(e.target.dataset.count));
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---- Fond circuit animé (signature visuelle) ---- */
  document.querySelectorAll('.circuit-field').forEach(el => buildCircuitField(el));

});

/* Anime un compteur de 0 à une valeur cible */
function animateCount(el, target, duration = 1400) {
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target < 10 && target % 1 !== 0 ? (target * eased).toFixed(1) : Math.round(target * eased);
    el.textContent = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Génère un champ de circuits SVG (lignes + nœuds) en fond de section */
function buildCircuitField(container) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 700');
  svg.setAttribute('preserveAspectRatio', 'none');

  const defs = document.createElementNS(ns, 'defs');
  const grad = document.createElementNS(ns, 'linearGradient');
  grad.setAttribute('id', 'traceGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
  grad.innerHTML = '<stop offset="0%" stop-color="#2f6fed"/><stop offset="100%" stop-color="#22d3ee"/>';
  defs.appendChild(grad);
  svg.appendChild(defs);

  const density = parseInt(container.dataset.density || '9', 10);
  let x = -50, y = Math.random() * 700;
  for (let i = 0; i < density; i++) {
    const path = document.createElementNS(ns, 'path');
    const segs = 3 + Math.floor(Math.random() * 3);
    let d = `M ${x} ${y}`;
    let cx = x, cy = y;
    for (let s = 0; s < segs; s++) {
      const nx = cx + 80 + Math.random() * 120;
      const ny = Math.max(0, Math.min(700, cy + (Math.random() - 0.5) * 260));
      d += ` L ${nx} ${cy} L ${nx} ${ny}`;
      cx = nx; cy = ny;
    }
    path.setAttribute('d', d);
    path.setAttribute('class', 'trace trace-draw');
    path.style.animationDelay = (Math.random() * 1.4) + 's';
    svg.appendChild(path);

    if (Math.random() > 0.4) {
      const node = document.createElementNS(ns, 'circle');
      node.setAttribute('cx', cx); node.setAttribute('cy', cy); node.setAttribute('r', 3.2);
      node.setAttribute('class', 'node');
      svg.appendChild(node);
    }
    x = -50 + Math.random() * 200; y = Math.random() * 700;
  }
  container.appendChild(svg);
}

async function setupEventCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  const eventTitle = document.getElementById('eventTitle');
  const eventMeta = document.getElementById('eventMeta');
  const eventDescription = document.getElementById('eventDescription');
  const eventImage = document.getElementById('eventImage');
  const eventPopup = document.getElementById('eventPopup');
  const popupClose = document.getElementById('popupClose');
  const popupTitle = document.getElementById('popupTitle');
  const popupTime = document.getElementById('popupTime');
  const popupLocation = document.getElementById('popupLocation');
  const popupImage = document.getElementById('popupImage');
  const popupDescription = document.getElementById('popupDescription');
  const viewAllEvents = document.getElementById('viewAllEvents');

  if (!calendarGrid || !eventTitle || !eventDescription) return;

  let eventsData = [];

  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error('events.json indisponible');
    eventsData = await response.json();
    if (!Array.isArray(eventsData) || !eventsData.length) throw new Error('events.json vide');
  } catch (error) {
    /* Le fetch échoue typiquement quand la page est ouverte directement
       depuis le disque (file://) plutôt que via un serveur web : on
       retombe alors sur la copie de secours embarquée dans le script. */
    eventsData = FALLBACK_EVENTS;
  }

  function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00');
    const locale = currentLanguage === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function buildCalendarDates(referenceDate) {
    const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const days = [];
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < firstWeekday; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), d));
    return days;
  }

  function renderCalendar(events) {
    const now = events.length ? new Date(events[0].date + 'T00:00') : new Date();
    const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const days = buildCalendarDates(now);
    calendarGrid.innerHTML = weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('') + days.map(date => {
      if (!date) return '<div class="calendar-day inactive"></div>';
      const iso = date.toISOString().slice(0, 10);
      const event = events.find(evt => evt.date === iso);
      const classes = ['calendar-day'];
      if (event) classes.push('has-event');
      return `<button type="button" class="${classes.join(' ')}" data-date="${iso}" ${event ? '' : 'disabled'}>
        <div class="day-number">${date.getDate()}</div>
        ${event ? `<div class="day-note">${event.title}</div>` : ''}
      </button>`;
    }).join('');
  }

  function showEventDetail(event) {
    if (!event) {
      eventTitle.textContent = 'Sélectionnez une date';
      eventMeta.textContent = '';
      eventDescription.textContent = "Les événements de SMITECH sont ici pour vous aider à suivre nos annonces, ateliers et journées thématiques.";
      eventImage.style.display = 'none';
      return;
    }
    eventTitle.textContent = event.title;
    eventMeta.innerHTML = `<span><strong>${event.date}</strong></span><span>${event.time} • ${event.location}</span>`;
    eventDescription.textContent = event.description;
    if (event.image) {
      eventImage.src = event.image;
      eventImage.style.display = 'block';
    } else {
      eventImage.style.display = 'none';
    }
  }

  function openPopup(event) {
    popupTitle.textContent = event.title;
    popupTime.textContent = `${event.date} · ${event.time}`;
    popupLocation.textContent = event.location;
    popupDescription.textContent = event.description;
    if (event.image) {
      popupImage.src = event.image;
      popupImage.style.display = 'block';
    } else {
      popupImage.style.display = 'none';
    }
    eventPopup.classList.add('open');
    eventPopup.setAttribute('aria-hidden', 'false');
  }

  function closePopup() {
    eventPopup.classList.remove('open');
    eventPopup.setAttribute('aria-hidden', 'true');
  }

  renderCalendar(eventsData);
  showEventDetail(eventsData[0] || null);

  calendarGrid.addEventListener('click', evt => {
    const day = evt.target.closest('.calendar-day.has-event');
    if (!day) return;
    const date = day.dataset.date;
    const event = eventsData.find(evt => evt.date === date);
    if (event) openPopup(event);
  });

  if (popupClose) popupClose.addEventListener('click', closePopup);
  if (eventPopup) eventPopup.addEventListener('click', (evt) => {
    if (evt.target === eventPopup) closePopup();
  });

  if (viewAllEvents) {
    viewAllEvents.addEventListener('click', () => {
      eventTitle.textContent = 'Tous les événements';
      eventMeta.textContent = '';
      eventDescription.innerHTML = eventsData.map(evt => `<strong>${formatDate(evt.date)}</strong><br>${evt.title} — ${evt.location}<br>${evt.description}`).join('<br><br>');
      eventImage.style.display = 'none';
    });
  }
}

/* ============================================
   SmiBot — assistant virtuel (page d'accueil)
============================================ */
document.addEventListener('DOMContentLoaded', () => {
  setupEventCalendar();
  const chatTrigger = document.getElementById('chatTrigger');
  const chatContainer = document.querySelector('.chatbot-container');
  const chatMessages = document.getElementById('chatMessages');
  const chatOptions = document.getElementById('chatOptions');
  const chatSearch = document.getElementById('chatSearch');
  const chatSuggestions = document.getElementById('chatSuggestions');
  const chatClose = document.getElementById('chatClose');

  if (!chatTrigger || !chatMessages || !chatOptions) return;

  const categories = [
    { key: 'formation', label: '🎓 Formation', questions: ['filières', 'parcours', 'formation'] },
    { key: 'association', label: '🏢 Association', questions: ['à propos', 'valeurs', 'groupe'] },
    { key: 'services', label: '💼 Services', questions: ['services', 'offres', 'cloud'] },
    { key: 'events', label: '📅 Événements', questions: ['événements', 'calendrier', 'atelier'] },
    { key: 'projets', label: '📂 Projets', questions: ['github', 'projets', 'repos'] },
    { key: 'contact', label: '📞 Contact', questions: ['contact', 'email', 'téléphone'] },
    { key: 'faq', label: '❓ FAQ', questions: ['postuler', 'tarifs', 'délais'] }
  ];

  const answers = {
    formation: {
      text: 'SMITECH regroupe six filières : Digital, Software, AI, Cloud & Cybersecurity, Labs et Cabinet Juridique. Chaque filière travaille ensemble pour livrer des solutions innovantes et fiables.',
      link: { text: 'Voir nos filières', url: 'filieres.html' }
    },
    association: {
      text: 'Nous sommes un groupe technologique réunissant développement, recherche, cybersécurité et droit pour proposer un accompagnement complet à nos clients.',
      link: { text: 'En savoir plus', url: 'about.html' }
    },
    services: {
      text: 'Nous offrons des services digitaux, logiciels, IA, cloud/cybersécurité, R&D et conseil juridique, conçus pour répondre aux besoins spécifiques de chaque projet.',
      link: { text: 'Découvrir nos services', url: 'services.html' }
    },
    events: {
      text: 'Consultez notre calendrier pour voir les prochains événements, ateliers et conférences organisés par SMITECH.',
      link: { text: 'Voir les actualités', url: 'actualites.html' }
    },
    projets: {
      text: 'Nos projets sont disponibles sur GitHub : découvrez nos dépôts, prototypes et outils techniques développés au sein du groupe.',
      link: { text: 'Voir nos projets', url: 'projets.html' }
    },
    contact: {
      text: 'Vous pouvez nous contacter par email, par téléphone ou via le formulaire de contact. Nous répondons généralement sous quelques jours ouvrés.',
      link: { text: 'Page Contact', url: 'contact.html' }
    },
    faq: {
      text: 'Pour postuler, rendez-vous sur la page Carrières et envoyez votre candidature. Nous traitons chaque dossier avec attention.',
      link: { text: 'Voir Carrières', url: 'carrieres.html' }
    }
  };

  function renderCategoryChips(list = categories) {
    if (!chatOptions) return;
    chatOptions.innerHTML = '';
    if (!list.length) {
      const noRes = document.createElement('button');
      noRes.className = 'option-chip';
      noRes.textContent = 'Aucun type trouvé';
      noRes.disabled = true;
      noRes.style.opacity = '.45';
      noRes.style.cursor = 'default';
      chatOptions.appendChild(noRes);
      return;
    }
    list.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'option-chip';
      btn.textContent = category.label;
      btn.addEventListener('click', () => handleCategory(category.key));
      chatOptions.appendChild(btn);
    });
  }

  function handleCategory(key) {
    const response = answers[key];
    if (!response) return;
    simulateBotReply(() => {
      appendMessage(response.text, 'bot');
      appendBotLink(response.link);
      displayOptions(['← Retour']);
    });
  }

  function appendBotLink(link) {
    if (!chatMessages.lastChild) return;
    const lastBotMsg = chatMessages.lastChild;
    const actionBtn = document.createElement('a');
    actionBtn.href = link.url;
    actionBtn.classList.add('chat-action-btn');
    actionBtn.innerHTML = `${link.text} →`;
    actionBtn.target = '_blank';
    actionBtn.rel = 'noopener';
    lastBotMsg.appendChild(actionBtn);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateBotReply(callback) {
    const typingNode = appendTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator(typingNode);
      callback();
    }, 700);
  }

  function appendTypingIndicator() {
    const typing = document.createElement('div');
    typing.classList.add('chat-msg', 'bot', 'typing');
    typing.innerHTML = '<div class="chat-card"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typing;
  }

  function removeTypingIndicator(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  const chatFlow = {
    start: {
      message: 'Bonjour, je suis SmiBot 👋 Je peux vous aider à trouver des informations sur nos filières, services, événements, projets ou contact.',
      options: []
    }
  };

  function openChat() {
    const isOpen = chatContainer.classList.toggle('open');
    if (isOpen && chatMessages.children.length === 0) {
      triggerBotResponse('start');
      renderCategoryChips();
    }
  }

  chatTrigger.addEventListener('click', openChat);
  if (chatClose) chatClose.addEventListener('click', () => chatContainer.classList.remove('open'));

  if (chatSearch) {
    chatSearch.addEventListener('input', () => {
      const value = chatSearch.value.toLowerCase().trim();
      const filtered = categories.filter(category => {
        return [category.label, ...category.questions].some(text => text.toLowerCase().includes(value));
      });
      renderCategoryChips(filtered);
    });
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', sender);
    msg.innerHTML = `<div class="chat-card">${text}</div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displayOptions(list) {
    chatOptions.innerHTML = '';
    list.forEach(text => {
      const btn = document.createElement('button');
      btn.classList.add('option-chip');
      btn.textContent = text;
      btn.addEventListener('click', () => handleUserChoice(text));
      chatOptions.appendChild(btn);
    });
  }

  function handleUserChoice(choice) {
    appendMessage(choice, 'user');
    if (choice === '← Retour') {
      setTimeout(() => {
        triggerBotResponse('start');
        renderCategoryChips();
      }, 250);
      return;
    }
    const mapping = {
      '🎓 Formation': 'formation',
      '💼 Services': 'services',
      '📅 Événements': 'events',
      '📞 Contact': 'contact',
      '❓ FAQ': 'faq'
    };
    if (mapping[choice]) {
      handleCategory(mapping[choice]);
    }
  }

  function triggerBotResponse(key) {
    const data = chatFlow[key];
    if (!data) return;
    simulateBotReply(() => {
      appendMessage(data.message, 'bot');
      if (key === 'start') {
        renderCategoryChips();
      } else if (data.options && data.options.length) {
        displayOptions(data.options);
      }
    });
  }
});

/* ---- Carrousel 3D "Nos services" ---- */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('serviceTrack');
  const dotsWrap = document.getElementById('serviceDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.c3d-card'));
  const total = cards.length;
  const radius = 380; // distance des cartes par rapport au centre — ajustable
  let activeIndex = 0;
  let autoTimer = null;

  // positionne chaque carte sur le cercle 3D
  function layout() {
    cards.forEach((card, i) => {
      const angle = (360 / total) * (i - activeIndex);
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      card.classList.toggle('is-active', i === activeIndex);
    });
    updateDots();
  }

  // construit les points de navigation
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'c3d-dot';
    dot.setAttribute('aria-label', `Aller au service ${i + 1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  function updateDots() {
    dotsWrap.querySelectorAll('.c3d-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === activeIndex);
    });
  }

  function goTo(index, userTriggered) {
    activeIndex = (index + total) % total;
    layout();
    if (userTriggered) restartAuto();
  }

  function next(userTriggered) { goTo(activeIndex + 1, userTriggered); }
  function prev(userTriggered) { goTo(activeIndex - 1, userTriggered); }

  // clic sur une carte : si elle n'est pas active, on la centre ; si déjà active, ne rien faire (le lien "Découvrir" à l'intérieur reste cliquable)
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (i !== activeIndex) {
        e.preventDefault();
        goTo(i, true);
      }
    });
  });

  document.querySelector('.c3d-prev').addEventListener('click', () => prev(true));
  document.querySelector('.c3d-next').addEventListener('click', () => next(true));

  // auto-rotation toutes les 5s, en pause au survol
  const wrap = document.querySelector('.carousel3d-wrap');
  function startAuto() {
    autoTimer = setInterval(() => next(false), 5000);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrap.addEventListener('mouseleave', () => startAuto());

  layout();
  startAuto();
});

/* ---- Anneaux de progression animés (stats graphiques accueil) ---- */
document.addEventListener('DOMContentLoaded', () => {
  const rings = document.querySelectorAll('.ring-progress');
  if (!rings.length) return;

  const circumference = 2 * Math.PI * 52; // rayon = 52 (cf. SVG)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring = entry.target;
        const percent = parseFloat(ring.getAttribute('data-percent')) || 0;
        const offset = circumference - (percent / 100) * circumference;
        ring.style.strokeDashoffset = offset;
        observer.unobserve(ring);
      }
    });
  }, { threshold: 0.4 });

  rings.forEach(ring => {
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
    observer.observe(ring);
  });
});