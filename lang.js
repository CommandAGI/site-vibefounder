/*
 * The one language button (the A/文 glyph) and the language hint.
 *
 * The button opens the <dialog> by invoker commands (commandfor/command="show-modal"), which need no script; this file
 * adds the same where a browser has no invoker commands, closes on a backdrop click, keeps Tab inside the dialog, and
 * remembers the choice (localStorage `sites.lang`) so the hint stays away. The hint offers the locale the visitor's
 * browser prefers, read from the page's own hreflang alternates: the static-locale mechanism, with no redirect.
 */
(() => {
    const KEY = 'sites.lang';
    const remember = () => { try { localStorage.setItem(KEY, '1'); } catch { /* storage off: the hint returns next time */ } };
    const dialog = document.getElementById('lang-dialog');

    if (dialog) {
        const button = document.querySelector('[commandfor="lang-dialog"]');
        if (button && !('commandForElement' in HTMLButtonElement.prototype))
            button.addEventListener('click', () => dialog.showModal());
        dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
        dialog.addEventListener('keydown', e => {
            if (e.key !== 'Tab') return;
            const focusable = dialog.querySelectorAll('a, button');
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (document.activeElement === (e.shiftKey ? first : last)) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            }
        });
        for (const link of dialog.querySelectorAll('a')) link.addEventListener('click', remember);
    }

    /** A browser tag to a site locale: `zh-CN`, `zh-SG` are zh-Hans; `zh-TW` is not one of this site's locales. */
    const siteLocale = tag => {
        const [language, region] = String(tag).toLowerCase().split('-');
        if (language !== 'zh') return language;
        return /^(hans|cn|sg|my)$/.test(region) ? 'zh-hans' : 'zh';
    };

    const hint = document.getElementById('lang-hint');
    if (!hint) return;
    try { if (localStorage.getItem(KEY)) return; } catch { /* a browser with storage off still gets the hint */ }
    const here = document.documentElement.lang;
    const alternates = [...document.querySelectorAll('link[rel="alternate"][hreflang]')];
    for (const preferred of navigator.languages ?? []) {
        if (siteLocale(preferred) === siteLocale(here)) return;
        const match = alternates.find(a => a.hreflang !== 'x-default' && siteLocale(a.hreflang) === siteLocale(preferred));
        if (!match) continue;
        const link = hint.querySelector('a');
        link.href = match.href;
        link.lang = match.hreflang;
        link.textContent = { es: 'Ver esta página en español', 'zh-Hans': '用简体中文阅读此页面' }[match.hreflang] ?? 'Read this page in English';
        link.addEventListener('click', remember);
        hint.hidden = false;
        return;
    }
})();
