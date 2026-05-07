//import { DottedSurface } from "./components/DottedSurface";
import { DottedSurface } from "./components/DottedSurface";
import { NovaChatbot } from "./components/NovaChatbot";
import { FloatingDock } from "./components/FloatingDock";
import { ExternalLink, Download, CheckCircle2 } from "lucide-react";
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
    <main className="text-white selection:bg-cyan-500 selection:text-white relative bg-[#04040a]">
      <Toaster position="top-center" theme="dark" />
      
      {/* LO SFONDO ELEGANTE E FLUIDO */}
      <DottedSurface />

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-6xl mx-auto right-0 mix-blend-difference">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RM Studio Logo" className="w-10 h-10 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="font-black tracking-widest text-xl">RM STUDIO</span>
        </div>
      </header>

      <div className="relative z-10 flex flex-col w-full">
        
        {/* SEZIONE 1: HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-black/40 backdrop-blur-md mb-8 text-[10px] font-black tracking-[4px] text-cyan-400 uppercase">
            AI Media & Automation Agency
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-center tracking-tighter leading-tight mb-6 drop-shadow-2xl">
            L'Intelligenza Artificiale che <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Lavora per il tuo Business.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 text-center max-w-2xl mb-12 font-light tracking-wide drop-shadow-lg">
            Costruiamo ecosistemi AI su misura per abbattere i costi ed espandere il tuo mercato. Nessun codice, solo risultati.
          </p>
          <button onClick={handleVCardClick} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Download size={18} />
            Salva Contatto (vCard)
          </button>
        </section>

        {/* SEZIONE 2: IL FOUNDER (Fiducia) */}
        <section className="min-h-screen flex items-center justify-center py-32 px-6 bg-gradient-to-b from-transparent via-[#04040a]/90 to-transparent">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 blur-2xl opacity-20 rounded-full" />
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
            </div>
          </div>
        </section>

        {/* SEZIONE 3: I PRODOTTI "MONEY MAKER" IN LUNGO */}
        <section className="py-32 px-6 bg-[#04040a]">
          <div className="max-w-5xl mx-auto flex flex-col gap-32">
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-10">I Nostri Ecosistemi</h2>

            {/* PRODOTTO 1: DRIVEMOTION */}
            <div className="flex flex-col md:flex-row items-center gap-12 bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-full md:w-1/2">
                <img src="/logo_drivemotion.png" alt="DriveMotion" className="w-16 h-16 object-contain mb-6 rounded-xl" onError={(e) => e.currentTarget.style.display='none'} />
                <h3 className="text-3xl font-bold mb-4">DriveMotion <span className="text-blue-400 text-sm align-top">Automotive AI</span></h3>
                <p className="text-white/60 mb-6 leading-relaxed">
                  L'incubo di ogni concessionaria: auto fotografate male nel piazzale. DriveMotion prende una tua foto, sconta l'auto e la posiziona in scenari fotorealistici, generando un video virale per i social in automatico.
                </p>
                <ul className="space-y-3 mb-8 text-sm text-white/80">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Sfondi AI perfetti in 10 secondi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Video Reel automatici per Instagram/TikTok</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Incrementa il valore percepito del 30%</li>
                </ul>
                <a href="https://drivemotion.rmstudio.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold transition-colors">
                  Scopri la piattaforma <ExternalLink size={16} />
                </a>
              </div>
              <div className="w-full md:w-1/2 h-[300px] bg-gradient-to-tr from-blue-900/50 to-transparent rounded-2xl border border-white/5 flex items-center justify-center">
                <span className="text-white/20 font-bold uppercase tracking-widest text-sm">[Immagine o Gif Prodotto]</span>
              </div>
            </div>

            {/* PRODOTTO 2: HOMETOUR */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/10 hover:border-green-500/50 transition-colors">
              <div className="w-full md:w-1/2">
                <img src="/logo_HomeTour.png" alt="HomeTour AI" className="w-16 h-16 object-contain mb-6 rounded-xl" onError={(e) => e.currentTarget.style.display='none'} />
                <h3 className="text-3xl font-bold mb-4">HomeTour AI <span className="text-green-400 text-sm align-top">Real Estate</span></h3>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Trasforma un annuncio noioso in un'esperienza cinematografica. Carica 4 foto della casa e la nostra AI genera un video con transizioni professionali e una voce narrante persuasiva che legge le caratteristiche.
                </p>
                <ul className="space-y-3 mb-8 text-sm text-white/80">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Voce AI umana ultra-realistica</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Sottotitoli dinamici (stile TikTok)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> Zero editing video richiesto</li>
                </ul>
                <a href="https://hometour.rmstudio.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-400 text-white font-bold transition-colors">
                  Scopri la piattaforma <ExternalLink size={16} />
                </a>
              </div>
              <div className="w-full md:w-1/2 h-[300px] bg-gradient-to-tl from-green-900/50 to-transparent rounded-2xl border border-white/5 flex items-center justify-center">
                <span className="text-white/20 font-bold uppercase tracking-widest text-sm">[Immagine o Gif Prodotto]</span>
              </div>
            </div>

            {/* PRODOTTO 3: CONCIERGE24 */}
            <div className="flex flex-col md:flex-row items-center gap-12 bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="w-full md:w-1/2">
                <img src="/logo_Concierge24.png" alt="Concierge24" className="w-16 h-16 object-contain mb-6 rounded-xl" onError={(e) => e.currentTarget.style.display='none'} />
                <h3 className="text-3xl font-bold mb-4">Concierge24 <span className="text-orange-400 text-sm align-top">Hospitality</span></h3>
                <p className="text-white/60 mb-6 leading-relaxed">
                  L'assistente vocale H24 che gestisce i turisti del tuo Hotel. Dalle info sul WiFi alla prenotazione del ristorante, risponde in 15 lingue tramite chiamata o chat, liberando il tuo staff.
                </p>
                <ul className="space-y-3 mb-8 text-sm text-white/80">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-400"/> Operativo 24/7 senza pause</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-400"/> Up-selling automatico dei tuoi servizi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-400"/> Connesso al tuo gestionale</li>
                </ul>
                <a href="https://concierge24.rmstudio.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors">
                  Scopri la piattaforma <ExternalLink size={16} />
                </a>
              </div>
              <div className="w-full md:w-1/2 h-[300px] bg-gradient-to-tr from-orange-900/50 to-transparent rounded-2xl border border-white/5 flex items-center justify-center">
                <span className="text-white/20 font-bold uppercase tracking-widest text-sm">[Immagine o Gif Prodotto]</span>
              </div>
            </div>

          </div>
        </section>

      </div>

      <NovaChatbot />
      <FloatingDock />
    </main>
  );
}
