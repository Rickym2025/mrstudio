/**
 * scrubber.js — Canvas Frame Scrubber v4.1 (Desktop & Mobile Segmented Architecture)
 *
 * ARCHITETTURA:
 * - 11 istanze di ScrollTrigger individuali per garantire perfetta sincronia card-video.
 * - Su Desktop: scrubbing manuale iper-preciso con progress specifico di sezione (1320 frame JPEGs).
 * - Su Mobile: riproduzione nativa e fluida di background.mp4 tramite interpolazione controllata di currentTime.
 * - Sincronia dinamica del loader-bar all'inizializzazione.
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // Desktop usa 1320 frame fisici JPEGs. Mobile non carica JPEGs ma usa background.mp4.
  const TOTAL_FRAMES = 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    return `frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
  }

  // Helper per ottenere l'esatto range di frame video di ogni scena (0-1320)
  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30],       // Scena 0: RM Studio Intro
      [30, 120],     // Scena 1: NexusAI
      [120, 240],    // Scena 2: Concierge24
      [240, 360],    // Scena 3: Dentis
      [360, 480],    // Scena 4: Lexis AI
      [480, 600],    // Scena 5: DriveMotion
      [600, 720],    // Scena 6: HomeTour AI
      [720, 840],    // Scena 7: OmniaStudio
      [840, 960],    // Scena 8: FF Edizioni
      [960, 1080],   // Scena 9: Ecosistema Connesso
      [1080, 1319]   // Scena 10: Contatti
    ];
    return {
      start: ranges[index][0],
      end: ranges[index][1]
    };
  }

  // Mappa il progresso dei frame fisici (0-1320) in secondi reali per background.mp4 su mobile
  function getSceneTimeRange(index, duration) {
    const range = getSceneFrameRange(index);
    const total = 1320;
    return {
      start: (range.start / total) * duration,
      end: (range.end / total) * duration
    };
  }

  // Ritorna l'indice della scena in base al frame corrente (usato per la sincronizzazione delle card su desktop)
  function getSceneIndexFromFrame(frame) {
    const ranges = [
      [0, 30],       // Scena 0
      [30, 120],     // Scena 1
      [120, 240],    // Scena 2
      [240, 360],    // Scena 3
      [360, 480],    // Scena 4
      [480, 600],    // Scena 5
      [600, 720],    // Scena 6
      [720, 840],    // Scena 7
      [840, 960],    // Scena 8
      [960, 1080],   // Scena 9
      [1080, 1320]   // Scena 10
    ];
    for (let i = 0; i < ranges.length; i++) {
      if (frame >= ranges[i][0] && frame < ranges[i][1]) {
        return i;
      }
    }
    return ranges.length - 1;
  }

  // ─── STATO ───────────────────────────────────────────────────────────────────
  const images = new Array(TOTAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 1, canvasH = 1, dpr = 1;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("immersive-canvas");
  const ctx    = canvas.getContext("2d");
  const loader = document.getElementById("loader");

  // ─── PROGRESSO LOADER IN TEMPO REALE ──────────────────────────────────────────
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
    if (!canvas) return;
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
    if (IS_MOBILE) return; // Su mobile usiamo l'elemento video nativo, non disegnamo su canvas
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

  // Chiamata da initCardAnimations (in index.html) per registrare ed allineare l'indice iniziale
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

    // Imposta immediatamente visibile solo la card corretta allineata al punto di caricamento
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });

    // Sincronizza l'orientamento di partenza del video o del canvas
    if (IS_MOBILE) {
      const video = document.getElementById("immersive-video");
      if (video) {
        const duration = video.duration || 44.0;
        const timeRange = getSceneTimeRange(activeCardIndex, duration);
        video.currentTime = timeRange.end;
      }
    } else {
      const range = getSceneFrameRange(activeCardIndex);
      scrollTracker.frame = range.end;
      drawFrame(range.end);
    }
  };

  // ─── PRELOAD (DIVERSIFICATO) ──────────────────────────────────────────────────
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
      // MOBILE: Precarica background.mp4 e sincronizza il caricamento grafico
      const video = document.getElementById("immersive-video");
      if (video) {
        video.src = "frames/background.mp4";
        video.load();

        const onVideoReady = () => {
          video.removeEventListener("loadedmetadata", onVideoReady);
          video.removeEventListener("canplaythrough", onVideoReady);

          // Simula un caricamento fluido al 100% una volta pronti i metadati del video
          gsap.to(loaderBar, {
            width: "100%",
            duration: 0.8,
            ease: "power1.out",
            onUpdate() {
              const pct = Math.round(parseFloat(loaderBar.style.width || 0));
              if (loaderText) loaderText.innerText = `Inizializzazione... ${pct}%`;
            },
            onComplete() {
              startApp();
            }
          });
        };

        video.addEventListener("loadedmetadata", onVideoReady);
        video.addEventListener("canplaythrough", onVideoReady);
        
        // Timeout di sicurezza
        setTimeout(onVideoReady, 2500);
      } else {
        startApp();
      }
    } else {
      // DESKTOP: Sequenza classica di immagini JPEGs
      loadFrame(0, () => {
        updateCanvasSize();
        drawFrame(0);
        startApp();
        const PRI = Math.min(120, TOTAL_FRAMES);
        for (let i = 1; i < PRI; i++) loadFrame(i, null);
        setTimeout(() => loadBatch(PRI, 50), 200);
      });
    }
  }

  // ─── INIZIALIZZAZIONE TRIGGERS INDIVIDUALI ─────────────────────────────────────
  function initTriggers() {
    if (IS_MOBILE) {
      // MOBILE: Controllo diretto e fluido su background.mp4 tramite currentTime
      const video = document.getElementById("immersive-video");
      const duration = video ? (video.duration || 44.0) : 44.0;

      for (let i = 0; i < SCENES_COUNT; i++) {
        const timeRange = getSceneTimeRange(i, duration);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top 60%", // Attiva il focus e allinea la card al 60% dello schermo
          end: "bottom 60%",
          onToggle(self) {
            if (self.isActive) {
              updateCardTimelineDirect(i);

              if (video) {
                // Esegue una transizione temporale morbidissima a 60fps
                gsap.to(video, {
                  currentTime: timeRange.end,
                  duration: 1.2,
                  ease: "power2.out",
                  overwrite: "auto"
                });
              }
            }
          }
        });
      }
    } else {
      // DESKTOP: Scrubbing manuale millimetrico legato allo scorrimento fisico
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = getSceneFrameRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate(self) {
            // Calcola il frame corrispondente alla sezione e aggiorna il canvas
            const currentFrame = range.start + self.progress * (range.end - range.start);
            scrollTracker.frame = currentFrame;
            drawFrame(Math.max(0, Math.min(Math.round(currentFrame), TOTAL_FRAMES - 1)));

            // Sincronizza la card testuale direttamente al frame renderizzato (compensando lo scorrimento inerziale)
            const sceneIndex = getSceneIndexFromFrame(currentFrame);
            updateCardTimelineDirect(sceneIndex);
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
      loader.style.transition = "opacity 0.6s";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 700);
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

  // Avvia l'applicazione quando il DOM e tutti gli script inline sono pronti in memoria
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", preloadImages);
  } else {
    preloadImages();
  }

})();