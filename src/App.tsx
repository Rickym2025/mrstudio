import { DottedSurface } from "./components/DottedSurface";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, Linkedin } from "lucide-react";
import { Toaster, toast } from "sonner";

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
    <main className="min-h-screen text-white selection:bg-cyan-500 selection:text-white overflow-x-hidden relative">
      <Toaster position="top-center" theme="dark" />
      
      <DottedSurface />

      {/* HEADER CON LOGO (Punto 6) */}
      <header className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-6xl mx-auto right-0">
        <div className="flex items-center gap-3">
          {/* Sostituisci src="/logo.svg" quando avrai il file nella cartella public */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-lg">RM</div>
          <span className="font-black tracking-widest text-xl">RM STUDIO</span>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase">
          AI Media & Automation Agency
        </div>
        
        {/* TESTO BUSINESS-ORIENTED (Punto 2) */}
        <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6">
          L'Intelligenza Artificiale che <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 text-center max-w-2xl mb-12 font-light tracking-wide">
          Dall'acquisizione clienti automatizzata alla produzione video cinematografica. Costruiamo ecosistemi su misura per abbattere i costi ed espandere il tuo mercato.
        </p>

        {/* PULSANTI CALL TO ACTION (Punto 1 e 8) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <button onClick={handleVCardClick} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
            <Download size={18} />
            Salva Contatto
          </button>
          <a href="https://www.linkedin.com/in/INSERISCI_IL_TUO_LINK_QUI" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/30 transition-all">
            <Linkedin size={18} className="text-blue-400" />
            Connettiamoci su LinkedIn
          </a>
        </div>

        {/* PROGETTI AGGIORNATI E COLORATI (Punti 3, 4, 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          <ProjectCard 
            title="DriveMotion" tag="Automotive AI" 
            desc="Sfondi fotorealistici e video virali generati in automatico per autosaloni e concessionarie." 
            url="https://drivemotion.rmstudio.app" 
            glowColor="from-blue-500 to-cyan-400" 
          />
          <ProjectCard 
            title="HomeTour AI" tag="Real Estate" 
            desc="Reel cinematografici con voce narrante professionale, generati da semplici foto immobiliari." 
            url="https://hometour.rmstudio.app" 
            glowColor="from-green-400 to-emerald-600" 
          />
          <ProjectCard 
            title="Concierge24" tag="Hospitality" 
            desc="L'assistente vocale H24 multilingua che gestisce i turisti del tuo Hotel e vende servizi extra." 
            url="https://concierge.rmstudio.app" 
            glowColor="from-orange-400 to-red-500" 
          />
          <ProjectCard 
            title="OmniaStudio & FF Edizioni" tag="Software & Audio" 
            desc="Privacy AI in locale per i tuoi documenti e produzione di Jingle musicali AI pronti per il broadcast." 
            url="https://omnia.rmstudio.app" 
            glowColor="from-purple-500 to-pink-500" 
          />
        </div>
      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

function ProjectCard({ title, tag, desc, url, glowColor }: { title: string, tag: string, desc: string, url: string, glowColor: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="p-8 bg-[#0a0a0f]/80 border border-white/5 rounded-3xl hover:border-white/20 transition-all duration-500 group relative backdrop-blur-md flex flex-col h-full overflow-hidden">
      {/* Sfondo sfumato colorato che appare all'hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <span className={`text-[10px] uppercase tracking-[3px] font-black bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>{tag}</span>
        <ExternalLink size={16} className="text-white/20 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3 relative z-10">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed flex-grow relative z-10">{desc}</p>
      <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors relative z-10">Scopri la piattaforma →</div>
    </a>
  );
}
