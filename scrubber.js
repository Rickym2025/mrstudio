/**
 * scrubber.js — RM Studio Ultra-Smooth Progressive Canvas Engine
 * 720 Frames (2x Fluidity) + Instant Site Launch + Background Streaming
 */

(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  // 1 frame ogni 2 = 720 frame totali (doppia fluidità rispetto a prima)
  const STEP = 2;
  const TOTAL_FRAMES = 1440;
  const TOTAL_SAMPLES = Math.floor(TOTAL_FRAMES / STEP); // 720 immagini
  const SCENES_COUNT = 12;

  // Intervalli esatti per le 12 presentazioni
  const SCENE_RANGES = [
    { start: 0,    end: 30 },    // 0: Intro RM Studio
    { start: 30,   end: 120 },   // 1: NexusAI
    { start: 120,  end: 240 },   // 2: Concierge24
    { start: 240,  end: 360 },   // 3: Dentis
    { start: 360,  end: 480 },   // 4: Lexis AI
    { start: 480,  end: 600 },   // 5: DriveMotion
    { start: 600,  end: 720 },   // 6: HomeTour AI
    { start: 720,  end: 840 },   // 7: OmniaStudio
    { start: 840,  end: 960 },   // 8: FF Edizioni
    { start: 960,  end: 1080 },  // 9: Vision
    { start: 1080, end: 1200 },  // 10: Ecosistema
    { start: 1200, end: 1439 }   // 11: Contatti
  ];

  function getFramePathBySample(sampleIndex) {
    const frameNumber = Math.min(TOTAL_FRAMES, (sampleIndex * STEP) + 1);
    return `frames/frame_${String(frameNumber).padStart(4, "0")}.jpg`;
  }

  // ─── STATO ───
  const images = new Array(TOTAL_SAMPLES).fill(null);
  const isLoaded = new Array(TOTAL_SAMPLES).fill(false);
  let lastDrawnImg = null;
  let canvasW = 1, canvasH = 1, dpr = 1;
  let targetFrame = 0;
  let cards = null;
  let activeCardIndex = 0;
  let lenisInstance = null;

  // ─── DOM ───
  const canvas = document.getElementById("immersive-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const loader = document.getElementById("loader");

  // ─── PROCEDURAL WEBAUDIO (SOUND) ───
  let audioCtx = null, windGain = null, windOn = false;

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
    } catch (e) {
      console.warn("Audio not supported", e);
    }
  }

  window.toggleSound = function () {
    if (!audioCtx) initSoundEngine();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    windOn = !windOn;
    if (windGain) windGain.gain.value = windOn ? 0.08 : 0;
    const btn = document.getElementById("sound-toggle-btn");
    if (btn) {
      btn.innerHTML = windOn 
        ? `<span class="w-2 h-2 rounded-full bg-[#F2D28B] animate-pulse inline-block mr-1"></span> AUDIO ON` 
        : `AUDIO OFF`;
    }
  };

  // ─── RESIZE CANVAS CON SCALING RETINA ───
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

  // ─── RICERCA FRAME INTELLIGENTE PER SCROLL ULTRA-RAPIDO ───
  function getBestAvailableImage(sampleIdx) {
    if (isLoaded[sampleIdx] && images[sampleIdx]) {
      return images[sampleIdx];
    }
    // Cerca il fotogramma più vicino nel raggio di 25 frame
    for (let offset = 1; offset < 25; offset++) {
      const back = sampleIdx - offset;
      if (back >= 0 && isLoaded[back] && images[back]) {
        return images[back];
      }
      const fwd = sampleIdx + offset;
      if (fwd < TOTAL_SAMPLES && isLoaded[fwd] && images[fwd]) {
        return images[fwd];
      }
    }
    return lastDrawnImg;
  }

  // ─── RENDERING CANVAS (0.1ms DALLA RAM) ───
  function drawSample(sampleIdx) {
    if (!ctx) return;
    sampleIdx = Math.max(0, Math.min(sampleIdx, TOTAL_SAMPLES - 1));
    
    const img = getBestAvailableImage(sampleIdx);
    if (!img || !img.complete || img.naturalWidth === 0) return;
    lastDrawnImg = img;

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

  // ─── TRANSIZIONI SCHEDE ───
  function updateActiveCard(idx, force = false) {
    if (!cards || (!force && idx === activeCardIndex)) return;
    const prevIdx = activeCardIndex;
    activeCardIndex = idx;

    const exitDur = 0.3;
    const enterDur = 0.4;

    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps ? window.getSceneProps(prevIdx) : null;
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: exitDur, ease: "power2.in" });
      }
    }

    if (idx >= 0 && idx < cards.length) {
      const next = cards[idx];
      const nextProps = window.getSceneProps ? window.getSceneProps(idx) : null;
      if (nextProps) {
        gsap.killTweensOf(next);
        gsap.fromTo(next, nextProps.init, { ...nextProps.mid, duration: enterDur, ease: "power3.out" });
      }
    }
  }

  window.registerCards = function (cardElements) {
    cards = cardElements;
    activeCardIndex = 0;
    cards.forEach((card, i) => {
      if (window.getSceneProps) {
        gsap.set(card, i === 0 ? window.getSceneProps(i).mid : window.getSceneProps(i).init);
      }
    });
  };

  // ─── CARICAMENTO SINGOLO FRAME ───
  function loadSingleSample(i, cb) {
    if (images[i] !== null) {
      if (cb) cb();
      return;
    }
    const img = new Image();
    images[i] = img;
    img.onload = () => {
      isLoaded[i] = true;
      if (cb) cb();
    };
    img.onerror = () => {
      if (cb) cb();
    };
    img.src = getFramePathBySample(i);
  }

  // ─── STREAMING IN BACKGROUND CONTINUO ───
  function startBackgroundStreaming() {
    let currentIdx = 20; // Inizia dal 20° frame (i primi 20 sono già pronti)
    const concurrency = 6;

    function worker() {
      if (currentIdx >= TOTAL_SAMPLES) return;
      const idx = currentIdx++;
      loadSingleSample(idx, () => {
        worker();
      });
    }

    for (let c = 0; c < concurrency; c++) {
      worker();
    }
  }

  // ─── AVVIO SCROLL ENGINE ───
  function startEngine() {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 300);
    }

    updateCanvasSize();
    window.addEventListener("resize", () => {
      updateCanvasSize();
      const currentSample = Math.floor(targetFrame / STEP);
      drawSample(currentSample);
      ScrollTrigger.refresh();
    });

    if (typeof Lenis !== "undefined") {
      lenisInstance = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      lenisInstance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // ScrollTrigger sulle 12 scene
    for (let i = 0; i < SCENES_COUNT; i++) {
      const range = SCENE_RANGES[i];

      ScrollTrigger.create({
        trigger: `#trigger-${i}`,
        start: "top top",
        end: "bottom top",
        scrub: 0.1,
        onUpdate(self) {
          const currentFrame = range.start + self.progress * (range.end - ran
