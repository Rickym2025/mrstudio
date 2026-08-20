/**
 * scrubber.js — RM Studio High-Performance Engine
 * Sincronizzazione 1:1, Ricerca Frame Intelligente & Infinite Loop
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // ─── TABELLA INTERVALLI ESATTI PER OGNI SAAS (12 SCENE) ───
  const SCENE_RANGES = [
    { start: 0,    end: 30,   timeStart: 0.0,  timeEnd: 1.0 },   // 0: Intro RM Studio
    { start: 30,   end: 120,  timeStart: 1.0,  timeEnd: 4.0 },   // 1: NexusAI
    { start: 120,  end: 240,  timeStart: 4.0,  timeEnd: 8.0 },   // 2: Concierge24
    { start: 240,  end: 360,  timeStart: 8.0,  timeEnd: 12.0 },  // 3: Dentis
    { start: 360,  end: 480,  timeStart: 12.0, timeEnd: 16.0 },  // 4: Lexis AI
    { start: 480,  end: 600,  timeStart: 16.0, timeEnd: 20.0 },  // 5: DriveMotion
    { start: 600,  end: 720,  timeStart: 20.0, timeEnd: 24.0 },  // 6: HomeTour AI
    { start: 720,  end: 840,  timeStart: 24.0, timeEnd: 28.0 },  // 7: OmniaStudio
    { start: 840,  end: 960,  timeStart: 28.0, timeEnd: 32.0 },  // 8: FF Edizioni
    { start: 960,  end: 1080, timeStart: 32.0, timeEnd: 36.0 },  // 9: Vision
    { start: 1080, end: 1200, timeStart: 36.0, timeEnd: 40.0 },  // 10: Ecosistema
    { start: 1200, end: 1439, timeStart: 40.0, timeEnd: 47.9 }   // 11: Contatti
  ];

  const TOTAL_FRAMES = 1440;
  const SCENES_COUNT = SCENE_RANGES.length;

  function getFramePath(i) {
    const frameNumber = Math.min(Math.max(1, i + 1), TOTAL_FRAMES);
    return `frames/frame_${String(frameNumber).padStart(4, "0")}.jpg`;
  }

  // ─── STATO MOTORE GRAFICO ───
  const images = new Array(TOTAL_FRAMES).fill(null);
  let targetFrame = 0;
  let currentRenderedFrame = -1;
  let lastValidImage = null;
  let canvasW = 1, canvasH = 1, dpr = 1;
  
  let cards = null;
  let activeCardIndex = -1;
  let lenisInstance = null;

  // ─── DOM ───
  const canvas = document.getElementById("immersive-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderText = document.getElementById("loader-text");

  // ─── RESIZE CANVAS ───
  function updateCanvasSize() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width || window.innerWidth;
    canvasH = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ─── RICERCA FRAME INTELLIGENTE (RISOLVE IL BLOCCO IN AVANTI) ───
  function getBestImage(idx) {
    if (images[idx] && images[idx].complete && images[idx].naturalWidth > 0) {
      return images[idx];
    }
    // Cerca il frame disponibile più vicino in avanti o indietro nel raggio di 25 frame
    for (let offset = 1; offset < 25; offset++) {
      const forward = idx + offset;
      if (forward < TOTAL_FRAMES && images[forward] && images[forward].complete && images[forward].naturalWidth > 0) {
        return images[forward];
      }
      const backward = idx - offset;
      if (backward >= 0 && images[backward] && images[backward].complete && images[backward].naturalWidth > 0) {
        return images[backward];
      }
    }
    return lastValidImage;
  }

  // ─── RENDER LOOP RAF A 60FPS ───
  function renderLoop() {
    const frameToDraw = Math.round(targetFrame);
    if (frameToDraw !== currentRenderedFrame) {
      drawCanvasFrame(frameToDraw);
    }
    requestAnimationFrame(renderLoop);
  }

  function drawCanvasFrame(idx) {
    if (!ctx) return;
    idx = Math.max(0, Math.min(idx, TOTAL_FRAMES - 1));

    const img = getBestImage(idx);
    if (!img) return;
    lastValidImage = img;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const ir = iw / ih, cr = canvasW / canvasH;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = canvasH; dw = dh * ir; dx = (canvasW - dw) / 2; dy = 0;
    } else {
      dw = canvasW; dh = dw / ir; dx = 0; dy = (canvasH - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
    currentRenderedFrame = idx;
  }

  // ─── SINCRONIZZAZIONE SCHEDE (SENZA SFARFALLII) ───
  function setActiveCard(sceneIdx) {
    if (!cards || cards.length === 0) return;
    if (sceneIdx === activeCardIndex) return;

    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    const exitDur = IS_MOBILE ? 0.2 : 0.35;
    const enterDur = IS_MOBILE ? 0.25 : 0.45;

    // Chiudi la scheda precedente
    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prevCard = cards[prevIdx];
      const prevProps = window.getSceneProps ? window.getSceneProps(prevIdx) : null;
      if (prevProps) {
        gsap.killTweensOf(prevCard);
        gsap.to(prevCard, { ...prevProps.exit, duration: exitDur, ease: "power2.in" });
      }
    }

    // Apri la nuova scheda
    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const nextCard = cards[sceneIdx];
      const nextProps = window.getSceneProps ? window.getSceneProps(sceneIdx) : null;
      if (nextProps) {
        gsap.killTweensOf(nextCard);
        gsap.fromTo(nextCard, nextProps.init, { ...nextProps.mid, duration: enterDur, ease: "power3.out" });
      }
    }
  }

  // ─── CARICAMENTO FRAME CON PARALLELISMO DIRETTO ───
  function preloadImages(onInitialReady) {
    let loadedCount = 0;
    let initialKeyframesCount = 45;

    function loadSingleFrame(i, cb) {
      if (images[i] !== null) {
        if (cb) cb();
        return;
      }
      const img = new Image();
      images[i] = img;

      const onDone = () => {
        loadedCount++;
        const pct = Math.min(100, Math.round((loadedCount / initialKeyframesCount) * 100));
        if (loaderBar) loaderBar.style.width = `${pct}%`;
        if (loaderText) loaderText.innerText = `Sincronizzazione Ecosistema... ${pct}%`;

        if (i === 0 && !lastValidImage) {
          lastValidImage = img;
          drawCanvasFrame(0);
        }

        if (loadedCount >= initialKeyframesCount && onInitialReady) {
          onInitialReady();
          onInitialReady = null;
          // Scarica l'intera sequenza rimanente in modo continuo
          loadRemainingStream();
        }
        if (cb) cb();
      };

      if (img.decode) {
        img.src = getFramePath(i);
        img.decode().then(onDone).catch(onDone);
      } else {
        img.onload = img.onerror = onDone;
        img.src = getFramePath(i);
      }
    }

    // Carica prioritariamente i primi 45 frame per avvio istantaneo
    for (let i = 0; i < initialKeyframesCount; i++) {
      loadSingleFrame(i);
    }

    // Flusso continuo di caricamento sequenziale verso il fondo
    function loadRemainingStream() {
      let currentIndex = initialKeyframesCount;
      const concurrency = 6; // 6 connessioni parallele contemporanee

      function loadNext() {
        if (currentIndex >= TOTAL_FRAMES) return;
        const indexToLoad = currentIndex++;
        loadSingleFrame(indexToLoad, () => {
          loadNext();
        });
      }

      for (let c = 0; c < concurrency; c++) {
        loadNext();
      }
    }
  }

  // ─── REGISTRAZIONE CARDS ───
  window.registerCards = function (cardElements) {
    cards = cardElements;
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === 0 ? props.mid : props.init);
      }
    });
    activeCardIndex = 0;
  };

  // ─── SCROLL ENGINE CON INFINITE LOOP ───
  function initTriggers() {
    if (IS_MOBILE) {
      // Mobile: IntersectionObserver
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.id.replace("trigger-", ""), 10);
            if (!isNaN(idx)) {
              setActiveCard(idx);
              const range = SCENE_RANGES[idx];
              if (range) targetFrame = range.start;
            }
          }
        });
      }, { rootMargin: "-30% 0px -30% 0px", threshold: 0.05 });

      for (let i = 0; i < SCENES_COUNT; i++) {
        const el = document.getElementById(`trigger-${i}`);
        if (el) observer.observe(el);
      }
    } else {
      // Desktop: Sincronizzazione frame continua su tutti i 12 capitoli
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = SCENE_RANGES[i];

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.15,
          onUpdate(self) {
            const currentF = range.start + self.progress * (range.end - range.start);
            targetFrame = currentF;

            if (self.isActive) {
              if (self.progress >= 0.15) {
                setActiveCard(i);
              } else if (self.progress < 0.15 && i > 0) {
                setActiveCard(i - 1);
              }
            }
          },
          onToggle(self) {
            if (self.isActive && i === 0) {
              setActiveCard(0);
            }
          }
        });
      }

      // ─── INFINITE LOOP TRIGGER (QUANDO ARRIVI ALLA FINE) ───
      ScrollTrigger.create({
        trigger: "#trigger-11",
        start: "bottom bottom",
        onEnter: () => {
          // Quando raggiunge il fondo, riavvolge istantaneamente all'inizio
          if (lenisInstance) {
            lenisInstance.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
          targetFrame = 0;
          setActiveCard(0);
        }
      });
    }

    if (typeof window.initCardAnimations === "function") {
      window.initCardAnimations();
    }
  }

  // ─── AVVIO APPLICAZIONE ───
  function startApp() {
    if (loader) {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 400);
    }

    if (!IS_MOBILE && typeof Lenis !== "undefined") {
      lenisInstance = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1.0
      });

      lenisInstance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    updateCanvasSize();
    window.addEventListener("resize", () => {
      updateCanvasSize();
      drawCanvasFrame(Math.round(targetFrame));
      ScrollTrigger.refresh();
    });

    initTriggers();
    requestAnimationFrame(renderLoop);
  }

  preloadImages(startApp);
})();
