import { DottedSurface } from "./components/DottedSurface";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink } from "lucide-react";
import { Toaster } from "sonner";

export default function App() {
  return (
    /* Rimosso bg-[#020205] da qui perché lo gestisce DottedSurface */
    <main className="min-h-screen text-white selection:bg-white selection:text-black overflow-x-hidden relative">
      <Toaster position="top-center" theme="dark" />
      
      {/* Lo sfondo animato */}
      <DottedSurface />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-white/50 uppercase">
          AI Engineering Lab
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-center tracking-tighter leading-tight mb-6">
          Non Scrivere Codice.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600">Scala il Business.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/40 text-center max-w-2xl mb-24 font-light tracking-wide">
          Ecosistemi di Intelligenza Artificiale progettati per espandere il tuo mercato e abbattere i costi operativi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <ProjectCard title="HomeTour AI" tag="Real Estate" desc="Reel cinematografici generati in automatico da semplici foto immobiliari." url="#" />
          <ProjectCard title="DriveMotion" tag="Automotive" desc="Piattaforma AI per autosaloni. Sfondi fotorealistici e video virali." url="#" />
          <ProjectCard title="Concierge24" tag="Hospitality" desc="L'assistente H24 multilingua che gestisce i turisti del tuo Hotel." url="#" />
        </div>
      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}

function ProjectCard({ title, tag, desc, url }: { title: string, tag: string, desc: string, url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 group relative backdrop-blur-md flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] uppercase tracking-[3px] text-white/40 font-bold">{tag}</span>
        <ExternalLink size={16} className="text-white/20 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed flex-grow">{desc}</p>
      <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Scopri la piattaforma →</div>
    </a>
  );
}