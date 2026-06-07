/**
 * scrubber.js — Canvas Frame Scrubber v3.1
 *
 * ARCHITETTURA CHIAVE:
 * - Una sola fonte di verità: progress normalizzato dello scroll (0 → 1)
 * - Mappatura non-lineare nativa sia per i frame che per le card (zero sfasamento)
 * - activeCardIndex pre-inizializzato a 0 per bloccare il flash di RM Studio
 * - scrub desktop: 0.5 (fluido) | scrub mobile: 0.1 (sensibile, no autoscroll)
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // 1320 frame fisici. Mobile usa 1 ogni 2 → 660 frame logici.
  const TOTAL_FRAMES = IS_MOBILE ? 660 : 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // ─── STATO ───────────────────────────────────────────────────────────────────
  const images = new Array(TOTAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 1, canvasH = 1, dpr = 1;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("immersive-canvas");
  const ctx    = canvas.getContext("2d");
  const loader = document.getElementById("loader");

  // ─── CANVAS SIZING ───────────────────────────────────────────────────────────
  function updateCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width  || window.innerWidth;
    canvasH = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2);
    canvas.width  = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeCanvas() {
    updateCanvasSize();
    const progress = scrollTracker.frame / (TOTAL_FRAMES - 1);
    drawFrameFromProgress(progress);
  }

  // ─── DRAW ────────────────────────────────────────────────────────────────────
  function drawFrame(idx) {
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let b = idx - 1; b >= 0; b--) {
        const fb = images[b];
        if (fb && fb.complete && fb.naturalWidth > 0) { img = fb; break; }
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;
    }
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const ir = iw / ih, cr = canvasW / canvasH;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = canvasH; dw = dh * ir; dx = (canvasW - dw) / 2; dy = 0;
    } else {
      dw = canvasW; dh = dw / ir; dx = 0; dy = (canvasH - dh) / 2;
    }
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ─── MAPPATURA NON-LINEARE DINAMICA DEL VIDEO ─────────────────────────────────
  function drawFrameFromProgress(progress) {
    const sceneIdx = Math.min(Math.floor(progress * SCENES_COUNT), SCENES_COUNT - 1);
    const sceneProgress = (progress * SCENES_COUNT) - sceneIdx;
    
    let videoFrame = 1;
    if (sceneIdx === 0) {
      videoFrame = 1 + sceneProgress * 29; // frame 1 a 30 (RM Studio Intro)
    } else if (sceneIdx === 1) {
      videoFrame = 30 + sceneProgress * 90; // frame 30 a 120 (NexusAI)
    } else if (sceneIdx === 10) {
      videoFrame = 1080 + sceneProgress * 240; // frame 1080 a 1320 (Contatti)
    } else {
      // Sezioni intermedie (120 frame ciascuna)
      videoFrame = (sceneIdx - 1) * 120 + sceneProgress * 120;
    }

    let idx;
    if (IS_MOBILE) {
      // Mappa il frame video reale (1-1320) sull'indice logico mobile (0-659)
      idx = Math.max(0, Math.min(Math.round((videoFrame - 1) / 2), TOTAL_FRAMES - 1));
    } else {
      idx = Math.max(0, Math.min(Math.round(videoFrame - 1), TOTAL_FRAMES - 1));
    }
    
    drawFrame(idx);
  }

  // ─── CARD SYNC ───────────────────────────────────────────────────────────────
  let cards = null;
  let activeCardIndex = 0; // Inizializzato fisso a 0 per evitare il flash della prima card

  function updateCardTimeline(progress) {
    if (!cards || cards.length === 0) return;

    // Determina la sezione attiva basandosi sul progresso lineare complessivo dello scroll
    const sceneIdx = Math.min(
      Math.floor(progress * SCENES_COUNT),
      SCENES_COUNT - 1
    );

    if (sceneIdx === activeCardIndex) return; // Nessun cambio di card
    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    // Anima uscita scheda precedente
    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps && window.getSceneProps(prevIdx);
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: 0.4, ease: "power2.in" });
      }
    }

    // Anima entrata scheda corrente
    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const card = cards[sceneIdx];
      const props = window.getSceneProps && window.getSceneProps(sceneIdx);
      if (props) {
        gsap.killTweensOf(card);
        gsap.fromTo(card, props.init, { ...props.mid, duration: 0.5, ease: "power3.out" });
      }
    }
  }

  // Chiamata da initCardAnimations (in index.html) per passare i riferimenti
  window.registerCards = function(cardElements) {
    cards = cardElements;
    activeCardIndex = 0; // Forza la sincronizzazione iniziale sulla card 0
  };

  // ─── PRELOAD ─────────────────────────────────────────────────────────────────
  function loadFrame(i, cb) {
    if (images[i] !== null) { cb && cb(); return; }
    const img = new Image();
    images[i] = img;
    img.onload = img.onerror = () => { cb && cb(); };
    img.src = getFramePath(i);
  }

  function loadBatch(from, size) {
    if (from >= TOTAL_FRAMES) return;
    const to = Math.min(from + size, TOTAL_FRAMES);
    let done = 0, n = to - from;
    for (let i = from; i < to; i++) {
      loadFrame(i, () => { if (++done === n) setTimeout(() => loadBatch(to, size), 16); });
    }
  }

  function preloadImages() {
    loadFrame(0, () => {
      updateCanvasSize();
      drawFrameFromProgress(0);
      startApp();
      // Carica i primi 80 in parallelo (alta priorità)
      const PRI = Math.min(80, TOTAL_FRAMES);
      for (let i = 1; i < PRI; i++) loadFrame(i, null);
      // Resto in batch da 50
      setTimeout(() => loadBatch(PRI, 50), 200);
    });
  }

  // ─── START ───────────────────────────────────────────────────────────────────
  function startApp() {
    if (loader) {
      loader.style.transition = "opacity 0.6s";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 700);
    }

    resizeCanvas();
    let rsTimer;
    window.addEventListener("resize", () => {
      clearTimeout(rsTimer);
      rsTimer = setTimeout(resizeCanvas, 80);
    });

    gsap.to(scrollTracker, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#app-container",
        start: "top top",
        end:   "bottom bottom",
        // Su mobile "0.1" vincola reattivamente il progresso al dito evitando l'effetto autoplay accelerato
        scrub: IS_MOBILE ? 0.1 : 0.5,
      },
      onUpdate() {
        const progress = scrollTracker.frame / (TOTAL_FRAMES - 1);
        drawFrameFromProgress(progress);
        updateCardTimeline(progress);
      },
    });

    if (typeof initCardAnimations === "function") {
      initCardAnimations();
    }
  }

  preloadImages();

})();