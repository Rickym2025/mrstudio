class RmOrbitEcosystem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Definizione del base URL per recuperare gli asset multimediali in modo assoluto.
    // Puoi passare l'attributo "base-url" dall'esterno oppure userà il dominio di default.
    const baseUrl = this.getAttribute("base-url") || "https://rmstudio.app";

    this.shadowRoot.innerHTML = `
      <style>
        @keyframes orbit-rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes counter-rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes pulse-ring-optimized {
          0%, 100% { opacity: 0.2; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        :host {
          display: block;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .orbit-area {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 440px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .orbit-area:hover .orbit-ring,
        .orbit-area:hover .orbit-item {
          animation-play-state: paused;
        }
        .pulse-ring-element {
          position: absolute;
          width: 288px;
          height: 288px;
          background: rgba(6, 182, 212, 0.05);
          filter: blur(48px);
          border-radius: 50%;
          will-change: transform, opacity;
          animation: pulse-ring-optimized 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .orbit-ring {
          position: relative;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
          animation: orbit-rotation 40s linear infinite;
        }
        .orbit-wrapper {
          position: absolute;
          width: 64px;
          height: 64px;
          transform: translate(-50%, -50%);
        }
        .orbit-item {
          position: relative;
          width: 100%;
          height: 100%;
          animation: counter-rotation 40s linear infinite;
          transform-origin: center;
        }
        .orbit-link {
          display: flex;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          box-sizing: border-box;
          transition: 0.3s;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-decoration: none;
        }
        .orbit-link:hover {
          border-color: #06b6d4;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
        }
        .orbit-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .orbit-img.cover {
          object-fit: cover;
        }
        .orbit-img.rounded {
          border-radius: 50%;
        }
        .orbit-center-photo {
          position: absolute;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          border: 4px solid #f97316;
          padding: 4px;
          background: #000;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          z-index: 15;
          box-sizing: border-box;
        }
        .orbit-center-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .orbit-tooltip {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          background: #0a0a0c;
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          font-size: 14px;
          border-radius: 8px;
          padding: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          text-align: center;
          z-index: 50;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          line-height: 1.4;
        }
        .orbit-tooltip b {
          color: white;
          display: block;
          margin-bottom: 4px;
        }
        .orbit-item:hover .orbit-tooltip {
          opacity: 1;
        }
      </style>

      <div class="orbit-area">
        <div class="pulse-ring-element"></div>

        <div class="orbit-ring">
          <!-- Concierge24 -->
          <div class="orbit-wrapper" style="top: 0%; left: 50%;">
            <div class="orbit-item">
              <a href="https://concierge24.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #0a0a0c; padding: 10px;">
                <img src="${baseUrl}/logo_Concierge24.png" alt="Concierge24" class="orbit-img" />
              </a>
              <div class="orbit-tooltip">
                <b>Concierge24</b>
                Assistente vocale e testuale AI H24 per hotel e strutture extra-alberghiere.
              </div>
            </div>
          </div>

          <!-- DriveMotion -->
          <div class="orbit-wrapper" style="top: 25%; left: 93.3%;">
            <div class="orbit-item">
              <a href="https://drivemotion.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #fff; padding: 6px;">
                <img src="${baseUrl}/logo_drivemotion_bg2.jpg" alt="DriveMotion" class="orbit-img cover rounded" />
              </a>
              <div class="orbit-tooltip">
                <b>DriveMotion AI</b>
                Generazione automatica di sfondi e video cinematici per saloni auto.
              </div>
            </div>
          </div>

          <!-- Nexus AI -->
          <div class="orbit-wrapper" style="top: 75%; left: 93.3%;">
            <div class="orbit-item">
              <a href="https://nexus.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #0a0a0c; padding: 12px;">
                <img src="${baseUrl}/logo_nexus_bg.png" alt="Nexus AI" class="orbit-img" />
              </a>
              <div class="orbit-tooltip">
                <b>Nexus AI</b>
                Widget chatbot intelligente per accoglienza e conversione automatica lead.
              </div>
            </div>
          </div>

          <!-- OmniaStudio -->
          <div class="orbit-wrapper" style="top: 100%; left: 50%;">
            <div class="orbit-item">
              <a href="https://omniastudio.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #fff; padding: 4px;">
                <img src="${baseUrl}/logo_OmniaStudio.png" alt="OmniaStudio" class="orbit-img" />
              </a>
              <div class="orbit-tooltip">
                <b>OmniaStudio</b>
                La potenza dell'AI locale e protetta offline sul tuo PC, a vita.
              </div>
            </div>
          </div>

          <!-- FF Edizioni -->
          <div class="orbit-wrapper" style="top: 75%; left: 6.7%;">
            <div class="orbit-item">
              <a href="https://ff.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #0a0a0c; padding: 2px;">
                <img src="${baseUrl}/logo_ff.png" alt="FF Edizioni" class="orbit-img cover rounded" />
              </a>
              <div class="orbit-tooltip">
                <b>FF Edizioni</b>
                Colonne sonore, jingle commerciali e sound design creati con l'AI.
              </div>
            </div>
          </div>

          <!-- HomeTour AI -->
          <div class="orbit-wrapper" style="top: 25%; left: 6.7%;">
            <div class="orbit-item">
              <a href="https://hometour.rmstudio.app" target="_blank" rel="noopener noreferrer" class="orbit-link" style="background: #0a0a0c; padding: 4px;">
                <img src="${baseUrl}/logo_hometour+bg.jpg" alt="HomeTour" class="orbit-img cover rounded" />
              </a>
              <div class="orbit-tooltip">
                <b>HomeTour AI</b>
                Reel immobiliari con voce narrante generati in automatico da foto.
              </div>
            </div>
          </div>
        </div>

        <div class="orbit-center-photo">
          <img src="${baseUrl}/riccardo_founder.jpeg" alt="Riccardo Modena - Fondatore RM Studio" />
        </div>
      </div>
    `;
  }
}

if (!customElements.get("rm-orbit-ecosystem")) {
  customElements.define("rm-orbit-ecosystem", RmOrbitEcosystem);
}
