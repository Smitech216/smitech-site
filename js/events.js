/* ============================================
   SMITECH — events.js
   Ce fichier construit le calendrier des événements affiché sur la
   page Actualités à partir du fichier events.json.

   Il remplit deux zones principales :
   1) la grille mensuelle du calendrier ;
   2) le panneau de détail et la popup qui affichent les informations
      d'un événement sélectionné.

   Le calendrier couvre une période fixe allant de septembre 2026 à
   septembre 2027. Les boutons de navigation permettent de se déplacer
   dans cette plage tout en empêchant de sortir des bornes définies.
============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return; // cette page n'a pas de calendrier, on ne fait rien

  const monthLabel = document.getElementById('calendarMonthLabel');
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');

  const eventTitle = document.getElementById('eventTitle');
  const eventMeta = document.getElementById('eventMeta');
  const eventDescription = document.getElementById('eventDescription');
  const eventImage = document.getElementById('eventImage');
  const viewAllBtn = document.getElementById('viewAllEvents');

  const popup = document.getElementById('eventPopup');
  const popupTitle = document.getElementById('popupTitle');
  const popupTime = document.getElementById('popupTime');
  const popupLocation = document.getElementById('popupLocation');
  const popupImage = document.getElementById('popupImage');
  const popupDescription = document.getElementById('popupDescription');
  const popupClose = document.getElementById('popupClose');

  const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const JOURS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  // ---- Période couverte par le calendrier : sept. 2026 → sept. 2027 ----
  const RANGE_START = { year: 2026, month: 8 };  // 8 = septembre (0-indexé)
  const RANGE_END   = { year: 2027, month: 8 };  // septembre 2027

  let current = { ...RANGE_START }; // mois actuellement affiché
  let byDate = {};                  // événements groupés par date "AAAA-MM-JJ"
  let allEvents = [];

  fetch('events.json')
    .then(res => res.json())
    .then(events => {
      allEvents = events;
      events.forEach(ev => { byDate[ev.date] = ev; });

      // On ouvre sur le mois du premier événement à venir dans la période,
      // sinon sur le tout premier mois de la période (septembre 2026).
      const upcoming = events
        .map(ev => new Date(ev.date))
        .filter(d => isWithinRange(d.getFullYear(), d.getMonth()))
        .sort((a, b) => a - b)[0];
      if (upcoming) current = { year: upcoming.getFullYear(), month: upcoming.getMonth() };

      renderCalendar();
      renderEventDetails(events[0]); // affiche le 1er événement par défaut
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--mute);font-size:.85rem;grid-column:1/-1;">Calendrier indisponible pour le moment.</p>';
    });

  function isWithinRange(year, month) {
    const idx = year * 12 + month;
    const start = RANGE_START.year * 12 + RANGE_START.month;
    const end = RANGE_END.year * 12 + RANGE_END.month;
    return idx >= start && idx <= end;
  }

  /* Construit les cases du mois actuellement sélectionné (current) */
  function renderCalendar() {
    const { year, month } = current;
    grid.innerHTML = '';

    JOURS_FR.forEach(j => {
      const head = document.createElement('div');
      head.textContent = j;
      head.style.background = 'transparent';
      head.style.border = 'none';
      head.style.color = 'var(--mute-2)';
      head.style.fontFamily = 'var(--font-mono)';
      head.style.fontSize = '.6875rem';
      head.style.cursor = 'default';
      grid.appendChild(head);
    });

    const firstDay = new Date(year, month, 1);
    // getDay() renvoie 0=dimanche ; on décale pour commencer la semaine le lundi
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.style.visibility = 'hidden';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.textContent = day;
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (byDate[iso]) {
        cell.classList.add('has-event');
        cell.addEventListener('click', () => {
          renderEventDetails(byDate[iso]);
          openPopup(byDate[iso]);
        });
      }
      grid.appendChild(cell);
    }

    if (monthLabel) monthLabel.textContent = `${MOIS_FR[month]} ${year}`;

    // Désactive les flèches aux deux bornes de la période (sept. 2026 / sept. 2027)
    const prevMonth = month - 1 >= 0 ? month - 1 : 11;
    const prevYear = month - 1 >= 0 ? year : year - 1;
    if (prevBtn) prevBtn.disabled = !isWithinRange(prevYear, prevMonth);
    if (nextBtn) nextBtn.disabled = (year === RANGE_END.year && month === RANGE_END.month);
  }

  function changeMonth(delta) {
    let { year, month } = current;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    if (!isWithinRange(year, month)) return; // hors période : on ignore
    current = { year, month };
    renderCalendar();
  }
  if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));

  /* Met à jour le panneau de détail (colonne de droite) */
  function renderEventDetails(ev) {
    if (!ev || !eventTitle) return;
    eventTitle.textContent = ev.title;
    eventMeta.innerHTML = `
      <span>📅 ${formatDate(ev.date)} — ${ev.time || ''}</span>
      <span>📍 ${ev.location || ''}</span>
    `;
    eventDescription.textContent = ev.description || '';
    if (ev.image && eventImage) {
      eventImage.src = ev.image;
      eventImage.style.display = 'block';
    }
  }

  /* Ouvre la fenêtre popup avec le détail complet de l'événement */
  function openPopup(ev) {
    if (!popup) return;
    popupTitle.textContent = ev.title;
    popupTime.textContent = `${formatDate(ev.date)} — ${ev.time || ''}`;
    popupLocation.textContent = ev.location || '';
    popupDescription.textContent = ev.description || '';
    if (ev.image && popupImage) {
      popupImage.src = ev.image;
      popupImage.style.display = 'block';
    }
    popup.setAttribute('aria-hidden', 'false');
  }
  if (popupClose) popupClose.addEventListener('click', () => popup.setAttribute('aria-hidden', 'true'));
  if (popup) popup.addEventListener('click', (e) => { if (e.target === popup) popup.setAttribute('aria-hidden', 'true'); });

  /* "Voir tous les événements" : revient au premier mois de la période
     qui contient un événement, pour parcourir la liste depuis le début. */
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const first = allEvents
        .map(ev => new Date(ev.date))
        .filter(d => isWithinRange(d.getFullYear(), d.getMonth()))
        .sort((a, b) => a - b)[0];
      current = first ? { year: first.getFullYear(), month: first.getMonth() } : { ...RANGE_START };
      renderCalendar();
      document.getElementById('calendarGrid').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
  }
});
