(function() {
  let sessionId = localStorage.getItem('nova_chat_session');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nova_chat_session', sessionId);
  }

  const isTooltipClosed = sessionStorage.getItem('nova_tooltip_closed') === 'true';

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes glow-shift {
      0%, 100% {
        border-color: rgba(242, 210, 139, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(242, 210, 139, 0.3);
      }
      33% {
        border-color: rgba(6, 182, 212, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.3);
      }
      66% {
        border-color: rgba(139, 92, 246, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.3);
      }
    }
    @keyframes bubble-breath {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }

    .chat-bubble {
      position: fixed;
      z-index: 50;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(8, 8, 12, 0.85);
      border: 1px solid rgba(242, 210, 139, 0.3);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: bubble-breath 3s ease-in-out infinite, glow-shift 6s linear infinite;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .chat-bubble:hover {
      animation: none;
      transform: scale(1.08) translateY(-2px);
      border-color: #F2D28B;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(242, 210, 139, 0.6);
    }

    .chat-tooltip {
      position: fixed;
      z-index: 49;
      background: rgba(8, 8, 12, 0.95);
      border: 1px solid rgba(242, 210, 139, 0.3);
      backdrop-filter: blur(12px);
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      animation: glow-shift 6s linear infinite;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .chat-tooltip.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .chat-window {
      position: fixed;
      z-index: 50;
      height: 480px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(12, 12, 18, 0.95) 0%, rgba(6, 6, 10, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(24px);
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      animation: glow-shift 6s linear infinite;
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
    .chat-avatar-frame {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid #F2D28B;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: black;
      box-shadow: 0 0 10px rgba(242, 210, 139, 0.3);
    }
    #chat-logo-avatar {
      width: 80%;
      height: 80%;
      object-fit: contain;
      transition: opacity 0.25s ease-in-out;
    }

    /* ─── POSIZIONAMENTO ADATTIVO RICHIESTO SU MOBILE ─── */
    @media (min-width: 768px) {
      .chat-bubble {
        bottom: 32px;
        right: 32px;
      }
      .chat-window {
        bottom: 120px;
        right: 32px;
        width: 410px;
      }
      .chat-tooltip {
        right: 120px;
        bottom: 44px;
      }
    }
    @media (max-width: 767px) {
      .chat-bubble {
        top: 96px; /* Spostata in alto a destra sotto l'Header */
        right: 16px;
      }
      .chat-window {
        top: 180px;
        right: 16px;
        width: calc(100% - 32px);
        height: 400px;
      }
      .chat-tooltip {
        right: 96px;
        top: 104px;
        bottom: auto;
      }
    }
  `;
  document.head.appendChild(style);

  // Creazione elementi DOM del Chatbot
  const chatContainer = document.createElement('div');
  chatContainer.innerHTML = `
    <!-- Bolla Fluttuante Cinetica -->
    <div id="chat-bubble" class="chat-bubble pointer-events-auto">
      <svg class="w-8 h-8 text-[#F2D28B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span class="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse"></span>
    </div>

    <!-- Fumetto di Neuromarketing -->
    \${!isTooltipClosed ? \`
      <div id="chat-tooltip" class="chat-tooltip pointer-events-auto">
        <span class="tracking-wide">In quale settore operi? Scopri l'AI su misura per te 🎯</span>
        <button id="tooltip-close" class="text-neutral-400 hover:text-white transition-colors focus:outline-none cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    \` : ''}

    <!-- Finestra di Chat -->
    <div id="chat-window" class="chat-window pointer-events-auto">
      <div class="chat-header">
        <div class="flex items-center gap-3">
          <div class="chat-avatar-frame">
            <img id="chat-logo-avatar" src="public/loghi/logo_rm.png" alt="RM Logo">
          </div>
          <div>
            <h4 class="text-sm font-bold text-white font-serif tracking-wide">Nova — AI Assistant</h4>
            <span class="text-[10px] text-[#F2D28B] uppercase tracking-widest font-mono font-black">Lab</span>
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
          Ciao! Sono Nova, l'AI di RM Studio. In quale settore opera la tua azienda? Ti mostro subito cosa possiamo automatizzare ⚡
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
  const tooltip = document.getElementById('chat-tooltip');
  const tooltipClose = document.getElementById('tooltip-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const avatarImg = document.getElementById('chat-logo-avatar');

  // Rotazione loghi avatar
  const avatarLogos = [
    "public/loghi/logo_rm.png",
    "public/loghi/logo_nexus.png",
    "public/loghi/logo_concierge.png",
    "public/loghi/logo_dentis.png",
    "public/loghi/logo_lexis.png",
    "public/loghi/logo_drivemotion.png",
    "public/loghi/logo_hometour.jpg",
    "public/loghi/logo_omniastudio.png",
    "public/loghi/logo_ff.png"
  ];
  let currentAvatarIndex = 0;

  if (avatarImg) {
    setInterval(() => {
      currentAvatarIndex = (currentAvatarIndex + 1) % avatarLogos.length;
      avatarImg.style.opacity = '0';
      setTimeout(() => {
        avatarImg.src = avatarLogos[currentAvatarIndex];
        avatarImg.style.opacity = '1';
      }, 250);
    }, 2500);
  }

  // Fumetto di benvenuto
  if (tooltip) {
    setTimeout(() => {
      if (!windowEl.classList.contains('active')) {
        tooltip.classList.add('active');
      }
    }, 2000);

    tooltipClose.addEventListener('click', (e) => {
      e.stopPropagation(); 
      sessionStorage.setItem('nova_tooltip_closed', 'true');
      tooltip.classList.remove('active');
    });
  }

  // Funzione Apertura Chatbot
  function openChat() {
    windowEl.classList.add('active');
    bubble.style.opacity = '0';
    bubble.style.pointerEvents = 'none';
    if (tooltip) {
      tooltip.classList.remove('active');
    }
  }

  // Funzione Chiusura Chatbot
  function closeChat() {
    windowEl.classList.remove('active');
    bubble.style.opacity = '1';
    bubble.style.pointerEvents = 'auto';
  }

  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // CONFIGURAZIONE AVVIO: APERTO SU DESKTOP, CHIUSO SU MOBILE
  const isDesktop = window.innerWidth >= 768;
  if (isDesktop) {
    openChat();
  } else {
    closeChat();
  }

  // Invio messaggio a n8n con parser dei link cliccabili
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerText = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message system italic opacity-50';
    typingIndicator.innerText = 'Nova sta scrivendo...';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
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
      chatMessages.removeChild(typingIndicator);

      if (data && data.response) {
        const botMsg = document.createElement('div');
        botMsg.className = 'message system';
        
        // PARSER DELLE URL: Rende cliccabili i link nudi generati da Nova (in elegante colore oro F2D28B)
        const rawResponse = data.response;
        const urlRegex = /(https?:\/\/[^\s<]+)/g;
        if (urlRegex.test(rawResponse)) {
          botMsg.innerHTML = rawResponse.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #F2D28B; text-decoration: underline; font-weight: 600;">${url}</a>`;
          });
        } else {
          botMsg.innerText = rawResponse;
        }

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