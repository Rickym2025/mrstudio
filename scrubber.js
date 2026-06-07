/**
 * scrubber.js — Canvas & Video Scrub Suite v5.0 (Hybrid Mobile Video Engine)
 *
 * ARCHITETTURA:
 * - Desktop: 11 ScrollTrigger individuali con rendering Canvas JPEG e attivazione card ritardata al 25% della sezione.
 * - Mobile: Scrubbing MP4 hardware-accelerato integrato via GSAP currentTime (senza caricamento frame JPEG per massima velocità).
 * - Sincronizzazione dinamica e precisa della scheda attiva all'ingresso di ogni sezione.
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // 1320 frame fisici su desktop (660 su mobile se attivo, ma ignorato in modalità MP4 mobile)
  const TOTAL_FRAMES = IS_MOBILE ? 660 : 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // Mappatura temporale precisa (in secondi) di background.mp4 basata sui 1320 frame a 30fps
  function getSceneTimeRange(index) {
    const ranges = [
      [0.0, 1.0],      // Scena 0: RM Studio Intro (frame 0-30)
      [1.0, 4.0],      // Scena 1: NexusAI (frame 30-120)
      [4.0, 8.0],      // Scena 2: Concierge24 (frame 120-240)
      [8.0, 12.0],     // Scena 3: Dentis (frame 240-360)
      [12.0, 16.0],    // Scena 4: Lexis AI (frame 360-480)
      [16.0, 20.0],    // Scena 5: DriveMotion (frame 480-600)
      [20.0, 24.0],    // Scena 6: HomeTour AI (frame 600-720)
      [24.0, 28.0],    // Scena 7: OmniaStudio (frame 720-840)
      [28.0, 32.0],    // Scena 8: FF Edizioni (frame 840-960)
      [32.0, 36.0],    // Scena 9: Ecosistema Connesso (frame 960-1080)
      [36.0, 43.9]     // Scena 10: Contatti (frame 1080-1320)
    ];
    return {
      start: ranges[index][0],
      end: ranges[index][1]
    };
  }

  // Helper per il range di frame su Desktop
  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30],
      [30, 120],
      [120, 240],
      [240, 360],
      [360, 480],
      [480, 600],
      [600, 720],
      [720, 840],
      [840, 960],
      [960, 1080],
      [1080, 1319]
    ];
    const r = ranges[index];
    return {
      start: r[0],
      end: r[1]
    };
  }

  // ─── STATO ───────────────────────────────────────────────────────────────────
  const images = new Array(TOTAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 1, canvasH = 1, dpr = 1;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("immersive-canvas");
  const ctx    = canvas.getContext("2d");
  const loader = document.getElementById("loader");

  // ─── PROGRESSO LOADER (Solo Desktop) ──────────────────────────────────────────
  let loadedCount = 0;
  const loaderBar = document.getElementById("loader-bar");
  const loaderText = document.getElementById("loader-text");

  function updateLoaderProgress() {
    loadedCount++;
    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.innerText = `Inizializzazione... ${pct}%`;
  }

  // ─── CANVAS SIZING ───────────────────────────────────────────────────────────
  function updateCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width  || window.innerWidth;
    canvasH = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeCanvas() {
    updateCanvasSize();
    drawFrame(Math.max(0, Math.min(Math.round(scrollTracker.frame), TOTAL_FRAMES - 1)));
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

  // ─── CARD SYNC ───────────────────────────────────────────────────────────────
  let cards = null;
  let activeCardIndex = 0;

  function updateCardTimelineDirect(sceneIdx) {
    if (!cards || cards.length === 0) return;
    if (sceneIdx === activeCardIndex) return;

    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    // Anima l'uscita della scheda precedente
    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps && window.getSceneProps(prevIdx);
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: 0.4, ease: "power2.in" });
      }
    }

    // Anima l'entrata della scheda corrente
    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const card = cards[sceneIdx];
      const props = window.getSceneProps && window.getSceneProps(sceneIdx);
      if (props) {
        gsap.killTweensOf(card);
        gsap.fromTo(card, props.init, { ...props.mid, duration: 0.5, ease: "power3.out" });
      }
    }
  }

  // Registrazione iniziale ed auto-allineamento dinamico
  window.registerCards = function (cardElements) {
    cards = cardElements;

    // Individua la sezione attiva sull'eventuale ricarica della pagina a metà scorrimento
    let initialActiveIndex = 0;
    for (let i = 0; i < SCENES_COUNT; i++) {
      const trigger = document.getElementById(`trigger-${i}`);
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          initialActiveIndex = i;
          break;
        }
      }
    }
    activeCardIndex = initialActiveIndex;

    // Mostra solo la scheda attiva al caricamento
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });

    // Se mobile, salta istantaneamente al timestamp corretto del video HTML5
    if (IS_MOBILE) {
      const videoEl = document.getElementById("immersive-video");
      if (videoEl) {
        const times = getSceneTimeRange(activeCardIndex);
        videoEl.currentTime = times.end;
      }
    }
  };

  // ─── PRELOAD ─────────────────────────────────────────────────────────────────
  function loadFrame(i, cb) {
    if (images[i] !== null) { cb && cb(); return; }
    const img = new Image();
    images[i] = img;
    img.onload = img.onerror = () => {
      updateLoaderProgress();
      cb && cb();
    };
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
    if (IS_MOBILE) {
      // Su mobile saltiamo l'attesa dei frame JPEG per caricare all'istante
      const videoEl = document.getElementById("immersive-video");
      if (videoEl) {
        videoEl.load();
        videoEl.play().catch(() => console.log("Video caricato e pronto per ScrollTrigger"));
      }
      startApp();
    } else {
      // Desktop preloading dei frame
      loadFrame(0, () => {
        updateCanvasSize();
        drawFrame(0);
        startApp();
        const PRI = Math.min(80, TOTAL_FRAMES);
        for (let i = 1; i < PRI; i++) loadFrame(i, null);
        setTimeout(() => loadBatch(PRI, 50), 200);
      });
    }
  }

  // ─── INIZIALIZZAZIONE TRIGGERS DI SEZIONE (DESKTOP / MOBILE IBRIDO) ────────────
  function initTriggers() {
    if (IS_MOBILE) {
      const videoEl = document.getElementById("immersive-video");

      // MOBILE: Riproduzione automatica hardware-accelerata tramite currentTime del tag <video>
      for (let i = 0; i < SCENES_COUNT; i++) {
        const times = getSceneTimeRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top 60%",
          end: "bottom 60%",
          onToggle(self) {
            if (self.isActive) {
              // Ritardo ottimizzato per coordinare l'ingresso della scheda a metà della transizione video
              setTimeout(() => {
                if (cards && activeCardIndex !== i) {
                  updateCardTimelineDirect(i);
                }
              }, 350);

              if (videoEl) {
                // Pausa obbligatoria per evitare conflitti tra il play nativo e lo scrub GSAP
                videoEl.pause();
                gsap.to(videoEl, {
                  currentTime: times.end,
                  duration: 1.5,
                  ease: "power1.inOut",
                  overwrite: "auto"
                });
              }
            }
          }
        });
      }
    } else {
      // DESKTOP: Scrubbing frame-by-frame di precisione sul canvas
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = getSceneFrameRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate(self) {
            const currentFrame = range.start + self.progress * (range.end - range.start);
            scrollTracker.frame = currentFrame;
            drawFrame(Math.max(0, Math.min(Math.round(currentFrame), TOTAL_FRAMES - 1)));

            // Sincronizzazione ritardata della scheda: appare solo dopo il 25% della transizione video
            if (self.isActive) {
              if (self.progress >= 0.25) {
                updateCardTimelineDirect(i);
              } else if (self.progress < 0.25 && i > 0) {
                updateCardTimelineDirect(i - 1);
              }
            }
          },
          onToggle(self) {
            if (self.isActive && i === 0) {
              updateCardTimelineDirect(0);
            }
          }
        });
      }
    }

    if (typeof window.initCardAnimations === "function") {
      window.initCardAnimations();
    }
  }

  // ─── START ───────────────────────────────────────────────────────────────────
  function startApp() {
    if (loader) {
      loader.style.transition = "opacity 0.4s";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 400);
    }

    if (!IS_MOBILE) {
      resizeCanvas();
      let rsTimer;
      window.addEventListener("resize", () => {
        clearTimeout(rsTimer);
        rsTimer = setTimeout(resizeCanvas, 80);
      });
    }

    initTriggers();
  }

  preloadImages();

})();