"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, Send, ArrowRight } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, LazyMotion, domAnimation, useScroll, useTransform, useSpring } from "framer-motion";

const CURRENT_YEAR = new Date().getFullYear();

// ─── COORDINATE DEI PRODOTTI NELLO SPAZIO 3D ───
const THREE_D_ECOSYSTEM = [
  {
    id: "concierge24",
    title: "Concierge24",
    tag: "Hospitality AI",
    logo: "/logo_Concierge24.png",
    gif: "/c24_gif.gif",
    desc: "L'assistente vocale H24 multilingua che accoglie gli ospiti, risponde alle domande sulla struttura ed esegue l'up-selling dei servizi extra.",
    url: "https://concierge24.rmstudio.app/",
    posX: 0, posY: 0, posZ: 0, rotY: 0,
    themeGlow: "rgba(249, 115, 22, 0.15)",
    envMarker: "Prato fiorito & Lanterne calde"
  },
  {
    id: "drivemotion",
    title: "DriveMotion",
    tag: "Automotive AI",
    logo: "/logo_drivemotion.png",
    gif: "/drivemotion_video.mp4",
    desc: "Sfondi fotorealistici e video virali generati in automatico. Trasforma le foto del piazzale in reel cinematografici che aumentano il valore delle vetture.",
    url: "https://drivemotion.rmstudio.app",
    posX: 800, posY: -100, posZ: -1200, rotY: -45,
    themeGlow: "rgba(59, 130, 246, 0.15)",
    envMarker: "Città Cyber & Neon Riflessi"
  },
  {
    id: "hometour",
    title: "HomeTour AI",
    tag: "Real Estate AI",
    logo: "/logo_HomeTour.png",
    gif: "/hometour_gif.gif",
    desc: "Reel immobiliari con voce narrante emozionale, generati in automatico da semplici fotografie di appartamenti per vendere l'esperienza prima della visita.",
    url: "https://hometour.rmstudio.app",
    posX: -800, posY: 150, posZ: -2400, rotY: 40,
    themeGlow: "rgba(34, 197, 94, 0.15)",
    envMarker: "Bosco di betulle & Luce filtrante"
  },
  {
    id: "dentis",
    title: "Dentis",
    tag: "Dental AI Receptionist",
    logo: "/logo_dentis.png",
    gif: "/dentis_video.mp4",
    desc: "La segretaria virtuale H24 per l'odontoiatria. Risponde con voce naturale, gestisce gli appuntamenti su Google Calendar e rileva le urgenze mediche.",
    url: "https://dentis.rmstudio.app",
    posX: 900, posY: -300, posZ: -3600, rotY: -30,
    themeGlow: "rgba(20, 184, 166, 0.15)",
    envMarker: "Studio asettico & Cerchi di luce bianca"
  },
  {
    id: "nexus",
    title: "NexusAI",
    tag: "AI Sales Overlay",
    logo: "/logo_nexus_bg.png",
    gif: "/nexus_gif.gif",
    desc: "Inietta un assistente intelligente che accoglie, informa e converte i visitatori in tempo reale sul tuo sito attuale, senza modificare il codice o il CMS.",
    url: "https://nexus.rmstudio.app/",
    posX: -1000, posY: -50, posZ: -4800, rotY: 65,
    themeGlow: "rgba(6, 182, 212, 0.15)",
    envMarker: "Portale di codice & Flussi di dati"
  },
  {
    id: "omniastudio",
    title: "OmniaStudio",
    tag: "Privacy AI Offline",
    logo: "/logo_OmniaStudio.png",
    gif: "/omniastudio_video.mp4",
    desc: "La potenza dei modelli linguistici locali sul tuo computer. Analizza contratti, PDF e dati sensibili con prima elaborazione 100% offline.",
    url: "https://omniastudio.rmstudio.app/",
    posX: 0, posY: 400, posZ: -6000, rotY: 0,
    themeGlow: "rgba(168, 85, 247, 0.15)",
    envMarker: "Caveau blindato & Lastre di vetro viola"
  },
  {
    id: "ffedizioni",
    title: "FF Edizioni",
    tag: "Audio & Sound Design",
    logo: "/logo_ff.png",
    gif: "/ff_gif.gif",
    desc: "Identità sonore e colonne sonore AI originali con la direzione artistica del M° Fausto Fusetti. Jingle commerciali pronti per le campagne del tuo brand.",
    url: "https://ff.rmstudio.app/",
    posX: 600, posY: 0, posZ: -7200, rotY: -75,
    themeGlow: "rgba(234, 179, 8, 0.15)",
    envMarker: "Onde sonore dorate & Particelle di ottone"
  }
];

