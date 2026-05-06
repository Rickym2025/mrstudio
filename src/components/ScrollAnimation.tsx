import { useRef, useState } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";

export function ScrollAnimation() {
  const ref = useRef(null);
  const [currentFrame, setCurrentFrame] = useState("/animation/frame_001.jpg");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  // Mappa lo scroll (0 a 1) sui tuoi frame (es. da 1 a 80)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, 80]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    const num = Math.floor(latest).toString().padStart(3, '0');
    setCurrentFrame(`/animation/frame_${num}.jpg`);
  });

  return (
    <section ref={ref} className="h-[300vh] relative bg-transparent">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Testo che accompagna l'animazione */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
          className="absolute top-20 text-center z-20"
        >
          <h2 className="text-2xl font-bold tracking-widest text-cyan-500 uppercase">The Innovation Core</h2>
          <p className="text-white/40 text-sm">Scorri per de-costruire l'ingegneria</p>
        </motion.div>

        <img 
          src={currentFrame} 
          alt="AI Core Animation" 
          className="w-full max-w-[800px] h-auto object-contain z-10"
        />

        {/* Testo finale che appare quando il core è aperto */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0.8, 0.9], [0, 1]) }}
          className="absolute bottom-20 text-center z-20"
        >
          <h2 className="text-4xl font-black text-white">Potenza Pura.</h2>
          <p className="text-white/60">Zero Codice. Solo Risultati.</p>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#04040a] via-transparent to-[#04040a] pointer-events-none" />
      </div>
    </section>
  );
}
