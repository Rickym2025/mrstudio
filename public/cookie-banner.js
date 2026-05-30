document.addEventListener('DOMContentLoaded', () => {
    // 1. Inizializza GA4 di default su negato
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
    });

    const consent = localStorage.getItem('rmstudio_cookie_consent');
    if (consent === 'granted') {
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        return; 
    } else if (consent === 'denied') {
        return; 
    }

    // 2. Inietta lo Stile CSS Universale (funziona anche senza Tailwind)
    const style = document.createElement('style');
    style.innerHTML = `
        #rm-cookie-banner {
            position: fixed; bottom: 0; left: 0; width: 100%;
            background: rgba(10, 10, 12, 0.98); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px; z-index: 999999;
            display: flex; flex-direction: column; gap: 15px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
            font-family: system-ui, -apple-system, sans-serif;
            transform: translateY(100%); transition: transform 0.5s ease-out;
            box-sizing: border-box;
        }
        @media (min-width: 768px) {
            #rm-cookie-banner { flex-direction: row; justify-content: space-between; align-items: center; padding: 20px 40px; }
        }
        #rm-cookie-text { color: #cbd5e1; font-size: 14px; line-height: 1.5; max-width: 800px; text-align: left; margin: 0; }
        #rm-cookie-text strong { color: #fff; }
        #rm-cookie-text a { color: #22d3ee; text-decoration: underline; font-weight: bold; }
        #rm-cookie-buttons { display: flex; gap: 10px; flex-shrink: 0; width: 100%; }
        @media (min-width: 768px) { #rm-cookie-buttons { width: auto; } }
        .rm-btn { flex: 1; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.2s; text-align: center; border: none; }
        #rm-btn-reject { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; }
        #rm-btn-reject:hover { background: rgba(255,255,255,0.05); }
        #rm-btn-accept { background: #fff; color: #000; box-shadow: 0 0 15px rgba(255,255,255,0.2); }
        #rm-btn-accept:hover { background: #e2e8f0; transform: scale(0.98); }
    `;
    document.head.appendChild(style);

    // 3. Inietta l'HTML
    const bannerHTML = `
    <div id="rm-cookie-banner">
        <div id="rm-cookie-text">
            <strong>Rispettiamo la tua privacy.</strong> Utilizziamo cookie tecnici per il sito e analitici (Google Analytics) per migliorarci. Nessun dato viene venduto. 
            <a href="/privacy" target="_blank">Leggi l'Informativa</a>.
        </div>
        <div id="rm-cookie-buttons">
            <button id="rm-btn-reject" class="rm-btn">Rifiuta</button>
            <button id="rm-btn-accept" class="rm-btn">Accetta Tutti</button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    const banner = document.getElementById('rm-cookie-banner');

    // Animazione entrata
    setTimeout(() => { banner.style.transform = 'translateY(0)'; }, 500);

    // Click Accetta
    document.getElementById('rm-btn-accept').addEventListener('click', () => {
        localStorage.setItem('rmstudio_cookie_consent', 'granted');
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => banner.remove(), 500);
    });

    // Click Rifiuta
    document.getElementById('rm-btn-reject').addEventListener('click', () => {
        localStorage.setItem('rmstudio_cookie_consent', 'denied');
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => banner.remove(), 500);
    });
});
