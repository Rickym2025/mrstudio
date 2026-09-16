/**
 * RM Studio - Universal Translation Engine (Smart Header Docking)
 */
(function () {
  function initTranslator() {
    if (document.getElementById('rm-lang-switcher')) return;

    // 1. Stili Dark / Neon RM Studio
    const style = document.createElement('style');
    style.id = 'rm-translate-styles';
    style.textContent = `
      #rm-lang-switcher {
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        background: rgba(8, 8, 14, 0.85) !important;
        border: 1px solid rgba(147, 51, 234, 0.4) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        padding: 3px 8px !important;
        border-radius: 9999px !important;
        box-shadow: 0 2px 12px rgba(0,0,0,0.6), 0 0 10px rgba(6, 182, 212, 0.2) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
        flex-shrink: 0 !important;
        z-index: 50 !important;
      }
      #rm-lang-switcher:hover {
        border-color: #06b6d4 !important;
        box-shadow: 0 2px 18px rgba(6, 182, 212, 0.4) !important;
      }

      /* Quando fluttua se non trova l'header */
      #rm-lang-switcher.rm-floating-top {
        position: fixed !important;
        top: 18px !important;
        right: 20px !important;
        z-index: 99999 !important;
      }

      .rm-lang-btn {
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 14px !important;
        padding: 2px 4px !important;
        border-radius: 6px !important;
        opacity: 0.5 !important;
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
        background: rgba(147, 51, 234, 0.4) !important;
        transform: scale(1.1) !important;
      }

      @media (max-width: 640px) {
        #rm-lang-switcher {
          padding: 2px 5px !important;
          gap: 2px !important;
        }
        .rm-lang-btn {
          font-size: 12px !important;
          padding: 1px 2px !important;
        }
      }

      /* Nasconde banner Google Translate */
      .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame { 
        display: none !important; 
      }
      body { 
        top: 0px !important; 
        position: static !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Lingue Supportate
    const languages = [
      { code: 'it', flag: '🇮🇹', title: 'Italiano' },
      { code: 'en', flag: '🇬🇧', title: 'English' },
      { code: 'de', flag: '🇩🇪', title: 'Deutsch' },
      { code: 'es', flag: '🇪🇸', title: 'Español' },
      { code: 'fr', flag: '🇫🇷', title: 'Français' }
    ];

    function getStoredLang() {
      const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
      if (match) {
        const parts = match[2].split('/');
        return parts[parts.length - 1] || 'it';
      }
      return localStorage.getItem('rm_selected_lang') || 'it';
    }

    const currentLang = getStoredLang();

    // 3. Creazione Elemento
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

    // 4. Logica di Auto-Docking in Alto a Destra
    function mountSwitcher() {
      // Priorità A: Se hai inserito un segnaposto manuale <div id="rm-translate-slot"></div>
      const manualSlot = document.getElementById('rm-translate-slot');
      if (manualSlot) {
        manualSlot.appendChild(switcher);
        return true;
      }

      // Priorità B: Cerca il gruppo di pulsanti a destra nell'header o nav
      const header = document.querySelector('header') || document.querySelector('nav');
      if (header) {
        const rightContainer = 
          header.querySelector('.flex.items-center:last-child') ||
          header.querySelector('.flex:last-child') ||
          header.querySelector('div:last-child') ||
          header;

        if (rightContainer && rightContainer !== header) {
          // Lo inserisce all'inizio del gruppo pulsanti di destra
          rightContainer.insertBefore(switcher, rightContainer.firstChild);
        } else {
          header.appendChild(switcher);
        }
        return true;
      }

      return false;
    }

    // Se la navbar impiega qualche millisecondo a montarsi (es. Next.js), fa tentativi rapidi
    let attempts = 0;
    const tryMount = setInterval(() => {
      attempts++;
      if (mountSwitcher() || attempts > 20) {
        clearInterval(tryMount);
        // Se non trova nessun header, fluttua in alto a destra
        if (!switcher.parentElement) {
          switcher.classList.add('rm-floating-top');
          document.body.appendChild(switcher);
        }
      }
    }, 50);

    // 5. Cambio Lingua
    window.changeLanguage = function (code) {
      const domain = location.hostname;
      
      if (code === 'it') {
        // Reset cookie per tornare all'italiano nativo pulito
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        localStorage.removeItem('rm_selected_lang');
        location.reload();
        return;
      }

      localStorage.setItem('rm_selected_lang', code);
      const cookieValue = `/it/${code}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;

      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change'));
      } else {
        location.reload();
      }
    };

    // 6. Iniezione Core Google Translate
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

    // 7. Supporto URL ?lang=...
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && languages.some(l => l.code === langParam) && langParam !== currentLang) {
      setTimeout(() => changeLanguage(langParam), 250);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslator);
  } else {
    initTranslator();
  }
})();
