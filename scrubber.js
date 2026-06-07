/**
 * scrubber.js — Canvas (Desktop) & Video Scrubber (Mobile) Architecture v5.0
 *
 * ARCHITETTURA CHIAVE:
 * - Desktop: Ripristinato lo scrubbing lineare originale iper-reattivo basato su canvas con immagini.
 * - Mobile: Usa direttamente il video background.mp4 accelerato via hardware.
 * - Alla variazione della scheda, il player video si sposta istantaneamente e fluidamente sul secondo esatto della scena corrente.
 * - Rilevamento automatico dell'indice di caricamento per eliminare il flash iniziale.
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // 1320 frame fisici per desktop
  const TOTAL_FRAMES = 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    return `frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
  }

  // ─── STATO ───────────────────────────────────────────────────────────────────
  const images = new Array(TOTAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 1, canvasH = 1, dpr = 1;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("immersive-canvas");
  const ctx    = canvas.getContext("2d");
  const loader = document.getElementById("loader");

  // ─── CANVAS SIZING (DESKTOP) ───────────────────────────────────────────────────
  function updateCanvasSize() {
    if (IS_MOBILE) return;
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
    const progress = scrollTracker.frame / (TOTAL_FRAMES - 1);
    drawFrameFromProgress(progress);
  }

  // ─── DRAW CANVAS (DESKTOP) ───────────────────────────────────────────────────
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

  // Mappatura non-lineare desktop originale
  function drawFrameFromProgress(progress) {
    const sceneIdx = Math.min(Math.floor(progress * SCENES_COUNT), SCENES_COUNT - 1);
    const sceneProgress = (progress * SCENES_COUNT) - sceneIdx;
    
    let videoFrame = 1;
    if (sceneIdx === 0) {
      videoFrame = 1 + sceneProgress * 29;
    } else if (sceneIdx === 1) {
      videoFrame = 30 + sceneProgress * 90;
    } else if (sceneIdx === 10) {
      videoFrame = 1080 + sceneProgress * 240;
    } else {
      videoFrame = (sceneIdx - 1) * 120 + sceneProgress * 120;
    }

    const idx = Math.max(0, Math.min(Math.round(videoFrame - 1), TOTAL_FRAMES - 1));
    drawFrame(idx);
  }

  // ─── TEMPORIZZAZIONE VIDEO IN SECONDI (MOBILE) ─────────────────────────────────
  function getTargetTimeForScene(index) {
    const frameRanges = [
      0,     // Scena 0: RM Studio Intro (0.0s)
      120,   // Scena 1: NexusAI (4.0s)
      240,   // Scena 2: Concierge24 (8.0s)
      360,   // Scena 3: Dentis (12.0s)
      480,   // Scena 4: Lexis AI (16.0s)
      600,   // Scena 5: DriveMotion (20.0s)
      720,   // Scena 6: HomeTour AI (24.0s)
      840,   // Scena 7: OmniaStudio (28.0s)
      960,   // Scena 8: FF Edizioni (32.0s)
      1080,  // Scena 9: Ecosistema Connesso (36.0s)
      1319   // Scena 10: Contatti (43.9s)
    ];
    return frameRanges[index] / 30;
  }

  // ─── CARD SYNC ───────────────────────────────────────────────────────────────
  let cards = null;
  let activeCardIndex = 0;

  function updateCardTimeline(progress) {
    if (!cards || cards.length === 0) return;

    const sceneIdx = Math.min(
      Math.floor(progress * SCENES_COUNT),
      SCENES_COUNT - 1
    );

    if (sceneIdx === activeCardIndex) return;
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

  // Chiamata da initCardAnimations (in index.html) per registrare i riferimenti
  window.registerCards = function (cardElements) {
    cards = cardElements;
    
    // Individua l'indice iniziale esatto in base alla posizione reale al caricamento
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

    // Se mobile, allinea subito il video al secondo corrispondente
    if (IS_MOBILE) {
      const video = document.getElementById("immersive-video");
      if (video) {
        video.currentTime = getTargetTimeForScene(activeCardIndex);
      }
    }

    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });
  };

  // ─── PRELOAD CARICAMENTO IMMAGINI (SOLO DESKTOP) ──────────────────────────────
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
      drawFrame(0);
      startApp();
      const PRI = Math.min(80, TOTAL_FRAMES);
      for (let i = 1; i < PRI; i++) loadFrame(i, null);
      setTimeout(() => loadBatch(PRI, 50), 200);
    });
  }

  // ─── START MOBILE (NATIVE VIDEO) ──────────────────────────────────────────────
  function startAppMobile() {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 700);
    }

    const video = document.getElementById("immersive-video");
    if (video) {
      // Warm-up per sbloccare l'audio/video decoder sui dispositivi iOS Safari
      const warmUpVideo = () => {
        video.play().then(() => {
          video.pause();
        }).catch(err => console.log("Video warm-up deferred:", err));
        document.removeEventListener("touchstart", warmUpVideo);
      };
      document.addEventListener("touchstart", warmUpVideo);
    }

    // Gestione reattiva e lineare globale su Mobile
    ScrollTrigger.create({
      trigger: "#app-container",
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        const progress = self.progress;
        const sceneIdx = Math.min(
          Math.floor(progress * SCENES_COUNT),
          SCENES_COUNT - 1
        );

        if (sceneIdx === activeCardIndex) return;
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

        // Spostamento fluido accelerato hardware della riproduzione MP4
        if (video) {
          const targetTime = getTargetTimeForScene(sceneIdx);
          gsap.to(video, {
            currentTime: targetTime,
            duration: 1.2,
            ease: "power1.out",
            overwrite: "auto"
          });
        }
      }
    });

    if (typeof initCardAnimations === "function") {
      initCardAnimations();
    }
  }

  // ─── START DESKTOP (CANVAS IMAGES) ───────────────────────────────────────────
  function startApp() {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 700);
    }

    resizeCanvas();
    let rsTimer;
    window.addEventListener("resize", () => {
      clearTimeout(rsTimer);
      rsTimer = setTimeout(resizeCanvas, 80);
    });

    // Unico trigger globale lineare come richiesto
    gsap.to(scrollTracker, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#app-container",
        start: "top top",
        end:   "bottom bottom",
        scrub: 0.5,
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

  // ─── ENTRY POINT INIZIALE ───
  if (IS_MOBILE) {
    startAppMobile();
  } else {
    preloadImages();
  }

})();