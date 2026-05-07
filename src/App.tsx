import React, { useRef, useState, useEffect } from "react";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, Send } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";

// --- 1. COMPONENTE FOOTER EFFETTO HOVER ---
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
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef} width="100%" height="100%" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none uppercase cursor-pointer w-full h-full"
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </>
          )}
        </linearGradient>
        <motion.radialGradient id="revealMask" gradientUnits="userSpaceOnUse" r="20%" initial={{ cx: "50%", cy: "50%" }} animate={maskPosition} transition={{ duration: 0, ease: "easeOut" }}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-white/10 font-black text-6xl" style={{ opacity: hovered ? 0.7 : 0 }}>{text}</text>
      <motion.text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-cyan-500/50 font-black text-6xl"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }} animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }} transition={{ duration: 4, ease: "easeInOut" }}
      >{text}</motion.text>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" stroke="url(#textGradient)" strokeWidth="0.3" mask="url(#textMask)" className="fill-transparent font-black text-6xl">{text}</text>
    </svg>
  );
};

// --- 2. COMPONENTE TESTIMONIAL CARD ---
function TestimonialCard({ handleShuffle, testimonial, position, id, author }: any) {
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
        if (dragRef.current - e.clientX > 100 || e.clientX - dragRef.current > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[350px] w-[300px] select-none place-content-center space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img src={`https://i.pravatar.cc/128?img=${id}`} alt={author} className="pointer-events-none mx-auto h-20 w-20 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg" />
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
  const handleShuffle = () => {
    setTestimonials((prev) => {
      const newArr = [...prev];
      const first = newArr.shift();
      if (first) newArr.push(first);
      return newArr;
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[450px] flex justify-center items-center mt-12 overflow-hidden px-4">
      <div className="relative w-[300px] h-[350px]">
        {testimonials.map((t, i) => (
          <TestimonialCard key={t.id} id={t.id} author={t.author} testimonial={t.text} position={i === 0 ? "front" : i === 1 ? "middle" : "back"} handleShuffle={handleShuffle} />
        ))}
      </div>
    </div>
  );
}

// --- 3. MAIN APP ---
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

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "9013a8d5-0901-42a0-b9e6-4c45553f960d"); 

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData }).then(r => r.json());
      if (res.success) {
        toast.success("Messaggio inviato con successo! Ti risponderò entro 24 ore.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("Errore nell'invio del messaggio.");
      }
    } catch (error) {
      toast.error("Errore di rete. Riprova più tardi.");
    }
  };

  return (
    <main className="text-white selection:bg-cyan-500 selection:text-white relative bg-transparent overflow-x-hidden min-h-screen">
      <Toaster position="top-center" theme="dark" />
      
      {/* 🌌 SFONDO STELLARE CONTINUO (Funziona ovunque, non si interrompe) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
        {/* Effetto particellare CSS */}
        <div className="stars-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="star" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }} />
          ))}
        </div>
      </div>

      {/* HEADER PROFESSIONALE */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="RM Studio Logo" className="w-8 h-8 object-contain rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            <span className="font-black tracking-[0.2em] text-lg uppercase">RM Studio</span>
          </div>
          <a href="#contatti" className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 px-5 py-2.5 rounded-full bg-cyan-500/5">
            Contattaci
          </a>
        </div>
      </header>

      <div className="relative z-10 flex flex-col w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase"
          >
            AI Engineering Lab
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6 drop-shadow-2xl">
            L'Intelligenza Artificiale che <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 text-center max-w-2xl mb-12 font-light tracking-wide">
            Sviluppiamo ecosistemi AI su misura per abbattere i costi operativi ed espandere il tuo mercato. Zero codice, solo risultati scalabili.
          </p>
          <button onClick={handleVCardClick} className="flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <Download size={20} />
            SALVA CONTATTO (vCard)
          </button>
        </section>

        {/* SEZIONE FOUNDER */}
        <section className="py-32 px-6 backdrop-blur-[2px]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full" />
               <img src="/riccardo_founder.jpeg" alt="Riccardo Modena" className="relative z-10 rounded-[2rem] border border-white/10 shadow-2xl object-cover w-full aspect-[4/5] grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter">Non ti vendo software.<br/><span className="text-cyan-400">Ti costruisco un vantaggio.</span></h2>
              <p className="text-white/60 mb-6 leading-relaxed text-lg font-light italic">
                "Prendo i tuoi colli di bottiglia e li trasformo in ecosistemi autonomi che producono media, gestiscono clienti e generano vendite H24."
              </p>
              <p className="text-white/40 mb-8 leading-relaxed text-base font-light">
                Sono Riccardo Modena, founder di RM Studio. Ho fondato questo lab perché oggi l'AI non è più un lusso, è l'unico modo per scalare senza un esercito di dipendenti.
              </p>
              <a href="#progetti" className="inline-flex items-center gap-2 border-b-2 border-cyan-400 text-cyan-400 pb-1 font-black uppercase text-sm tracking-widest hover:text-white hover:border-white transition-all">
                Esplora le Soluzioni ↓
              </a>
            </div>
          </div>
        </section>

        {/* SEZIONE PRODOTTI (Ordine: Concierge, DriveMotion, HomeTour, OmniaStudio, FF Edizioni) */}
        <section id="progetti" className="py-32 px-6 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter mb-20 uppercase">I Nostri Ecosistemi</h2>

            <ProjectCard 
              title="Concierge24" tag="Hospitality" logo="/logo_Concierge24.png"
              desc="L'assistente vocale H24 multilingua che accoglie i tuoi ospiti, risponde alle loro domande e fa up-selling dei tuoi servizi extra mentre il tuo staff riposa." 
              url="https://concierge24.rmstudio.app/" glowColor="from-orange-400 to-red-500" 
            />

            <ProjectCard 
              title="DriveMotion" tag="Automotive AI" logo="/logo_drivemotion.png"
              desc="Sfondi fotorealistici e video virali generati in automatico. Trasforma le foto amatoriali del tuo piazzale in reel cinematografici che aumentano il valore percepito delle tue auto." 
              url="https://drivemotion.rmstudio.app" glowColor="from-blue-500 to-cyan-400" 
            />

            <ProjectCard 
              title="HomeTour AI" tag="Real Estate" logo="/logo_HomeTour.png"
              desc="Reel immobiliari con voce narrante emozionale, generati in automatico da semplici fotografie. Vendi l'esperienza della casa prima ancora della visita reale." 
              url="https://hometour.rmstudio.app" glowColor="from-green-400 to-emerald-600" 
            />

            <ProjectCard 
              title="OmniaStudio" tag="Privacy AI" logo="/logo_OmniaStudio.png"
              desc="La potenza dell'AI generativa, completamente offline sul tuo PC. Analizza contratti, PDF e dati sensibili senza mai inviare un solo byte al cloud. Privacy al 100%." 
              url="https://omniastudio.rmstudio.app/" glowColor="from-purple-500 to-pink-500" 
            />

            <ProjectCard 
              title="FF Edizioni" tag="Audio & Music" logo="/logo_ff.png"
              desc="Identità sonora e colonne sonore AI originali. Jingle musicali pronti per il broadcast e le campagne social, creati per non essere mai dimenticati dai tuoi clienti." 
              url="https://ff.rmstudio.app/" glowColor="from-yellow-400 to-orange-600" 
            />
          </div>
        </section>

        {/* SEZIONE TESTIMONIALS */}
        <section className="py-32 px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center tracking-tighter mb-4 uppercase">Dicono di noi</h2>
          <p className="text-center text-white/30 mb-12 tracking-widest uppercase text-[10px] font-bold">Slide per scoprire i feedback</p>
          <TestimonialSection />
        </section>

        {/* SEZIONE CONTATTI */}
        <section id="contatti" className="py-32 px-6">
          <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
            <h2 className="text-4xl font-black mb-2 text-center tracking-tighter">Parliamo del tuo Progetto</h2>
            <p className="text-white/40 text-center mb-10 font-light">Compila il modulo, rispondo personalmente in meno di 24 ore.</p>
            
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="subject" value="Nuovo Lead da RMStudio.app" />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">Nome Completo</label>
                <input type="text" name="name" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10" placeholder="Esempio: Mario Rossi" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">Email Aziendale</label>
                <input type="email" name="email" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10" placeholder="nome@azienda.it" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 ml-2">Il tuo Obiettivo</label>
                <textarea name="message" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-white/10" placeholder="Quale processo vuoi automatizzare?"></textarea>
              </div>
              <button type="submit" className="mt-4 flex items-center justify-center gap-3 bg-white text-black font-black py-5 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs">
                <Send size={18} /> Invia Messaggio
              </button>
            </form>
          </div>
        </section>

        {/* FOOTER & SOCIAL */}
        <footer className="relative w-full pt-40 pb-12 bg-black border-t border-white/5 flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(100% 100% at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 100%)" }} />
          
          <div className="relative z-10 w-full max-w-5xl px-6 h-40 md:h-64 mb-16">
            <TextHoverEffect text="RM STUDIO" />
          </div>
          
          <div className="relative z-10 flex flex-wrap justify-center gap-10 mb-12">
            <a href="https://www.facebook.com/riccardo.modena.792" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> 
              Facebook
            </a>
            <a href="https://instagram.com/riccardo_mode_" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> 
              Instagram
            </a>
            <a href="https://www.linkedin.com/in/riccardo-modena-13918a61/" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> 
              LinkedIn
            </a>
            <a href="https://tiktok.com/@mr3d.riccardo" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              TikTok
            </a>
          </div>

          <div className="relative z-10 text-white/20 text-[10px] font-bold tracking-[4px] text-center uppercase">
            © {new Date().getFullYear()} Riccardo Modena • RM STUDIO <br/> 
            <span className="text-cyan-500/50">High-End AI Engineering</span>
          </div>
        </footer>

      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

