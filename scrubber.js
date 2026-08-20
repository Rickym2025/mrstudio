/**
 * scrubber.js — Pure Video Scrubbing Engine (Apple-Grade)
 */
(function () {
  "use strict";

  const video = document.getElementById("immersive-video");
  const SCENES_COUNT = 12;

  // Tempi esatti dei 12 capitoli nel video (47.9s totali)
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

  function updateActiveCard(idx) {
    if (!cards || idx === activeCardIndex) return;
    const prev = cards[activeCardIndex];
    const next = cards[idx];
    activeCardIndex = idx;

    if (prev) gsap.to(prev, { ...window.getSceneProps(activeCardIndex).exit, duration: 0.3 });
    if (next) gsap.fromTo(next, window.getSceneProps(idx).init, { ...window.getSceneProps(idx).mid, duration: 0.4 });
  }

  window.registerCards = function (cardElements) {
    cards = cardElements;
    cards.forEach((card, i) => {
      gsap.set(card, i === 0 ? window.getSceneProps(i).mid : window.getSceneProps(i).init);
    });
  };

  function init() {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 300);
    }

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // Sincronizza ciascuna delle 12 sezioni con il minutaggio esatto del video
    for (let i = 0; i < SCENES_COUNT; i++) {
      const times = SCENE_TIMES[i];

      ScrollTrigger.create({
        trigger: `#trigger-${i}`,
        start: "top top",
        end: "bottom top",
        scrub: 0.1,
        onUpdate(self) {
          if (video && video.readyState >= 2) {
            video.currentTime = times.start + self.progress * (times.end - times.start);
          }
          if (self.isActive && self.progress >= 0.15) {
            updateActiveCard(i);
          }
        }
      });
    }

    // Infinite Loop al termine del capitolo 11
    ScrollTrigger.create({
      trigger: "#trigger-11",
      start: "bottom bottom",
      onEnter: () => {
        lenis.scrollTo(0, { immediate: true });
        if (video) video.currentTime = 0;
        updateActiveCard(0);
      }
    });

    if (window.initCardAnimations) window.initCardAnimations();
  }

  // Si avvia appena i primi metadati del video sono pronti
  if (video.readyState >= 1) {
    init();
  } else {
    video.addEventListener("loadedmetadata", init, { once: true });
  }
})();
