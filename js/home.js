/* ============================================================
 * Homepage interactions
 * ↓↓↓ The two arrays below are your content config — just edit ↓↓↓
 * ============================================================ */

// Gallery: drop photos into photos/, point src at the file,
// and write a caption for each one
const PHOTOS = [
  { src: 'photos/1.jpg', caption: '[The story behind this photo]' },
  { src: 'photos/2.jpg', caption: '[Some year, some place]' },
  { src: 'photos/3.jpg', caption: '[Who I was with]' },
  { src: 'photos/4.jpg', caption: '[Why I love this one]' },
  { src: 'photos/5.jpg', caption: '[A single moment]' },
  { src: 'photos/6.jpg', caption: '[To be continued]' }
];

// Places I want to go — add or remove freely
const DESTINATIONS = [
  { name: 'Iceland',            note: 'Wait out an aurora night outside Reykjavík' },
  { name: 'Lake Tekapo, NZ',    note: 'The world’s first international dark-sky reserve' },
  { name: 'Atacama, Chile',     note: 'The most Martian place on Earth — the Milky Way overhead' },
  { name: 'Machu Picchu, Peru', note: 'The lost city above the clouds' },
  { name: 'Lofoten, Norway',    note: 'Fjords, fishing villages, and the midnight sun' },
  { name: 'Giza, Egypt',        note: 'Watch Orion rise behind the pyramids' },
  { name: 'Mt. Fuji, Japan',    note: 'One sunrise from the summit' },
  { name: 'Antarctica',         note: 'The end of the world, and the purest white' }
];

