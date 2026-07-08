/* ============================================================
 * Interstellar warp transition: click the black hole, then get pulled
 * into the tunnel, flash to white, and arrive at the home page.
 * ============================================================ */
(function () {
  'use strict';

  const warpCanvas = document.getElementById('warp-canvas');
  const flash = document.getElementById('flash');
  const scene = document.getElementById('bh-canvas');

  let started = false;

  scene.addEventListener('click', event => {
    if (started) return;
    if (window.rhscueBlackHole && !window.rhscueBlackHole.hitTest(event.clientX, event.clientY)) return;
    started = true;
    document.body.classList.add('warping');
    setTimeout(runWarp, 250);
  });

  function runWarp() {
    const ctx = warpCanvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, CX, CY, maxR;

    function size() {
      W = warpCanvas.width = Math.round(window.innerWidth * DPR);
      H = warpCanvas.height = Math.round(window.innerHeight * DPR);
      CX = W / 2;
      CY = H / 2;
      maxR = Math.hypot(CX, CY);
    }
    size();
    window.addEventListener('resize', size);
    warpCanvas.style.opacity = '1';

    // Starlight particles: mostly cool white-blue, with a few warm gold traces.
    const N = 520;
    const streaks = [];

    function spawn(fromCenter) {
      return {
        a: Math.random() * Math.PI * 2,
        r: (fromCenter ? 0.02 + Math.random() * 0.08 : Math.random() * 0.5) * maxR,
        sp: 0.6 + Math.random() * 1.5,
        w: (0.5 + Math.random() * 1.6) * DPR,
        c: Math.random() < 0.78
          ? 'hsl(' + (205 + Math.random() * 30) + ', 90%, ' + (70 + Math.random() * 25) + '%)'
          : 'hsl(' + (36 + Math.random() * 14) + ', 95%, ' + (74 + Math.random() * 16) + '%)'
      };
    }
    for (let i = 0; i < N; i++) streaks.push(spawn(false));

    const T0 = performance.now();
    const DUR = 2700;

    function frame(now) {
      const p = Math.min((now - T0) / DUR, 1);
      const speed = 0.25 + 6.0 * p * p * p;

      // Pull the scene inward: scale, blur, and brighten toward the center.
      const s = 1 + 6.5 * p * p * p;
      scene.style.transform = 'scale(' + s + ')';
      scene.style.filter = 'blur(' + (p * p * 14) + 'px) brightness(' + (1 + p * 1.9) + ')';

      // Motion trails.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 8, ' + (0.34 - 0.16 * p) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      const twist = 0.5 * p;

      for (let i = 0; i < streaks.length; i++) {
        const st = streaks[i];
        const r0 = st.r;
        st.r *= 1 + 0.035 * speed * st.sp;
        st.a += twist * 0.004 * st.sp;

        const x0 = CX + Math.cos(st.a) * r0;
        const y0 = CY + Math.sin(st.a) * r0;
        const x1 = CX + Math.cos(st.a) * st.r;
        const y1 = CY + Math.sin(st.a) * st.r;

        ctx.strokeStyle = st.c;
        ctx.lineWidth = st.w * (0.4 + st.r / maxR);
        ctx.globalAlpha = Math.min(1, 0.15 + st.r / maxR + p * 0.5);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        if (st.r > maxR * 1.15) {
          streaks[i] = spawn(true);
        }
      }
      ctx.globalAlpha = 1;

      // White light at the end.
      if (p > 0.78) {
        flash.style.opacity = String((p - 0.78) / 0.22);
      }

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        try { sessionStorage.setItem('rhscue-warp', '1'); } catch (e) {}
        location.replace('home.html');
      }
    }
    requestAnimationFrame(frame);
  }
})();
