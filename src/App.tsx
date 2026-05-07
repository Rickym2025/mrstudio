import { DottedSurface } from "./components/DottedSurface";
import { BackgroundScrollVideo } from "./components/BackgroundScrollVideo";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
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
    <main className="min-h-screen text-white selection:bg-cyan-500 selection:text-white relative">
      <Toaster position="top-center" theme="dark" />
      
      {/* 1. RIAKTIVIAMO L'OCEANO DI PUNTINI */}
      <DottedSurface />

      <header className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-6xl mx-auto right-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RM Studio Logo" className="w-10 h-10 object-contain" />
          <span className="font-black tracking-widest text-xl drop-shadow-md">RM STUDIO</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 min-h-[85vh] flex flex-col items-center justify-center pt-20">
        <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-black/40 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase">
          AI Media & Automation Agency
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6 drop-shadow-2xl">
          L'Intelligenza Artificiale che <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 text-center max-w-2xl mb-12 font-light tracking-wide drop-shadow-lg">
          Costruiamo ecosistemi AI su misura per abbattere i costi ed espandere il tuo mercato.
        </p>
      </div>

      {/* LA NUOVA SEZIONE FOUNDER (Neuro-Trust) */}
      <div className="relative z-10 w-full bg-gradient-to-b from-transparent via-[#04040a]/90 to-transparent py-32">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Sostituisci con la tua foto generata con il prompt precedente */}
          <div className="w-full md:w-1/2 relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
             <img src="/riccardo_founder.jpg" alt="Riccardo Modena" className="relative z-10 rounded-2xl border border-white/10 shadow-2xl object-cover w-full h-[400px]" />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-black mb-4">Meno Codice. Più Risultati.</h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Sono Riccardo Modena, founder di RM Studio. Ho smesso di vendere "siti web" perché oggi le aziende non hanno bisogno di vetrine vuote, hanno bisogno di <strong className="text-white">macchine da conversione</strong>.
            </p>
            <p className="text-white/60 mb-8 leading-relaxed">
              Unisco neuroscienza e Intelligenza Artificiale per creare automazioni che generano video, audio e contatti mentre tu dormi. Se vuoi scalare, parliamone.
            </p>
            <button onClick={handleVCardClick} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Download size={18} />
              Salva il mio Contatto
            </button>
          </div>
        </div>
      </div>

        {/* GRIGLIA PROGETTI (In fondo alla pagina) */}
        <div className="w-full max-w-6xl px-6 pb-48 pt-20">
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

      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

function ProjectCard({ title, tag, desc, url, glowColor, logo }: { title: string, tag: string, desc: string, url: string, glowColor: string, logo: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="p-8 bg-[#0a0a0f]/60 border border-white/10 rounded-3xl hover:border-white/30 transition-all duration-500 group relative backdrop-blur-xl flex flex-col h-full overflow-hidden shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
           <img src={logo} alt={title} className="w-8 h-8 object-contain rounded-lg" onError={(e) => e.currentTarget.style.display='none'} />
           <span className={`text-[10px] uppercase tracking-[3px] font-black bg-clip-text text-transparent bg-gradient-to-r ${glowColor}`}>{tag}</span>
        </div>
        <ExternalLink size={16} className="text-white/20 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3 relative z-10 drop-shadow-md">{title}</h3>
      <p className="text-sm text-white/70 leading-relaxed flex-grow relative z-10">{desc}</p>
      <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors relative z-10">Scopri la piattaforma →</div>
    </a>
  );
}
