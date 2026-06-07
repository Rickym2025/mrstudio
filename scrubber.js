/**
 * scrubber.js — Canvas & Video Hybrid Scrubber v8.4 (Mobile Native Engine)
 *
 * ARCHITETTURA:
 * - Desktop: Ripristino dei vecchi 11 ScrollTrigger individuali (allineamento perfetto confermato dall'utente).
 * - Desktop: Ritardo di attivazione delle card impostato alla soglia del 25% di ciascuna transizione video.
 * - Mobile: Sostituzione di ScrollTrigger con IntersectionObserver nativo per risposta immediata (0ms lag).
 * - Mobile: Disattivazione dinamica del backdrop-blur per eliminare il sovraccarico GPU causato dal video.
 */

(function () {
  "use strict";

  const IS_MOBILE = window.innerWidth < 768;

  // Iniezione dinamica delle ottimizzazioni mobile per eliminare i colli di bottiglia grafici
  if (IS_MOBILE) {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 767px) {
        .section-trigger { height: 110vh !important; }
        #trigger-0 { height: 40vh !important; }
        /* Rimuoviamo il backdrop-filter che manda in blocco la GPU su mobile sopra un video */
        .scene-card {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background-color: rgba(7, 7, 10, 0.97) !important;
        }
        header, .fixed.bottom-8 {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background-color: rgba(5, 5, 5, 0.95) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 1320 frame fisici su desktop (660 su mobile se attivo, ma ignorato in modalità MP4 mobile)
  const TOTAL_FRAMES = IS_MOBILE ? 660 : 1320;
  const SCENES_COUNT = 11; // trigger-0 … trigger-10

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // Mappatura temporale precisa (in secondi) di background.mp4 basata sui 1320 frame a 30fps
  function getSceneTimeRange(index) {
    const ranges = [
      [0.0, 1.0],      // Scena 0: RM Studio Intro (frame 0-30)
      [1.0, 4.0],      // Scena 1: NexusAI (frame 30-120)
      [4.0, 8.0],      // Scena 2: Concierge24 (frame 120-240)
      [8.0, 12.0],     // Scena 3: Dentis (frame 240-360)
      [12.0, 16.0],    // Scena 4: Lexis AI (frame 360-480)
      [16.0, 20.0],    // Scena 5: DriveMotion (frame 480-600)
      [20.0, 24.0],    // Scena 6: HomeTour AI (frame 600-720)
      [24.0, 28.0],    // Scena 7: OmniaStudio (frame 720-840)
      [28.0, 32.0],    // Scena 8: FF Edizioni (frame 840-960)
      [32.0, 36.0],    // Scena 9: Ecosistema Connesso (frame 960-1080)
      [36.0, 43.9]     // Scena 10: Contatti (frame 1080-1320)
    ];
    return {
      start: ranges[index][0],
      end: ranges[index][1]
    };
  }

  // Helper per il range di frame su Desktop
  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30],
      [30, 120],
      [120, 240],
      [240, 360],
      [360, 480],
      [480, 600],
      [600, 720],
      [720, 840],
      [840, 960],
      [960, 1080],
      [1080, 1319]
    ];
    const r = ranges[index];
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

  // ─── PROGRESSO LOADER (Solo Desktop) ──────────────────────────────────────────
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

    // Transizioni veloci ed estremamente snelle su mobile per massimizzare la reattività
    const exitDur = IS_MOBILE ? 0.2 : 0.4;
    const enterDur = IS_MOBILE ? 0.25 : 0.5;

    // Anima l'uscita della scheda precedente
    if (prevIdx >= 0 && prevIdx < cards.length) {
      const prev = cards[prevIdx];
      const prevProps = window.getSceneProps && window.getSceneProps(prevIdx);
      if (prevProps) {
        gsap.killTweensOf(prev);
        gsap.to(prev, { ...prevProps.exit, duration: exitDur, ease: "power2.in" });
      }
    }

    // Anima l'entrata della scheda corrente
    if (sceneIdx >= 0 && sceneIdx < cards.length) {
      const card = cards[sceneIdx];
      const props = window.getSceneProps && window.getSceneProps(sceneIdx);
      if (props) {
        gsap.killTweensOf(card);
        gsap.fromTo(card, props.init, { ...props.mid, duration: enterDur, ease: "power3.out" });
      }
    }
  }

  let videoReady = false;

  // Funzione ultra-performante per gestire il playhead su mobile tramite GSAP Tween (Nessun lag di play/pause)
  function playMobileVideoSegment(index) {
    const videoEl = document.getElementById("immersive-video");
    if (!videoEl || !videoReady) return;

    const times = getSceneTimeRange(index);
    
    try {
      // Mettiamo in pausa il video per far gestire a GSAP il rendering dei frame in totale fluidità
      videoEl.pause();

      // Animiamo fluidamente il playhead del video verso la fine della scena target.
      // overwrite: "auto" cancella istantaneamente le transizioni precedenti se l'utente scorre velocemente.
      gsap.to(videoEl, {
        currentTime: times.end,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
    } catch (err) {
      console.warn("Smooth video transitions failed safely", err);
    }
  }

  window.registerCards = function (cardElements) {
    cards = cardElements;

    // Individua l'indice attivo iniziale in base allo scroll reale di caricamento
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

    // Mostra solo la scheda attiva al caricamento
    cards.forEach((card, i) => {
      const props = window.getSceneProps && window.getSceneProps(i);
      if (props) {
        gsap.set(card, i === activeCardIndex ? props.mid : props.init);
      }
    });

    // Se mobile, prepara e allinea l'avvio asincrono del video nativo
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

        // Fallback di sicurezza: se nessun evento spara entro 300ms, forziamo videoReady per evitare blocchi
        const fallbackTimer = setTimeout(() => {
          setupMobileVideo();
        }, 300);

        try {
          if (videoEl.readyState >= 1) {
            clearTimeout(fallbackTimer);
            setupMobileVideo();
          } else {
            const events = ["loadedmetadata", "loadeddata", "canplay", "play"];
            events.forEach(evt => {
              videoEl.addEventListener(evt, () => {
                clearTimeout(fallbackTimer);
                setupMobileVideo();
              }, { once: true });
            });
          }
        } catch (err) {
          console.warn("Dynamic video metadata check failed safely", err);
          setupMobileVideo();
        }

        // Sblocco proattivo del video al primo tocco o scroll (necessario per iOS/Safari in modalità risparmio energetico)
        const unblockVideo = () => {
          try {
            videoEl.play().then(() => {
              videoEl.pause();
            }).catch(() => {});
          } catch (e) {}
          window.removeEventListener("touchstart", unblockVideo);
          window.removeEventListener("scroll", unblockVideo);
        };
        window.addEventListener("touchstart", unblockVideo, { passive: true });
        window.addEventListener("scroll", unblockVideo, { passive: true });
      }
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

  // Non usato su mobile, preservato per desktop
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
      // Setup video nativo su mobile (Saltiamo preloading delle immagini per avvio istantaneo)
      const videoEl = document.getElementById("immersive-video");
      if (videoEl) {
        try {
          videoEl.setAttribute("playsinline", "");
          videoEl.setAttribute("webkit-playsinline", "");
          videoEl.setAttribute("muted", "");
          videoEl.setAttribute("preload", "auto");
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.load();
          
          videoEl.play().then(() => {
            videoEl.pause();
          }).catch(() => {
            // Silenziato in caso di blocco dell'autoplay
          });
        } catch (e) {
          console.warn("Video initial setups failed safely", e);
        }
      }

      // Risoluzione della race condition: attendiamo che il DOM sia completamente pronto
      // prima di eseguire startApp(), in modo che le schede in index.html vengano generate e trovate
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startApp);
      } else {
        setTimeout(startApp, 50);
      }
    } else {
      // Desktop (Invariato per non toccare le prestazioni ottimali già confermate)
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

  // ─── INIZIALIZZAZIONE TRIGGERS INDIVIDUALI (ALLINEAMENTO PERFETTO) ────────────
  function initTriggers() {
    if (IS_MOBILE) {
      const videoEl = document.getElementById("immersive-video");

      // MOBILE: Sostituiamo ScrollTrigger con IntersectionObserver nativo.
      // Gira direttamente sul thread del browser (compositor), offrendo tempi di risposta a 60fps e zero lag.
      try {
        const observerOptions = {
          root: null,
          rootMargin: "-25% 0px -25% 0px", // Zona attiva ristretta alla fascia centrale dello schermo
          threshold: 0.01
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idStr = entry.target.id;
              const idx = parseInt(idStr.replace("trigger-", ""), 10);
              if (!isNaN(idx)) {
                // Sincronizzazione ISTANTANEA della scheda attiva
                updateCardTimelineDirect(idx);

                // Controllo del video fluido tramite GSAP
                if (videoEl && videoReady) {
                  playMobileVideoSegment(idx);
                }
              }
            }
          });
        }, observerOptions);

        for (let i = 0; i < SCENES_COUNT; i++) {
          const trigger = document.getElementById(`trigger-${i}`);
          if (trigger) {
            observer.observe(trigger);
          }
        }
      } catch (err) {
        console.warn("IntersectionObserver initiation failed", err);
      }
    } else {
      // DESKTOP: Ritorno alle 11 istanze di ScrollTrigger individuali (confermato perfetto dall'utente)
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

            // Sincronizzazione controllata della scheda: compare solo dopo il 25% della transizione video
            if (self.isActive) {
              if (self.progress >= 0.25) {
                updateCardTimelineDirect(i);
              } else if (self.progress < 0.25 && i > 0) {
                updateCardTimelineDirect(i - 1);
              }
            }
          },
          onToggle(self) {
            if (self.isActive && i === 0) {
              updateCardTimelineDirect(0);
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
      loader.style.transition = "opacity 0.4s";
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 400);
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

  preloadImages();

})();