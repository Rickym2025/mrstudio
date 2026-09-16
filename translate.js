/**
 * RM Studio - Universal Translation Engine (Smart Right-Cluster Docking)
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
        margin: 0 4px !important;
        z-index: 50 !important;
      }
      #rm-lang-switcher:hover {
        border-color: #06b6d4 !important;
        box-shadow: 0 2px 18px rgba(6, 182, 212, 0.4) !important;
      }

      /* Fallback fluttuante se la landing non ha navbar */
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
        font-size: 11px !important;
        font-weight: 700 !important;
        letter-spacing: 0.05em !important;
        padding: 3px 6px !important;
        border-radius: 6px !important;
        color: #cbd5e1 !important;
        opacity: 0.65 !important;
        transition: all 0.2s ease !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
        font-family: inherit !important;
      }
      .rm-lang-btn:hover {
        opacity: 1 !important;
        color: #fff !important;
        background: rgba(6, 182, 212, 0.2) !important;
      }
      .rm-lang-btn.active {
        opacity: 1 !important;
        color: #ffffff !important;
        background: #9333ea !important; /* Badge solido viola come da tuo screenshot */
        box-shadow: 0 0 10px rgba(147, 51, 234, 0.6) !important;
      }

      @media (max-width: 768px) {
        #rm-lang-switcher {
          padding: 2px 5px !important;
          gap: 1px !important;
          margin: 0 2px !important;
        }
        .rm-lang-btn {
          font-size: 10px !important;
          padding: 2px 4px !important;
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
      { code: 'it', label: 'IT', title: 'Italiano' },
      { code: 'en', label: 'GB', title: 'English' },
      { code: 'de', label: 'DE', title: 'Deutsch' },
      { code: 'es', label: 'ES', title: 'Español' },
      { code: 'fr', label: 'FR', title: 'Français' }
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
      btn.innerText = lang.label;
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage(lang.code);
      };
      switcher.appendChild(btn);
    });

    // 4. Algoritmo di Aggancio Intelligente Universale
    function mountSwitcher() {
      // Priorità 1: Se hai messo un contenitore manuale <div id="rm-lang-slot"></div>
      const manualSlot = document.getElementById('rm-lang-slot') || document.getElementById('rm-translate-slot');
      if (manualSlot) {
        manualSlot.appendChild(switcher);
        return true;
      }

      // Priorità 2: Trova l'elemento header o nav
      const navRoot = document.querySelector('header') || document.querySelector('nav');
      if (!navRoot) return false;

      // Cerca il vero contenitore orizzontale (flex con almeno 2 figli: logo e azioni)
      let flexRow = null;
      const candidates = [navRoot, ...navRoot.querySelectorAll('.flex, [class*="justify-between"], [class*="items-center"]')];
      
      for (const el of candidates) {
        const validChildren = Array.from(el.children).filter(c => 
          c.tagName !== 'SCRIPT' && 
          c.tagName !== 'STYLE' && 
          c.id !== 'rm-lang-switcher'
        );
        // Troviamo la riga che divide logo da menu/pulsanti (almeno 2 colonne)
        if (validChildren.length >= 2) {
          flexRow = el;
          break;
        }
      }

      if (!flexRow) flexRow = navRoot;

      const validChildren = Array.from(flexRow.children).filter(c => 
        c.tagName !== 'SCRIPT' && 
        c.tagName !== 'STYLE' && 
        c.id !== 'rm-lang-switcher'
      );

      if (validChildren.length >= 2) {
        // Il blocco di destra è sempre l'ultimo figlio della riga
        const rightCluster = validChildren[validChildren.length - 1];

        // Se è un contenitore (div con i bottoni es. "Area Agenzie" e "Prova"), lo inseriamo all'inizio del blocco
        if (rightCluster.children.length > 0 && rightCluster.tagName !== 'A' && rightCluster.tagName !== 'BUTTON') {
          rightCluster.insertBefore(switcher, rightCluster.firstChild);
        } else {
          // Se è un bottone singolo, lo inseriamo subito alla sua sinistra
          flexRow.insertBefore(switcher, rightCluster);
        }
        return true;
      }

      return false;
    }

    // Polling di montaggio rapido per supportare anche componenti React / Next.js
    let attempts = 0;
    const tryMount = setInterval(() => {
      attempts++;
      if (mountSwitcher() || attempts > 25) {
        clearInterval(tryMount);
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

    // 7. Supporto parametro ?lang=...
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
