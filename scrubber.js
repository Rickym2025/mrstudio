/**
 * scrubber.js — RM Studio High-Performance Engine (On-Demand Streaming & Instant Load)
 */

(function () {
  "use strict";

  // Disabilita il ripristino automatico dello scroll di Chrome
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  const IS_MOBILE = window.innerWidth < 768;
  const TOTAL_FRAMES = IS_MOBILE ? 720 : 1440;
  const SCENES_COUNT = 12;

  // ─── STILI DINAMICI MOBILE ───
  if (IS_MOBILE) {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 767px) {
        .section-trigger { height: 120vh !important; }
        #trigger-0 { height: 50vh !important; }
        .scene-card {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background-color: rgba(7, 7, 10, 0.98) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    const clamped = Math.min(Math.max(1, n), 1440);
    return `frames/frame_${String(clamped).padStart(4, "0")}.jpg`;
  }

  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30], [30, 120], [120, 240], [240, 360],
      [360, 480], [480, 600], [600, 720], [720, 840],
      [840, 960], [960, 1080], [1080, 1200], [1200, 1439]
    ];
    return { start: ranges[index][0], end: ranges[index][1] };
  }

  function getSceneTimeRange(index) {
    const ranges = [
      [0.0, 1.0], [1.0, 4.0], [4.0, 8.0], [8.0, 12.0],
      [12.0, 16.0], [16.0, 20.0], [20.0, 24.0], [24.0, 28.0],
      [28.0, 32.0], [32.0, 36.0], [36.0, 40.0], [40.0, 47.9]
    ];
    return { start: ranges[index][0], end: ranges[index][1] };
  }

  // ─── STATO IMMAGINI E RENDERING ───
  const images = new Array(TOTAL_FRAMES).fill(null);
  const isLoaded = new Array(TOTAL_FRAMES).fill(false);
  let lastDrawnFrame = 0;
  let targetFrame = 0;
  let canvasW = 1, canvasH = 1, dpr = 1;
  let cards = null;
  let activeCardIndex = 0;
  let lenisInstance = null;

  // ─── DOM ───
  const canvas = document.getElementById("immersive-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const loader = document.getElementById("loader");

  // ─── PROCEDURAL WEBAUDIO (SOUND) ───
  let audioCtx = null, windGain = null, windOn = false, windTarget = 0;

  function initSoundEngine() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const len = audioCtx.sampleRate * 4;
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 2.8;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 360;
      lp.Q.value = 0.5;
      windGain = audioCtx.createGain();
      windGain.gain.value = 0;
      src.connect(lp).connect(windGain).connect(audioCtx.destination);
      src.start();

      setInterval(() => {
        if (!windOn || !windGain) return;
        const cur = windGain.gain.value;
        windGain.gain.value = cur + (windTarget - cur) * 0.08;
      }, 40);
    } catch (e) {
      console.warn("Audio not supported", e);
    }
  }

  window.toggleSound = function () {
    if (!audioCtx) initSoundEngine();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    windOn = !windOn;
    windTarget = windOn ? 0.06 : 0;
    if (!windOn && windGain) windGain.gain.value = 0;
    const btn = document.getElementById("sound-toggle-btn");
    if (btn) {
      btn.innerHTML = windOn 
        ? `<span class="w-2 h-2 rounded-full bg-[#F2D28B] animate-pulse inline-block mr-1"></span> AUDIO ON` 
        : `AUDIO OFF`;
    }
  };

  // ─── CARICAMENTO ON-DEMAND ISTANTANEO ───
  function requestFrameLoad(idx) {
    idx = Math.max(0, Math.min(idx, TOTAL_FRAMES - 1));
    if (images[idx] !== null) return;

    const img = new Image();
    images[idx] = img;
    img.onload = () => {
      isLoaded[idx] = true;
      // Se lo scroll è fermo su questo frame o nelle vicinanze, ridisegna subito
      if (Math.abs(Math.round(targetFrame) - idx) < 3) {
        drawFrame(idx);
      }
    };
    img.src = getFramePath(idx);
  }

  // Pre-carica una finestra attorno alla posizione attuale
  function preloadWindow(centerIdx) {
    const windowSize = 8;
    for (let i = -windowSize; i <= windowSize; i++) {
      const target = centerIdx + i;
      if (target >= 0 && target < TOTAL_FRAMES) {
        requestFrameLoad(target);
      }
    }
  }

  // ─── CANVAS DRAWING ULTRA VELOCE ───
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

  function drawFrame(idx) {
    if (!ctx) return;
    idx = Math.max(0, Math.min(idx, TOTAL_FRAMES - 1));

    // Trova il frame migliore pronto all'uso
    let img = null;
    if (isLoaded[idx] && images[idx]) {
      img = images[idx];
      lastDrawnFrame = idx;
    } else if (isLoaded[lastDrawnFrame] && images[lastDrawnFrame]) {
      img = images[lastDrawnFrame];
    } else {
      // Cerca nei frame adiacenti
      for (let offset = 1; offset < 20; offset++) {
        const back = idx - offset;
        if (back >= 0 && isLoaded[back] && images[back]) {
          img = images[back];
          lastDrawnFrame = back;
          break;
        }
        const fwd = idx + offset;
        if (fwd < TOTAL_FRAMES && isLoaded[fwd] && images[fwd]) {
          img = images[fwd];
          lastDrawnFrame = fwd;
          break;
        }
      }
    }

    if (!img) return;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const ir = iw / ih, cr = canvasW / canvasH;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = canvasH; dw = dh * ir; dx = (canvasW - dw) / 2; dy = 0;
    } else {
      dw = canvasW; dh = dw / ir; dx = 0; dy = (canvasH - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ─── CARD TIMELINE CONTROLLER ───
  function updateCardTimelineDirect(sceneIdx, force = false) {
    if (!cards || cards.length === 0) return;
    if (sceneIdx === activeCardIndex && !force) return;

    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    const exitDur = IS_MOBILE ? 0.2 : 0.3;
    const enterDur = IS_MOBILE ? 0.25 : 0.4;

    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps && window.getSceneProps(prevIdx);
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: exitDur, ease: "power2.in" });
      }
    }

    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const card = cards[sceneIdx];
      const props = window.getSceneProps && window.getSceneProps(sceneIdx);
      if (props) {
        gsap.killTweensOf(card);
        gsap.fromTo(card, props.init, { ...props.mid, duration: enterDur, ease: "power3.out" });
      }
    }
  }

  window.registerCards = function (cardElements) {
    cards = cardElements;
    activeCardIndex = 0;
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        // FORZA LA SCHEDA 0 VISIBILE, LE ALTRE NASCOSTE
        gsap.set(card, i === 0 ? props.mid : props.init);
      }
    });
  };

  // ─── SCROLLTRIGGERS E SINCRONIZZAZIONE ───
  function initTriggers(lenis) {
    for (let i = 0; i < SCENES_COUNT; i++) {
      const range = getSceneFrameRange(i);

      ScrollTrigger.create({
        trigger: `#trigger-${i}`,
        start: "top top",
        end: "bottom top",
        scrub: 0.15,
        onUpdate(self) {
          const currentFrame = range.start + self.progress * (range.end - range.start);
          targetFrame = currentFrame;
          const targetInt = Math.round(currentFrame);

          // Richiede e disegna il frame
          requestFrameLoad(targetInt);
          preloadWindow(targetInt);
          drawFrame(targetInt);

          // Transizione scheda coordinata
          if (self.isActive) {
            if (self.progress >= 0.12 && self.progress <= 0.95) {
              updateCardTimelineDirect(i);
            } else if (self.progress < 0.12 && i > 0) {
              updateCardTimelineDirect(i - 1);
            }
          }
        },
        onToggle(self) {
          if (self.isActive) {
            updateCardTimelineDirect(i);
          }
        }
      });
    }

    // ─── INFINITE LOOP TRIGGER (AL FONDO RIPARTE DA CAPO) ───
    ScrollTrigger.create({
      trigger: "#trigger-11",
      start: "bottom bottom",
      onEnter: () => {
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        targetFrame = 0;
        drawFrame(0);
        updateCardTimelineDirect(0, true);
      }
    });

    if (typeof window.initCardAnimations === "function") {
      window.initCardAnimations();
    }
  }

  // ─── AVVIO IMMEDIATO (0 SECONDI DI ATTESA) ───
  function startApp() {
    // Rimuove il loader all'istante
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 300);
    }

    updateCanvasSize();
    window.addEventListener("resize", () => {
      updateCanvasSize();
      drawFrame(Math.round(targetFrame));
      ScrollTrigger.refresh();
    });

    if (!IS_MOBILE && typeof Lenis !== "undefined") {
      lenisInstance = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      lenisInstance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    initTriggers(lenisInstance);

    // Carica subito i primi 10 frame della Scena 0 per avvio perfetto
    for (let i = 0; i < 15; i++) {
      requestFrameLoad(i);
    }
  }

  // Avvio istantaneo appena caricato il primo fotogramma
  const initialFrame = new Image();
  initialFrame.onload = () => {
    isLoaded[0] = true;
    images[0] = initialFrame;
    updateCanvasSize();
    drawFrame(0);
    startApp();
  };
  initialFrame.onerror = () => {
    startApp();
  };
  initialFrame.src = getFramePath(0);
})();
