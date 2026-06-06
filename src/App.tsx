"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Toaster, toast } from "sonner";
import { LazyMotion, domAnimation } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Import dei componenti reali presenti nel tuo repository GitHub
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";

gsap.registerPlugin(ScrollTrigger);

const CURRENT_YEAR = new Date().getFullYear();

interface Scene {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  logo: string;
  problem?: string;
  solution?: string;
  neuroCopy?: string;
  url?: string;
  isProduct: boolean;
  isIntro?: boolean;
  isTheUnion?: boolean;
  isContact?: boolean;
}

const SCENES: Scene[] = [
  {
    id: "hero-start",
    chapter: "Ecosistema",
    title: "RM Studio",
    subtitle: "Risolviamo colli di bottiglia operativi sviluppando ecosistemi AI su misura. Riduciamo lo sforzo d'uso, azzeriamo l'errore umano ed espandiamo i tuoi canali commerciali. Scorri per iniziare.",
    logo: "logo_rm.png",
    isProduct: false,
    isIntro: true
  },
  {
    id: "nexus",
    chapter: "Chapter I — Conversion AI",
    title: "NexusAI",
    subtitle: "Assunzioni e vendite H24 sul tuo sito attuale senza cambiare codice. NexusAI inietta un assistente intelligente che accoglie, informa e converte i visitatori in lead profilati.",
    logo: "logo_nexus.png",
    problem: "I siti web aziendali statici registrano costantemente alti tassi di rimbalzo (bounce rate), fallendo nel convertire il traffico serale o festivo in clienti attivi.",
    solution: "L'overlay invisibile si aggancia all'istante alla tua infrastruttura, scansiona in autonomia la conoscenza aziendale e acquisisce i dati di contatto dei visitatori in tempo reale.",
    neuroCopy: "Il 96% degli utenti abbandona le pagine a causa del sovraccarico cognitivo. Nexus agisce sul principio biologico di fluidità, intercettando il dubbio del visitatore all'istante.",
    isProduct: true,
    url: "https://nexus.rmstudio.app"
  },
  {
    id: "concierge24",
    chapter: "Chapter II — Hospitality",
    title: "Concierge24",
    subtitle: "L'assistente vocale H24 multilingua che accoglie gli ospiti, risponde alle loro domande e fa up-selling dei tuoi servizi extra mentre il tuo staff riposa.",
    logo: "logo_concierge.png",
    problem: "La reception offre di picchi di sovraccarico, con centralini intasati e turisti frustrati in attesa di risposte su Wi-Fi e check-in nelle ore notturne.",
    solution: "Giulia risponde all'istante con un'espressività vocale calda e umana, parlando la lingua nativa dell'ospite, proponendo servizi e inviando conferme su WhatsApp.",
    neuroCopy: "Il cervello rettiliano percepisce l'attesa come un disservizio immediato. Giulia azzera la frizione d'ingresso, elevando la percezione di status della struttura.",
    isProduct: true,
    url: "https://concierge24.rmstudio.app"
  },
  {
    id: "dentis",
    chapter: "Chapter III — Dental AI",
    title: "Dentis",
    subtitle: "Receptionist AI telefonica H24 su misura per l'odontoiatria. Sincronizza gli appuntamenti, gestisce il triage e azzera le poltrone vuote.",
    logo: "logo_dentis.png",
    problem: "Telefonate perse fuori orario, poltrone vuote non ottimizzate e segreteria medica intasata dalle urgenze improvvise dei pazienti.",
    solution: "Serena risponde H24, esegue il triage empatico delle problematiche cliniche e prenota le visite direttamente sul calendario sincronizzato Google Calendar.",
    neuroCopy: "Un paziente con dolore vive uno stato di urgenza limbica. Serena risponde al primo squillo, trasformando l'ansia del paziente in fiducia verso lo studio.",
    isProduct: true,
    url: "https://dentis.rmstudio.app"
  },
  {
    id: "lexis",
    chapter: "Chapter IV — Legal AI",
    title: "Lexis AI",
    subtitle: "Assistente telefonica AI formale ed empatica per studi legali. Gestisce prime consulenze e tutela il segreto professionale.",
    logo: "logo_lexis.png",
    problem: "Avvocati e studi legali che faticano a filtrare le richieste futili fuori orario nel rispetto del segreto professionale e del protocollo di studio.",
    solution: "Chiara adotta un registro formale ('Lei'), risponde ai dubbi di base, prenota le prime consulenze sul calendario ed invia promemoria WhatsApp.",
    neuroCopy: "Il cliente legale esige riservatezza e autorità fin dal primo contatto. Chiara adotta un tono distaccato ma empatico, riducendo l'attrito burocratico iniziale.",
    isProduct: true,
    url: "https://lexis.rmstudio.app"
  },
  {
    id: "drivemotion",
    chapter: "Chapter V — Automotive",
    title: "DriveMotion",
    subtitle: "Sfondi fotorealistici e video virali generati in automatico. Trasforma le foto amatoriali del tuo piazzale in reel cinematografici che aumentano il valore delle vetture.",
    logo: "logo_drivemotion.png",
    problem: "Fotografie dei veicoli scattate in piazzali disordinati con sfondi disturbanti che abbassano drasticamente il valore percepito delle auto sui portali.",
    solution: "Rimozione automatica del piazzale e inserimento immediato delle vetture all'interno di showroom digitali 3D di lusso, riallineando fari e riflessi fisici.",
    neuroCopy: "La valutazione estetica avviene in meno di tre decimi di secondo. Elevando lo sfondo, inneschiamo l'euristica del prestigio riducendo la trattativa sul prezzo.",
    isProduct: true,
    url: "https://drivemotion.rmstudio.app"
  },
  {
    id: "hometour",
    chapter: "Chapter VI — Real Estate",
    title: "HomeTour AI",
    subtitle: "Reel immobiliari con voce narrante emozionale, generati in automatico da semplici fotografie. Vendi l'esperienza della casa prima ancora della visita reale.",
    logo: "logo_hometour.jpg",
    problem: "Annunci immobiliari piatti sui portali che faticano a catturare l'interesse emotivo dell'acquirente ed ostacolano l'acquisizione di mandati in esclusiva.",
    solution: "Generazione di video-visite emozionali con carrellate 3D di parallasse simulato dalle foto, musica d'atmosfera e narrazione vocale persuasiva.",
    neuroCopy: "Non si acquistano mq, ma proiezioni del proprio futuro. Attraverso il movimento 3D simuliamo l'immersione spaziale prima ancora della visita fisica.",
    isProduct: true,
    url: "https://hometour.rmstudio.app"
  },
  {
    id: "omniastudio",
    chapter: "Chapter VII — Privacy AI",
    title: "OmniaStudio",
    subtitle: "La potenza dell'AI generativa sul tuo PC, completamente offline. Analizza contratti, PDF e dati sensibili senza inviare dati al cloud, a tutela del segreto professionale.",
    logo: "logo_omniastudio.png",
    problem: "Restrizioni severe sul GDPR e rischio di fuga di dati sensibili inviando contratti e documenti privati ai server cloud delle intelligenze artificiali pubbliche.",
    solution: "Un software monolitico installato localmente sul tuo hardware che analizza documenti, esegue OCR ed elabora report a connessione totalmente disattivata.",
    neuroCopy: "La sicurezza risponde al bisogno biologico di controllo. OmniaStudio lavora isolato, offrendo zero latenza di rete e totale conformità legale.",
    isProduct: true,
    url: "https://omniastudio.rmstudio.app"
  },
  {
    id: "ffedizioni",
    chapter: "Chapter VIII — Audio & Music",
    title: "FF Edizioni",
    subtitle: "Identità sonora e colonne sonore AI originali. Jingle musicali pronti per il broadcast e le campagne social, creati per sintonizzarsi con l'identità del tuo brand.",
    logo: "logo_ff.png",
    problem: "Spot e video aziendali privi di carattere acustico identitario, con elevato rischio di violazione di copyright o royalty su tracce musicali terze.",
    solution: "Creazione di jingle originali e tracce audio proprietarie registrate, progettati scientificamente per innescare l'ancoraggio uditivo del brand.",
    neuroCopy: "L'udito è l'unico senso che non possiamo isolare. Applichiamo l'ancoraggio uditivo affinché il brand rimanga impresso nella memoria a lungo termine.",
    isProduct: true,
    url: "https://ff.rmstudio.app"
  },
  {
    id: "the-union",
    chapter: "The Synthesis",
    title: "Ecosistema Connesso",
    subtitle: "La convergenza di otto canali autonomi integrati sotto un'unica direzione tecnica. Sincronizzazione automatica tramite database relazionali per azzerare ogni forma di frizione logica ed operativa.",
    logo: "logo_rm.png",
    isProduct: false,
    isTheUnion: true
  },
  {
    id: "contacts-end",
    chapter: "The Connection",
    title: "Parliamo del tuo Progetto",
    subtitle: "Compila il modulo contatti per richiedere un'analisi di fattibilità e integrare la tua azienda nell'ecosistema autonomo di RM Studio.",
    logo: "logo_rm.png",
    isProduct: false,
    isContact: true
  }
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitContainerRef = useRef<HTMLDivElement>(null);
  
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const totalFrames = isMobile ? 660 : 1320;
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Caricamento del file esterno orbit-template.html asincrono nativo
  useEffect(() => {
    if (isLoading) return;
    fetch("/orbit-template.html")
      .then((res) => res.text())
      .then((html) => {
        if (orbitContainerRef.current) {
          orbitContainerRef.current.innerHTML = html;
        }
      })
      .catch((err) => console.error("Errore nel recupero del template orbitale:", err));
  }, [isLoading]);

  // Caricamento asincrono e ottimizzazione mobile al 50%
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const getFramePath = (index: number) => {
      const targetIndex = isMobile ? (index * 2) - 1 : index;
      return `/frames/frame_${String(targetIndex).padStart(4, "0")}.jpg`;
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      
      const onLoadOrError = () => {
        loadedCount++;
        setProgress(Math.round((loadedCount / totalFrames) * 100));

        if (loadedCount === totalFrames) {
          setIsLoading(false);
        }
      };

      img.onload = onLoadOrError;
      img.onerror = onLoadOrError;
      images.push(img);
    }
    imagesRef.current = images;
  }, [isMobile, totalFrames]);

  // Gestore del loop bidirezionale infinito
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 4) {
        window.scrollTo(0, 10);
      } else if (window.scrollY <= 2) {
        window.scrollTo(0, maxScroll - 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Inizializzazione GSAP e disegno dei frame sul Canvas
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const scrollTracker = { frame: 0 };

    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
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
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.scale(dpr, dpr);
      drawFrame(getMappedFrame(scrollTracker.frame));
    };

    const getMappedFrame = (rawFrame: number) => {
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
    };

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
      }
    });

    // ─── TRANSIZIONI 3D UNICHE CON FORCE-EXIT (autoAlpha) ───
    const getSceneProps = (idx: number) => {
      switch (idx) {
        case 0:
          return {
            init: { autoAlpha: 0, opacity: 0, scale: 0.7, z: -400, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, scale: 1, z: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, scale: 1.1, z: 100, pointerEvents: "none" }
          };
        case 1:
          return {
            init: { autoAlpha: 0, opacity: 0, rotateY: 90, x: 250, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, rotateY: 0, x: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, rotateY: -90, x: -250, pointerEvents: "none" }
          };
        case 2:
          return {
            init: { autoAlpha: 0, opacity: 0, y: -300, rotateX: 45, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, y: 0, rotateX: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, y: 150, rotateX: -15, pointerEvents: "none" }
          };
        case 3:
          return {
            init: { autoAlpha: 0, opacity: 0, scale: 0.3, z: -700, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, scale: 1, z: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, scale: 1.5, z: 250, pointerEvents: "none" }
          };
        case 4:
          return {
            init: { autoAlpha: 0, opacity: 0, rotateY: -60, rotateX: 20, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, rotateY: 0, rotateX: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, rotateY: 60, rotateX: -20, pointerEvents: "none" }
          };
        case 5:
          return {
            init: { autoAlpha: 0, opacity: 0, scale: 0.1, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, scale: 1, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, scale: 0.1, pointerEvents: "none" }
          };
        case 6:
          return {
            init: { autoAlpha: 0, opacity: 0, x: 350, skewX: -12, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, x: 0, skewX: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, x: -350, skewX: 12, pointerEvents: "none" }
          };
        case 7:
          return {
            init: { autoAlpha: 0, opacity: 0, rotateZ: -180, scale: 0.5, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, rotateZ: 0, scale: 1, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, rotateZ: 180, scale: 0.5, pointerEvents: "none" }
          };
        case 8:
          return {
            init: { autoAlpha: 0, opacity: 0, scale: 1.4, z: 200, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, scale: 1, z: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, scale: 0.7, z: -200, pointerEvents: "none" }
          };
        case 9:
          return {
            init: { autoAlpha: 0, opacity: 0, rotateY: -180, z: -500, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, rotateY: 0, z: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, rotateY: 180, z: 500, pointerEvents: "none" }
          };
        case 10:
          return {
            init: { autoAlpha: 0, opacity: 0, y: 150, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, y: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, y: -150, pointerEvents: "none" }
          };
        default:
          return {
            init: { autoAlpha: 0, opacity: 0, z: -400, pointerEvents: "none" },
            mid: { autoAlpha: 1, opacity: 1, z: 0, pointerEvents: "auto" },
            exit: { autoAlpha: 0, opacity: 0, z: 200, pointerEvents: "none" }
          };
      }
    };

    const triggers = gsap.utils.toArray("#scroll-triggers section");
    const cards = gsap.utils.toArray(".scene-card");

    triggers.forEach((trigger: any, index: number) => {
      const card = cards[index] as HTMLElement;
      if (!card) return;

      const props = getSceneProps(index);
      gsap.set(card, props.init);

      if (index === 0) {
        gsap.set(card, props.mid);
        gsap.timeline({
          scrollTrigger: {
            trigger: trigger,
            start: "top top",
            end: "bottom top",
            scrub: 1
          }
        })
        .to(card, { ...props.mid, duration: 0.8 })
        .to(card, { ...props.exit, duration: 0.2, ease: "power3.in" });
      } else if (index === triggers.length - 1) {
        gsap.timeline({
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1
          }
        })
        .to(card, { ...props.mid, duration: 0.3, ease: "power3.out" })
        .to(card, { ...props.mid, duration: 0.7 });
      } else {
        gsap.timeline({
          scrollTrigger: {
            trigger: trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        })
        .to(card, { ...props.mid, duration: 0.15, ease: "power3.out" })
        .to(card, { ...props.mid, duration: 0.70 })
        .to(card, { ...props.exit, duration: 0.15, ease: "power3.in" });
      }
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isLoading, totalFrames, isMobile]);

  const handleVCardClick = () => {
    const link = document.createElement("a");
    link.href = "contact.vcf";
    link.download = "Riccardo_Modena_RMStudio.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const button = form.querySelector("button[type='submit']") as HTMLButtonElement;
    if (!button) return;
    const originalText = button.innerText;
    button.innerText = "Invio in corso...";
    button.disabled = true;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Messaggio inviato con successo! Ti risponderò entro 24 ore.");
        form.reset();
      } else {
        toast.error("Errore nell'invio. Riprova più tardi.");
      }
    } catch {
      toast.error("Errore di rete. Controlla la connessione.");
    } finally {
      button.innerText = originalText;
      button.disabled = false;
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <main className="fixed inset-0 w-full h-screen bg-[#020205] text-white overflow-hidden select-none">
        
        {/* Toast Notifiche Custom */}
        <Toaster position="top-right" richColors />

        {/* ── CSS ANTI-FLASH INIZIALE & STILI ORBITALI ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          ::-webkit-scrollbar {
            display: none;
          }
          html {
            scrollbar-width: none;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .scene-card {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
          @keyframes orbit-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes counter-rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes pulse-ring-optimized {
            0%, 100% { opacity: 0.2; transform: scale(0.95); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          .pulse-ring-element {
            position: absolute;
            width: 380px;
            height: 380px;
            background-color: rgba(242, 210, 139, 0.05);
            filter: blur(48px);
            border-radius: 9999px;
            will-change: transform, opacity;
            animation: pulse-ring-optimized 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .orbit-ring {
            position: relative;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
            animation: orbit-rotation 40s linear infinite;
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
            border-color: #F2D28B;
            box-shadow: 0 0 15px rgba(242, 210, 139, 0.4);
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
            width: 180px;
            height: 180px;
            border-radius: 50%;
            border: 4px solid #F2D28B;
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
            bottom: 85px;
            left: 50%;
            transform: translateX(-50%);
            width: 220px;
            background: #0a0a0c;
            border: 1px solid rgba(255,255,255,0.08);
            color: #94a3b8;
            font-size: 11px;
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
        ` }} />

        {/* ─── PRELOADER ─── */}
        {isLoading && (
          <div id="loader" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
            <div className="text-center">
              <span className="text-[#F2D28B] text-xs tracking-[0.4em] uppercase block mb-3 font-semibold">RM Studio</span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase text-white mb-8">Ecosistema AI</h2>
              <div className="w-64 h-[1px] bg-neutral-800 relative overflow-hidden mx-auto mb-4">
                <div className="absolute h-full left-0 top-0 bg-[#F2D28B] transition-all duration-150" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">{progress}% Caricato</span>
            </div>
          </div>
        )}

        {/* ─── HEADER MINIMALISTA ─── */}
        <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 md:px-12 py-6 border-b border-white/5 bg-black/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="logo_rm.png" alt="RM Studio Logo" className="w-6 h-6 object-contain" onerror="this.style.display='none'" />
            <span className="font-serif text-lg tracking-widest uppercase text-[#F2D28B]">RM Studio</span>
          </div>
          <a href="#trigger-10" className="border border-[#F2D28B]/40 text-[#F2D28B] hover:bg-[#F2D28B] hover:text-black transition-all duration-300 px-5 py-2 text-[10px] tracking-widest uppercase font-mono">
            CONTATTI
          </a>
        </header>

        {/* ─── CONTENITORE IMMERSIVO CANVAS ─── */}
        <div id="app-container" ref={containerRef} className="relative w-full">
          <div className="sticky top-0 h-screen w-full overflow-hidden z-0 bg-black">
            <canvas ref={canvasRef} id="immersive-canvas" className="w-full h-full object-cover opacity-80"></canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none"></div>
          </div>

          {/* Contenitore Fisso delle Schede (Centrate e allineate lateralmente) */}
          <div id="text-overlays" className="fixed inset-0 z-10 pointer-events-none">
            {SCENES.map((scene, index) => {
              const isEven = index % 2 === 0;
              const flexDirClass = isEven ? "md:flex-row" : "md:flex-row-reverse";

              let alignmentClass = "justify-center md:justify-start text-left items-center md:pl-24";
              if (scene.isIntro || scene.isTheUnion || scene.isContact) {
                alignmentClass = "justify-center text-center mx-auto items-center";
              }

              const cardSizeClass = (scene.isIntro || scene.isTheUnion) ? "max-w-6xl md:p-16" : scene.isContact ? "max-w-4xl md:p-14" : "max-w-3xl";

              // Corpo Editoriale Fluido
              const editorialBody = scene.isProduct ? (
                <div className="mt-6 space-y-4 border-t border-white/5 pt-6 text-base text-neutral-300 font-light leading-relaxed">
                  <p>{scene.problem}</p>
                  <p>{scene.solution}</p>
                  <div className="relative bg-gradient-to-r from-[#F2D28B]/10 to-transparent p-5 rounded-2xl border-l-2 border-[#F2D28B] text-[15px] italic text-[#F2D28B]/95 font-light leading-relaxed">
                    "{scene.neuroCopy}"
                  </div>
                </div>
              ) : null;

              // VCard Button
              const introButton = scene.isIntro ? (
                <button onClick={handleVCardClick} className="inline-flex items-center justify-center gap-3 bg-white text-black text-sm tracking-wider font-extrabold uppercase px-8 py-5 rounded-full hover:scale-105 hover:bg-neutral-100 active:scale-95 transition-all duration-300 mt-8 cursor-pointer pointer-events-auto shadow-[0_0_30px_rgba(255,255,255,0.25)] focus:outline-none">
                  <Download className="w-5 h-5 text-black" />
                  <span>SALVA CONTATTO (vCard)</span>
                </button>
              ) : null;

              // Link al Sito Ufficiale (Informativo, ma ora tutta la scheda è cliccabile)
              const siteLinkButton = (scene.isProduct && scene.url) ? (
                <div className="mt-5 text-left text-sm text-[#F2D28B] font-mono font-bold tracking-wider underline decoration-dotted underline-offset-4 decoration-[#F2D28B]/60">
                  VISITA IL SITO UFFICIALE
                </div>
              ) : null;

              // Form Contatti
              const contactForm = scene.isContact ? (
                <form className="flex flex-col gap-4 mt-6 text-left pointer-events-auto w-full max-w-lg" onSubmit={handleContactSubmit}>
                  <input type="hidden" name="access_key" value="9013a8d5-0901-42a0-b9e6-4c45553f960d" />
                  <input type="hidden" name="subject" value="Nuovo Lead da RMStudio Suite" />
                  
                  <input type="text" name="name" required placeholder="Nome Completo" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#F2D28B]/50 text-base font-light" />
                  <input type="email" name="email" required placeholder="Email Aziendale" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#F2D28B]/50 text-base font-light" />
                  <textarea name="message" required rows="3" placeholder="Quale processo vuoi automatizzare?" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#F2D28B]/50 text-base font-light resize-none"></textarea>
                  
                  <button type="submit" className="bg-[#F2D28B] text-black text-xs tracking-widest font-black uppercase py-5 rounded-2xl hover:bg-white transition-all duration-300 cursor-pointer w-full">
                    Invia Messaggio Aziendale
                  </button>
                </form>
              ) : null;

              // Colonna Destra (Logo, Foto Riccardo, o Sistema Orbitale)
              let rightColumnContent = (
                <div className="flex-shrink-0 flex items-center justify-center bg-black/50 border border-white/10 rounded-[2rem] p-6 w-32 h-32 md:w-44 md:h-44 shadow-inner">
                  <img src={`${scene.logo}`} alt={`${scene.title} Logo`} className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
                </div>
              );

              if (scene.isIntro) {
                rightColumnContent = (
                  <div className="flex-shrink-0 flex items-center justify-center border-2 border-[#F2D28B]/30 rounded-[2.5rem] p-1.5 w-44 h-44 md:w-80 md:h-80 bg-[#050505] shadow-[0_0_40px_rgba(242,210,139,0.25)]">
                    <img src="riccardo_founder.jpeg" alt="Riccardo Modena" className="w-full h-full object-cover rounded-[2rem]" />
                  </div>
                );
              } else if (scene.isTheUnion) {
                rightColumnContent = (
                  <div ref={orbitContainerRef} className="relative w-[400px] h-[400px] flex items-center justify-center scale-95 md:scale-110 mt-6 md:mt-0 pointer-events-auto">
                    {/* Iniettato Dinamicamente tramite fetch da public/orbit-template.html */}
                  </div>
                );
              }

              const cardContent = (
                <div className="flex-1 text-left w-full">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#F2D28B] block mb-2 font-semibold font-mono">{scene.chapter}</span>
                  <h2 className="font-serif text-3xl md:text-5xl text-[#F6F3F0] tracking-wide leading-tight mb-4">{scene.title}</h2>
                  <p className="text-base md:text-lg tracking-wide text-neutral-300 leading-relaxed font-light">{scene.subtitle}</p>
                  {editorialBody}
                  {introButton}
                  {siteLinkButton}
                  {contactForm}
                </div>
              );

              // Per i prodotti, l'intera scheda è un link interattivo a
              if (scene.isProduct) {
                return (
                  <div key={scene.id} className={`absolute inset-0 flex pointer-events-none p-6 md:p-12 ${alignmentClass}`}>
                    <a href={scene.url} target="_blank" rel="noopener noreferrer" className={`scene-card w-full ${cardSizeClass} bg-[#07070a]/92 backdrop-blur-3xl p-8 md:p-14 border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.95)] preserve-3d opacity-0 pointer-events-none flex flex-col ${flexDirClass} gap-8 md:gap-12 items-center justify-between cursor-pointer hover:border-[#F2D28B]/30 hover:shadow-[0_40px_100px_rgba(242,210,139,0.05)] transition-all duration-300`}>
                      {cardContent}
                      {rightColumnContent}
                    </a>
                  </div>
                );
              }

              return (
                <div key={scene.id} className={`absolute inset-0 flex pointer-events-none p-6 md:p-12 ${alignmentClass}`}>
                  <div className={`scene-card w-full ${cardSizeClass} bg-[#07070a]/92 backdrop-blur-3xl p-8 md:p-14 border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.95)] preserve-3d opacity-0 pointer-events-none flex flex-col ${flexDirClass} gap-8 md:gap-12 items-center justify-between`}>
                    {cardContent}
                    {rightColumnContent}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Triggers di Scorrimento */}
          <div id="scroll-triggers" className="relative z-20 w-full pointer-events-none">
            <section id="trigger-0" className="h-screen w-full"></section>
            <section id="trigger-1" className="h-screen w-full"></section>
            <section id="trigger-2" className="h-screen w-full"></section>
            <section id="trigger-3" className="h-screen w-full"></section>
            <section id="trigger-4" className="h-screen w-full"></section>
            <section id="trigger-5" className="h-screen w-full"></section>
            <section id="trigger-6" className="h-screen w-full"></section>
            <section id="trigger-7" className="h-screen w-full"></section>
            <section id="trigger-8" className="h-screen w-full"></section>
            <section id="trigger-9" className="h-screen w-full"></section>
            <section id="trigger-10" className="h-screen w-full"></section>
          </div>
        </div>

        {/* ─── CHATBOT & ACCESSORI DI NAVIGAZIONE COMPATIBILI ─── */}
        <NovaChatbot />
        <FloatingDock />

      </main>
    </LazyMotion>
  );
}
