"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, Send } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, LazyMotion, domAnimation } from "framer-motion";

// ─── COSTANTE ANNO (non ricalcolata ad ogni render) ───
const CURRENT_YEAR = new Date().getFullYear();

// ─── 1. FOOTER: TextHoverEffect ───────────────────────────────────────────
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
      <p className="text-center text-sm italic text-white/70 leading-relaxed">&ldquo;{testimonial}&rdquo;</p>
      <span className="text-center text-xs font-black tracking-widest uppercase text-cyan-400">{author}</span>
    </motion.div>
  );
}

const initialTestimonials = [
  // ─── HOMETOUR AI (Real Estate) ───
  { 
    id: "12", 
    author: "Marco G. (Modena)", 
    text: "Abbiamo venduto un immobile in 4 giorni dall'annuncio. Il Reel di HomeTour ha fatto 10k views organiche su Instagram." 
  },
  { 
    id: "15", 
    author: "Elena V. (Milano)", 
    text: "I miei clienti venditori rimangono colpiti quando mostro l'animazione 3D del loro appartamento. Un valore aggiunto concreto per acquisire mandati in esclusiva." 
  },

  // ─── CONCIERGE24 (Hospitality) ───
  { 
    id: "32", 
    author: "Sara L. (Roma)", 
    text: "L'assistente Concierge24 ha letteralmente azzerato le chiamate in reception per chiedere la password del WiFi e gli orari di colazione." 
  },
  { 
    id: "34", 
    author: "Giuseppe T. (Firenze)", 
    text: "I clienti internazionali apprezzano l'assistenza multilingua attiva anche di notte. Risponde all'istante su check-in tardivi e consigli logistici locali." 
  },
  { 
    id: "36", 
    author: "Alessia B. (Venezia)", 
    text: "Gestisco 8 appartamenti turistici. L'integrazione di Concierge24 ha ridotto del 70% i messaggi ripetitivi su WhatsApp, lasciandomi molto più tempo libero." 
  },

  // ─── FF EDIZIONI (Audio & Music) ───
  { 
    id: "42", 
    author: "Claudio M. (Napoli)", 
    text: "Il jingle creato per la nostra campagna radiofonica locale è orecchiabile e professionale. Ottimo lavoro di sintonizzazione con l'identità del nostro brand." 
  },
  { 
    id: "45", 
    author: "Valentina R. (Bologna)", 
    text: "Colonne sonore ideali per i nostri spot di lancio sui social. FF Edizioni ci permette di ottenere sonorità originali senza preoccuparci delle licenze di copyright." 
  },

  // ─── DRIVEMOTION (Automotive AI) ───
  { 
    id: "53", 
    author: "Fabio R. (Torino)", 
    text: "La rimozione dello sfondo e l'inserimento automatico nei saloni virtuali ha dato alle nostre vetture usate un aspetto ordinato e professionale sul portale." 
  },

  // ─── NEXUS AI (Sales AI) ───
  { 
    id: "58", 
    author: "Studio Associato B. (Milano)", 
    text: "Nexus AI gestisce i flussi di contatto sul nostro sito principale. Filtra le richieste degli indecisi e risponde ai dubbi tecnici anche durante il fine settimana." 
  },

  // ─── OMNIASTUDIO (Privacy AI) ───
  { 
    id: "62", 
    author: "Avv. De Luca (Napoli)", 
    text: "L'elaborazione dati completamente locale offline è l'unica soluzione compatibile con il segreto professionale del nostro studio legale. Analisi dei contratti sicura al 100%." 
  },
];

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

