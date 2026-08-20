/**
 * scrubber.js — RM Studio High-Performance Engine (Synchronized & Lag-Free)
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
  let isTransitioning = false;

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

  // ─── RENDER LOOP RAF (Nessun blocco del browser) ───
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

    let img = images[idx];
    if (img && img.complete && img.naturalWidth > 0) {
      lastValidImage = img;
    } else if (lastValidImage) {
      img = lastValidImage;
    } else {
      return;
    }

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

  // ─── SINCRONIZZAZIONE PRECISA CARD <-> SCENA ───
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

  // ─── PRELOAD ASINCRONO AD ALTA PRIORITÀ ───
  function preloadImages(onInitialReady) {
    let loadedCount = 0;
    const initialKeyframes = [];

    // 1. Carica subito i primi frame chiave di ciascuna delle 12 scene
    SCENE_RANGES.forEach(range => {
      initialKeyframes.push(range.start);
      initialKeyframes.push(Math.floor((range.start + range.end) / 2));
    });

    function loadImage(i, isPriority = false) {
      if (images[i] !== null) return;
      const img = new Image();
      images[i] = img;

      const onDone = () => {
        loadedCount++;
        const pct = Math.min(100, Math.round((loadedCount / (initialKeyframes.length + 60)) * 100));
        if (loaderBar) loaderBar.style.width = `${pct}%`;
        if (loaderText) loaderText.innerText = `Sincronizzazione Ecosistema... ${pct}%`;

        if (i === 0 && !lastValidImage) {
          lastValidImage = img;
          drawCanvasFrame(0);
        }

        if (loadedCount >= initialKeyframes.length && onInitialReady) {
          onInitialReady();
          onInitialReady = null;
          // Continua a scaricare il resto dei frame in background in modo non bloccante
          loadRemainingFrames();
        }
      };

      if (img.decode) {
        img.src = getFramePath(i);
        img.decode().then(onDone).catch(onDone);
      } else {
        img.onload = img.onerror = onDone;
        img.src = getFramePath(i);
      }
    }

    // Carica prioritari
    initialKeyframes.forEach(idx => loadImage(idx, true));
    for (let i = 0; i < 40; i++) loadImage(i, true);

    // Caricamento progressivo delle rimanenti immagini a batch
    function loadRemainingFrames() {
      let currentBatchIndex = 0;
      function nextBatch() {
        const end = Math.min(currentBatchIndex + 30, TOTAL_FRAMES);
        for (let i = currentBatchIndex; i < end; i++) {
          loadImage(i, false);
        }
        currentBatchIndex = end;
        if (currentBatchIndex < TOTAL_FRAMES) {
          setTimeout(nextBatch, 25);
        }
      }
      nextBatch();
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

  // ─── SCROLLTRIGGER & LENIS SETUP ───
  function initTriggers(lenisInstance) {
    if (IS_MOBILE) {
      // Setup Mobile con IntersectionObserver leggero
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
      // Setup Desktop: ScrollTrigger dedicato per ogni capitolo con calcolo esatto
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = SCENE_RANGES[i];

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.1, // Scrub ultra reattivo
          onUpdate(self) {
            // Calcolo frame continuo e privo di scatti
            const currentF = range.start + self.progress * (range.end - range.start);
            targetFrame = currentF;

            // Transizione card al punto aureo del capitolo (20% dello scroll della sezione)
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

    let lenis = null;
    if (!IS_MOBILE && typeof Lenis !== "undefined") {
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1.0
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    updateCanvasSize();
    window.addEventListener("resize", () => {
      updateCanvasSize();
      drawCanvasFrame(Math.round(targetFrame));
      ScrollTrigger.refresh();
    });

    initTriggers(lenis);
    // Avvia il loop RAF separato
    requestAnimationFrame(renderLoop);
  }

  // Avvio con pre-caricamento intelligente
  preloadImages(startApp);
})();
