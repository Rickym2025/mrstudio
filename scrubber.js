/**
 * scrubber.js — RM Studio Hybrid Canvas & Video Engine v9.1 (Restored & Optimized)
 * Sincronizzato con Lenis Smooth Scroll + Single RAF Loop + Procedural WebAudio + Infinite Loop
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;
  const TOTAL_FRAMES = IS_MOBILE ? 720 : 1440;
  const SCENES_COUNT = 12; // 0 .. 11

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
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  function getSceneTimeRange(index) {
    const ranges = [
      [0.0, 1.0], [1.0, 4.0], [4.0, 8.0], [8.0, 12.0],
      [12.0, 16.0], [16.0, 20.0], [20.0, 24.0], [24.0, 28.0],
      [28.0, 32.0], [32.0, 36.0], [36.0, 40.0], [40.0, 47.9]
    ];
    return { start: ranges[index][0], end: ranges[index][1] };
  }

  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30], [30, 120], [120, 240], [240, 360],
      [360, 480], [480, 600], [600, 720], [720, 840],
      [840, 960], [960, 1080], [1080, 1200], [1200, 1439]
    ];
    return { start: ranges[index][0], end: ranges[index][1] };
  }

  // ─── STATO ───
  const images = new Array(TOTAL_FRAMES).fill(null);
  let lastLoadedImg = null;
  const scrollTracker = { frame: 0 };
  let canvasW = 1, canvasH = 1, dpr = 1;
  let videoReady = false;
  let isLooping = false;
  let currentTargetTime = 0;
  let lastProgress = 0, scrollVelocity = 0;
  let lenis = null;

  // ─── DOM ───
  const canvas = document.getElementById("immersive-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderText = document.getElementById("loader-text");
  let loadedCount = 0;

  // ─── PROCEDURAL WEBAUDIO (SOUND SYNTHESIS) ───
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
      console.warn("Audio synthesis not supported", e);
    }
  }

  function updateSoundVelocity(v) {
    if (!windOn) return;
    windTarget = Math.min(0.04 + v * 35, 0.28);
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

  // ─── PROGRESSO LOADER ───
  function updateLoaderProgress() {
    loadedCount++;
    const pct = Math.min(100, Math.round((loadedCount / 60) * 100));
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.innerText = `Calibrazione Ecosistema... ${pct}%`;
  }

  // ─── CANVAS SIZING & RENDER O(1) FLUIDO ───
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

  function resizeCanvas() {
    updateCanvasSize();
    drawFrame(Math.max(0, Math.min(Math.round(scrollTracker.frame), TOTAL_FRAMES - 1)));
  }

  function drawFrame(idx) {
    if (!ctx) return;
    let img = images[idx];
    
    // Ricerca istantanea O(1) del frame disponibile più vicino
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (lastLoadedImg) {
        img = lastLoadedImg;
      } else {
        return;
      }
    } else {
      lastLoadedImg = img;
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
  }

  // ─── CARD SYNC & SCENE PROPS ───
  let cards = null;
  let activeCardIndex = 0;

  function updateCardTimelineDirect(sceneIdx, force = false) {
    if (window.isAutoScrolling && !force) return;
    if (!cards || cards.length === 0) return;
    if (sceneIdx === activeCardIndex && !force) return;

    const prevIdx = activeCardIndex;
    activeCardIndex = sceneIdx;

    const exitDur = IS_MOBILE ? 0.2 : 0.35;
    const enterDur = IS_MOBILE ? 0.25 : 0.45;

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

  window.forceUpdateCard = function(sceneIdx) {
    updateCardTimelineDirect(sceneIdx, true);
  };

  // ─── MOBILE VIDEO PLAYBACK ENGINE ───
  function playMobileVideoSegment(index) {
    const videoEl = document.getElementById("immersive-video");
    if (!videoEl || !videoReady) return;
    const times = getSceneTimeRange(index);
    try {
      if (videoEl.currentTime >= times.start && videoEl.currentTime < times.end && !videoEl.paused) {
        currentTargetTime = times.end;
        return;
      }
      videoEl.pause();
      if (Math.abs(videoEl.currentTime - times.start) > 0.4) {
        videoEl.currentTime = times.start;
      }
      currentTargetTime = times.end;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (!isLooping) {
            isLooping = true;
            requestAnimationFrame(monitorVideoPlayback);
          }
        }).catch(() => {
          try { videoEl.currentTime = times.end; } catch (e) {}
        });
      }
    } catch (err) {
      console.warn("Mobile video sync fallback", err);
    }
  }

  function monitorVideoPlayback() {
    if (!isLooping) return;
    const videoEl = document.getElementById("immersive-video");
    if (!videoEl || videoEl.currentTime >= currentTargetTime) {
      if (videoEl) videoEl.pause();
      isLooping = false;
      return;
    }
    requestAnimationFrame(monitorVideoPlayback);
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

    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) gsap.set(card, i === activeCardIndex ? props.mid : props.init);
    });

    if (IS_MOBILE) {
      const videoEl = document.getElementById("immersive-video");
      if (videoEl) {
        let setupDone = false;
        const setupMobileVideo = () => {
          if (setupDone) return;
          setupDone = true;
          videoReady = true;
          playMobileVideoSegment(activeCardIndex);
        };
        setTimeout(setupMobileVideo, 300);
        if (videoEl.readyState >= 1) setupMobileVideo();
        else videoEl.addEventListener("loadeddata", setupMobileVideo, { once: true });
      }
    }
  };

  // ─── PRELOAD ASINCRONO ISTANTANEO (COME NEL TUO ORIGINALE) ───
  function loadFrame(i, cb) {
    if (images[i] !== null) { cb && cb(); return; }
    const img = new Image();
    images[i] = img;
    img.onload = img.onerror = () => {
      if (!lastLoadedImg && i === 0) lastLoadedImg = img;
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
      loadFrame(i, () => {
        if (++done === n) setTimeout(() => loadBatch(to, size), 10);
      });
    }
  }

  function preloadImages() {
    if (IS_MOBILE) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startApp);
      } else {
        setTimeout(startApp, 50);
      }
    } else {
      // Carica il Frame 0 e APRE SUBITO IL SITO senza attese
      loadFrame(0, () => {
        updateCanvasSize();
        drawFrame(0);
        startApp();
        // Carica le prime 60 immagini prioritariamente e poi scarica a flusso continuo
        const PRI = Math.min(60, TOTAL_FRAMES);
        for (let i = 1; i < PRI; i++) loadFrame(i, null);
        setTimeout(() => loadBatch(PRI, 50), 50);
      });
    }
  }

  // ─── INITIALIZATION CON LENIS + SCROLLTRIGGER + INFINITE LOOP ───
  function initTriggers(lenisInstance) {
    if (IS_MOBILE) {
      const videoEl = document.getElementById("immersive-video");
      try {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idx = parseInt(entry.target.id.replace("trigger-", ""), 10);
              if (!isNaN(idx)) {
                updateCardTimelineDirect(idx);
                if (videoEl && videoReady) playMobileVideoSegment(idx);
              }
            }
          });
        }, { root: null, rootMargin: "-25% 0px -25% 0px", threshold: 0.01 });

        for (let i = 0; i < SCENES_COUNT; i++) {
          const el = document.getElementById(`trigger-${i}`);
          if (el) observer.observe(el);
        }
      } catch (err) {
        console.warn("IntersectionObserver init fallback", err);
      }
    } else {
      // DESKTOP: Sincronizzazione 1:1 per ciascuna delle 12 scene
      for (let i = 0; i < SCENES_COUNT; i++) {
        const range = getSceneFrameRange(i);

        ScrollTrigger.create({
          trigger: `#trigger-${i}`,
          start: "top top",
          end: "bottom top",
          scrub: 0.2,
          onUpdate(self) {
            const currentFrame = range.start + self.progress * (range.end - range.start);
            scrollTracker.frame = currentFrame;
            drawFrame(Math.max(0, Math.min(Math.round(currentFrame), TOTAL_FRAMES - 1)));

            // Calcolo velocità per WebAudio Sound Design
            const curP = self.progress;
            scrollVelocity = scrollVelocity * 0.85 + Math.abs(curP - lastProgress) * 0.15;
            lastProgress = curP;
            updateSoundVelocity(scrollVelocity);

            if (self.isActive) {
              if (self.progress >= 0.15 && self.progress <= 0.95) {
                updateCardTimelineDirect(i);
              } else if (self.progress < 0.15 && i > 0) {
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

      // ─── INFINITE LOOP TRIGGER (FINE SCENA 11 -> RITORNO ALL'INIZIO) ───
      ScrollTrigger.create({
        trigger: "#trigger-11",
        start: "bottom bottom",
        onEnter: () => {
          if (lenisInstance) {
            lenisInstance.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
          scrollTracker.frame = 0;
          drawFrame(0);
          updateCardTimelineDirect(0, true);
        }
      });
    }

    if (typeof window.initCardAnimations === "function") {
      window.initCardAnimations();
    }
  }

  // ─── START APP & LENIS SETUP ───
  function startApp() {
    if (loader) {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 400);
    }

    if (!IS_MOBILE && typeof Lenis !== "undefined") {
      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    if (!IS_MOBILE) {
      resizeCanvas();
      let rsTimer;
      window.addEventListener("resize", () => {
        clearTimeout(rsTimer);
        rsTimer = setTimeout(() => {
          resizeCanvas();
          ScrollTrigger.refresh();
        }, 80);
      });
    }

    initTriggers(lenis);
  }

  preloadImages();
})();
