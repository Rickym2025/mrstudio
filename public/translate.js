/**
 * RM Studio - Universal Dynamic Translation Engine
 * Compatibile con Vanilla HTML e Next.js
 */
(function () {
  // 1. Iniezione Stile CSS Dark / Neon RM Studio
  const style = document.createElement('style');
  style.textContent = `
    .rm-lang-switcher {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 99998;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(10, 10, 14, 0.92);
      border: 1px solid rgba(147, 51, 234, 0.4);
      backdrop-filter: blur(12px);
      padding: 6px 10px;
      border-radius: 9999px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(6, 182, 212, 0.25);
      font-family: system-ui, -apple-system, sans-serif;
      transition: all 0.3s ease;
    }
    .rm-lang-switcher:hover {
      border-color: #06b6d4;
      box-shadow: 0 4px 25px rgba(6, 182, 212, 0.4);
    }
    .rm-lang-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 6px;
      border-radius: 6px;
      opacity: 0.6;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .rm-lang-btn:hover, .rm-lang-btn.active {
      opacity: 1;
      background: rgba(147, 51, 234, 0.25);
      transform: scale(1.1);
    }
    /* Nasconde l'interfaccia standard e l'attributo top di Google */
    .goog-te-banner-frame, .skiptranslate, #goog-gt-tt { display: none !important; }
    body { top: 0px !important; }
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

  // 3. Creazione Elemento UI
  const switcher = document.createElement('div');
  switcher.className = 'rm-lang-switcher notranslate';

  const currentLang = localStorage.getItem('rm_selected_lang') || 'it';

  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = `rm-lang-btn ${lang.code === currentLang ? 'active' : ''}`;
    btn.setAttribute('title', lang.title);
    btn.innerHTML = lang.flag;
    btn.onclick = (e) => {
      e.preventDefault();
      setLanguage(lang.code);
    };
    switcher.appendChild(btn);
  });

  document.body.appendChild(switcher);

  // 4. Inizializzazione Headless Google Translate Core
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: 'it',
      includedLanguages: 'it,en,de,es,fr',
      autoDisplay: false
    }, 'google_translate_element');

    if (currentLang !== 'it') {
      setTimeout(() => applyGoogleLang(currentLang), 300);
    }
  };

  const hiddenDiv = document.createElement('div');
  hiddenDiv.id = 'google_translate_element';
  hiddenDiv.style.display = 'none';
  document.body.appendChild(hiddenDiv);

  const gtScript = document.createElement('script');
  gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(gtScript);

  // 5. Funzione di Cambio Lingua Programmatica
  function setLanguage(code) {
    localStorage.setItem('rm_selected_lang', code);
    document.querySelectorAll('.rm-lang-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = Array.from(document.querySelectorAll('.rm-lang-btn')).find(b => b.getAttribute('title') === languages.find(l => l.code === code).title);
    if (activeBtn) activeBtn.classList.add('active');
    applyGoogleLang(code);
  }

  function applyGoogleLang(code) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    }
  }

  // 6. Supporto query param automatico (es. ?lang=en nei link delle Ads o WhatsApp)
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && languages.some(l => l.code === langParam)) {
    setTimeout(() => setLanguage(langParam), 600);
  }
})();
