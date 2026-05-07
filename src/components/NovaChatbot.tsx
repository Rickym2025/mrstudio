import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";

export function NovaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "bot" | "user", isLink?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "🎥 Voglio un video UGC",
    "🤖 Come funziona Omnia?",
    "🏨 Info Concierge Hotel",
    "🎵 Parla del progetto Musica"
  ];

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
      // Inserisci l'URL del tuo Webhook n8n qui
      const res = await fetch("https://[IL-TUO-WEBHOOK-N8N]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sessionId })
      });
      const data = await res.json();
      
      // Fix per rendere i link cliccabili
      const botResponse = data.output || "Ricevuto.";
      const formattedResponse = botResponse.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-cyan-400 underline font-bold hover:text-cyan-300">Clicca Qui</a>');

      setMessages((prev) =>[...prev, { text: formattedResponse, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) =>[...prev, { text: "I miei server sono saturi. Riprova tra poco.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[100] flex flex-col items-start">
      <div className={`bg-[#0a0a0f]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl w-[350px] shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-left ${isOpen ? 'opacity-100 scale-100 mb-4 h-[550px]' : 'opacity-0 scale-50 h-0 mb-0 pointer-events-none'}`}>
        
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-b border-white/5 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
            <span className="font-bold text-sm tracking-widest text-white">NOVA AI</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 text-sm rounded-2xl max-w-[85%] ${m.sender === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white self-end rounded-br-sm ml-auto font-medium shadow-lg' : 'bg-white/5 text-white/90 border border-white/5 self-start rounded-bl-sm leading-relaxed'}`} dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }} />
          ))}
          {isLoading && (
            <div className="bg-white/5 text-cyan-400 border border-white/5 p-3 rounded-2xl rounded-bl-sm self-start max-w-[85%] text-sm flex gap-1">
              <span className="animate-bounce">●</span><span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* PULSANTI DI SCELTA RAPIDA (Migliorati) */}
        <div className="p-3 flex flex-wrap gap-2 bg-black/40 border-t border-white/5">
          {suggestions.map((text) => (
            <button key={text} onClick={() => sendMessage(text)} className="text-[10px] font-bold text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 px-3 py-1.5 rounded-full transition-all">
              {text}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 bg-black/60 flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Scrivi a Nova..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" />
          <button onClick={() => sendMessage()} className="bg-cyan-500 text-black p-2 rounded-xl hover:scale-105 transition-transform"><Send size={18} /></button>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-110 transition-transform ${isOpen ? 'hidden' : 'flex'}`}>
        <MessageSquare size={24} className="text-white" />
      </button>
    </div>
  );
}
