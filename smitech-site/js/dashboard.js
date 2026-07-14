/* ============================================
   SMITECH — dashboard.js
   Onglets de filières, compteurs animés,
   barres de progression, et un donut chart en canvas pur (sans librairie).
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Compteurs animés (cartes stats en haut) ---------- */
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    animateCount(el, parseInt(el.dataset.count, 10));
  });

  /* ---------- 2. Onglets ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(name) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
    // (re)joue l'animation des barres de progression du panneau actif
    const activePanel = document.getElementById('panel-' + name);
    if (activePanel) {
      activePanel.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = bar.dataset.target + '%'; }, 50);
        });
      });
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
      history.replaceState(null, '', '#' + btn.dataset.tab);
    });
  });

  // Ouvre l'onglet correspondant si l'URL a un ancre (#droit, #informatique, #sante)
  const hashMap = { droit: 'droit', informatique: 'informatique', sante: 'sante' };
  const initial = hashMap[location.hash.replace('#', '')] || 'apercu';
  activateTab(initial);

  /* ---------- 3. Donut chart en canvas (répartition des projets par statut) ---------- */
  const canvas = document.getElementById('statusChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const data = [
      { label: 'Terminé',    value: 3, color: '#c8f31d' },
      { label: 'En cours',   value: 5, color: '#5fc9e8' },
      { label: 'À venir',    value: 4, color: '#8d9a98' },
    ];
    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;
    const lineWidth = 26;

    let startAngle = -Math.PI / 2;
    const drawSlice = (endAngle, color) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
      startAngle = endAngle;
    };

    // légère animation de tracé
    let progress = 0;
    function animateChart() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      startAngle = -Math.PI / 2;
      let acc = 0;
      data.forEach(d => {
        acc += d.value;
        const sliceEnd = -Math.PI / 2 + (acc / total) * Math.PI * 2 * progress;
        drawSlice(sliceEnd, d.color);
      });
      if (progress < 1) {
        progress += 0.04;
        requestAnimationFrame(animateChart);
      }
    }
    animateChart();
  }

});