// ─── 3. PROJECT CARD (SUPPORTA SIA GIF SIA VIDEO MP4) ──────────────────────
function ProjectCard({ title, tag, desc, url, glowColor, logo, gif, isReversed }: { 
  title: string, tag: string, desc: string, url: string, glowColor: string, logo: string, gif?: string, isReversed?: boolean 
}) {
  const hasGif = Boolean(gif && gif.trim() !== "");
  // Controlla se la risorsa è un video MP4
  const isVideo = hasGif && gif ? gif.endsWith(".mp4") : false;

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
        <p className="text-white/60 leading-relaxed text-lg md:text-xl mb-6">{desc}</p>
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
          isVideo ? (
            /* Renderizza il tag video se è un MP4 (muto, in loop, autostart come una gif) */
            <video
              src={gif}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            />
          ) : (
            /* Renderizza l'immagine standard se è una GIF */
            <img
              src={gif}
              alt={`${title} demo`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )
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

  // Iniezione automatica dello Schema Markup JSON-LD per indicizzazione
  useEffect(() => {
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

        {/* ── STILI CSS ISOLATI (REGOLE DI NEUROSCIENZA COGNITIVA ED ECOISTEMA ORBITANTE) ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes orbit-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes counter-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes netflix-glow {
            0%, 100% { transform: scale(1); opacity: 0.35; filter: blur(75px); }
            50% { transform: scale(1.15); opacity: 0.6; filter: blur(100px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.25; }
            50% { transform: scale(1.08); opacity: 0.5; }
            100% { transform: scale(0.95); opacity: 0.25; }
          }
          @keyframes gold-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.25), inset 0 0 12px rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.3); }
            50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.65), inset 0 0 20px rgba(234, 179, 8, 0.4); border-color: rgba(234, 179, 8, 0.85); }
          }
          
          .orbit-ring {
            position: relative;
            width: 320px;
            height: 320px;
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
            min-height: 440px;
          }
          .orbit-area:hover .orbit-ring,
          .orbit-area:hover .orbit-item {
            animation-play-state: paused;
          }
          .orbit-wrapper {
            position: absolute;
            width: 64px;
            height: 64px;
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
            border-radius: 50%;
          }
          .orbit-center-photo {
            position: absolute;
            width: 144px;
            height: 144px;
            border-radius: 50%;
            border: 4px solid #f97316;
            padding: 4px;
            background: #000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            z-index: 15;
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
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            background: #0a0a0c;
            border: 1px solid rgba(255,255,255,0.08);
            color: #94a3b8;
            font-size: 12px;
            border-radius: 8px;
            padding: 12px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            text-align: center;
            z-index: 50;
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
            animation: netflix-glow 6s ease-in-out infinite;
          }
          .pulse-ring-element {
            animation: pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .gold-decoy-card {
            animation: gold-pulse 3s infinite ease-in-out;
          }
          html { scroll-behavior: smooth; }
        ` }} />

        {/* ── VIDEO BACKGROUND OTTIMIZZATO (ACCELERATO DA GPU CON ACCESSO FLUIDO AUTO) ── */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 transform-gpu ${
              videoLoaded ? "opacity-30" : "opacity-0"
            }`}
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/80 via-[#020205]/40 to-[#020205]/95" />
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

          {/* ── REGOLA 3: Il Visual Hook di 3 secondi (Effetto Netflix) ── */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-blue-500/15 rounded-full pointer-events-none visual-hook-glow z-0" />

          {/* ── HERO CON STRUTTURA A "F" PER LA COMFORT ZONE (REGOLA 4) ── */}
          <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 pt-24 gap-12 lg:gap-16">
            
            {/* Sezione Sinistra dell&apos;Asse di Lettura a F */}
            <div className="flex-1 text-center lg:text-left z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase"
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

              {/* REGOLA 1: Riduzione della Frizione di Lettura (Testo >= 18px) */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 font-light tracking-wide leading-relaxed"
              >
                Sviluppiamo ecosistemi AI su misura per abbattere i costi operativi ed espandere il tuo mercato.
                Zero codice complesso, solo risultati scalabili ed integrati.
              </motion.p>

              {/* REGOLA 7: Consolidamento Decisionale (CTA Ravvicinate) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center lg:justify-start">
                
                {/* REGOLA 2: Dominanza Visiva del Pulsante di Conversione (Dimensione x2) */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleVCardClick}
                  className="flex items-center justify-center gap-3 px-14 py-7 rounded-full bg-white text-black font-extrabold hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] text-lg sm:text-xl tracking-wider w-full sm:w-auto"
                >
                  <Download size={24} />
                  SALVA CONTATTO (vCard)
                </motion.button>

                <a 
                  href="#progetti"
                  className="bg-black/40 text-slate-300 border border-white/10 px-6 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all text-sm text-center self-center"
                >
                  Esplora Ecosistemi
                </a>
              </div>
            </div>

            {/* Sezione Destra dell&apos;Asse a F: Ecosistema Orbitante a 6 elementi */}
            <div className="flex-1 w-full max-w-[500px] flex justify-center items-center relative z-10 min-h-[440px] orbit-area">
              <div className="absolute w-72 h-72 bg-cyan-500/5 blur-3xl rounded-full pulse-ring-element" />
              
              <div className="orbit-ring">
                
                {/* 1. Concierge24 (0° - Alto al centro) */}
                <div className="orbit-wrapper" style={{ top: "0%", left: "50%" }}>
                  <div className="orbit-item">
                    <a href="https://concierge24.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#0a0a0c", padding: "10px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/concierge24pro/main/logo.png" alt="Concierge24" className="orbit-img" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>Concierge24</b>
                      Assistente vocale e testuale AI H24 per hotel e strutture extra-alberghiere.
                    </div>
                  </div>
                </div>

                {/* 2. DriveMotion (60° - Alto a destra) */}
                <div className="orbit-wrapper" style={{ top: "25%", left: "93.3%" }}>
                  <div className="orbit-item">
                    <a href="https://drivemotion.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#fff", padding: "6px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_drivemotion_bg2.jpg" alt="DriveMotion" className="orbit-img cover rounded" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>DriveMotion AI</b>
                      Generazione automatica di sfondi e video cinematici per saloni auto.
                    </div>
                  </div>
                </div>

                {/* 3. Nexus AI (120° - Basso a destra) */}
                <div className="orbit-wrapper" style={{ top: "75%", left: "93.3%" }}>
                  <div className="orbit-item">
                    <a href="https://nexus.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#0a0a0c", padding: "12px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/nexus/main/logo_nexus.png" alt="Nexus AI" className="orbit-img" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>Nexus AI</b>
                      Widget chatbot intelligente per accoglienza e conversione automatica lead.
                    </div>
                  </div>
                </div>

                {/* 4. OmniaStudio (180° - Basso al centro) */}
                <div className="orbit-wrapper" style={{ top: "100%", left: "50%" }}>
                  <div className="orbit-item">
                    <a href="https://omniastudio.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#fff", padding: "4px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_OmniaStudio.png" alt="OmniaStudio" className="orbit-img" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>OmniaStudio</b>
                      La potenza dell&apos;AI locale e protetta offline sul tuo PC, a vita.
                    </div>
                  </div>
                </div>

                {/* 5. FF Edizioni (240° - Basso a sinistra) */}
                <div className="orbit-wrapper" style={{ top: "75%", left: "6.7%" }}>
                  <div className="orbit-item">
                    <a href="https://ff-edizioni.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#0a0a0c", padding: "2px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/fausto-fusetti-links/main/logo6.jpg" alt="FF Edizioni" className="orbit-img cover rounded" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>FF Edizioni</b>
                      Colonne sonore, jingle commerciali e sound design creati con l&apos;AI.
                    </div>
                  </div>
                </div>

                {/* 6. HomeTour AI (300° - Alto a sinistra) */}
                <div className="orbit-wrapper" style={{ top: "25%", left: "6.7%" }}>
                  <div className="orbit-item">
                    <a href="https://hometour.rmstudio.app" target="_blank" rel="noopener noreferrer" className="orbit-link" style={{ background: "#0a0a0c", padding: "4px" }}>
                      <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo_hometour%2Bbg.jpg" alt="HomeTour" className="orbit-img cover rounded" />
                    </a>
                    <div className="orbit-tooltip">
                      <b>HomeTour AI</b>
                      Reel immobiliari con voce narrante generati in automatico da foto.
                    </div>
                  </div>
                </div>

              </div>

              {/* Foto del Fondatore fissa al centro - REGOLA 5 (Fiducia Umana) */}
              <div className="orbit-center-photo">
                <img src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/riccardo_founder.jpeg" alt="Riccardo Modena - Fondatore RM Studio" />
              </div>
            </div>

          </section>

          {/* ── AUTOREVOLEZZA SCIENTIFICA (REGOLA 6) ── */}
          <section className="bg-slate-950/60 border-y border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 text-sm">
              <p className="text-center md:text-left text-slate-400 font-medium max-w-xl">
                I nostri sistemi e le strutture conversazionali sono progettati in aderenza ai protocolli e agli standard internazionali sulla sicurezza delle informazioni e sulla comunicazione d&apos;impresa.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold">
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

          {/* ── SEZIONE PROFILO & EEAT CON SOLIDITÀ SCIENTIFICA ── */}
          <section className="py-24 px-6 max-w-6xl mx-auto border-b border-white/5">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="relative p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-3xl shadow-2xl">
                  <img 
                    src="https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/riccardo_founder.jpeg" 
                    alt="Riccardo Modena" 
                    className="w-64 h-64 object-cover rounded-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-[#0a0a0c] border border-white/10 px-4 py-2 rounded-xl text-xs text-slate-300 font-semibold shadow-xl">
                    Riccardo Modena
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
                <span className="text-xs uppercase tracking-widest font-black text-cyan-400 mb-3 block">Direzione Tecnica</span>
                <h3 className="text-3xl font-bold mb-4">La tecnologia deve eliminare l&apos;attrito, non crearlo.</h3>
                {/* REGOLA 1: Riduzione della Frizione di Lettura (Testo >= 18px) */}
                <p className="text-lg text-white/50 leading-relaxed font-light mb-6">
                  &ldquo;Nello sviluppo dei nostri ecosistemi l&apos;obiettivo principale è rimuovere ogni forma di frizione operativa, riducendo lo sforzo d&apos;uso sia per le aziende che per i loro utenti finali. Integrare l&apos;intelligenza artificiale non significa aggiungere complessità, ma automatizzare canali per produrre risultati in modo fluido e protetto.&rdquo;
                </p>
                <p className="text-sm text-white/30">
                  Come indicato nelle linee guida di conformità dell&apos;organizzazione internazionale <a href="https://www.w3.org/community/tourism/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">W3C per i canali integrati</a>, l&apos;adozione di architetture logiche simmetriche riduce i tempi di interazione massimizzando la permanenza attiva.
                </p>
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
                gif="/drivemotion_video.mp4"
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
                gif="/omniastudio_video.mp4"
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

          {/* ── CONTATTI (CTA COORDINATE E COMPATTE - REGOLA 7) ── */}
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

                {/* REGOLA 2: Dominanza Visiva del Pulsante di Conversione */}
                <button
                  type="submit"
                  className="mt-4 flex items-center justify-center gap-3 bg-white text-black font-black py-6 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.25)]"
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