// ─── TEXT HOVER EFFECT (FOOTER) ───
const TextHoverEffect = ({ text }: { text: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCursor({ x: clientX, y: clientY });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (svgRef.current && cursor.x !== 0 && cursor.y !== 0) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className="select-none uppercase cursor-pointer w-full h-full"
    >
      <defs>
        <radialGradient id="textGradient" gradientUnits="userSpaceOnUse" cx={maskPosition.cx} cy={maskPosition.cy} r="40%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </radialGradient>
        <radialGradient id="revealMask" gradientUnits="userSpaceOnUse" cx={maskPosition.cx} cy={maskPosition.cy} r="20%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-white/10 font-black text-6xl" style={{ opacity: hovered ? 0.7 : 0 }}>
        {text}
      </text>
      <motion.text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-cyan-500/50 font-black text-6xl" initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }} animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }} transition={{ duration: 4, ease: "easeInOut" }}>
        {text}
      </motion.text>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" stroke="url(#textGradient)" strokeWidth="0.3" mask="url(#textMask)" className="fill-transparent font-black text-6xl">
        {text}
      </text>
    </svg>
  );
};

// ─── TESTIMONIALS ───
function TestimonialCard({ handleShuffle, testimonial, position, id, author }: { handleShuffle: () => void; testimonial: string; position: "front" | "middle" | "back"; id: string; author: string; }) {
  const dragRef = useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{ zIndex: position === "front" ? 2 : position === "middle" ? 1 : 0 }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%",
        scale: position === "front" ? 1 : position === "middle" ? 0.95 : 0.9,
      }}
      drag={isFront ? "x" : false}
      dragElastic={0.35}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(_e, info) => { dragRef.current = info.point.x; }}
      onDragEnd={(_e, info) => {
        if (Math.abs(dragRef.current - info.point.x) > 100) handleShuffle();
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[350px] w-[300px] select-none place-content-center space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ${isFront ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <img src={`https://i.pravatar.cc/128?img=${id}`} alt={author} loading="lazy" className="pointer-events-none mx-auto h-20 w-20 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg" />
      <p className="text-center text-[16px] italic text-white/70 leading-relaxed">&ldquo;{testimonial}&rdquo;</p>
      <span className="text-center text-[16px] font-black tracking-widest uppercase text-cyan-400">{author}</span>
    </motion.div>
  );
}

const initialTestimonials = [
  { id: "12", author: "Marco G. (Modena)", text: "Abbiamo venduto un immobile in 4 giorni dall'annuncio. Il Reel di HomeTour ha fatto 10k views organiche su Instagram." },
  { id: "15", author: "Elena V. (Milano)", text: "I miei clienti venditori rimangono colpiti quando mostro l'animazione 3D del loro appartamento. Un valore aggiunto concreto per acquisire mandati in esclusiva." },
  { id: "32", author: "Sara L. (Roma)", text: "L'assistente Concierge24 ha letteralmente azzerato le chiamate in reception per chiedere la password del WiFi e gli orari di colazione." },
  { id: "34", author: "Giuseppe T. (Firenze)", text: "I clienti internazionali apprezzano l'assistenza multilingua attiva anche di notte. Risponde all'istante su check-in tardivi e consigli logistici locali." },
  { id: "36", author: "Alessia B. (Venezia)", text: "Gestisco 8 appartamenti turistici. L'integrazione di Concierge24 ha ridotto del 70% i messaggi ripetitivi su WhatsApp, lasciandoci molto più tempo libero." }
];

function TestimonialSection() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const handleShuffle = useCallback(() => {
    setTestimonials((prev) => {
      const newArr = [...prev];
      const first = newArr.shift();
      if (first) newArr.push(first);
      return newArr;
    });
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[450px] flex justify-center items-center mt-12 overflow-hidden px-4">
      <div className="relative max-w-[300px] w-full h-[350px]">
        {testimonials.map((t, i) => (
          <TestimonialCard key={t.id} id={t.id} author={t.author} testimonial={t.text} position={i === 0 ? "front" : i === 1 ? "middle" : "back"} handleShuffle={handleShuffle} />
        ))}
      </div>
    </div>
  );
}

// ─── VIDEO RENDERER COMPONENT ───
function ActiveMedia({ src, alt }: { src: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = src.endsWith(".mp4");

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.log("Autoplay mitigato", err);
      });
    }
  }, [isVideo, src]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
    />
  );
}