// COMPONENTE CARD PRODOTTO (Ultra-Glassmorphism)
function ProjectCard({ title, tag, desc, url, glowColor, logo }: { title: string, tag: string, desc: string, url: string, glowColor: string, logo: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col md:flex-row items-center gap-8 bg-white/[0.01] hover:bg-white/[0.04] p-8 md:p-10 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all duration-700 group relative backdrop-blur-md overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
      
      <div className="w-full md:w-2/3 relative z-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-5 mb-6">
           <img src={logo} alt={title} className="w-14 h-14 object-contain rounded-2xl shadow-2xl bg-black/40 p-2 border border-white/5" onError={(e) => e.currentTarget.style.display='none'} />
           <div>
             <h3 className="text-3xl font-black tracking-tighter">{title}</h3>
             <span className={`text-[10px] font-black uppercase tracking-[4px] bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>{tag}</span>
           </div>
        </div>
        <p className="text-white/50 leading-relaxed text-lg font-light mb-8 max-w-xl">
          {desc}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/30 group-hover:text-cyan-400 transition-all">
          Accedi alla Piattaforma <ExternalLink size={14} />
        </div>
      </div>

      <div className="w-full md:w-1/3 h-[180px] bg-white/[0.02] rounded-[1.5rem] border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-700 relative overflow-hidden">
         <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-[0.05]`} />
         <span className="text-white/5 font-black uppercase tracking-[10px] text-[10px] rotate-[-10deg]">RM STUDIO ENV</span>
      </div>
    </a>
  );
}
