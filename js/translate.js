/* ============================================
   SMITECH — translate.js
   Menu de langues avec drapeaux, propulsé par Google Translate.
   La langue choisie est sauvegardée (localStorage) et réappliquée
   automatiquement sur chaque page du site.
============================================ */

const SMITECH_LANGS = [
  { code: 'fr', label: 'Français', flagImg: 'https://flagcdn.com/24x18/fr.png' },
  { code: 'en', label: 'English',  flagImg: 'https://flagcdn.com/24x18/gb.png' },
  { code: 'es', label: 'Español',  flagImg: 'https://flagcdn.com/24x18/es.png' },
  { code: 'it', label: 'Italiano', flagImg: 'https://flagcdn.com/24x18/it.png' },
  { code: 'ar', label: 'العربية',  flagImg: 'https://flagcdn.com/24x18/sa.png' },
  { code: 'ja', label: '日本語',    flagImg: 'https://flagcdn.com/24x18/jp.png' },
];

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.translate-btn');
  if (!buttons.length) return;

  // Élément technique requis par le widget Google Translate (invisible)
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
  }

  const STORAGE_KEY = 'smitech_lang';
  let widgetReady = false;

  function currentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'fr';
  }

  function applyLang(code) {
    if (code === 'fr') { // retour à la langue d'origine = pas de traduction Google
      localStorage.setItem(STORAGE_KEY, 'fr');
      location.reload();
      return;
    }
    localStorage.setItem(STORAGE_KEY, code);
    setCombo(code);
    refreshButtonLabel();
  }

  function setCombo(code) {
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) { setTimeout(() => setCombo(code), 300); return; }
    combo.value = code;
    combo.dispatchEvent(new Event('change'));
  }

  function loadWidget(callback) {
    if (window.google && window.google.translate) { widgetReady = true; callback(); return; }
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: 'fr', includedLanguages: SMITECH_LANGS.map(l => l.code).filter(c => c !== 'fr').join(','), autoDisplay: false },
        'google_translate_element'
      );
      widgetReady = true;
      setTimeout(callback, 700);
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }

  function buildMenu(anchorBtn) {
    const existing = document.querySelector('.lang-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    SMITECH_LANGS.forEach(lang => {
      const item = document.createElement('button');
      item.className = 'lang-menu-item';
      item.innerHTML = `<img class="lang-flag" src="${lang.flagImg}" alt="${lang.label}"><span>${lang.label}</span>`;
      if (lang.code === currentLang()) item.classList.add('is-active');
      item.addEventListener('click', () => {
        menu.remove();
        if (lang.code === 'fr') { applyLang('fr'); return; }
        loadWidget(() => applyLang(lang.code));
      });
      menu.appendChild(item);
    });
    anchorBtn.parentElement.style.position = 'relative';
    anchorBtn.parentElement.appendChild(menu);

    // fermer si clic ailleurs
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== anchorBtn) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }

  // affiche le drapeau de la langue courante sur le bouton
  function refreshButtonLabel() {
    const lang = SMITECH_LANGS.find(l => l.code === currentLang()) || SMITECH_LANGS[0];
    buttons.forEach(b => b.innerHTML = `<img class="lang-flag" src="${lang.flagImg}" alt="${lang.code}">`);
  }
  refreshButtonLabel();

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      buildMenu(btn);
    });
  });

  // au chargement de la page, réapplique automatiquement la langue sauvegardée (sauf FR)
  const saved = currentLang();
  if (saved !== 'fr') {
    loadWidget(() => setCombo(saved));
  }
});