/* ============================================
   SMITECH — cookies.js
   Ce script gère la bannière de consentement RGPD des cookies.
   Son rôle est simple : afficher la bannière au premier passage,
   mémoriser le choix de l'utilisateur dans le stockage local du
   navigateur, puis masquer la bannière si un choix a déjà été fait.

   Le consentement est conservé pendant 6 mois afin d'éviter de
   refaire la même question à chaque visite. Le bouton
   #manage-cookies-btn, présent sur la page Cookies, permet aussi
   d'ouvrir à nouveau la bannière pour modifier le choix.
============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const STORAGE_KEY = 'smitech_cookie_consent';
  const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

  function getStoredChoice() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && Date.now() - raw.ts < SIX_MONTHS_MS) return raw.value;
    } catch (e) { /* localStorage indisponible : on redemandera à chaque visite */ }
    return null;
  }
  function storeChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() })); }
    catch (e) { /* stockage impossible, tant pis — pas bloquant */ }
  }
  function showBanner() { banner.setAttribute('aria-hidden', 'false'); }
  function hideBanner() { banner.setAttribute('aria-hidden', 'true'); }

  // Si aucun choix valide n'est mémorisé (ou expiré après 6 mois), on affiche
  if (!getStoredChoice()) showBanner();

  const acceptBtn = document.getElementById('cookieAccept');
  const refuseBtn = document.getElementById('cookieRefuse');
  if (acceptBtn) acceptBtn.addEventListener('click', () => { storeChoice('accepted'); hideBanner(); });
  if (refuseBtn) refuseBtn.addEventListener('click', () => { storeChoice('refused'); hideBanner(); });

  // Bouton "Modifier mes préférences de cookies" présent sur cookies.html
  const manageBtn = document.getElementById('manage-cookies-btn');
  if (manageBtn) manageBtn.addEventListener('click', showBanner);
});
