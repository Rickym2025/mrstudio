const isMobile = window.innerWidth < 768;
const totalFrames = isMobile ? 660 : 1320;
const canvas = document.getElementById("immersive-canvas");
const context = canvas.getContext("2d");
const images = [];
const scrollTracker = { frame: 0 };

const getFramePath = index => {
  const targetIndex = isMobile ? (index * 2) - 1 : index;
  return `frames/frame_${String(targetIndex).padStart(4, '0')}.jpg`;
};

let loadedCount = 0;
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderText = document.getElementById("loader-text");

function preloadImages() {
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    
    const onLoadOrError = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalFrames) * 100);
      if (loaderBar) loaderBar.style.width = `${progress}%`;
      if (loaderText) loaderText.innerText = `${progress}% Caricato`;

      if (loadedCount === totalFrames) {
        if (loader) loader.style.opacity = "0";
        setTimeout(() => {
          if (loader) loader.style.display = "none";
          initCanvasScrub();
          if (typeof initCardAnimations === "function") {
            initCardAnimations();
          }
        }, 600);
      }
    };

    img.onload = onLoadOrError;
    img.onerror = onLoadOrError; 
    images.push(img);
  }
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  context.scale(dpr, dpr);
  drawFrame(getMappedFrame(scrollTracker.frame));
}

function getMappedFrame(rawFrame) {
  const normalizedFrame = isMobile ? rawFrame * 2 : rawFrame;
  const sectionLength = 1320 / 11; 
  const sectionIndex = Math.floor(normalizedFrame / sectionLength);
  const sectionProgress = (normalizedFrame % sectionLength) / sectionLength;

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
  const targetIndex = isMobile ? Math.floor(index / 2) : index;
  const img = images[targetIndex];
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
      drawFrame(mappedFrame);
      if (typeof updateCardTimeline === "function") {
        updateCardTimeline(scrollTracker.frame);
      }
    }
  });
}

preloadImages();