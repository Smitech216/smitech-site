/* ============================================
   SMITECH — translate.js
   Bouton "EN" dans la navigation : traduit la page du français vers
   l'anglais via le widget Google Translate, chargé uniquement au clic
   (cohérent avec cookies.html : "activé après votre acceptation").

   Fonctionnement :
   - 1er clic  → charge le script Google Translate, initialise le widget
                 caché, puis force la traduction vers l'anglais.
   - 2ᵉ clic   → recharge la page (donc revient au français d'origine).
   Le bouton passe de "EN" à "FR" pour indiquer l'état courant.
============================================ */

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

  let translated = false;

  function applyEnglish() {
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) { setTimeout(applyEnglish, 300); return; } // widget pas encore prêt
    combo.value = 'en';
    combo.dispatchEvent(new Event('change'));
    translated = true;
    buttons.forEach(b => b.textContent = 'FR');
  }

  function loadWidgetThenTranslate() {
    if (window.google && window.google.translate) { applyEnglish(); return; }
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: 'fr', includedLanguages: 'en', autoDisplay: false },
        'google_translate_element'
      );
      setTimeout(applyEnglish, 700);
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (translated) {
        location.reload(); // le plus fiable pour revenir au français d'origine
        return;
      }
      loadWidgetThenTranslate();
    });
  });
});
