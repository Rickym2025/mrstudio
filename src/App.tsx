import React, { useRef, useState, useEffect } from "react";
import { DottedSurface } from "./components/DottedSurface";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, CheckCircle2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";

// --- COMPONENTE FOOTER EFFETTO HOVER (Da 21st.dev) ---
const TextHoverEffect = ({ text }: { text: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
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
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none uppercase cursor-pointer w-full h-full"
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#06b6d4" /> {/* Ciano */}
              <stop offset="50%" stopColor="#8b5cf6" /> {/* Viola */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* Blu */}
            </>
          )}
        </linearGradient>
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-white/10 font-black text-6xl" style={{ opacity: hovered ? 0.7 : 0 }}>
        {text}
      </text>
      <motion.text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-cyan-500/50 font-black text-6xl"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" stroke="url(#textGradient)" strokeWidth="0.3" mask="url(#textMask)" className="fill-transparent font-black text-6xl">
        {text}
      </text>
    </svg>
  );
};
// ----------------------------------------------------

export default function App() {
  const handleVCardClick = () => {
    toast.success("Contatto salvato nella rubrica.");
    const link = document.createElement("a");
    link.href = "/contact.vcf";
    link.download = "Riccardo_Modena_RMStudio.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="text-white selection:bg-cyan-500 selection:text-white relative bg-[#04040a] overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      
      {/* SFONDO PUNTINI (Rimesso in funzione) */}
      <DottedSurface />

      {/* HEADER PROFESSIONALE */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 backdrop-blur-md bg-[#04040a]/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="RM Studio Logo" className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <span className="font-black tracking-[0.2em] text-lg">RM STUDIO</span>
          </div>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 px-4 py-2 rounded-full bg-cyan-500/10">
            Contattaci
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-col w-full">
        
        {/* SEZIONE 1: HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-black/40 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase">
            AI Engineering Lab
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6 drop-shadow-2xl">
            L'Intelligenza Artificiale che <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 text-center max-w-2xl mb-12 font-light tracking-wide drop-shadow-lg">
            Sviluppiamo ecosistemi AI su misura per abbattere i costi operativi ed espandere il tuo mercato. Nessun codice, solo risultati.
          </p>
          <button onClick={handleVCardClick} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Download size={18} />
            Salva il mio Contatto (vCard)
          </button>
        </section>

        {/* SEZIONE 2: IL FOUNDER (Nuova Copy Neuroscientifica) */}
        <section className="py-32 px-6 bg-gradient-to-b from-transparent via-[#080812] to-[#04040a]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
               <img src="/riccardo_founder.jpeg" alt="Riccardo Modena" className="relative z-10 rounded-3xl border border-white/10 shadow-2xl object-cover w-full aspect-square md:aspect-[4/5] grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Non ti vendo software.<br/><span className="text-cyan-400">Ti costruisco un vantaggio.</span></h2>
              <p className="text-white/70 mb-6 leading-relaxed text-lg font-light">
                Sono Riccardo Modena, founder di RM Studio. Vedo troppe aziende bloccate da processi lenti, compiti manuali e costi operativi insostenibili.
              </p>
              <p className="text-white/70 mb-8 leading-relaxed text-lg font-light">
                Oggi l'Intelligenza Artificiale non è più un lusso, è l'unico modo per scalare senza dover assumere un esercito di dipendenti. Il mio lavoro? <strong className="text-white font-medium">Prendo i tuoi colli di bottiglia e li trasformo in ecosistemi autonomi</strong> che producono media, gestiscono clienti e generano vendite H24.
              </p>
              <a href="#progetti" className="inline-block border-b border-cyan-400 text-cyan-400 pb-1 font-bold hover:text-white hover:border-white transition-colors">
                Scopri le nostre Soluzioni ↓
              </a>
            </div>
          </div>
        </section>

        {/* SEZIONE 3: I PRODOTTI */}
        <section id="progetti" className="py-32 px-6 bg-[#04040a] relative">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-16">I Nostri Ecosistemi</h2>

            {/* OMNIA STUDIO (Aggiunto come richiesto) */}
            <ProjectCard 
              title="OmniaStudio" tag="Privacy AI" 
              logo="/logo_OmniaStudio.png"
              desc="La potenza dell'Intelligenza Artificiale generativa, completamente offline. Analizza contratti, PDF e dati sensibili della tua azienda senza mai inviare un solo byte al cloud. Privacy garantita al 100%." 
              url="https://omniastudio.rmstudio.app/" 
              glowColor="from-purple-500 to-pink-500" 
            />

            <ProjectCard 
              title="DriveMotion" tag="Automotive AI" 
              logo="/logo_drivemotion.png"
              desc="Sfondi fotorealistici e video virali generati in automatico. Trasforma le foto amatoriali del tuo piazzale in reel cinematografici che aumentano il valore percepito delle tue auto." 
              url="https://drivemotion.rmstudio.app" 
              glowColor="from-blue-500 to-cyan-400" 
            />

            <ProjectCard 
              title="HomeTour AI" tag="Real Estate" 
              logo="/logo_HomeTour.png"
              desc="Reel immobiliari con voce narrante emozionale, generati in automatico da semplici fotografie. Vendi l'esperienza della casa prima ancora della visita." 
              url="https://hometour.rmstudio.app" 
              glowColor="from-green-400 to-emerald-600" 
            />

            <ProjectCard 
              title="Concierge24" tag="Hospitality" 
              logo="/logo_Concierge24.png"
              desc="L'assistente vocale H24 multilingua che accoglie i tuoi ospiti, risponde alle loro domande e fa up-selling dei tuoi servizi extra mentre il tuo staff riposa." 
              url="https://concierge.rmstudio.app/" 
              glowColor="from-orange-400 to-red-500" 
            />

            <ProjectCard 
              title="FF Edizioni" tag="Audio & Music" 
              logo="/logo_ff.png"
              desc="Produzione di Jingle musicali e colonne sonore AI originali. L'identità sonora perfetta per il tuo brand, pronta per il broadcast e le campagne social." 
              url="https://ff.rmstudio.app/" 
              glowColor="from-yellow-400 to-orange-600" 
            />
          </div>
        </section>

        {/* SEZIONE 4: CINEMATIC FOOTER (Da 21st.dev) */}
        <footer className="relative w-full h-[50vh] md:h-[60vh] bg-[#020205] border-t border-white/10 flex flex-col items-center justify-center overflow-hidden">
          {/* Gradiente radiale di sfondo */}
          <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(125% 125% at 50% 10%, rgba(15,15,17,0.4) 50%, rgba(6,182,212,0.15) 100%)" }} />
          
          <div className="relative z-10 w-full max-w-4xl px-6 h-48 md:h-64 mb-8">
            <TextHoverEffect text="RM STUDIO" />
          </div>
          
          <div className="relative z-10 flex gap-6 text-sm text-white/50 font-medium">
            <a href="mailto:riccardo@rmstudio.app" className="hover:text-cyan-400 transition-colors">riccardo@rmstudio.app</a>
            <span>•</span>
            <a href="https://linkedin.com" target="_blank" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
          </div>
        </footer>

      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

// COMPONENTE CARD PRODOTTO (Layout Orizzontale Elegante)
function ProjectCard({ title, tag, desc, url, glowColor, logo }: { title: string, tag: string, desc: string, url: string, glowColor: string, logo: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col md:flex-row items-center gap-8 bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 group relative backdrop-blur-md overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      <div className="w-full md:w-2/3 relative z-10">
        <div className="flex items-center gap-4 mb-4">
           <img src={logo} alt={title} className="w-12 h-12 object-contain rounded-xl shadow-lg bg-black/50 p-1" onError={(e) => e.currentTarget.style.display='none'} />
           <div>
             <h3 className="text-3xl font-bold">{title}</h3>
             <span className={`text-xs uppercase tracking-[3px] font-black bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>{tag}</span>
           </div>
        </div>
        <p className="text-white/60 leading-relaxed text-lg mb-6">
          {desc}
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:underline decoration-cyan-400 underline-offset-4 transition-all">
          Accedi alla Piattaforma <ExternalLink size={16} />
        </span>
      </div>

      {/* Box decorativo a destra (puoi metterci GIF in futuro) */}
      <div className="w-full md:w-1/3 h-[200px] bg-gradient-to-tr from-white/5 to-transparent rounded-2xl border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
         <span className="text-white/10 font-bold uppercase tracking-widest text-xs rotate-[-10deg]">RM Studio Env</span>
      </div>
    </a>
  );
}