/* ============================================================
 * Implementation below — usually no need to touch
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- Wormhole-exit entrance ---------- */
  let warped = false;
  try {
    warped = sessionStorage.getItem('rhscue-warp') === '1';
    sessionStorage.removeItem('rhscue-warp');
  } catch (e) {}

  if (warped) {
    document.body.classList.add('warp-in');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('entered');
      });
    });
  } else {
    document.body.classList.add('soft-in');
  }

  /* ---------- Living starfield background ----------
   * Three parallax star layers slowly drifting, breathing nebulae,
   * shooting stars, and a subtle response to the pointer and scroll.
   */
  const sky = document.getElementById('sky');
  const ctx = sky.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, layers, nebulae;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function makeStars(count, maxR) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.25 + Math.random() * maxR,
        ph: Math.random() * Math.PI * 2,
        sp: 0.3 + Math.random() * 1.1,
        warm: Math.random() < 0.18
      });
    }
    return arr;
  }

  function sizeSky() {
    W = window.innerWidth;
    H = window.innerHeight;
    sky.width = Math.round(W * DPR);
    sky.height = Math.round(H * DPR);
    sky.style.width = W + 'px';
    sky.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // far → near: smaller/slower → bigger/faster
    layers = [
      { depth: 0.35, vx: -0.050, vy: 0.012, stars: makeStars(Math.round(W * H / 9000), 0.7) },
      { depth: 0.65, vx: -0.100, vy: 0.026, stars: makeStars(Math.round(W * H / 16000), 1.1) },
      { depth: 1.00, vx: -0.180, vy: 0.050, stars: makeStars(Math.round(W * H / 26000), 1.6) }
    ];

    const S = Math.max(W, H);
    nebulae = [
      { c: '96,110,220',  a: 0.080, r: S * 0.52, x: 0.22, y: 0.30, ax: 0.10, ay: 0.06, sp: 0.021, ph: 0.0 },
      { c: '150,96,210',  a: 0.055, r: S * 0.45, x: 0.78, y: 0.22, ax: 0.08, ay: 0.05, sp: 0.017, ph: 2.1 },
      { c: '232,184,109', a: 0.045, r: S * 0.38, x: 0.65, y: 0.78, ax: 0.07, ay: 0.06, sp: 0.013, ph: 4.2 },
      { c: '70,150,190',  a: 0.050, r: S * 0.48, x: 0.15, y: 0.85, ax: 0.09, ay: 0.05, sp: 0.019, ph: 5.4 }
    ];
  }
  window.addEventListener('resize', sizeSky);
  sizeSky();

  window.addEventListener('pointermove', e => {
    pointer.tx = (e.clientX / W) * 2 - 1;
    pointer.ty = (e.clientY / H) * 2 - 1;
  });

  const meteors = [];
  let nextMeteor = performance.now() + 2500 + Math.random() * 4000;

  function spawnMeteor(now) {
    const ang = Math.PI * (0.12 + Math.random() * 0.22); // heading down-right
    const v = 9 + Math.random() * 7;
    meteors.push({
      x: Math.random() * W * 0.9,
      y: Math.random() * H * 0.45,
      vx: Math.cos(ang) * v,
      vy: Math.sin(ang) * v,
      life: 1,
      decay: 0.016 + Math.random() * 0.012
    });
    nextMeteor = now + 3500 + Math.random() * 5500;
  }

  function drawSky(now) {
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);

    // eased pointer parallax
    pointer.x += (pointer.tx - pointer.x) * 0.035;
    pointer.y += (pointer.ty - pointer.y) * 0.035;
    const scroll = window.scrollY || 0;
    const drift = reduced ? 0 : 1;

    // slow-breathing nebulae
    ctx.globalCompositeOperation = 'lighter';
    for (const nb of nebulae) {
      const cx = (nb.x + Math.sin(t * nb.sp + nb.ph) * nb.ax * drift) * W - pointer.x * 24;
      const cy = (nb.y + Math.cos(t * nb.sp * 0.8 + nb.ph) * nb.ay * drift) * H - pointer.y * 16 - scroll * 0.04;
      const rr = nb.r * (1 + 0.08 * Math.sin(t * nb.sp * 1.7 + nb.ph) * drift);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, 'rgba(' + nb.c + ',' + nb.a + ')');
      g.addColorStop(1, 'rgba(' + nb.c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
    ctx.globalCompositeOperation = 'source-over';

    // drifting parallax star layers
    for (const layer of layers) {
      const ox = pointer.x * 18 * layer.depth;
      const oy = pointer.y * 12 * layer.depth + scroll * 0.06 * layer.depth;
      for (const s of layer.stars) {
        if (!reduced) {
          s.x += layer.vx * layer.depth;
          s.y += layer.vy * layer.depth;
          if (s.x < 0) s.x += W; else if (s.x > W) s.x -= W;
          if (s.y < 0) s.y += H; else if (s.y > H) s.y -= H;
        }
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = (0.25 + 0.65 * tw) * (0.45 + 0.55 * layer.depth);
        ctx.fillStyle = s.warm ? '#ffe0b3' : '#dfe6ff';
        const sx = (((s.x - ox) % W) + W) % W;
        const sy = (((s.y - oy) % H) + H) % H;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // shooting stars
    if (!reduced && now > nextMeteor) spawnMeteor(now);
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;
      if (m.life <= 0 || m.x > W + 60 || m.y > H + 60) {
        meteors.splice(i, 1);
        continue;
      }
      const tail = 14;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.85 * m.life) + ')');
      g.addColorStop(1, 'rgba(160,190,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * m.life) + ')';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawSky);
  }
  requestAnimationFrame(drawSky);

  /* ---------- Gallery ---------- */
  const grid = document.getElementById('photo-grid');
  PHOTOS.forEach((ph, i) => {
    const fig = document.createElement('figure');
    fig.className = 'photo-card';

    const img = document.createElement('img');
    img.src = ph.src;
    img.alt = ph.caption;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      fig.classList.add('placeholder');
      img.remove();
      const ph2 = document.createElement('div');
      ph2.className = 'photo-empty';
      ph2.innerHTML = '<span class="ph-star">✦</span><span>Drop a photo at<br>photos/' + (i + 1) + '.jpg</span>';
      fig.prepend(ph2);
    });

    const cap = document.createElement('figcaption');
    cap.textContent = ph.caption;

    fig.appendChild(img);
    fig.appendChild(cap);
    grid.appendChild(fig);
  });

  /* ---------- Someday check-ins ---------- */
  const bucketGrid = document.getElementById('bucket-grid');
  const fill = document.getElementById('bucket-fill');
  const count = document.getElementById('bucket-count');

  let lit = [];
  try { lit = JSON.parse(localStorage.getItem('rhscue-bucket') || '[]'); } catch (e) {}

  function save() {
    try { localStorage.setItem('rhscue-bucket', JSON.stringify(lit)); } catch (e) {}
  }

  function updateProgress() {
    const n = lit.length, total = DESTINATIONS.length;
    fill.style.width = (total ? (n / total) * 100 : 0) + '%';
    count.textContent = n + ' / ' + total + ' stars lit · every star is a promise to the future';
  }

  DESTINATIONS.forEach(d => {
    const card = document.createElement('div');
    card.className = 'dest';
    if (lit.indexOf(d.name) !== -1) card.classList.add('lit');

    card.innerHTML =
      '<div class="dest-star">✦</div>' +
      '<h3>' + d.name + '</h3>' +
      '<p>' + d.note + '</p>' +
      '<button type="button">' + (card.classList.contains('lit') ? 'Lit ✓' : 'Light this star') + '</button>';

    const btn = card.querySelector('button');
    btn.addEventListener('click', () => {
      const idx = lit.indexOf(d.name);
      if (idx === -1) {
        lit.push(d.name);
        card.classList.add('lit');
        btn.textContent = 'Lit ✓';
      } else {
        lit.splice(idx, 1);
        card.classList.remove('lit');
        btn.textContent = 'Light this star';
      }
      save();
      updateProgress();
    });

    bucketGrid.appendChild(card);
  });
  updateProgress();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
