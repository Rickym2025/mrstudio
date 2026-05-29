import React, { useRef, useState, useEffect, useCallback } from "react";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, Send } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, LazyMotion, domAnimation } from "framer-motion";

// ─── COSTANTE ANNO (fuori dal componente, non ricalcolata ad ogni render) ───
const CURRENT_YEAR = new Date().getFullYear();

// ─── 1. FOOTER: TextHoverEffect (gradiente radiale corretto) ───────────────
const TextHoverEffect = ({ text }: { text: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const rafRef = useRef<number | null>(null);

  // Throttle mousemove con requestAnimationFrame per evitare re-render continui
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
        <radialGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="40%"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </radialGradient>

        <radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="20%"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-white/10 font-black text-6xl"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>

      <motion.text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-cyan-500/50 font-black text-6xl"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        stroke="url(#textGradient)" strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-black text-6xl"
      >
        {text}
      </text>
    </svg>
  );
};

// ─── 2. TESTIMONIAL CARD ──────────────────────────────────────────────────
function TestimonialCard({
  handleShuffle, testimonial, position, id, author,
}: {
  handleShuffle: () => void;
  testimonial: string;
  position: "front" | "middle" | "back";
  id: string;
  author: string;
}) {
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
      onDragStart={(e: any) => { dragRef.current = e.clientX; }}
      onDragEnd={(e: any) => {
        if (Math.abs(dragRef.current - e.clientX) > 100) handleShuffle();
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[350px] w-[300px] select-none place-content-center space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={`https://i.pravatar.cc/128?img=${id}`}
        alt={author}
        loading="lazy"
        className="pointer-events-none mx-auto h-20 w-20 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg"
      />
      <p className="text-center text-sm italic text-white/70 leading-relaxed">"{testimonial}"</p>
      <span className="text-center text-xs font-black tracking-widest uppercase text-cyan-400">{author}</span>
    </motion.div>
  );
}

const initialTestimonials = [
  { id: "12", author: "Marco G. (Modena)", text: "Abbiamo venduto un immobile in 4 giorni dall'annuncio. Il Reel di HomeTour ha fatto 10k views organiche su Instagram." },
  { id: "32", author: "Sara L. (Roma)", text: "L'assistente Concierge24 ha letteralmente azzerato le chiamate in reception per chiedere la password del WiFi." },
  { id: "53", author: "Studio Rossi", text: "Marketing di un altro livello. Le auto sembrano fotografate in studio. DriveMotion ha cambiato le nostre vendite." },
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
          <TestimonialCard
            key={t.id}
            id={t.id}
            author={t.author}
            testimonial={t.text}
            position={i === 0 ? "front" : i === 1 ? "middle" : "back"}
            handleShuffle={handleShuffle}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 3. PROJECT CARD ──────────────────────────────────────────────────────
function ProjectCard({ title, tag, desc, url, glowColor, logo, gif, isReversed }: { 
  title: string, tag: string, desc: string, url: string, glowColor: string, logo: string, gif?: string, isReversed?: boolean 
}) {
  const hasGif = Boolean(gif && gif.trim() !== "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group flex flex-col ${
        isReversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-center gap-8 bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 relative backdrop-blur-md overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <div className="w-full md:w-2/3 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={logo}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-12 h-12 object-contain rounded-xl shadow-lg bg-black/50 p-1"
          />
          <div>
            <h3 className="text-3xl font-bold">{title}</h3>
            <span className={`text-xs uppercase tracking-[3px] font-black bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>
              {tag}
            </span>
          </div>
        </div>
        <p className="text-white/60 leading-relaxed text-lg mb-6">{desc}</p>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:underline decoration-cyan-400 underline-offset-4 transition-all">
          Accedi alla Piattaforma <ExternalLink size={16} />
        </span>
      </div>

      <div className="w-full md:w-1/3 h-[220px] bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
        <img
          src={logo}
          alt={title}
          loading="lazy"
          decoding="async"
          className={`w-20 h-20 object-contain transition-all duration-500 ${
            hasGif 
              ? "opacity-60 group-hover:opacity-0 group-hover:scale-90" 
              : "opacity-40 group-hover:opacity-100 group-hover:scale-110"
          }`}
        />

        {hasGif && (
          <img
            src={gif}
            alt={`${title} demo`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-10 pointer-events-none`} />
        
        {hasGif && (
          <div className="absolute bottom-3 right-4 text-[8px] font-black uppercase tracking-[2px] text-white/30 group-hover:opacity-0 transition-opacity">
            Preview
          </div>
        )}
      </div>
    </a>
  );
}

// ─── 4. MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Iniezione automatica e sicura dello Schema Markup JSON-LD all'avvio
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Concierge24",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "description": "Assistente vocale e testuale AI H24 per hotel, appartamenti turistici, B&B e Pro Loco. Gestisce check-in, regole della casa e consiglia itinerari locali in tempo reale.",
      "offers": {
        "@type": "Offer",
        "price": "49.00",
        "priceCurrency": "EUR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "128"
      },
      "author": {
        "@type": "Person",
        "name": "Riccardo Modena",
        "url": "https://www.linkedin.com/in/riccardo-modena-13918a61/"
      }
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
    } catch (error) {
      toast.error("Errore di rete. Controlla la connessione e riprova.");
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <main className="relative min-h-screen bg-[#020205] text-white overflow-x-hidden scroll-smooth">
        <Toaster position="top-right" richColors />

        {/* CSS isolato per il widget orbitale simmetrico a 6 elementi */}
        <style>{`
          @keyframes orbit-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes counter-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          .orbit-ring-container {
            animation: orbit-rotation 40s linear infinite;
          }
          .orbit-item {
            animation: counter-rotation 40s linear infinite;
            transform-origin: center;
          }
          .orbit-area:hover .orbit-ring-container,
          .orbit-area:hover .orbit-item {
            animation-play-state: paused;
          }
        `}</style>

        {/* ── VIDEO BACKGROUND ── */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-40" : "opacity-0"
            }`}
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/70 via-[#020205]/40 to-[#020205]/80" />
        </div>

        {/* ── HEADER ── */}
        <header className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="RM Studio Logo"
                className="w-8 h-8 object-contain rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
              <span className="font-black tracking-[0.2em] text-lg uppercase">RM Studio</span>
            </div>
            <a
              href="#contatti"
              className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 px-5 py-2.5 rounded-full bg-cyan-500/5"
            >
              Contattaci
            </a>
          </div>
        </header>

        <div className="relative z-10 flex flex-col w-full">

          {/* ── HERO (OTTIMIZZATO NEURO-LAYOUT) ── */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase animate-pulse"
            >
              AI Engineering Lab
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6 drop-shadow-2xl"
            >
              L'Intelligenza Artificiale che <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                Lavora per il tuo Business.
              </span>
            </motion.h1>

            {/* Neuro-ottimizzazione: carattere a 18px (text-lg) per eliminare la frizione di lettura */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/50 text-center max-w-2xl mb-12 font-light tracking-wide leading-relaxed"
            >
              Sviluppiamo ecosistemi AI su misura per abbattere i costi operativi ed espandere il tuo mercato.
              Zero codice, solo risultati scalabili.
            </motion.p>

            {/* CTA raddoppiata di dimensioni per dominare lo spazio visivo e guidare la conversione */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleVCardClick}
              className="flex items-center justify-center gap-3 px-14 py-7 rounded-full bg-white text-black font-black hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.25)] text-lg sm:text-xl tracking-wider"
            >
              <Download size={24} />
              SALVA CONTATTO (vCard)
            </motion.button>
          </section>

          {/* ── SEZIONE FOUNDER & ECOSISTEMA ORBITALE (6 ELEMENTI SIMMETRICI) ── */}
          <section className="py-32 px-6 backdrop-blur-[2px] border-t border-white/5 bg-[#020202]/50 relative">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
              
              {/* Widget Orbitale ad Esagono Regolare (60 gradi) */}
              <div className="w-full lg:w-1/2 flex justify-center items-center relative min-h-[440px] orbit-area">
                <div class="absolute w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>
                
                <div class="orbit-ring-container relative w-80 h-80 rounded-full border border-white/5 flex items-center justify-center">
                  
                  {/* 1. Concierge24 (0° - Alto al centro | Sfondo Nero) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "0%", left: "50%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://concierge24.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-full p-2.5 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/concierge24pro/main/logo.png" alt="Concierge24" class="w-full h-full object-contain" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">Concierge24</b>
                        Assistente vocale e testuale multilingua H24 per hotel e strutture ricettive.
                      </div>
                    </div>
                  </div>

                  {/* 2. DriveMotion (60° - Alto a destra | Sfondo Bianco) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "25%", left: "93.3%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://drivemotion.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-white border border-slate-200 rounded-full p-1.5 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_drivemotion_bg2.jpg" alt="DriveMotion" class="w-full h-full object-contain" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">DriveMotion</b>
                        Video promozionali con rimozione dello sfondo per saloni auto.
                      </div>
                    </div>
                  </div>

                  {/* 3. Nexus AI (120° - Basso a destra | Sfondo Nero) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "75%", left: "93.3%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://nexus.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-full p-3 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/nexus/main/logo_nexus.png" alt="Nexus AI" class="w-full h-full object-contain" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">Nexus AI</b>
                        Inietta un assistente virtuale intelligente su qualsiasi sito esistente.
                      </div>
                    </div>
                  </div>

                  {/* 4. OmniaStudio (180° - Basso al centro | Sfondo Bianco) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "100%", left: "50%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://omniastudio.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-white border border-slate-200 rounded-full p-1 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_OmniaStudio.png" alt="OmniaStudio" class="w-full h-full object-contain" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">OmniaStudio</b>
                        AI locale e privata 100% offline per studi professionali.
                      </div>
                    </div>
                  </div>

                  {/* 5. FF Edizioni (240° - Basso a sinistra | Sfondo Nero | Ritratto) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "75%", left: "6.7%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://ff-edizioni.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-full p-0.5 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/fausto-fusetti-links/main/logo6.jpg" alt="FF Edizioni" class="w-full h-full object-cover rounded-full" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">FF Edizioni</b>
                        Canzoni, sigle commerciali e sound design creati su misura con l'AI.
                      </div>
                    </div>
                  </div>

                  {/* 6. HomeTour AI (300° - Alto a sinistra | Sfondo Nero) */}
                  <div class="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: "25%", left: "6.7%" }}>
                    <div class="orbit-item group relative">
                      <a href="https://hometour.rmstudio.app/" target="_blank" rel="noopener" class="block w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-full p-1 hover:border-cyan-500 transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_hometour%2Bbg.jpg" alt="HomeTour AI" class="w-full h-full object-contain" />
                      </a>
                      <div class="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-[#0a0a0c] border border-white/10 text-slate-300 text-xs rounded-lg p-3 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl text-center z-50">
                        <b class="text-white block mb-1">HomeTour AI</b>
                        Reel immobiliari cinematografici realizzati da semplici foto.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Foto del Fondatore fissa al centro (Massimo fattore di fiducia e E-E-A-T) */}
                <div class="absolute w-36 h-36 rounded-full border-4 border-cyan-500 p-1 bg-black overflow-hidden shadow-2xl z-10">
                  <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/riccardo_founder.jpeg" alt="Riccardo Modena - Fondatore RM Studio" class="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              {/* Informazioni Profilo ed E-E-A-T con link di citazione scientifica ad alta autorevolezza */}
              <div className="w-full lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                  Esperienza & Autorevolezza
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter">
                  Non ti vendo software.<br />
                  <span className="text-cyan-400">Ti costruisco un vantaggio.</span>
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed text-lg font-light italic">
                  "Prendo i tuoi colli di bottiglia e li trasformo in ecosistemi autonomi che producono media,
                  gestiscono clienti e generano vendite H24."
                </p>
                <p className="text-white/40 mb-8 leading-relaxed text-base font-light">
                  Sono Riccardo Modena, founder di <b>RM Studio</b>. Ho fondato questo lab perché oggi l'AI non è più
                  un lusso, è l'unico modo per scalare senza un esercito di dipendenti. Come evidenziato nelle <a href="https://www.w3.org/community/tourism/" target="_blank" rel="noopener" class="text-cyan-400 underline hover:text-cyan-300">linee guida del consorzio internazionale W3C sull'IA applicata al turismo</a>, l'integrazione di sistemi conversazionali intelligenti abbatte la frizione operativa e ottimizza l'esperienza d'uso dell'utente finale.
                </p>
                <a
                  href="#progetti"
                  className="inline-flex items-center gap-2 border-b-2 border-cyan-400 text-cyan-400 pb-1 font-black uppercase text-sm tracking-widest hover:text-white hover:border-white transition-all"
                >
                  Esplora le Soluzioni ↓
                </a>
              </div>
            </div>
          </section>

          {/* ── PRODOTTI ── */}
          <section id="progetti" className="py-32 px-6 relative z-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">
              <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter mb-20 uppercase">
                I Nostri Ecosistemi
              </h2>
          
              {/* 1. Concierge24 */}
              <ProjectCard
                title="Concierge24"
                tag="Hospitality"
                logo="/logo_Concierge24.png"
                gif="/c24_gif.gif"
                desc="L'assistente vocale H24 multilingua che accoglie i tuoi ospiti, risponde alle loro domande e fa up-selling dei tuoi servizi extra mentre il tuo staff riposa."
                url="https://concierge24.rmstudio.app/"
                glowColor="from-orange-400 to-red-500"
              />
          
              {/* 2. DriveMotion */}
              <ProjectCard
                title="DriveMotion"
                tag="Automotive AI"
                logo="/logo_drivemotion.png"
                gif="/drivemotion_gif.gif"
                desc="Sfondi fotorealistici e video virali generati in automatico. Trasforma le foto amatoriali del tuo piazzale in reel cinematografici che aumentano il valore percepito delle tue auto."
                url="https://drivemotion.rmstudio.app"
                glowColor="from-blue-500 to-cyan-400"
                isReversed
              />
          
              {/* 3. HomeTour AI */}
              <ProjectCard
                title="HomeTour AI"
                tag="Real Estate"
                logo="/logo_HomeTour.png"
                gif="/hometour_gif.gif"
                desc="Reel immobiliari con voce narrante emozionale, generati in automatico da semplici fotografie. Vendi l'esperienza della casa prima ancora della visita reale."
                url="https://hometour.rmstudio.app"
                glowColor="from-green-400 to-emerald-600"
              />
          
              {/* 4. NexusAI */}
              <ProjectCard
                title="NexusAI"
                tag="AI Sales Overlay"
                logo="/logo_nexus_bg.png" 
                gif="/nexus_gif.gif"
                desc="Assunzioni e vendite H24, senza cambiare una riga del tuo sito. NexusAI inietta un assistente intelligente che accoglie, informa e converte i tuoi visitatori in tempo reale."
                url="https://demo.rmstudio.app/"
                glowColor="from-cyan-400 to-blue-600"
                isReversed
              />
          
              {/* 5. OmniaStudio */}
              <ProjectCard
                title="OmniaStudio"
                tag="Privacy AI"
                logo="/logo_OmniaStudio.png"
                gif="/omnia_gif.gif"
                desc="La potenza dell'AI generativa, completamente offline sul tuo PC. Analizza contratti, PDF e dati sensibili senza mai inviare un solo byte al cloud. Privacy al 100%."
                url="https://omniastudio.rmstudio.app/"
                glowColor="from-purple-500 to-pink-500"
              />
          
              {/* 6. FF Edizioni */}
              <ProjectCard
                title="FF Edizioni"
                tag="Audio & Music"
                logo="/logo_ff.png"
                gif="/ff_gif.gif"
                desc="Identità sonora e colonne sonore AI originali. Jingle musicali pronti per il broadcast e le campagne social, creati per non essere mai dimenticati dai tuoi clienti."
                url="https://ff.rmstudio.app/"
                glowColor="from-yellow-400 to-orange-600"
                isReversed
              />
            </div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section className="py-32 px-6">
            <h2 className="text-3xl md:text-5xl font-black text-center tracking-tighter mb-4 uppercase">
              Dicono di noi
            </h2>
            <p className="text-center text-white/30 mb-12 tracking-widest uppercase text-[10px] font-bold">
              Slide per scoprire i feedback
            </p>
            <TestimonialSection />
          </section>

          {/* ── CONTATTI (CTA COORDINATE E COMPATTE) ── */}
          <section id="contatti" className="py-32 px-6">
            <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
              <h2 className="text-4xl font-black mb-2 text-center tracking-tighter">
                Parliamo del tuo Progetto
              </h2>
              <p className="text-white/40 text-center mb-10 font-light">
                Compila il modulo, rispondo personalmente in meno di 24 ore.
              </p>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="subject" value="Nuovo Lead da RMStudio.app" />

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                    placeholder="Esempio: Mario Rossi"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Email Aziendale
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                    placeholder="nome@azienda.it"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">
                    Il tuo Obiettivo
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-white/10"
                    placeholder="Quale processo vuoi automatizzare?"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 flex items-center justify-center gap-3 bg-white text-black font-black py-5 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs"
                >
                  <Send size={18} /> Invia Messaggio
                </button>
              </form>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="relative w-full pt-40 pb-12 bg-black border-t border-white/5 flex flex-col items-center overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{ background: "radial-gradient(100% 100% at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 100%)" }}
            />

            <div className="relative z-10 w-full max-w-5xl px-6 h-40 md:h-64 mb-16">
              <TextHoverEffect text="RM STUDIO" />
            </div>

            <div className="relative z-10 flex flex-wrap justify-center gap-10 mb-12">
              <a href="https://www.facebook.com/riccardo.modena.792" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>
              <a href="https://instagram.com/riccardo_mode_" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
              <a href="https://www.linkedin.com/in/riccardo-modena-13918a61/" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
              <a href="https://tiktok.com/@mr3d.riccardo" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
                TikTok
              </a>
            </div>

            <div className="relative z-10 text-white/20 text-[10px] font-bold tracking-[4px] text-center uppercase">
              © {CURRENT_YEAR} Riccardo Modena • RM STUDIO <br />
              <span className="text-cyan-500/50">High-End AI Engineering</span>
            </div>
          </footer>

        </div>

        <NovaChatbot />
        <FloatingDock />
      </main>
    </LazyMotion>
  );
}
