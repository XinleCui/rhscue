/* ============================================================
 * Slowly rotating black-hole image
 * - Uses the supplied realistic image as one whole rotating scene.
 * - No extra star twinkle or local-only black-hole rotation.
 * - Clicking the black-hole area still triggers the existing warp.
 * ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('bh-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const image = new Image();
  image.src = 'assets/blackhole-bg.png';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let W = 0;
  let H = 0;
  let draw = null;
  let blackHole = null;
  let started = false;

  function containRect(imgW, imgH, boxW, boxH) {
    const scale = Math.min(boxW / imgW, boxH / imgH);
    const w = imgW * scale;
    const h = imgH * scale;
    return {
      x: (boxW - w) / 2,
      y: (boxH - h) / 2,
      w,
      h
    };
  }

  function computeBlackHole() {
    if (!draw) return null;

    // Ratios are measured from the supplied 1672 x 941 reference image.
    const cx = draw.x + draw.w * 0.516;
    const cy = draw.y + draw.h * 0.526;
    return {
      cx,
      cy,
      hitRx: draw.w * 0.13,
      hitRy: draw.h * 0.16
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    if (image.complete && image.naturalWidth) {
      draw = containRect(image.naturalWidth, image.naturalHeight, W, H);
      blackHole = computeBlackHole();
    }
  }

  function drawRotatingImage(time) {
    if (!draw || !blackHole) return;

    const angle = reduced ? 0 : time * 0.018;
    const scale = 1.08;
    const w = draw.w * scale;
    const h = draw.h * scale;

    ctx.save();
    ctx.translate(blackHole.cx, blackHole.cy);
    ctx.rotate(angle);
    ctx.filter = 'contrast(1.05) saturate(0.96) brightness(0.9)';
    ctx.drawImage(
      image,
      -w * 0.516,
      -h * 0.526,
      w,
      h
    );
    ctx.restore();
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.53, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.76);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.58)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function hitTest(clientX, clientY) {
    if (!blackHole) return true;
    const dx = (clientX - blackHole.cx) / blackHole.hitRx;
    const dy = (clientY - blackHole.cy) / blackHole.hitRy;
    return dx * dx + dy * dy <= 1;
  }

  window.rhscueBlackHole = {
    hitTest,
    getBounds: () => blackHole ? { ...blackHole } : null
  };

  canvas.addEventListener('mousemove', event => {
    canvas.style.cursor = hitTest(event.clientX, event.clientY) ? 'pointer' : 'default';
  });
  canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
  });

  function loop(now) {
    const time = now / 1000;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    drawRotatingImage(time);
    drawVignette();
    requestAnimationFrame(loop);
  }

  function start() {
    if (started) return;
    started = true;
    resize();
    requestAnimationFrame(loop);
  }

  image.addEventListener('load', start);
  window.addEventListener('resize', resize);
  resize();
  if (image.complete && image.naturalWidth) start();
})();
