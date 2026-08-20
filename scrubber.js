/**
 * scrubber.js — Optimized Single-Timeline Canvas Engine
 */
(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;
  // Imposta il numero esatto di frame estratti (es. 300)
  const TOTAL_FRAMES = IS_MOBILE ? 150 : 300; 
  const SCENES_COUNT = 12;

  function getFramePath(i) {
    const n = i + 1;
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // ─── STATO ───
  const images = new Array(TOTAL_FRAMES).fill(null);
  let lastDrawnIndex = -1;
  let canvasW = 1, canvasH = 1, dpr = 1;
  let cards = [];
  let currentActiveCard = -1;

  // ─── DOM ───
  const canvas = document.getElementById("immersive-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderText = document.getElementById("loader-text");
  let loadedCount = 0;

  // ─── RESIZE CANVAS ───
  function updateCanvasSize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width || window.innerWidth;
    canvasH = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ─── DRAW FRAME (O(1) istantaneo) ───
  function drawFrame(idx) {
    if (!ctx) return;
    idx = Math.max(0, Math.min(idx, TOTAL_FRAMES - 1));
    
    // Trova il frame più vicino già caricato senza cicli pesanti
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (lastDrawnIndex >= 0 && images[lastDrawnIndex]) {
        img = images[lastDrawnIndex];
      } else {
        return;
      }
    } else {
      lastDrawnIndex = idx;
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

  // ─── SINCRONIZZAZIONE SCHEDE ───
  function updateActiveCard(index) {
    if (index === currentActiveCard || !cards.length) return;
    
    const prevIdx = currentActiveCard;
    currentActiveCard = index;

    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps ? window.getSceneProps(prevIdx) : null;
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: 0.3, ease: "power2.in" });
      }
    }

    if (index >= 0 && index < cards.length) {
      const current = cards[index];
      const props = window.getSceneProps ? window.getSceneProps(index) : null;
      if (props) {
        gsap.killTweensOf(current);
        gsap.fromTo(current, props.init, { ...props.mid, duration: 0.4, ease: "power3.out" });
      }
    }
  }

  // ─── CARICAMENTO FRAME CON DECODE ASINCRONO ───
  function preloadImages(onComplete) {
    let loaded = 0;
    // Carica prioritariamente i primi 15 frame, poi il resto
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      images[i] = img;

      const onImageReady = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        if (loaderBar) loaderBar.style.width = `${pct}%`;
        if (loaderText) loaderText.innerText = `Calibrazione Ecosistema... ${pct}%`;

        if (loaded === 1) {
          updateCanvasSize();
          drawFrame(0);
        }
        if (loaded >= Math.min(20, TOTAL_FRAMES)) {
          if (onComplete) {
            onComplete();
            onComplete = null; // esegui una sola volta
          }
        }
      };

      if (img.decode) {
        img.decode().then(onImageReady).catch(onImageReady);
      } else {
        img.onload = img.onerror = onImageReady;
      }
    }
  }

  // ─── REGISTRAZIONE CARDS ───
  window.registerCards = function (cardElements) {
    cards = cardElements;
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) gsap.set(card, i === 0 ? props.mid : props.init);
    });
    currentActiveCard = 0;
  };

  // ─── AVVIO SCENE & LENIS ───
  function startApp() {
    if (loader) {
      loader.style.transition = "opacity 0.5s ease";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 500);
    }

    // Lenis Smooth Scroll
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    updateCanvasSize();
    window.addEventListener("resize", () => {
      updateCanvasSize();
      drawFrame(lastDrawnIndex >= 0 ? lastDrawnIndex : 0);
      ScrollTrigger.refresh();
    });

    if (window.initCardAnimations) {
      window.initCardAnimations();
    }

    // ─── UNICO SCROLLTRIGGER GLOBALE MASTER ───
    ScrollTrigger.create({
      trigger: "#scroll-triggers",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
      onUpdate(self) {
        const frameIndex = Math.floor(self.progress * (TOTAL_FRAMES - 1));
        drawFrame(frameIndex);

        // Calcolo scena attiva proporzionale
        const sceneIndex = Math.min(
          SCENES_COUNT - 1,
          Math.floor(self.progress * SCENES_COUNT)
        );
        updateActiveCard(sceneIndex);
      }
    });
  }

  // Avvio
  preloadImages(startApp);
})();
