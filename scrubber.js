/**
 * scrubber.js — Canvas Frame Scrubber
 * Versione 2.0 — Riscritta completamente
 *
 * FIX principali:
 * 1. Array images sempre 0-based e allineato 1:1 con i file frame_XXXX.jpg
 * 2. getMappedFrame semplificata: mappatura lineare senza salti di sezione
 * 3. Canvas sizing corretto: su mobile occupa h-1/2, le dimensioni di disegno lo rispettano
 * 4. resizeCanvas non accumula scale() — usa save/restore correttamente
 * 5. Preload prioritizzato: prime 60 immagini immediate, poi batch progressivo
 * 6. drawFrame usa sempre naturalWidth/naturalHeight per il ratio corretto
 * 7. scrub ridotto su mobile per maggiore reattività
 */

(function () {
  "use strict";

  // ─── COSTANTI ────────────────────────────────────────────────────────────────
  const IS_MOBILE = window.innerWidth < 768;

  /**
   * Su mobile carichiamo 1 frame ogni 2 (frame dispari: 0001, 0003, 0005, ...)
   * Il totale di file fisici è 1320, ma ne usiamo 660 su mobile.
   * Su desktop usiamo tutti e 1320.
   */
  const TOTAL_LOGICAL_FRAMES = IS_MOBILE ? 660 : 1320;

  /**
   * Mappa un indice logico (0-based) al nome file corretto.
   * - Desktop: indice 0 → frame_0001.jpg, indice 1319 → frame_1320.jpg
   * - Mobile:  indice 0 → frame_0001.jpg, indice 1 → frame_0003.jpg (skip di 2)
   */
  function getFramePath(logicalIndex) {
    // logicalIndex è 0-based
    const fileIndex = IS_MOBILE
      ? logicalIndex * 2 + 1       // 0→1, 1→3, 2→5, ... 659→1319
      : logicalIndex + 1;          // 0→1, 1→2, ... 1319→1320
    return `frames/frame_${String(fileIndex).padStart(4, "0")}.jpg`;
  }

  // ─── STATO GLOBALE ───────────────────────────────────────────────────────────
  const images = new Array(TOTAL_LOGICAL_FRAMES).fill(null);
  const scrollTracker = { frame: 0 };
  let canvasW = 0;     // larghezza CSS del canvas (non DPR)
  let canvasH = 0;     // altezza CSS del canvas (non DPR)
  let currentDPR = 1;

  // ─── ELEMENTI DOM ────────────────────────────────────────────────────────────
  const canvas  = document.getElementById("immersive-canvas");
  const context = canvas.getContext("2d");
  const loader      = document.getElementById("loader");
  const loaderBar   = document.getElementById("loader-bar");
  const loaderText  = document.getElementById("loader-text");

  // ─── DIMENSIONI CANVAS ───────────────────────────────────────────────────────
  /**
   * Su mobile il canvas è posizionato come h-1/2 bottom (vedi CSS: h-1/2 md:h-full).
   * Calcoliamo le dimensioni reali dell'elemento per disegnare esattamente su di esso.
   */
  function getCanvasDimensions() {
    const rect = canvas.getBoundingClientRect();
    return {
      w: rect.width  || window.innerWidth,
      h: rect.height || (IS_MOBILE ? window.innerHeight / 2 : window.innerHeight),
    };
  }

  function resizeCanvas() {
    const { w, h } = getCanvasDimensions();
    canvasW = w;
    canvasH = h;

    // DPR capped: 1.5 su mobile, devicePixelRatio su desktop
    currentDPR = IS_MOBILE
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : (window.devicePixelRatio || 1);

    // Imposta dimensioni fisiche del buffer
    canvas.width  = Math.round(canvasW  * currentDPR);
    canvas.height = Math.round(canvasH * currentDPR);

    // Reset trasformazione e scala una sola volta (evita accumulo)
    context.setTransform(currentDPR, 0, 0, currentDPR, 0, 0);

    // Ridisegna il frame corrente con le nuove dimensioni
    const mappedIndex = getMappedIndex(scrollTracker.frame);
    drawFrame(mappedIndex);
  }

  // ─── MAPPATURA FRAME ─────────────────────────────────────────────────────────
  /**
   * Mappa scrollTracker.frame (0 → TOTAL_LOGICAL_FRAMES-1) a un indice logico
   * nell'array images (0-based).
   *
   * Logica semplificata: mappatura lineare 1:1.
   * Il GSAP porta frame da 0 a TOTAL_LOGICAL_FRAMES-1 → usiamo direttamente.
   */
  function getMappedIndex(rawFrame) {
    const idx = Math.round(rawFrame);
    return Math.max(0, Math.min(idx, TOTAL_LOGICAL_FRAMES - 1));
  }

  // ─── DISEGNO ─────────────────────────────────────────────────────────────────
  function drawFrame(logicalIndex) {
    const img = images[logicalIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Tenta il frame precedente più vicino già caricato (fallback)
      for (let fallback = logicalIndex - 1; fallback >= 0; fallback--) {
        const fb = images[fallback];
        if (fb && fb.complete && fb.naturalWidth > 0) {
          drawImageCover(fb);
          return;
        }
      }
      return; // Nessun fallback disponibile
    }
    drawImageCover(img);
  }

  function drawImageCover(img) {
    const imgRatio    = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH, startX, startY;

    if (imgRatio > canvasRatio) {
      // Immagine più larga del canvas → scala per altezza, taglia i lati
      drawH  = canvasH;
      drawW  = canvasH * imgRatio;
      startX = (canvasW - drawW) / 2;
      startY = 0;
    } else {
      // Immagine più alta del canvas → scala per larghezza, taglia sopra/sotto
      drawW  = canvasW;
      drawH  = canvasW / imgRatio;
      startX = 0;
      startY = (canvasH - drawH) / 2;
    }

    context.clearRect(0, 0, canvasW, canvasH);
    context.drawImage(img, startX, startY, drawW, drawH);
  }

  // ─── PRELOAD ─────────────────────────────────────────────────────────────────
  let loadedCount = 0;

  function updateLoaderUI() {
    const pct = Math.round((loadedCount / TOTAL_LOGICAL_FRAMES) * 100);
    if (loaderBar)  loaderBar.style.width  = pct + "%";
    if (loaderText) loaderText.innerText   = `Caricamento ${pct}%`;
  }

  /**
   * Carica le immagini in batch per non saturare le connessioni HTTP.
   * - Prima: frame 0 immediato (per eliminare schermo nero)
   * - Poi: frame 1-59 (prime schermate visibili → max priorità)
   * - Poi: il resto in chunk di 30
   */
  function preloadImages() {
    // ① Carica subito il primo frame
    loadSingleFrame(0, () => {
      resizeCanvas();
      drawFrame(0);
      hideLoaderAndStart();

      // ② Carica i primi 60 frame in parallelo
      const PRIORITY_END = Math.min(60, TOTAL_LOGICAL_FRAMES);
      let priorityDone = 0;
      for (let i = 1; i < PRIORITY_END; i++) {
        loadSingleFrame(i, () => {
          priorityDone++;
          updateLoaderUI();
        });
      }

      // ③ Carica il resto in batch lazy
      loadBatch(PRIORITY_END, 30);
    });
  }

  function loadSingleFrame(logicalIndex, onDone) {
    if (images[logicalIndex] !== null) {
      onDone && onDone();
      return;
    }
    const img = new Image();
    images[logicalIndex] = img;
    img.onload = () => {
      loadedCount++;
      updateLoaderUI();
      onDone && onDone();
    };
    img.onerror = () => {
      loadedCount++;
      updateLoaderUI();
      onDone && onDone();
    };
    img.src = getFramePath(logicalIndex);
  }

  function loadBatch(startIndex, batchSize) {
    if (startIndex >= TOTAL_LOGICAL_FRAMES) return;
    const end = Math.min(startIndex + batchSize, TOTAL_LOGICAL_FRAMES);
    let done = 0;
    const count = end - startIndex;

    for (let i = startIndex; i < end; i++) {
      loadSingleFrame(i, () => {
        done++;
        if (done === count) {
          // Prossimo batch con un minimo delay per non bloccare il thread
          setTimeout(() => loadBatch(end, batchSize), 50);
        }
      });
    }
  }

  // ─── INIT SCRUB ──────────────────────────────────────────────────────────────
  function hideLoaderAndStart() {
    if (loader) {
      loader.style.transition = "opacity 0.7s ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        if (loader) loader.style.display = "none";
      }, 750);
    }

    initCanvasScrub();

    if (typeof initCardAnimations === "function") {
      initCardAnimations();
    }
  }

  function initCanvasScrub() {
    resizeCanvas();

    // Resize throttled per non sparare troppi eventi
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 80);
    });

    /**
     * scrub: su mobile abbassato a 0.3 per reattività immediata.
     * snap disabilitato: rallenta lo scrubbing su mobile.
     */
    gsap.to(scrollTracker, {
      frame: TOTAL_LOGICAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#app-container",
        start: "top top",
        end: "bottom bottom",
        scrub: IS_MOBILE ? 0.3 : 0.8,
      },
      onUpdate() {
        const idx = getMappedIndex(scrollTracker.frame);
        drawFrame(idx);
        if (typeof updateCardTimeline === "function") {
          updateCardTimeline(scrollTracker.frame);
        }
      },
    });
  }

  // ─── AVVIO ───────────────────────────────────────────────────────────────────
  preloadImages();

})();