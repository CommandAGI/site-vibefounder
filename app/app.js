/*
 * The founding bench's page: the form, the ranked sample co-founders, the founding agreement it drafts, and the first
 * week's checklist. All of it runs in this browser; the page's policy forbids a connection (`connect-src 'none'`).
 * The matching and the agreement are `match.mjs` (pure, tested by test/site.test.mjs); the words are `strings.mjs`.
 */
import { PROFILES } from './profiles.mjs';
import { rankCoFounders, foundingAgreement, MAX_SCORE, CRAFTS, DOMAINS, COMMITMENTS } from './match.mjs';
import { t, localeOf } from './strings.mjs';

const $ = selector => document.querySelector(selector);
const BENCH_KEY = 'vibefounder.bench';
const CHECKLIST_KEY = 'vibefounder.first-week';
const LANG_KEY = 'sites.lang.tag';

const read = (store, key) => { try { return JSON.parse(store.getItem(key) ?? 'null'); } catch { return null; } };
const write = (store, key, value) => { try { store.setItem(key, JSON.stringify(value)); } catch { /* storage off: the page still works, it just forgets */ } };

/** The page's locale: `?lang=` (chosen here), else the language chosen on a marketing page, else this page's tag. */
function currentLocale() {
    const asked = new URLSearchParams(location.search).get('lang');
    if (asked) return localeOf(asked === 'zh' ? 'zh-Hans' : asked);
    let stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch { /* storage off */ }
    return localeOf(stored ?? document.documentElement.lang);
}

let locale = currentLocale();
let state = read(sessionStorage, BENCH_KEY) ?? { name: '', craft: 'code', domain: 'startup', commitment: 'full-time', picked: null };

/** Every word the page carries, in this locale; then the selects and the checklist are built from it. */
function applyLocale() {
    const was = document.documentElement.lang;
    document.documentElement.lang = locale;
    if (was !== locale) document.documentElement.dir = 'ltr';
    for (const node of document.querySelectorAll('[data-t]')) node.textContent = t(locale, node.dataset.t);
    const nameInput = $('#founder-name');
    nameInput.placeholder = t(locale, 'form.namePlaceholder');
    $('.lang-btn').setAttribute('aria-label', t(locale, 'lang.button'));
    $('.lang-btn').title = t(locale, 'lang.button');
    $('.lang-dialog__close').setAttribute('aria-label', t(locale, 'lang.close'));
    for (const a of document.querySelectorAll('.lang-list a'))
        a.setAttribute('aria-current', a.dataset.lang === locale ? 'true' : 'false');
    // The about and privacy pages are one page per locale: the link follows this page's language, so a visitor
    // reading the bench in Spanish is not sent to the English page.
    const folder = { en: '../', es: '../es/', 'zh-Hans': '../zh/' }[locale];
    for (const a of document.querySelectorAll('[data-page]')) a.href = `${folder}${a.dataset.page}`;
    buildSelect($('#founder-craft'), CRAFTS, 'craft');
    buildSelect($('#founder-domain'), DOMAINS, 'domain');
    buildChips();
    buildChecklist();
    render();
}

function buildSelect(select, values, prefix) {
    select.replaceChildren(...values.map(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(locale, `${prefix}.${value}`);
        return option;
    }));
    select.value = state[prefix];
}

function buildChips() {
    const group = $('#founder-commitment');
    group.replaceChildren(...COMMITMENTS.map(value => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.dataset.value = value;
        chip.textContent = t(locale, `commitment.${value}`);
        chip.setAttribute('aria-pressed', String(state.commitment === value));
        chip.addEventListener('click', () => {
            state.commitment = value;
            save();
            buildChips();
            render();
        });
        return chip;
    }));
}

const save = () => write(sessionStorage, BENCH_KEY, state);

function matchItem(result) {
    const { profile, score, reasons } = result;
    const item = document.createElement('li');
    item.className = 'match';
    const head = document.createElement('div');
    head.className = 'match__head';
    const name = document.createElement('span');
    name.className = 'match__name';
    name.textContent = profile.name;
    const sample = document.createElement('span');
    sample.className = 'sample';
    sample.textContent = t(locale, 'sample');
    const points = document.createElement('span');
    points.className = 'match__score';
    points.textContent = t(locale, 'match.outOf', { score, max: MAX_SCORE });
    head.append(name, sample, points);
    const line = document.createElement('p');
    line.textContent = profile.line;
    const where = document.createElement('p');
    where.className = 'hint mono';
    where.textContent = profile.place;
    const why = document.createElement('ul');
    why.className = 'match__reasons';
    for (const reason of reasons) {
        const row = document.createElement('li');
        row.textContent = t(locale, `reason.${reason.key}`, { value: nameOf(reason) });
        why.append(row);
    }
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'button button--quiet';
    pick.textContent = t(locale, 'pick', { name: profile.name });
    pick.addEventListener('click', () => { state.picked = profile.id; save(); render(); });
    item.append(head, line, where, why, pick);
    return item;
}

