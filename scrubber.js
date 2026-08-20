/**
 * scrubber.js — RM Studio Pure Video Scrubbing Engine (Apple-Grade)
 */

(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  const video = document.getElementById("immersive-video");
  const SCENES_COUNT = 12;

  // Tempi esatti (in secondi) per ciascuna delle 12 presentazioni SaaS nel video
  const SCENE_TIMES = [
    { start: 0.0,  end: 1.0 },   // 0: Intro RM Studio
    { start: 1.0,  end: 4.0 },   // 1: NexusAI
    { start: 4.0,  end: 8.0 },   // 2: Concierge24
    { start: 8.0,  end: 12.0 },  // 3: Dentis
    { start: 12.0, end: 16.0 },  // 4: Lexis AI
    { start: 16.0, end: 20.0 },  // 5: DriveMotion
    { start: 20.0, end: 24.0 },  // 6: HomeTour AI
    { start: 24.0, end: 28.0 },  // 7: OmniaStudio
    { start: 28.0, end: 32.0 },  // 8: FF Edizioni
    { start: 32.0, end: 36.0 },  // 9: Vision
    { start: 36.0, end: 40.0 },  // 10: Ecosistema
    { start: 40.0, end: 47.9 }   // 11: Contatti
  ];

  let cards = null;
  let activeCardIndex = 0;
  let lenisInstance = null;
  let targetTime = 0;
  let isSeeking = false;

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

  // ─── SINCRONIZZAZIONE SCHEDE ───
  function updateActiveCard(idx, force = false) {
    if (!cards || (!force && idx === activeCardIndex)) return;
    const prev = cards[activeCardIndex];
    const next = cards[idx];
    activeCardIndex = idx;

    if (prev && window.getSceneProps) {
      gsap.killTweensOf(prev);
      gsap.to(prev, { ...window.getSceneProps(activeCardIndex).exit, duration: 0.3 });
    }
    if (next && window.getSceneProps) {
      gsap.killTweensOf(next);
      gsap.fromTo(next, window.getSceneProps(idx).init, { ...window.getSceneProps(idx).mid, duration: 0.4 });
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

  // ─── RENDER LOOP RAF PER IL VIDEO ───
  function renderVideoScrub() {
    if (video && video.readyState >= 2 && !isSeeking) {
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    }
    requestAnimationFrame(renderVideoScrub);
  }

  // ─── INIZIALIZZAZIONE ───
  function startEngine() {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 300);
    }

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

    // ScrollTriggers per le 12 sezioni
    for (let i = 0; i < SCENES_COUNT; i++) {
      const times = SCENE_TIMES[i];

      ScrollTrigger.create({
        trigger: `#trigger-${i}`,
        start: "top top",
        end: "bottom top",
        scrub: 0.1,
        onUpdate(self) {
          targetTime = times.start + self.progress * (times.end - times.start);
          if (self.isActive) {
            if (self.progress >= 0.15 && self.progress <= 0.95) {
              updateActiveCard(i);
            } else if (self.progress < 0.15 && i > 0) {
              updateActiveCard(i - 1);
            }
          }
        },
        onToggle(self) {
          if (self.isActive) {
            updateActiveCard(i);
          }
        }
      });
    }

    // Infinite Loop al fondo
    ScrollTrigger.create({
      trigger: "#trigger-11",
      start: "bottom bottom",
      onEnter: () => {
        if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
        targetTime = 0;
        if (video) video.currentTime = 0;
        updateActiveCard(0, true);
      }
    });

    if (window.initCardAnimations) {
      window.initCardAnimations();
    }

    requestAnimationFrame(renderVideoScrub);
  }

  if (video) {
    if (video.readyState >= 1) {
      startEngine();
    } else {
      video.addEventListener("loadedmetadata", startEngine, { once: true });
    }
  } else {
    document.addEventListener("DOMContentLoaded", startEngine);
  }
})();
