// Rileva se l'utente è su un dispositivo mobile (schermo inferiore a 768px)
const isMobile = window.innerWidth < 768;

// Se l'utente è su mobile, disattiviamo completamente il precaricamento pesante dei frame
// Questo fa caricare il sito all'istante su mobile, salvando banda e GPU
if (isMobile) {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("immersive-canvas");
    if (canvas) canvas.style.display = "none";
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => { loader.style.display = "none"; }, 400);
    }
    // Inizializza solo le animazioni di entrata/uscita delle schede
    initCardAnimations();
  });
} else {
  // Caricamento desktop classico (precarica frame 1, sblocca, poi precarica i restanti in background)
  preloadImages();
}

const totalFrames = 1320;
const canvas = document.getElementById("immersive-canvas");
const context = canvas.getContext("2d");
const images = [];
const scrollTracker = { frame: 0 };

const getFramePath = index => {
  return `frames/frame_${String(index).padStart(4, '0')}.jpg`;
};

let loadedCount = 0;
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderText = document.getElementById("loader-text");

function preloadImages() {
  // Carica immediatamente solo il 1° fotogramma per mostrare subito lo sfondo
  const firstImg = new Image();
  firstImg.src = getFramePath(1);
  
  firstImg.onload = () => {
    images[0] = firstImg;
    drawFrame(0); // Disegna subito (risolve sfondo nero)
    hideLoaderAndStart(); 
  };
  
  firstImg.onerror = () => {
    hideLoaderAndStart();
  };

  images.push(firstImg);
  for (let i = 2; i <= totalFrames; i++) {
    const img = new Image();
    images.push(img);
  }
}

function hideLoaderAndStart() {
  if (loader) loader.style.opacity = "0";
  setTimeout(() => {
    if (loader) loader.style.display = "none";
    initCanvasScrub();
    if (typeof initCardAnimations === "function") {
      initCardAnimations();
    }
    preloadRemainingImages();
  }, 600);
}

function preloadRemainingImages() {
  for (let i = 2; i <= totalFrames; i++) {
    images[i - 1].src = getFramePath(i);
  }
}

function resizeCanvas() {
  if (isMobile) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  context.scale(dpr, dpr);
  
  const mappedFrame = getMappedFrame(scrollTracker.frame);
  drawFrame(mappedFrame - 1);
}

function getMappedFrame(rawFrame) {
  const sectionLength = totalFrames / 11; 
  const sectionIndex = Math.floor(rawFrame / sectionLength);
  const sectionProgress = (rawFrame % sectionLength) / sectionLength;

  if (sectionIndex === 0) {
    return 1 + Math.floor(sectionProgress * 30);
  }
  
  if (sectionIndex === 1) {
    const startFrame = 30;
    const endFrame = 120;
    return startFrame + Math.floor(sectionProgress * (endFrame - startFrame));
  }
  
  if (sectionIndex === 10) {
    const startFrame = 1080;
    const endFrame = 1320;
    const targetFrame = startFrame + Math.floor(sectionProgress * (endFrame - startFrame));
    return Math.min(targetFrame, 1320);
  }

  const startFrame = (sectionIndex - 1) * 120;
  const targetFrame = startFrame + Math.floor(sectionProgress * 120);
  return Math.max(1, Math.min(targetFrame, 1320));
}

function drawFrame(index) {
  if (isMobile) return;
  const img = images[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const imgRatio = img.width / img.height;
  const canvasRatio = window.innerWidth / window.innerHeight;
  let drawWidth = window.innerWidth;
  let drawHeight = window.innerHeight;
  let startX = 0;
  let startY = 0;

  if (imgRatio > canvasRatio) {
    drawWidth = window.innerHeight * imgRatio;
    startX = (window.innerWidth - drawWidth) / 2;
  } else {
    drawHeight = window.innerWidth / imgRatio;
    startY = (window.innerHeight - drawHeight) / 2;
  }

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.drawImage(img, startX, startY, drawWidth, drawHeight);
}

function initCanvasScrub() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  gsap.to(scrollTracker, {
    frame: totalFrames - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: "#app-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8
    },
    onUpdate: () => {
      const mappedFrame = getMappedFrame(scrollTracker.frame);
      drawFrame(mappedFrame - 1);
      if (typeof updateCardTimeline === "function") {
        updateCardTimeline(scrollTracker.frame);
      }
    }
  });
}