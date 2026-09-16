/**
 * RM Studio - Universal Translation Engine (React Reconciliation Safe & Brand Shield)
 */
(function () {
  function initTranslator() {
    if (document.getElementById('rm-lang-switcher')) return;

    // 1. BRAND SHIELD: Protezione nomi e marchi
    const BRAND_NAMES = [
      'Lexis', 'Lexis AI', 'Dentis', 'Dentis AI', 'Concierge24',
      'DriveMotion', 'HomeTour', 'OmniaStudio', 'Vision', 'Ares',
      'LOVE', 'ETERNIA', 'Locanda Digitale', 'AURA', 'VeloMotion',
      'SiteEngine', 'SiteEngine AI', 'Free Energy', 'RM Studio', 'FF Edizioni', 'Nexus'
    ];

    function protectBrands() {
      document.querySelectorAll('[class*="logo"], [id*="logo"], [class*="brand"], [id*="brand"], header a:first-child, nav a:first-child').forEach(el => {
        el.classList.add('notranslate');
        el.setAttribute('translate', 'no');
      });

      document.querySelectorAll('h1, h2, h3, h4, h5, span, p, a, b, strong').forEach(el => {
        if (el.children.length === 0) {
          const text = el.textContent.trim();
          if (BRAND_NAMES.some(brand => text === brand || text.startsWith(brand + ' '))) {
            el.classList.add('notranslate');
            el.setAttribute('translate', 'no');
          }
        }
      });
    }

    protectBrands();

    // 2. Stili Dark / Neon
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
        margin: 0 6px !important;
        z-index: 50 !important;
      }
      #rm-lang-switcher:hover {
        border-color: #06b6d4 !important;
        box-shadow: 0 2px 18px rgba(6, 182, 212, 0.4) !important;
      }
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
        background: #9333ea !important;
        box-shadow: 0 0 10px rgba(147, 51, 234, 0.6) !important;
      }
      @media (max-width: 768px) {
        #rm-lang-switcher {
          padding: 2px 5px !important;
          gap: 1px !important;
          margin: 0 3px !important;
        }
        .rm-lang-btn {
          font-size: 10px !important;
          padding: 2px 4px !important;
        }
      }
      .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame { 
        display: none !important; 
      }
      body { 
        top: 0px !important; 
        position: static !important;
      }
    `;
    document.head.appendChild(style);

    // 3. Lingue Supportate
    const languages = [
      { code: 'it', label: 'IT', title: 'Italiano' },
      { code: 'en', label: 'GB', title: 'English' },
      { code: 'de', label: 'DE', title: 'Deutsch' },
      { code: 'es', label: 'ES', title: 'Español' },
      { code: 'fr', label: 'FR', title: 'Français' }
    ];

    function getStoredLang() {
      const local = localStorage.getItem('rm_selected_lang');
      if (local && languages.some(l => l.code === local)) return local;

      const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
      if (match) {
        const parts = match[2].split('/');
        const code = parts[parts.length - 1];
        if (code && languages.some(l => l.code === code)) return code;
      }
      return 'it';
    }

    const currentLang = getStoredLang();

    // 4. Creazione Elemento
    const switcher = document.createElement('div');
    switcher.id = 'rm-lang-switcher';
    switcher.className = 'notranslate';
    switcher.setAttribute('translate', 'no');

    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `rm-lang-btn ${lang.code === currentLang ? 'active' : ''}`;
      btn.setAttribute('title', lang.title);
      btn.setAttribute('data-lang', lang.code);
      btn.innerText = lang.label;
      btn.onclick = (e) => {
        e.preventDefault();
        window.rmChangeLanguage(lang.code, true);
      };
      switcher.appendChild(btn);
    });

    // 5. Scansione Navbar con soglia minima adatta a max-w-6xl
    function findTrueTopNavbar() {
      const manualSlot = document.getElementById('rm-lang-slot') || document.getElementById('rm-translate-slot');
      if (manualSlot) return { target: manualSlot, method: 'append' };

      const selectors = [
        'header',
        'nav',
        '[role="navigation"]',
        '.fixed.top-0',
        '.sticky.top-0',
        '[class*="fixed"][class*="top-0"]',
        '[class*="sticky"][class*="top-0"]',
        'div[class*="nav"]',
        '#navbar',
        '#header'
      ];

      let trueNavbar = null;
      const elements = document.querySelectorAll(selectors.join(', '));
      const minWidthThreshold = Math.min(window.innerWidth * 0.45, 600);

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (
          rect.top >= -15 &&
          rect.top <= 65 &&
          rect.height >= 30 &&
          rect.height <= 130 &&
          rect.width >= minWidthThreshold
        ) {
          trueNavbar = el;
          break;
        }
      }

      if (!trueNavbar) return null;

      let flexRow = trueNavbar;
      const rows = [trueNavbar, ...trueNavbar.querySelectorAll('.flex, [class*="justify-between"], [class*="items-center"]')];
      for (const r of rows) {
        const valid = Array.from(r.children).filter(c => 
          c.tagName !== 'SCRIPT' && 
          c.tagName !== 'STYLE' && 
          c.id !== 'rm-lang-switcher'
        );
        if (valid.length >= 2) {
          flexRow = r;
          break;
        }
      }

      const validChildren = Array.from(flexRow.children).filter(c => 
        c.tagName !== 'SCRIPT' && 
        c.tagName !== 'STYLE' && 
        c.id !== 'rm-lang-switcher'
      );

      if (validChildren.length >= 2) {
        const rightCluster = validChildren[validChildren.length - 1];
        if (rightCluster.children.length > 0 && rightCluster.tagName !== 'A' && rightCluster.tagName !== 'BUTTON') {
          return { target: rightCluster, method: 'prepend' };
        } else {
          return { target: rightCluster, method: 'before', parent: flexRow };
        }
      }

      return { target: trueNavbar, method: 'append' };
    }

    function mountSwitcher() {
      const destination = findTrueTopNavbar();
      if (!destination) return false;

      if (destination.method === 'prepend') {
        destination.target.insertBefore(switcher, destination.target.firstChild);
        return true;
      } else if (destination.method === 'before' && destination.parent) {
        destination.parent.insertBefore(switcher, destination.target);
        return true;
      } else if (destination.method === 'append') {
        destination.target.appendChild(switcher);
        return true;
      }
      return false;
    }

    let attempts = 0;
    const tryMount = setInterval(() => {
      attempts++;
      if (mountSwitcher() || attempts > 35) {
        clearInterval(tryMount);
        if (!switcher.parentElement) {
          switcher.classList.add('rm-floating-top');
          document.body.appendChild(switcher);
        }
      }
    }, 60);

    // 6. Anti-Wipe MutationObserver: Se React re-renderizza e cancella lo switcher, lo rimonta subito
    const observer = new MutationObserver(() => {
      if (!document.body.contains(switcher)) {
        mountSwitcher();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 7. Cambio Lingua
    window.rmChangeLanguage = function (code, isUserClick = false) {
      const domain = location.hostname;
      
      document.querySelectorAll('.rm-lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === code) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (code === 'it') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        localStorage.removeItem('rm_selected_lang');
        
        const select = document.querySelector('.goog-te-combo');
        if (select && select.value !== 'it') {
          select.value = 'it';
          select.dispatchEvent(new Event('change'));
        } else if (isUserClick) {
          location.reload();
        }
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
      } else if (isUserClick) {
        location.reload();
      }

      setTimeout(protectBrands, 300);
      setTimeout(protectBrands, 800);
    };

    // 8. Core Google Translate
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

    // 9. Query param ?lang=...
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && languages.some(l => l.code === langParam) && langParam !== currentLang) {
      setTimeout(() => window.rmChangeLanguage(langParam, false), 350);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslator);
  } else {
    initTranslator();
  }
})();
