/**
 * scrubber.js — RM Studio Pure Video Engine (GSAP Master Timeline Sync)
 */

(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  const video = document.getElementById("immersive-video");
  const SCENES_COUNT = 12;

  let cards = null;
  let activeCardIndex = 0;
  let lenisInstance = null;

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

  // ─── SETUP MOTORE VIDEO SCRUBBING ───
  function initApp() {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { if (loader) loader.style.display = "none"; }, 300);
    }

    // Forza il browser a risvegliare il frame iniziale
    if (video) {
      video.currentTime = 0.001;
    }

    // Lenis Smooth Scroll
    if (typeof Lenis !== "undefined") {
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

    // ── 1. TIMELINE MASTER PER IL VIDEO (FLUIDITÀ CONTINUA) ──
    const videoDuration = (video && video.duration && !isNaN(video.duration)) ? video.duration : 47.9;

    gsap.fromTo(video, 
      { currentTime: 0 }, 
      {
        currentTime: videoDuration,
        ease: "none",
        scrollTrigger: {
          trigger: "#scroll-triggers",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15 // Scrub ultra reattivo
        }
      }
    );

    // ── 2. TRIGGER DEDICATI ALLE 12 SCHEDE ──
    for (let i = 0; i < SCENES_COUNT; i++) {
      ScrollTrigger.create({
        trigger: `#trigger-${i}`,
        start: "top center",
        end: "bottom center",
        onEnter: () => updateActiveCard(i),
        onEnterBack: () => updateActiveCard(i)
      });
    }

    // ── 3. INFINITE LOOP ──
    ScrollTrigger.create({
      trigger: "#trigger-11",
      start: "bottom bottom",
      onEnter: () => {
        if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
        if (video) video.currentTime = 0;
        updateActiveCard(0, true);
      }
    });

    if (window.initCardAnimations) {
      window.initCardAnimations();
    }
  }

  // Assicura che i metadati del video siano pronti prima di avviare GSAP
  if (video) {
    if (video.readyState >= 1) {
      initApp();
    } else {
      video.addEventListener("loadedmetadata", initApp, { once: true });
    }
  } else {
    document.addEventListener("DOMContentLoaded", initApp);
  }
})();
