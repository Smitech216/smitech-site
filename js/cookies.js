/* ============================================
   SMITECH — cookies.js
   Bannière de consentement cookies : affichée à la première visite,
   choix mémorisé 6 mois (cohérent avec le texte de cookies.html).
   Le bouton #manage-cookies-btn (sur la page Cookies) permet de la
   rouvrir à tout moment pour changer d'avis.
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
