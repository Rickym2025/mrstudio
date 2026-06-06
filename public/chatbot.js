(function() {
  // Generazione o recupero della sessione univoca (per la memoria di Nova su n8n)
  let sessionId = localStorage.getItem('nova_chat_session');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nova_chat_session', sessionId);
  }

  // 1. Iniezione degli stili CSS responsivi ed effetto "Respiro" cinetico
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes bubble-breath {
      0%, 100% { 
        transform: scale(1); 
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(242, 210, 139, 0.15); 
      }
      50% { 
        transform: scale(1.06); 
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(242, 210, 139, 0.4); 
        border-color: rgba(242, 210, 139, 0.6);
      }
    }
    .chat-bubble {
      position: fixed;
      z-index: 50;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(8, 8, 12, 0.85);
      border: 1px solid rgba(242, 210, 139, 0.3);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: bubble-breath 3s ease-in-out infinite;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .chat-bubble:hover {
      animation: none;
      transform: scale(1.08) translateY(-2px);
      border-color: #F2D28B;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(242, 210, 139, 0.5);
    }

    @media (min-width: 768px) {
      .chat-bubble {
        bottom: 32px;
        right: 32px;
      }
      .chat-window {
        bottom: 100px;
        right: 32px;
        width: 380px;
      }
    }
    @media (max-width: 767px) {
      .chat-bubble {
        bottom: 32px;
        left: 32px;
      }
      .chat-window {
        bottom: 100px;
        left: 32px;
        width: calc(100% - 64px);
      }
    }

    .chat-window {
      position: fixed;
      z-index: 50;
      height: 480px;
      border-radius: 24px;
      background: rgba(7, 7, 10, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(24px);
      box-shadow: 0 20px 80px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .chat-window.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .chat-header {
      padding: 18px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .chat-messages::-webkit-scrollbar {
      display: none;
    }
    .message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.4;
    }
    .message.system {
      background: rgba(242, 210, 139, 0.08);
      border: 1px solid rgba(242, 210, 139, 0.15);
      color: rgba(255,255,255,0.9);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .message.user {
      background: #F2D28B;
      color: #000;
      font-weight: 500;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .chat-input-area {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      gap: 8px;
    }
    .chat-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 12px;
      color: white;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus {
      border-color: rgba(242, 210, 139, 0.5);
    }
    .chat-send {
      background: #F2D28B;
      color: black;
      border: none;
      border-radius: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .chat-send:hover {
      opacity: 0.9;
    }
    .chat-dot-pulse {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 10px #22c55e;
    }
  `;
  document.head.appendChild(style);

  // 2. Creazione elementi DOM del Chatbot
  const chatContainer = document.createElement('div');
  chatContainer.innerHTML = `
    <!-- Bolla Fluttuante Cinetica -->
    <div id="chat-bubble" class="chat-bubble pointer-events-auto">
      <svg class="w-6 h-6 text-[#F2D28B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span class="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse"></span>
    </div>

    <!-- Finestra di Chat -->
    <div id="chat-window" class="chat-window pointer-events-auto">
      <div class="chat-header">
        <div class="flex items-center gap-3">
          <div class="chat-dot-pulse"></div>
          <div>
            <h4 class="text-sm font-bold text-white font-serif tracking-wide">Nova — AI Assistant</h4>
            <span class="text-[10px] text-neutral-400 uppercase tracking-widest">RM Studio Suite</span>
          </div>
        </div>
        <button id="chat-close" class="text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Corpo Messaggi -->
      <div id="chat-messages" class="chat-messages">
        <div class="message system">
          Benvenuto in RM Studio. Sono Nova, l'assistente virtuale dell'ecosistema. Come posso aiutarti ad automatizzare ed espandere i canali commerciali della tua azienda?
        </div>
      </div>

      <!-- Input Area -->
      <form id="chat-form" class="chat-input-area" onsubmit="return false;">
        <input type="text" id="chat-input" class="chat-input" placeholder="Scrivi un messaggio..." autocomplete="off">
        <button type="submit" id="chat-send" class="chat-send">
          <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(chatContainer);

  const bubble = document.getElementById('chat-bubble');
  const windowEl = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  bubble.addEventListener('click', () => {
    windowEl.classList.add('active');
    bubble.style.opacity = '0';
    bubble.style.pointerEvents = 'none';
  });

  closeBtn.addEventListener('click', () => {
    windowEl.classList.remove('active');
    bubble.style.opacity = '1';
    bubble.style.pointerEvents = 'auto';
  });

  // ─── CHIAMATA AL WEBHOOK REALE DI N8N (HETZNER VPS) ───
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Messaggio Utente a schermo
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerText = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Creazione del segnale di caricamento temporaneo (typing indicator)
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message system italic opacity-50';
    typingIndicator.innerText = 'Nova sta scrivendo...';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // Esegue la chiamata asincrona POST su n8n
      const response = await fetch("https://n8n.rmstudio.app/webhook/nova", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId
        })
      });

      const data = await response.json();
      chatMessages.removeChild(typingIndicator); // Rimuove indicatore di scrittura

      if (data && data.response) {
        const botMsg = document.createElement('div');
        botMsg.className = 'message system';
        botMsg.innerText = data.response;
        chatMessages.appendChild(botMsg);
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err) {
      console.error("Errore n8n:", err);
      if (typingIndicator.parentNode) chatMessages.removeChild(typingIndicator);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message system text-red-400';
      errorMsg.innerText = "Connessione con l'agente interrotta. Riprova tra pochi istanti.";
      chatMessages.appendChild(errorMsg);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
})();