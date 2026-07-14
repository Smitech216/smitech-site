/* ============================================
   SMITECH — forms.js
   Gère le formulaire "Postuler" et la page "Faire un don".

   ⚠️ Ce site est statique (pas de serveur/backend) : le formulaire
   de candidature ouvre le client mail de la personne avec un message
   pré-rempli (mailto:). Pour un vrai envoi automatique sans passer par
   le client mail, branchez ce formulaire sur un service comme Formspree,
   Google Forms ou un backend maison, et remplacez la fonction handleSubmit.
============================================ */

const CONTACT_EMAIL = "contact@smitech.fr"; // <-- adresse qui recevra les candidatures
const DON_LINK = "#"; // <-- remplacez par votre vrai lien de paiement (HelloAsso, PayPal, Stripe...)

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Formulaire "Postuler" ---------- */
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(applyForm)) return;

      const data = new FormData(applyForm);
      const subject = encodeURIComponent(`Candidature Smitech — ${data.get('nom')} (${data.get('filiere')})`);
      const body = encodeURIComponent(
        `Nom : ${data.get('nom')}\n` +
        `Email : ${data.get('email')}\n` +
        `Filière visée : ${data.get('filiere')}\n` +
        `Lien portfolio / CV : ${data.get('lien') || 'non fourni'}\n\n` +
        `Message :\n${data.get('message')}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

      const confirm = document.getElementById('applyConfirm');
      if (confirm) confirm.classList.add('show');
    });
  }

  /* ---------- Page "Faire un don" ---------- */
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmount = document.getElementById('customAmount');
  const donBtn = document.getElementById('donBtn');

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (customAmount) customAmount.value = '';
    });
  });
  if (customAmount) {
    customAmount.addEventListener('input', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
    });
  }
  if (donBtn) {
    donBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(DON_LINK, '_blank');
    });
  }

  /* ---------- Validation générique ---------- */
  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      const field = input.closest('.field');
      const isEmpty = !input.value.trim();
      if (field) field.classList.toggle('error', isEmpty);
      if (isEmpty) valid = false;
    });
    return valid;
  }
});
