/*
 * The home page's scenes, one script for the three locale homes (each page's <html lang> picks the words):
 *   - the duet: two cursors co-write the headline, then co-build Fig. 1 (motion only without reduced motion; with it,
 *     the composed final state and the cursors parked);
 *   - the missing half: the bench's own matcher (app/match.mjs) on the same fictional sample co-founders;
 *   - the films: muted loops that play only on screen, with a pause button, never under reduced motion;
 * The page works without this file: the headline, the figure and the ring are already composed in the HTML.
 */
import { PROFILES } from './app/profiles.mjs';
import { rankCoFounders, MAX_SCORE } from './app/match.mjs';
import { t, localeOf } from './app/strings.mjs';

const locale = localeOf(document.documentElement.lang);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* ---- the duet ---------------------------------------------------------------------------------------------- */
const hero = $('.hero');
const cursors = { a: $('[data-cursor="a"]'), b: $('[data-cursor="b"]') };
const thing = $('.thing');

/** Where a point of the page is, in the hero's own coordinates (the cursors are positioned in it). */
function inHero(x, y) {
    const box = hero.getBoundingClientRect();
    return [x - box.left, y - box.top];
}
/** A cursor near the right edge carries its name tag on its left, so the tag never leaves the page. */
function place(hand, x, y) {
    const cursor = cursors[hand];
    const flip = x + cursor.offsetWidth > hero.clientWidth - 8;
    cursor.classList.toggle('cursor--flip', flip);
    cursor.style.translate = `${Math.round(Math.max(4, flip ? x - cursor.offsetWidth : x))}px ${Math.round(y)}px`;
}
function toWord(hand, word, edge = 'end') {
    const box = word.getBoundingClientRect();
    const [x, y] = inHero(edge === 'end' ? box.right - 6 : box.left + 4, box.top + box.height * .62);
    place(hand, x, y);
}
/** A point of the figure's SVG, in the hero's coordinates. */
function svgPoint(path, at) {
    const point = path.getPointAtLength(at);
    const matrix = path.getScreenCTM();
    return inHero(point.x * matrix.a + point.y * matrix.c + matrix.e, point.x * matrix.b + point.y * matrix.d + matrix.f);
}

/** The cursors' resting place: each at the end of the last line its hand drew. */
function park() {
    for (const hand of ['a', 'b']) {
        const paths = $$(`path[data-hand="${hand}"]`, thing);
        const last = paths[paths.length - 1];
        const [x, y] = svgPoint(last, last.getTotalLength());
        place(hand, x, y);
    }
}

/** Both hands draw their paths at once, path after path, each cursor riding its own pen. */
function build() {
    const hands = { a: $$('path[data-hand="a"]', thing), b: $$('path[data-hand="b"]', thing) };
    for (const path of [...hands.a, ...hands.b]) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = String(length);
    }
    const PER = 750;
    return new Promise(resolve => {
        const start = performance.now();
        const frame = now => {
            let running = false;
            for (const hand of ['a', 'b']) {
                const paths = hands[hand];
                const elapsed = now - start;
                const index = Math.min(paths.length - 1, Math.floor(elapsed / PER));
                for (const [i, path] of paths.entries()) {
                    const length = path.getTotalLength();
                    const share = i < index ? 1 : i > index ? 0 : Math.min(1, (elapsed - i * PER) / PER);
                    const eased = 1 - (1 - share) ** 3;
                    path.style.strokeDashoffset = String(length * (1 - eased));
                    if (i === index) {
                        const [x, y] = svgPoint(path, length * eased);
                        cursors[hand].style.transition = 'none';
                        place(hand, x, y);
                    }
                }
                if (elapsed < paths.length * PER) running = true;
            }
            if (running) requestAnimationFrame(frame);
            else resolve();
        };
        requestAnimationFrame(frame);
    });
}

async function duet() {
    const words = $$('.hero h1 .w');
    for (const cursor of Object.values(cursors)) cursor.hidden = false;
    if (still) {
        park();
        addEventListener('resize', park);
        return;
    }
    document.documentElement.classList.add('motion');
    const h1 = $('.hero h1').getBoundingClientRect();
    const [x0, y0] = inHero(h1.left, h1.top);
    place('a', x0 - 30, y0 + 20);
    place('b', x0 + h1.width * .6, y0 - 30);
    await wait(350);
    for (const word of words) {
        const hand = word.classList.contains('w--b') ? 'b' : 'a';
        if (word.classList.contains('w--both')) break;
        toWord(hand, word, 'start');
        await wait(160);
        word.classList.add('is-in');
        toWord(hand, word, 'end');
        await wait(260);
    }
    // The signature: both hands select the last word together, and it turns the colour of their overlap.
    const last = words[words.length - 1];
    last.classList.add('is-in');
    toWord('a', last, 'start');
    toWord('b', last, 'end');
    await wait(520);
    last.classList.add('is-sel');
    await wait(500);
    // Then they move to the figure and build it, both at once.
    for (const cursor of Object.values(cursors)) cursor.style.transition = '';
    thing.classList.remove('is-built');
    await build();
    thing.classList.add('is-built');
    for (const cursor of Object.values(cursors)) cursor.style.transition = '';
    addEventListener('resize', park);
}

/* ---- the missing half ------------------------------------------------------------------------------------- */
function half(craft) {
    const [top] = rankCoFounders(PROFILES, { craft, domain: 'startup', commitment: 'full-time' });
    const theirs = top.profile.crafts.filter(c => c !== craft);
    for (const node of $$('#half [data-craft]')) {
        const value = node.dataset.craft;
        if (node.matches('button')) { node.setAttribute('aria-pressed', String(value === craft)); continue; }
        node.classList.toggle('is-a', value === craft);
        node.classList.toggle('is-b', theirs.includes(value));
    }
    $('[data-who]').textContent = top.profile.name;
    $('[data-why]').textContent = t(locale, 'half.covers', { crafts: theirs.map(c => t(locale, `craft.${c}`)).join(t(locale, 'half.join')) });
    $('[data-score]').textContent = t(locale, 'match.outOf', { score: top.score, max: MAX_SCORE });
    cursors.a.querySelector('span').textContent = `${t(locale, 'half.you')} · ${t(locale, `craft.${craft}`)}`;
    cursors.b.querySelector('span').textContent = `${t(locale, 'sample')} · ${t(locale, `craft.${theirs[0] ?? top.profile.crafts[0]}`)}`;
}
for (const button of $$('[data-crafts] button')) button.addEventListener('click', () => half(button.dataset.craft));

/* ---- the films --------------------------------------------------------------------------------------------- */
for (const film of $$('[data-film]')) {
    const video = $('video', film);
    const toggle = $('.film__toggle', film);
    let wanted = !still;
    const label = () => { toggle.textContent = video.paused ? toggle.dataset.play : toggle.dataset.pause; };
    const play = () => video.play().then(label, label);
    toggle.addEventListener('click', () => {
        wanted = video.paused;
        if (wanted) { video.preload = 'auto'; play(); } else { video.pause(); label(); }
    });
    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && wanted) { video.preload = 'auto'; play(); }
        else if (!entry.isIntersecting && !video.paused) { video.pause(); label(); }
    }, { rootMargin: '120px 0px' }).observe(film);
}

half('code');
if (document.fonts?.ready) document.fonts.ready.then(duet); else duet();
