/**
 * scrubber.js — Canvas Frame Scrubber v2.1
 *
 * Architettura:
 * - Array images[] 0-based, sempre allineato 1:1 con frame_XXXX.jpg
 * - getMappedIndex: mappatura lineare diretta, zero salti
 * - Canvas sizing: usa getBoundingClientRect(), non window.innerHeight
 * - resizeCanvas: context.setTransform() assoluto, nessun accumulo DPR
 * - Preload: frame 0 immediato, poi primi 80 in parallelo, resto in batch
 * - scrub desktop 1.2 (fluido), mobile 0.5 (reattivo ma non secco)
 * - Nessun snap (causa scatti su mobile)
 */

(function () {
  "use strict";

  // ─── RILEVAMENTO DEVICE ──────────────────────────────────────────────────────
  const IS_MOBILE = window.innerWidth < 768;

  // ─── FRAME CONFIG ────────────────────────────────────────────────────────────
  // 1320 frame fisici totali.
  // Mobile: carichiamo 1 frame ogni 2 (frame_0001, frame_0003, frame_0005...)
  // → 660 frame logici su mobile, 1320 su desktop
  const TOTAL_FRAMES = IS_MOBILE ? 660 : 1320;

  // Mappa indice logico 0-based → percorso file
  function getFramePath(i) {
    const fileNum = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(fileNum).padStart(4, "0")}.jpg`;
  }

  // ─── STATO ───────────────────────────────────────────────────────────────────
  const images = new Array(TOTAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 1;
  let canvasH = 1;
  let dpr = 1;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const canvas  = document.getElementById("immersive-canvas");
  const ctx     = canvas.getContext("2d");
  const loader  = document.getElementById("loader");

  // ─── CANVAS SIZING ───────────────────────────────────────────────────────────
  // Misura il canvas dal DOM (è inset-0 w-full h-full → uguale al viewport)
  function updateCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width  || window.innerWidth;
    canvasH = rect.height || window.innerHeight;

    // DPR capped a 2 desktop, 1.5 mobile per performance
    dpr = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2);

    canvas.width  = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);

    // Imposta trasformazione assoluta (non accumula)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeCanvas() {
    updateCanvasSize();
    const idx = getMappedIndex(scrollTracker.frame);
    drawFrame(idx);
  }

  // ─── DRAW ────────────────────────────────────────────────────────────────────
  // Mappatura lineare: rawFrame 0→TOTAL_FRAMES-1 → indice 0-based
  function getMappedIndex(rawFrame) {
    return Math.max(0, Math.min(Math.round(rawFrame), TOTAL_FRAMES - 1));
  }

  function drawFrame(idx) {
    // Trova il frame più vicino già caricato se il corrente non è pronto
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let back = idx - 1; back >= 0; back--) {
        const fb = images[back];
        if (fb && fb.complete && fb.naturalWidth > 0) { img = fb; break; }
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;
    }
    blitCover(img);
  }

  function blitCover(img) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const ir = iw / ih;
    const cr = canvasW / canvasH;

    let dw, dh, dx, dy;
    if (ir > cr) {
      // Immagine più larga → scala per altezza, centra orizzontalmente
      dh = canvasH; dw = dh * ir;
      dx = (canvasW - dw) / 2; dy = 0;
    } else {
      // Immagine più alta → scala per larghezza, centra verticalmente
      dw = canvasW; dh = dw / ir;
      dx = 0; dy = (canvasH - dh) / 2;
    }

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ─── PRELOAD ─────────────────────────────────────────────────────────────────
  let loadedCount = 0;

  function loadFrame(i, cb) {
    if (images[i] !== null) { cb && cb(); return; }
    const img = new Image();
    images[i] = img;
    img.onload = img.onerror = () => { loadedCount++; cb && cb(); };
    img.src = getFramePath(i);
  }

  function loadBatch(from, size) {
    if (from >= TOTAL_FRAMES) return;
    const to   = Math.min(from + size, TOTAL_FRAMES);
    let   done = 0;
    const n    = to - from;
    for (let i = from; i < to; i++) {
      loadFrame(i, () => {
        done++;
        if (done === n) setTimeout(() => loadBatch(to, size), 32);
      });
    }
  }

  function preloadImages() {
    // 1) Frame 0 subito — elimina schermo nero al caricamento
    loadFrame(0, () => {
      updateCanvasSize();
      drawFrame(0);
      startApp();

      // 2) Frame 1-79 in parallelo (alta priorità — prime schermate visibili)
      const PRI = Math.min(80, TOTAL_FRAMES);
      for (let i = 1; i < PRI; i++) loadFrame(i, null);

      // 3) Resto in batch lazy da 40
      setTimeout(() => loadBatch(PRI, 40), 100);
    });
  }

  // ─── AVVIO ───────────────────────────────────────────────────────────────────
  function startApp() {
    // Nascondi loader
    if (loader) {
      loader.style.transition = "opacity 0.6s ease";
      loader.style.opacity    = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 700);
    }

    // Inizializza canvas e resize
    resizeCanvas();
    let rsTimer;
    window.addEventListener("resize", () => {
      clearTimeout(rsTimer);
      rsTimer = setTimeout(resizeCanvas, 80);
    });

    // Inizializza ScrollTrigger scrub
    gsap.to(scrollTracker, {
      frame: TOTAL_FRAMES - 1,
      ease:  "none",
      scrollTrigger: {
        trigger: "#app-container",
        start:   "top top",
        end:     "bottom bottom",
        // Desktop: 1.2 → fluido cinematico. Mobile: 0.5 → reattivo senza scatti
        scrub:   IS_MOBILE ? 0.5 : 1.2,
      },
      onUpdate() {
        const idx = getMappedIndex(scrollTracker.frame);
        drawFrame(idx);
        if (typeof updateCardTimeline === "function") {
          updateCardTimeline(scrollTracker.frame);
        }
      },
    });

    // Inizializza animazioni schede (definita in index.html)
    if (typeof initCardAnimations === "function") {
      initCardAnimations();
    }
  }

  // ─── GO ──────────────────────────────────────────────────────────────────────
  preloadImages();

})();