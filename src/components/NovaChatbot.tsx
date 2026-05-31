import { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";

export function NovaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "bot" | "user" }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lista ordinata dei tuoi loghi locali
  const logos = [
    "/logo.png",
    "/logo_Concierge24.png",
    "/logo_HomeTour.png",
    "/logo_OmniaStudio.png",
    "/logo_drivemotion.png",
    "/logo_ff.png",
    "/logo_nexus_bg.png"
  ];
  const [currentLogoIdx, setCurrentLogoIdx] = useState(0);

  const suggestions = [
    "🚗 Video virali per Auto",
    "🏠 Reel per Agenzie Immobiliari",
    "🏨 AI Concierge per Hotel",
    "🤝 Parla con Riccardo"
  ];

  // Alterna i loghi ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIdx((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [logos.length]);

  useEffect(() => {
    if (window.innerWidth > 768) {
      setTimeout(() => setIsOpen(true), 2000);
    }
    setMessages([{ 
      text: "Benvenuto nel futuro. Sono Nova, il tuo punto d'accesso agli ecosistemi di RM Studio. <br><br>Quale processo del tuo business vuoi automatizzare oggi?", 
      sender: "bot" 
    }]);
  },[]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (overrideText?: string) => {
    const userText = overrideText || input.trim();
    if (!userText) return;
    setInput("");
    setMessages((prev) =>[...prev, { text: userText, sender: "user" }]);
    setIsLoading(true);

    let sessionId = localStorage.getItem("rm_session");
    if (!sessionId) {
      sessionId = "rm_" + Math.random().toString(36).substring(7);
      localStorage.setItem("rm_session", sessionId);
    }

    try {
      const res = await fetch("https://n8n.labottegadeldelta.it/webhook/nova", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ message: userText, sessionId })
      });
      
      const data = await res.json();
      const botResponse = data.response || data.output || "Messaggio ricevuto, ma formato risposta non valido.";
      const formattedResponse = botResponse.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-cyan-400 underline font-bold hover:text-cyan-300">Clicca Qui</a>');

      setMessages((prev) =>[...prev, { text: formattedResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Errore fetch:", error);
      setMessages((prev) =>[...prev, { text: "I miei server sono saturi o c'è un blocco CORS. Riprova tra poco.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[100] flex flex-col items-start">
      
      {/* Finestra chat rialzata (h-[680px]), allargata (w-[380px]) e con testi ad alta leggibilità */}
      <div className={`bg-[#0a0a0f]/95 backdrop-blur-2xl animated-gradient-border rounded-2xl w-[380px] max-w-[calc(100vw-2rem)] shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-left ${isOpen ? 'opacity-100 scale-100 mb-4 h-[680px] max-h-[80vh]' : 'opacity-0 scale-50 h-0 mb-0 pointer-events-none'}`}>
        
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-b border-white/5 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={logos[currentLogoIdx]} 
              alt="RM Studio Logo" 
              className="w-8 h-8 object-contain rounded-lg border border-white/10 bg-black/50 p-1"
              onError={(e) => {
                e.currentTarget.src = "https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo.png";
              }}
            />
            <div>
              <span className="font-bold text-[16px] tracking-widest text-white block leading-none">NOVA AI</span>
              <span className="text-[11px] text-cyan-400 font-medium">Attivo</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        {/* Corpo della chat con spaziatura p-4 per massima leggibilità */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-4 text-[16px] rounded-2xl max-w-[85%] leading-relaxed tracking-wide ${
                m.sender === 'user' 
                  ? 'bg-cyan-600 text-white self-end rounded-br-sm ml-auto font-semibold shadow-lg' 
                  : 'bg-white/[0.07] text-slate-100 border border-white/5 self-start rounded-bl-sm'
              }`} 
              dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }} 
            />
          ))}
          {isLoading && (
            <div className="bg-white/5 text-cyan-400 border border-white/5 p-3 rounded-2xl rounded-bl-sm self-start max-w-[85%] text-[16px] flex gap-1">
              <span className="animate-bounce">●</span><span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pulsanti di domanda rapida con font ridimensionato a 13px */}
        <div className="p-3 flex flex-wrap gap-2 bg-black/40 border-t border-white/5">
          {suggestions.map((text) => (
            <button 
              key={text} 
              onClick={() => sendMessage(text)} 
              className="text-[13px] font-bold text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 px-3.5 py-2 rounded-full transition-all"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 bg-black/60 flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Scrivi a Nova..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[16px] text-white outline-none focus:border-cyan-500/50 transition-colors" />
          <button onClick={() => sendMessage()} className="bg-cyan-500 text-black p-2 rounded-xl hover:scale-105 transition-transform"><Send size={18} /></button>
        </div>
      </div>

      {/* Pulsante esterno */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 bg-[#0a0a0f]/90 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-110 transition-transform overflow-hidden ${isOpen ? 'hidden' : 'flex'}`}
      >
        <img 
          src={logos[currentLogoIdx]} 
          alt="RM Studio Logo" 
          className="w-12 h-12 object-contain transition-all duration-500 transform" 
          onError={(e) => {
            e.currentTarget.src = "https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/logo.png";
          }}
        />
      </button>
    </div>
  );
}
