import { DottedSurface } from "./components/DottedSurface";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ScrollAnimation } from "./components/ScrollAnimation"; // IMPORTANTE
import { ExternalLink, Download } from "lucide-react";
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

      <header className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-6xl mx-auto right-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RM Studio Logo" className="w-10 h-10 object-contain" />
          <span className="font-black tracking-widest text-xl">RM STUDIO</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase">
          AI Media & Automation Agency
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6">
          L'Intelligenza Artificiale che <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 text-center max-w-2xl mb-12 font-light tracking-wide">
          Costruiamo ecosistemi AI su misura per abbattere i costi ed espandere il tuo mercato.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <button onClick={handleVCardClick} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Download size={18} />
            Salva Contatto (vCard)
          </button>
        </div>
      </div>

      {/* SEZIONE ANIMAZIONE (Crea lo scroll lungo) */}
      <ScrollAnimation />

      {/* GRIGLIA PROGETTI */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
          <ProjectCard 
            title="DriveMotion" tag="Automotive AI" 
            logo="/logo_drivemotion.png"
            desc="Sfondi fotorealistici e video virali generati in automatico per autosaloni e concessionarie." 
            url="https://drivemotion.rmstudio.app" 
            glowColor="from-blue-500 to-cyan-400" 
          />
          <ProjectCard 
            title="HomeTour AI" tag="Real Estate" 
            logo="/logo_HomeTour.png"
            desc="Reel cinematografici con voce narrante professionale, generati da semplici foto immobiliari." 
            url="https://hometour.rmstudio.app" 
            glowColor="from-green-400 to-emerald-600" 
          />
          <ProjectCard 
            title="Concierge24" tag="Hospitality"
            logo="/logo_Concierge24.png"
            desc="L'assistente vocale H24 multilingua che gestisce i turisti del tuo Hotel e vende servizi extra." 
            url="https://concierge24.rmstudio.app/" 
            glowColor="from-orange-400 to-red-500" 
          />
          <ProjectCard 
            title="OmniaStudio" tag="Privacy AI" 
            logo="/logo_OmniaStudio.png"
            desc="L'AI che lavora in locale sul tuo PC. Analisi documenti e PDF senza inviare dati al cloud." 
            url="https://omniastudio.rmstudio.app/" 
            glowColor="from-purple-500 to-pink-500" 
          />
          <ProjectCard 
            title="FF Edizioni" tag="Audio & Music" 
            logo="/logo_ff.png"
            desc="Produzione di Jingle musicali e colonne sonore AI originali pronte per il broadcast e i social." 
            url="https://ff.rmstudio.app/" 
            glowColor="from-yellow-400 to-orange-600" 
          />
        </div>
      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

function ProjectCard({ title, tag, desc, url, glowColor, logo }: { title: string, tag: string, desc: string, url: string, glowColor: string, logo: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="p-8 bg-[#0a0a0f]/80 border border-white/5 rounded-3xl hover:border-white/20 transition-all duration-500 group relative backdrop-blur-md flex flex-col h-full overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
           <img src={logo} alt={title} className="w-8 h-8 object-contain rounded-lg" />
           <span className={`text-[10px] uppercase tracking-[3px] font-black bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>{tag}</span>
        </div>
        <ExternalLink size={16} className="text-white/20 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3 relative z-10">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed flex-grow relative z-10">{desc}</p>
      <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors relative z-10">Scopri la piattaforma →</div>
    </a>
  );
}
