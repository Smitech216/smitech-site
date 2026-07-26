/* ============================================
   SMITECH — forms.js
   Ce script intervient sur les formulaires de contact et de candidature.
   Il prépare automatiquement le poste demandé via l'URL, affiche le nom
   du fichier sélectionné pour les pièces jointes, puis valide les champs
   avant l'envoi.

   L'envoi réel est délégué à FormSubmit via l'attribut action des formulaires.
   Le rôle de ce script est donc principalement d'améliorer l'expérience
   utilisateur avant la soumission.
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Pré-remplissage du poste visé depuis l'URL (?poste=...) ---------- */
  const posteSelect = document.getElementById('poste');
  if (posteSelect) {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('poste');
    if (wanted) {
      [...posteSelect.options].forEach(opt => {
        if (opt.value.toLowerCase() === wanted.toLowerCase() || opt.textContent.trim().toLowerCase() === wanted.toLowerCase()) {
          posteSelect.value = opt.value;
        }
      });
    }
  }

  /* ---------- Affiche le nom du fichier choisi dans les champs de dépôt ---------- */
  document.querySelectorAll('.file-field input[type=file]').forEach(input => {
    const label = input.closest('.file-field').querySelector('.fname');
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) {
        const f = input.files[0];
        const sizeOk = f.size <= 8 * 1024 * 1024;
        if (!sizeOk) {
          label.textContent = 'Fichier trop lourd (max 8 Mo) — choisissez un autre fichier';
          input.value = '';
          return;
        }
        label.textContent = f.name;
      }
    });
  });

  /* ---------- Validation générique avant envoi ---------- */
  function attachValidation(form) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.field') || input.closest('.file-field');
        const isEmpty = input.type === 'file' ? input.files.length === 0 : !input.value.trim();
        if (field) field.classList.toggle('error', isEmpty);
        if (isEmpty) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        const firstError = form.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const btn = form.querySelector('button[type=submit]');
        if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
      }
    });
  }

  attachValidation(document.getElementById('applyForm'));
  attachValidation(document.getElementById('contactForm'));

});
