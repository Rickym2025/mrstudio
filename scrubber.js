/**
 * scrubber.js — Canvas Frame Scrubber v4.1 (Desktop & Mobile Segmented Architecture)
 *
 * ARCHITETTURA SICURA:
 * - Esporta window.initScrubber() per eliminare ogni problema di race-condition all'avvio.
 * - Su Desktop: scrubbing di precisione su <canvas>, cambio scheda sincronizzato al fotogramma visualizzato reale.
 * - Su Mobile: disattivato il caricamento dei 660 frame JPEG. Riproduzione e tweening assistito nativo sul file video "frames/background.mp4" tramite GSAP currentTime.
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // 1320 frame fisici su desktop. Su mobile il video gestisce il tempo in secondi.
  const TOTAL_FRAMES = IS_MOBILE ? 660 : 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // Helper per ottenere l'esatto range di frame video di ogni scena (per il canvas desktop)
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
    return {
      start: r[0],
      end: r[1]
    };
  }

  // Mappa i fotogrammi teorici (da 0 a 1320) in secondi reali basandosi sulla durata del video mobile
  function getSceneTimeRange(index, duration) {
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
    const totalFrames = 1320;
    return {
      start: (r[0] / totalFrames) * duration,
      end: (r[1] / totalFrames) * duration
    };
  }

  // Individua l'indice della scena attiva partendo da un determinato frame (Desktop)
  function getSceneIndexFromFrame(frame) {
    const ranges = [
      [0, 30], [30, 120], [120, 240], [240, 360], [360, 480],
      [480, 600], [600, 720], [720, 840], [840, 960], [960, 1080], [1080, 1320]
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
    if (IS_MOBILE) return;
    updateCanvasSize();
    drawFrame(Math.max(0, Math.min(Math.round(scrollTracker.frame), TOTAL_FRAMES - 1)));
  }

  // ─── DRAW CANVAS (Desktop Only) ──────────────────────────────────────────────
  function drawFrame(idx) {
    if (IS_MOBILE) return;
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

  // ─── CARD SYNC (Desktop & Mobile) ────────────────────────────────────────────
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

  // Chiamata da initCardAnimations per registrare ed allineare l'indice iniziale
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

    // Forza la card visibile allineata allo scroll effettivo al caricamento della pagina
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });

    // Allinea la posizione temporale o di frame iniziale della sorgente video/canvas
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
      // MOBILE: Ignora i file JPEG individuali e carica il video background.mp4
      const video = document.getElementById("immersive-video");
      if (video) {
        video.src = "frames/background.mp4";
        video.load();

        const onVideoReady = () => {
          video.removeEventListener("loadedmetadata", onVideoReady);
          video.removeEventListener("canplaythrough", onVideoReady);

          // Completa visivamente la barra del loader
          gsap.to(loaderBar, {
            width: "100%",
            duration: 0.4,
            onUpdate() {
              const pct = Math.round(parseFloat(loaderBar.style.width || 0));
              if (loaderText) loaderText.innerText = `Inizializzazione... ${pct}%`;
            },
            onComplete() {
              startApp();
            }
          });
        };

        if (video.readyState >= 1) {
          onVideoReady();
        } else {
          video.addEventListener("loadedmetadata", onVideoReady);
          video.addEventListener("canplaythrough", onVideoReady);
          // Fallback di sicurezza in caso di mancato trigger
          setTimeout(onVideoReady, 2000);
        }
      } else {
        startApp();
      }
    } else {
      // DESKTOP: Carica la sequenza di immagini
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

  // ─── INIZIALIZZAZIONE TRIGGERS INDIVIDUALI ─────────────────────────────────────
  function initTriggers() {
    if (IS_MOBILE) {
      // MOBILE: Passaggio automatico fluido a 60fps controllando currentTime con GSAP
      const video = document.getElementById("immersive-video");
      const duration = (video && video.duration) || 44.0;

      for (let i = 0; i < SCENES_COUNT; i++) {
        const timeRange = getSceneTimeRange(i, duration);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top 60%", // Attiva il capitolo quando la sezione entra nel mirino dello schermo
          end: "bottom 60%",
          onToggle(self) {
            if (self.isActive) {
              updateCardTimelineDirect(i);

              if (video) {
                // Esegue una transizione assistita fluida verso la fine della transizione attiva
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
      // DESKTOP: Scrubbing legato allo scroll
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = getSceneFrameRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate(self) {
            // Calcola il progresso della sezione per identificare il fotogramma corretto
            const currentFrame = range.start + self.progress * (range.end - range.start);
            scrollTracker.frame = currentFrame;
            drawFrame(Math.max(0, Math.min(Math.round(currentFrame), TOTAL_FRAMES - 1)));

            // Sincronizza l'attivazione della scheda sull'esatto frame renderizzato
            const currentActiveScene = getSceneIndexFromFrame(currentFrame);
            updateCardTimelineDirect(currentActiveScene);
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

  // Esporta la funzione di avvio per essere invocata in sicurezza alla fine di index.html
  window.initScrubber = function () {
    preloadImages();
  };

})();