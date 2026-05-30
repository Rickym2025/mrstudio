document.addEventListener('DOMContentLoaded', () => {
    // 1. Inizializza GA4 e imposta il consenso di default su "negato"
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
    });

    // 2. Controlla se l'utente ha già fatto una scelta
    const consent = localStorage.getItem('rmstudio_cookie_consent');
    if (consent === 'granted') {
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        return; // Esce: il banner non viene mostrato
    } else if (consent === 'denied') {
        return; // Esce: il banner non viene mostrato
    }

    // 3. Se non c'è scelta, inietta l'HTML del banner nel body
    const bannerHTML = `
    <div id="rm-cookie-banner" class="fixed bottom-0 left-0 w-full bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-[99999] transform translate-y-full transition-transform duration-500 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" style="font-family: sans-serif;">
        <div class="text-slate-300 text-sm max-w-4xl text-left">
            <strong class="text-white">Rispettiamo la tua privacy.</strong> Utilizziamo cookie tecnici per il sito e analitici (Google Analytics) per migliorarci. Nessun dato viene venduto. 
            <a href="https://rmstudio.app/privacy.html" target="_blank" class="text-cyan-400 underline hover:text-cyan-300 ml-1">Leggi l'Informativa</a>.
        </div>
        <div class="flex gap-3 shrink-0 w-full md:w-auto">
            <button id="btn-reject-cookie" class="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-white/20 text-slate-300 font-bold hover:bg-white/5 transition-colors text-sm">Rifiuta</button>
            <button id="btn-accept-cookie" class="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white text-black font-extrabold hover:bg-slate-200 transition-transform active:scale-95 text-sm">Accetta Tutti</button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    const banner = document.getElementById('rm-cookie-banner');

    // 4. Animazione di entrata
    setTimeout(() => { banner.classList.remove('translate-y-full'); }, 500);

    // 5. Gestione dei click
    document.getElementById('btn-accept-cookie').addEventListener('click', () => {
        localStorage.setItem('rmstudio_cookie_consent', 'granted');
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        banner.classList.add('translate-y-full');
        setTimeout(() => banner.remove(), 500);
    });

    document.getElementById('btn-reject-cookie').addEventListener('click', () => {
        localStorage.setItem('rmstudio_cookie_consent', 'denied');
        banner.classList.add('translate-y-full');
        setTimeout(() => banner.remove(), 500);
    });
});
