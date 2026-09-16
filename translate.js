/**
 * RM Studio - Universal Translation Engine (Headless Google Core)
 */
(function () {
  function initTranslator() {
    // Evita doppie iniezioni
    if (document.getElementById('rm-lang-switcher')) return;

    // 1. Iniezione Stili CSS Dark / Neon
    const style = document.createElement('style');
    style.id = 'rm-translate-styles';
    style.textContent = `
      #rm-lang-switcher {
        position: fixed !important;
        bottom: 24px !important;
        left: 24px !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        background: rgba(10, 10, 16, 0.95) !important;
        border: 1px solid rgba(147, 51, 234, 0.45) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        padding: 6px 12px !important;
        border-radius: 9999px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.8), 0 0 14px rgba(6, 182, 212, 0.3) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      #rm-lang-switcher:hover {
        border-color: #06b6d4 !important;
        box-shadow: 0 4px 25px rgba(6, 182, 212, 0.5) !important;
      }
      .rm-lang-btn {
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 16px !important;
        padding: 4px 6px !important;
        border-radius: 8px !important;
        opacity: 0.55 !important;
        transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
      }
      .rm-lang-btn:hover {
        opacity: 1 !important;
        transform: scale(1.2) !important;
        background: rgba(6, 182, 212, 0.2) !important;
      }
      .rm-lang-btn.active {
        opacity: 1 !important;
        background: rgba(147, 51, 234, 0.35) !important;
        transform: scale(1.1) !important;
      }
      /* Nasconde i banner nativi e frame di Google Translate */
      .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame { 
        display: none !important; 
      }
      body { 
        top: 0px !important; 
        position: static !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Lingue gestite
    const languages = [
      { code: 'it', flag: '🇮🇹', title: 'Italiano' },
      { code: 'en', flag: '🇬🇧', title: 'English' },
      { code: 'de', flag: '🇩🇪', title: 'Deutsch' },
      { code: 'es', flag: '🇪🇸', title: 'Español' },
      { code: 'fr', flag: '🇫🇷', title: 'Français' }
    ];

    // Rileva lingua corrente dai cookie o default IT
    function getStoredLang() {
      const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
      if (match) {
        const parts = match[2].split('/');
        return parts[parts.length - 1] || 'it';
      }
      return localStorage.getItem('rm_selected_lang') || 'it';
    }

    const currentLang = getStoredLang();

    // 3. Creazione Barra UI
    const switcher = document.createElement('div');
    switcher.id = 'rm-lang-switcher';
    switcher.className = 'notranslate';

    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `rm-lang-btn ${lang.code === currentLang ? 'active' : ''}`;
      btn.setAttribute('title', lang.title);
      btn.setAttribute('data-lang', lang.code);
      btn.innerHTML = lang.flag;
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage(lang.code);
      };
      switcher.appendChild(btn);
    });

    document.body.appendChild(switcher);

    // 4. Funzione Cambio Lingua (Cookie Googtrans + Reload pulito)
    window.changeLanguage = function (code) {
      localStorage.setItem('rm_selected_lang', code);
      
      const domain = location.hostname;
      const cookieValue = `/it/${code}`;
      
      // Scrittura cookie sia con dominio che senza per massima compatibilità
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;

      // Se la libreria Google è già carica prova a commutare, altrimenti aggiorna
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change'));
      } else {
        location.reload();
      }
    };

    // 5. Iniezione Script Google Translate
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'it,en,de,es,fr',
        autoDisplay: false
      }, 'google_translate_element');
    };

    if (!document.getElementById('google-translate-script')) {
      const hiddenDiv = document.createElement('div');
      hiddenDiv.id = 'google_translate_element';
      hiddenDiv.style.display = 'none';
      document.body.appendChild(hiddenDiv);

      const gtScript = document.createElement('script');
      gtScript.id = 'google-translate-script';
      gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(gtScript);
    }

    // 6. Supporto Query Param (es: rmstudio.app/?lang=en)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && languages.some(l => l.code === langParam) && langParam !== currentLang) {
      setTimeout(() => changeLanguage(langParam), 200);
    }

    console.log("✅ [RM Studio] Translator attivato con successo.");
  }

  // Avvio sicuro dopo il caricamento del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslator);
  } else {
    initTranslator();
  }
})();