// ─── 3. SPATIAL CAMERA RIG (IL VIAGGIO 3D REALE) ───
function Spatial3DScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 15,
    restDelta: 0.001
  });

  const steps = THREE_D_ECOSYSTEM.length;
  const scrollKeys = THREE_D_ECOSYSTEM.map((_, i) => i / (steps - 1));

  const cameraX = useTransform(smoothProgress, scrollKeys, THREE_D_ECOSYSTEM.map(p => -p.posX));
  const cameraY = useTransform(smoothProgress, scrollKeys, THREE_D_ECOSYSTEM.map(p => -p.posY));
  const cameraZ = useTransform(smoothProgress, scrollKeys, THREE_D_ECOSYSTEM.map(p => -p.posZ));
  const cameraRotY = useTransform(smoothProgress, scrollKeys, THREE_D_ECOSYSTEM.map(p => -p.rotY));
  const cameraRotX = useTransform(smoothProgress, [0, 0.5, 1], [0, 3, -2]);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const currentIdx = Math.min(
        Math.round(latest * (steps - 1)),
        steps - 1
      );
      setActiveIdx(currentIdx);
    });
  }, [scrollYProgress, steps]);

  return (
    <div ref={containerRef} className="relative h-[800vh] w-full bg-[#030308]">
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden flex items-center justify-center z-20">
        
        <div className="absolute top-28 left-10 z-30 hidden md:flex flex-col gap-2 pointer-events-none">
          <span className="text-[12px] font-black uppercase tracking-[4px] text-cyan-400">
            STRATEGIC SPACE MAP
          </span>
          <div className="flex flex-col gap-1 text-slate-500 font-bold text-[14px]">
            {THREE_D_ECOSYSTEM.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 transition-colors duration-300">
                <span className={`w-2 h-2 rounded-full ${i === activeIdx ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" : "bg-white/10"}`} />
                <span className={i === activeIdx ? "text-white" : ""}>{p.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1100px" }}>
          <motion.div
            style={{
              x: cameraX,
              y: cameraY,
              z: cameraZ,
              rotateY: cameraRotY,
              rotateX: cameraRotX,
              transformStyle: "preserve-3d"
            }}
            className="w-full h-full absolute flex items-center justify-center gpu-accelerated"
          >
            <div 
              className="absolute w-[10000px] h-[10000px] opacity-10 pointer-events-none border-t border-cyan-500/30"
              style={{
                transform: "rotateX(90deg) translateY(5000px)",
                background: "radial-gradient(circle, rgba(6,182,212,0.15) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
                transformStyle: "preserve-3d"
              }}
            />

            <div 
              className="absolute w-[10000px] h-[10000px] opacity-20 pointer-events-none"
              style={{
                transform: "rotateX(-90deg) translateY(5000px)",
                background: "radial-gradient(circle, #fff 1px, transparent 1.5px)",
                backgroundSize: "150px 150px",
                transformStyle: "preserve-3d"
              }}
            />

            {THREE_D_ECOSYSTEM.map((prod) => {
              return (
                <div
                  key={`env-${prod.id}`}
                  style={{
                    transform: `translate3d(${prod.posX}px, ${prod.posY + 300}px, ${prod.posZ - 200}px) rotateY(${prod.rotY}deg)`,
                    transformStyle: "preserve-3d"
                  }}
                  className="absolute pointer-events-none flex flex-col items-center justify-center"
                >
                  <div 
                    className="w-96 h-96 rounded-full filter blur-[120px] opacity-40 animate-pulse"
                    style={{ background: prod.themeGlow }}
                  />
                  <span className="text-[12px] font-black uppercase tracking-[8px] text-white/10 mt-4 block">
                    {prod.envMarker}
                  </span>
                </div>
              );
            })}

            {THREE_D_ECOSYSTEM.map((prod, idx) => {
              const isFocused = idx === activeIdx;

              return (
                <motion.div
                  key={prod.id}
                  style={{
                    transform: `translate3d(${prod.posX}px, ${prod.posY}px, ${prod.posZ}px) rotateY(${prod.rotY}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    opacity: isFocused ? 1 : 0.15,
                    filter: isFocused ? "blur(0px)" : "blur(4px)",
                    scale: isFocused ? 1 : 0.92,
                  }}
                  transition={{ duration: 0.6 }}
                  className={`absolute w-[90%] max-w-4xl bg-black/60 backdrop-blur-3xl border ${isFocused ? "border-cyan-500/30" : "border-white/5"} p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex flex-col md:flex-row gap-8 items-center ${isFocused ? "pointer-events-auto" : "pointer-events-none"} gpu-accelerated`}
                >
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none z-0 transition-opacity"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${prod.themeGlow}, transparent)` }}
                  />

                  <div className="flex-1 z-10 text-left">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={prod.logo}
                        alt={prod.title}
                        className="w-16 h-16 object-contain rounded-2xl bg-black/50 p-2 border border-white/10 shadow-lg"
                      />
                      <div>
                        <span className="text-[13px] uppercase tracking-[4px] font-black text-cyan-400">
                          {prod.tag}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-white">{prod.title}</h3>
                      </div>
                    </div>
                    <p className="text-white/60 text-[16px] md:text-[18px] leading-relaxed mb-6 font-light">
                      {prod.desc}
                    </p>
                    <a
                      href={prod.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-[15px] font-bold text-white hover:bg-white/10 transition-all group"
                    >
                      Accedi alla Piattaforma 
                      <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  <div className="w-full md:w-[340px] h-[220px] md:h-[260px] rounded-3xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner z-10">
                    <ActiveMedia src={prod.gif} alt={prod.title} />
                    <div className="absolute top-3 right-4 text-[11px] font-black uppercase tracking-[2px] text-white/30 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md">
                      ECOSYSTEM PREVIEW
                    </div>
                  </div>

                </motion.div>
              );
            })}

          </motion.div>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none">
          <span className="text-[11px] font-black uppercase tracking-[5px] text-white/20">
            PROSSIMA DESTINAZIONE
          </span>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
            <span className="text-[13px] font-bold text-cyan-400">
              {activeIdx < steps - 1 ? THREE_D_ECOSYSTEM[activeIdx + 1].title : "Fine del Viaggio"}
            </span>
            <ArrowRight size={14} className="text-cyan-400 animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 4. MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const orbitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/orbit-template.html")
      .then((res) => res.text())
      .then((html) => {
        if (orbitContainerRef.current) {
          orbitContainerRef.current.innerHTML = html;
        }
      })
      .catch((err) => console.error("Errore nel recupero del template orbitale:", err));

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "RM Studio AI Suite",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "description": "Lab di Ingegneria AI ad alte prestazioni che realizza ecosistemi intelligenti su misura per automatizzare ed espandere i canali commerciali aziendali.",
      "offers": {
        "@type": "Offer",
        "price": "49.00",
        "priceCurrency": "EUR",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "128",
      },
      "author": {
        "@type": "Person",
        "name": "Riccardo Modena",
        "url": "https://www.linkedin.com/in/riccardo-modena-13918a61/",
      },
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleVCardClick = () => {
    toast.success("Contatto salvato nella rubrica.");
    const link = document.createElement("a");
    link.href = "/contact.vcf";
    link.download = "Riccardo_Modena_RMStudio.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "9013a8d5-0901-42a0-b9e6-4c45553f960d");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error(`Errore HTTP: ${res.status}. Riprova più tardi.`);
        return;
      }

      const data = await res.json();

      if (data.success) {
        toast.success("Messaggio inviato con successo! Ti risponderò entro 24 ore.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("Errore nell'invio del messaggio. Verifica i dati e riprova.");
      }
    } catch {
      toast.error("Errore di rete. Controlla la connessione e riprova.");
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <main className="relative min-h-screen bg-[#020205] text-white overflow-x-hidden scroll-smooth">
        <Toaster position="top-right" richColors />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes orbit-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes counter-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes netflix-glow-optimized {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.35; }
          }
          @keyframes pulse-ring-optimized {
            0%, 100% { opacity: 0.2; transform: scale(0.95); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          @keyframes gold-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.25), inset 0 0 12px rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.3); }
            50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.65), inset 0 0 20px rgba(234, 179, 8, 0.4); border-color: rgba(234, 179, 8, 0.85); }
          }
          @keyframes animated-border-glow {
            0%, 100% { border-color: rgba(6, 182, 212, 0.6); box-shadow: 0 0 15px rgba(6, 182, 212, 0.25); }
            33% { border-color: rgba(139, 92, 246, 0.6); box-shadow: 0 0 15px rgba(139, 92, 246, 0.25); }
            66% { border-color: rgba(236, 72, 153, 0.6); box-shadow: 0 0 15px rgba(236, 72, 153, 0.25); }
          }
          .gpu-accelerated {
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: transform, opacity;
          }
          .animated-gradient-border {
            animation: animated-border-glow 6s linear infinite;
            border-width: 1.5px;
            border-style: solid;
          }
          .orbit-ring {
            position: relative;
            width: 380px;
            height: 380px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
            animation: orbit-rotation 40s linear infinite;
          }
          .orbit-area {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 500px;
          }
          .orbit-area:hover .orbit-ring,
          .orbit-area:hover .orbit-item {
            animation-play-state: paused;
          }
          .orbit-wrapper {
            position: absolute;
            width: 72px;
            height: 72px;
            transform: translate(-50%, -50%);
          }
          .orbit-item {
            position: relative;
            width: 100%;
            height: 100%;
            animation: counter-rotation 40s linear infinite;
            transform-origin: center;
          }
          .orbit-link {
            display: flex;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.1);
            box-sizing: border-box;
            transition: 0.3s;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            text-decoration: none;
          }
          .orbit-link:hover {
            border-color: #06b6d4;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
          }
          .orbit-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .orbit-img.cover {
            object-fit: cover;
          }
          .orbit-img.rounded {
            border-radius: 9999px;
          }
          .orbit-center-photo {
            position: absolute;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            border: 4px solid #f97316;
            padding: 4px;
            background: #000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            z-index: 10;
            box-sizing: border-box;
          }
          .orbit-center-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .orbit-tooltip {
            position: absolute;
            bottom: 95px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            background: #0a0a0c;
            border: 1px solid rgba(255,255,255,0.08);
            color: #94a3b8;
            font-size: 16px;
            border-radius: 8px;
            padding: 12px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            text-align: center;
            z-index: 100;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            line-height: 1.4;
          }
          .orbit-tooltip b {
            color: white;
            display: block;
            margin-bottom: 4px;
          }
          .orbit-item:hover .orbit-tooltip {
            opacity: 1;
          }
          .visual-hook-glow {
            filter: blur(50px);
            will-change: opacity;
            animation: netflix-glow-optimized 6s ease-in-out infinite;
          }
          .pulse-ring-element {
            position: absolute;
            width: 360px;
            height: 360px;
            background-color: rgba(6, 182, 212, 0.05);
            filter: blur(48px);
            border-radius: 9999px;
            will-change: transform, opacity;
            animation: pulse-ring-optimized 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .gold-decoy-card {
            animation: gold-pulse 3s infinite ease-in-out;
          }
          html { scroll-behavior: smooth; }
        ` }} />

        {/* ── VIDEO BACKGROUND ── */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020205]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-20 gpu-accelerated"
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/80 via-[#020205]/40 to-[#020205]/95 pointer-events-none" />
        </div>

        {/* ── HEADER ── */}
        <header className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RM Studio Logo"
                className="w-8 h-8 object-contain rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
              <span className="font-black tracking-[0.2em] text-[16px] uppercase">RM Studio</span>
            </div>
            <a
              href="#contatti"
              className="text-[16px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 px-5 py-2.5 rounded-full bg-cyan-500/5"
            >
              Contattaci
            </a>
          </div>
        </header>

        <div className="relative z-10 flex flex-col w-full">

          <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/5 via-purple-500/5 to-blue-500/10 rounded-full pointer-events-none visual-hook-glow z-0 -translate-x-1/2 -translate-y-1/2" />

          {/* ── HERO ── */}
          <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 pt-24 gap-12 lg:gap-16">

            <div className="flex-1 text-center lg:text-left z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8 text-[16px] font-black tracking-[4px] text-cyan-400 uppercase"
              >
                AI Engineering Lab
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl text-white"
              >
                L&apos;Intelligenza Artificiale che <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Lavora per il tuo Business.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 font-light tracking-wide leading-relaxed"
              >
                Sviluppiamo ecosistemi AI su misura per abbattere i costi operativi ed espandere il tuo mercato.
                Zero codice complesso, solo risultati scalabili ed integrati.
              </motion.p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center lg:justify-start">
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleVCardClick}
                  className="flex items-center justify-center gap-3 px-5 py-3 sm:px-8 sm:py-4 rounded-full bg-white text-black hover:text-black focus:text-black active:text-black font-extrabold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] sm:shadow-[0_0_30px_rgba(255,255,255,0.25)] text-[16px] tracking-wider w-full sm:w-auto focus:outline-none"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  <span className="text-black font-extrabold">SALVA CONTATTO (vCard)</span>
                </motion.button>

                <a
                  href="#progetti"
                  className="bg-black/40 text-slate-300 border border-white/10 px-6 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all text-[16px] text-center self-center"
                >
                  Esplora Ecosistemi
                </a>
              </div>
            </div>

            <div 
              ref={orbitContainerRef}
              className="flex-1 w-full max-w-[500px] flex justify-center items-center relative z-10 min-h-[500px] orbit-area"
            >
              {/* Iniettato dinamicamente */}
            </div>

          </section>

          {/* ── AUTOREVOLEZZA ── */}
          <section className="bg-slate-950/60 border-y border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 text-[16px]">
              <p className="text-center md:text-left text-slate-400 font-medium max-w-xl text-[16px]">
                I nostri sistemi e le strutture conversazionali sono progettati in aderenza ai protocolli e agli standard internazionali sulla sicurezza delle informazioni e sulla comunicazione d&apos;impresa.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-[16px] font-semibold">
                <a
                  href="https://www.nar.realtor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition underline decoration-dotted underline-offset-4"
                >
                  National Association of Realtors
                </a>
                <span className="text-slate-800">|</span>
                <a
                  href="https://www.iso.org/standard/27001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition underline decoration-dotted underline-offset-4"
                >
                  ISO/IEC 27001 Security Standard
                </a>
                <span className="text-slate-800">|</span>
                <a
                  href="https://www.health.harvard.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition underline decoration-dotted underline-offset-4"
                >
                  Harvard Health Publishing
                </a>
              </div>
            </div>
          </section>

          {/* ── PROFILO ── */}
          <section className="py-24 px-6 max-w-6xl mx-auto border-b border-white/5">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="relative p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-3xl shadow-2xl">
                  <img
                    src="/riccardo_founder.jpeg"
                    alt="Riccardo Modena"
                    className="w-64 h-64 object-cover rounded-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-[#0a0a0c] border border-white/10 px-4 py-2 rounded-xl text-[16px] text-slate-300 font-semibold shadow-xl">
                    Riccardo Modena
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
                <span className="text-[16px] uppercase tracking-widest font-black text-cyan-400 mb-3 block">Direzione Tecnica</span>
                <h3 className="text-3xl font-bold mb-4">La tecnologia deve eliminare l&apos;attrito, non crearlo.</h3>
                <p className="text-[16px] text-white/50 leading-relaxed font-light mb-6">
                  &ldquo;Nello sviluppo dei nostri ecosistemi l&apos;obiettivo principale è rimuovere ogni forma di frizione operativa, riducendo lo sforzo d&apos;uso sia per le aziende che per i loro utenti finali. Integrare l&apos;intelligenza artificiale non significa aggiungere complessità, ma automatizzare canali per produrre risultati in modo fluido e protetto.&rdquo;
                </p>
                <p className="text-[16px] text-white/30">
                  Come indicato nelle linee guida di conformità dell&apos;organizzazione internazionale{" "}
                  <a href="https://www.w3.org/community/tourism/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    W3C per i canali integrati
                  </a>
                  , l&apos;adozione di architetture logiche simmetriche riduce i tempi di interazione massimizzando la permanenza attiva.
                </p>
              </div>
            </div>
          </section>

          {/* ── IL NUOVO SPATIAL CAMERA RIG 3D ── */}
          <div id="progetti">
            <Spatial3DScroller />
          </div>

          {/* ── TESTIMONIALS ── */}
          <section className="py-32 px-6">
            <h2 className="text-3xl md:text-5xl font-black text-center tracking-tighter mb-4 uppercase">
              Dicono di noi
            </h2>
            <p className="text-center text-white/30 mb-12 tracking-widest uppercase text-[16px] font-bold">
              Slide per scoprire i feedback
            </p>
            <TestimonialSection />
          </section>

          {/* ── CONTATTI ── */}
          <section id="contatti" className="py-32 px-6">
            <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
              <h2 className="text-4xl font-black mb-2 text-center tracking-tighter">
                Parliamo del tuo Progetto
              </h2>
              <p className="text-white/40 text-center mb-10 font-light text-[16px]">
                Compila il modulo, rispondo personalmente in meno di 24 ore.
              </p>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="subject" value="Nuovo Lead da RMStudio.app" />

                <div className="space-y-1">
                  <label className="text-[16px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10 text-[16px]"
                    placeholder="Esempio: Mario Rossi"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[16px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Email Aziendale
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10 text-[16px]"
                    placeholder="nome@azienda.it"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[16px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Il tuo Obiettivo
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-white/10 text-[16px]"
                    placeholder="Quale processo vuoi automatizzare?"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 flex items-center justify-center gap-3 bg-white text-black font-black py-6 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-[16px] shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                >
                  <Send size={18} /> Invia Messaggio
                </button>
              </form>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="relative w-full pt-40 pb-56 bg-black border-t border-white/5 flex flex-col items-center overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{ background: "radial-gradient(100% 100% at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 100%)" }}
            />

            <div className="relative z-10 w-full max-w-5xl px-6 h-40 md:h-64 mb-16">
              <TextHoverEffect text="RM STUDIO" />
            </div>

            <div className="relative z-10 flex flex-wrap justify-center gap-10 mb-12">
              <a href="https://www.facebook.com/riccardo.modena.792" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-[16px] font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>
              <a href="https://instagram.com/riccardo_mode_" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-[16px] font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
              <a href="https://www.linkedin.com/in/riccardo-modena-13918a61/" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-[16px] font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
              <a href="https://tiktok.com/@mr3d.riccardo" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-[16px] font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
                TikTok
              </a>
            </div>

            <div className="relative z-10 text-white/20 text-[16px] font-bold tracking-[4px] text-center uppercase leading-relaxed pb-12">
              © {CURRENT_YEAR} Riccardo Modena • RM STUDIO <br />
              <span className="text-cyan-500/50">High-End AI Engineering</span> <br />
              <div className="mt-3 flex items-center justify-center gap-3">
                <a href="/privacy.html" target="_blank" className="text-white/30 hover:text-cyan-400 underline transition-colors inline-block lowercase font-sans normal-case text-[16px]">Privacy Policy</a>
                <span className="text-white/20 font-sans">|</span>
                <a href="/termini.html" target="_blank" className="text-white/30 hover:text-cyan-400 underline transition-colors inline-block lowercase font-sans normal-case text-[16px]">Termini e Condizioni</a>
              </div>
            </div>
          </footer>

        </div>

        <NovaChatbot />
        <FloatingDock />
      </main>
    </LazyMotion>
  );
}