/** A reason's value in words: a craft, a domain or a commitment, named in this locale. */
function nameOf({ key, value }) {
    if (key === 'domain') return t(locale, `domain.${value}`);
    if (key === 'commitment' || key === 'commitmentMismatch') return t(locale, `commitment.${value}`);
    return t(locale, `craft.${value}`);
}

function renderAgreement(profile) {
    const text = foundingAgreement({ founderName: state.name, profile });
    const box = document.createElement('div');
    box.className = 'stack';
    const head = document.createElement('div');
    head.className = 'match__head';
    const title = document.createElement('h2');
    title.textContent = t(locale, 'agreement.title', { name: profile.name });
    head.append(title);
    const note = document.createElement('p');
    note.className = 'hint';
    note.textContent = t(locale, 'agreement.note');
    const panel = document.createElement('div');
    panel.className = 'agreement';
    const pre = document.createElement('pre');
    pre.id = 'agreement-text';
    pre.textContent = text;
    panel.append(pre);
    const actions = document.createElement('div');
    actions.className = 'chips';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'button';
    copy.textContent = t(locale, 'copy');
    copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(text); } catch {
            const range = document.createRange();
            range.selectNodeContents(pre);
            const selection = getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        copy.textContent = t(locale, 'copied');
    });
    const download = document.createElement('a');
    download.className = 'button button--quiet';
    download.textContent = t(locale, 'download');
    download.download = 'founding-agreement.md';
    download.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'button button--quiet';
    back.textContent = t(locale, 'close');
    back.addEventListener('click', () => { state.picked = null; save(); render(); });
    actions.append(copy, download, back);
    box.append(head, note, panel, actions);
    return box;
}

function render() {
    const out = $('#bench-results');
    const picked = state.picked && PROFILES.find(p => p.id === state.picked);
    if (picked) {
        out.replaceChildren(renderAgreement(picked));
        return;
    }
    const results = rankCoFounders(PROFILES, { craft: state.craft, domain: state.domain, commitment: state.commitment });
    const count = document.createElement('p');
    count.className = 'label';
    count.textContent = t(locale, 'result.count', { n: results.length });
    const list = document.createElement('ul');
    list.className = 'results';
    for (const result of results) list.append(matchItem(result));
    out.replaceChildren(count, list);
}

function buildChecklist() {
    const done = read(localStorage, CHECKLIST_KEY) ?? {};
    const form = $('#checklist');
    form.replaceChildren(...Array.from({ length: 8 }, (_, i) => {
        const key = `c${i + 1}`;
        const label = document.createElement('label');
        label.className = 'check';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.key = key;
        input.checked = Boolean(done[key]);
        input.addEventListener('change', () => {
            const now = read(localStorage, CHECKLIST_KEY) ?? {};
            now[key] = input.checked;
            write(localStorage, CHECKLIST_KEY, now);
            progress();
        });
        const text = document.createElement('span');
        text.textContent = t(locale, `checklist.${key}`);
        label.append(input, text);
        return label;
    }));
    progress();
}

function progress() {
    const done = read(localStorage, CHECKLIST_KEY) ?? {};
    const count = Object.values(done).filter(Boolean).length;
    $('#checklist-progress').textContent = t(locale, 'checklist.progress', { done: count, max: 8 });
}

function wireForm() {
    $('#founder-name').value = state.name;
    $('#founder-name').addEventListener('input', e => { state.name = e.target.value; save(); });
    $('#founder-form').addEventListener('submit', e => {
        e.preventDefault();
        state.name = $('#founder-name').value;
        state.craft = $('#founder-craft').value;
        state.domain = $('#founder-domain').value;
        state.picked = null;
        save();
        render();
        // A jump, not a smooth scroll: the matches must not move under the pointer of a person about to click one.
        const results = $('#bench-results');
        if (results.getBoundingClientRect().top > innerHeight - 120) results.scrollIntoView({ block: 'start' });
    });
    $('#founder-craft').addEventListener('change', e => { state.craft = e.target.value; save(); });
    $('#founder-domain').addEventListener('change', e => { state.domain = e.target.value; save(); });
}

function wireLanguage() {
    const dialog = $('#lang-dialog');
    const button = $('.lang-btn');
    if (!('commandForElement' in HTMLButtonElement.prototype)) button.addEventListener('click', () => dialog.showModal());
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
    for (const link of dialog.querySelectorAll('a')) link.addEventListener('click', e => {
        e.preventDefault();
        try { localStorage.setItem(LANG_KEY, link.dataset.lang); } catch { /* the choice lasts this page */ }
        try { localStorage.setItem('sites.lang', '1'); } catch { /* idem */ }
        locale = localeOf(link.dataset.lang);
        history.replaceState(null, '', link.getAttribute('href'));
        dialog.close();
        applyLocale();
    });
}

// The tool dock's keys, as on the other pages (lang.js): 1–4 follow its links unless focus is in a field.
addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
    if (e.target.closest?.('input, select, textarea, [contenteditable], dialog')) return;
    const link = document.querySelectorAll('.dock a')[Number(e.key) - 1];
    if (link) { e.preventDefault(); link.click(); }
});

wireForm();
wireLanguage();
applyLocale();
