/**
 * scrubber.js — Canvas Frame Scrubber v4.1 (Dynamic Asset Streaming Architecture)
 *
 * ARCHITETTURA CHIAVE:
 * - 11 Triggers individuali per allineamento millimetrico.
 * - Queue di caricamento prioritario (Streaming Loader): i frame della sezione attiva
 *   vengono messi in cima alla coda e scaricati istantaneamente in micro-batch (2 alla volta su mobile)
 *   evitando congestione di rete e sovraccarichi di CPU/GPU mobile.
 * - Triggers ridotti a 100vh su mobile per rendere lo scroll iper-reattivo.
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

  // Helper per calcolare i frame esatti assegnati ad ogni scena
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
    const r = ranges[index];
    if (IS_MOBILE) {
      return {
        start: Math.round(r[0] / 2),
        end: Math.round(r[1] / 2)
      };
    }
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

  // ─── STREAMING QUEUE DI CARICAMENTO AUTOMATICO ───────────────────────────────
  let loadingQueue = [];
  let isCurrentlyLoading = false;
  const BATCH_SIZE = IS_MOBILE ? 2 : 5; // Limita i download in parallelo per preservare la CPU

  let loadedCount = 0;
  const loaderBar = document.getElementById("loader-bar");
  const loaderText = document.getElementById("loader-text");

  function updateLoaderProgress() {
    loadedCount++;
    const pct = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.innerText = `Inizializzazione... ${pct}%`;
  }

  // Aggiunge frame specifici in testa alla coda di caricamento (Priorità Massima)
  function enqueueSceneFrames(sceneIdx) {
    const range = getSceneFrameRange(sceneIdx);
    const sceneFrames = [];
    for (let f = range.start; f <= range.end; f++) {
      if (!images[f] || !images[f].complete) {
        sceneFrames.push(f);
      }
    }
    // Mette i frame in cima eliminando eventuali duplicati
    loadingQueue = [...sceneFrames, ...loadingQueue.filter(f => !sceneFrames.includes(f))];
    triggerQueueLoad();
  }

  function triggerQueueLoad() {
    if (isCurrentlyLoading || loadingQueue.length === 0) return;
    isCurrentlyLoading = true;
    
    const batch = loadingQueue.splice(0, BATCH_SIZE);
    let completed = 0;
    
    batch.forEach(frameIdx => {
      loadFrame(frameIdx, () => {
        completed++;
        if (completed === batch.length) {
          isCurrentlyLoading = false;
          // Un piccolo ritardo lascia respirare il browser mobile durante lo scorrimento
          setTimeout(triggerQueueLoad, IS_MOBILE ? 40 : 20);
        }
      });
    });
  }

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
    drawFrame(Math.max(0, Math.min(Math.round(scrollTracker.frame), TOTAL_FRAMES - 1)));
  }

  // ─── DRAW ────────────────────────────────────────────────────────────────────
  function drawFrame(idx) {
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback sul frame caricato precedentemente più vicino per non mostrare buchi neri
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

    // Dai priorità istantanea ai frame della nuova sezione che sta per entrare e a quella successiva
    enqueueSceneFrames(sceneIdx);
    if (sceneIdx + 1 < SCENES_COUNT) {
      enqueueSceneFrames(sceneIdx + 1);
    }

    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps && window.getSceneProps(prevIdx);
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: 0.4, ease: "power2.in" });
      }
    }

    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const card = cards[sceneIdx];
      const props = window.getSceneProps && window.getSceneProps(sceneIdx);
      if (props) {
        gsap.killTweensOf(card);
        gsap.fromTo(card, props.init, { ...props.mid, duration: 0.5, ease: "power3.out" });
      }
    }
  }

  window.registerCards = function (cardElements) {
    cards = cardElements;

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

    // Prioritizza i frame di partenza
    enqueueSceneFrames(activeCardIndex);

    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });
  };

  // ─── PRELOAD ─────────────────────────────────────────────────────────────────
  function loadFrame(i, cb) {
    if (images[i] !== null) {
      if (images[i].complete) {
        cb && cb();
      } else {
        const prevOnload = images[i].onload;
        images[i].onload = images[i].onerror = () => {
          if (prevOnload) prevOnload();
          cb && cb();
        };
      }
      return;
    }
    const img = new Image();
    images[i] = img;
    img.onload = img.onerror = () => {
      updateLoaderProgress();
      cb && cb();
    };
    img.src = getFramePath(i);
  }

  function preloadImages() {
    loadFrame(0, () => {
      updateCanvasSize();
      drawFrame(0);
      startApp();
      
      // Carica il resto dei frame in background con priorità standard (in coda)
      const allFrames = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        allFrames.push(i);
      }
      loadingQueue = [...loadingQueue, ...allFrames.filter(f => !loadingQueue.includes(f))];
      triggerQueueLoad();
    });
  }

  // ─── INIZIALIZZAZIONE TRIGGERS INDIVIDUALI ─────────────────────────────────────
  function initTriggers() {
    if (IS_MOBILE) {
      // MOBILE: Passaggio automatico fluido assistito a 60fps basato sulle sezioni
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = getSceneFrameRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top", // Sequenzialità perfetta e lineare senza sovrapposizioni
          end: "bottom top",
          onToggle(self) {
            if (self.isActive) {
              updateCardTimelineDirect(i);

              // Transizione automatica morbida dal frame in cui ci si trova fino all'end-frame della nuova sezione
              gsap.to(scrollTracker, {
                frame: range.end,
                duration: 1.2,
                ease: "power2.out",
                overwrite: "auto",
                onUpdate() {
                  drawFrame(Math.max(0, Math.min(Math.round(scrollTracker.frame), TOTAL_FRAMES - 1)));
                }
              });
            }
          }
        });
      }
    } else {
      // DESKTOP: Scrubbing iper-preciso legato allo scorrimento fisico
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
          },
          onToggle(self) {
            if (self.isActive) {
              updateCardTimelineDirect(i);
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

    initTriggers();
  }

  preloadImages();

})();