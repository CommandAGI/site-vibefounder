/*
 * The site's own tests: the pages, the static-locale mechanism, the bench's matching and agreement, and the words.
 * Run: `node --test test/` from the site's folder (or `node --test test/site.test.mjs`).
 *
 * The highest check that catches a mistake here is the browser: `tests/workbench/browser_org_sites.mjs` in the
 * CommandAGI repository screenshots every page of this site at 1440 and 390 px and fails on a sideways scroll, a broken
 * image or a page error. This file holds what a page cannot show by itself: a link with no file behind it, a locale
 * page without its alternates, a sample co-founder who is not marked fictional, and a string a locale lacks.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { rankCoFounders, foundingAgreement, MAX_SCORE, CRAFTS, DOMAINS, COMMITMENTS } from '../app/match.mjs';
import { PROFILES } from '../app/profiles.mjs';
import { STRINGS, t, localeOf } from '../app/strings.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');
const PAGES = ['index.html', 'es/index.html', 'zh/index.html', 'about.html', 'es/about.html', 'zh/about.html', 'privacy.html', 'es/privacy.html', 'zh/privacy.html', 'app/index.html'];
const LOCALES = ['en', 'es', 'zh-Hans'];

/** The site's own files, by the paths the pages may point at. */
const files = new Set(readdirSync(root, { recursive: true }).map(p => String(p).split(path.sep).join('/')).filter(p => !p.endsWith('/')));

/** A page's local links: `href`/`src` that name a file here, resolved against the page's folder. */
function localRefs(page, html) {
    const refs = [];
    for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
        if (/^(https?:|mailto:|data:|blob:|#)/.test(value)) continue;
        if (value.startsWith('?')) continue;
        const [target] = value.split(/[?#]/);
        if (!target) continue;
        const directory = target.endsWith('/');
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(page), target));
        refs.push({ attr, value, target: directory ? `${resolved}/` : resolved });
    }
    return refs;
}

test('every page exists and names a file behind each local link', () => {
    for (const page of PAGES) {
        assert.ok(existsSync(path.join(root, page)), `${page} is missing`);
        const html = read(page);
        for (const ref of localRefs(page, html)) {
            const resolved = ref.target.endsWith('/') ? path.posix.normalize(`${ref.target}index.html`) : ref.target;
            assert.ok(files.has(resolved), `${page} points at ${ref.value}, and ${resolved} is not in the site`);
        }
    }
});

test('every page carries a title, its language, the no-connection policy and the one A/文 button', () => {
    for (const page of PAGES) {
        const html = read(page);
        assert.match(html, /<title>[^<]{8,}<\/title>/, `${page} has no title`);
        assert.match(html, /<html lang="(en|es|zh-Hans)"/, `${page} names no language`);
        assert.match(html, /Content-Security-Policy" content="[^"]*connect-src 'none'/, `${page} does not forbid a connection`);
        assert.equal((html.match(/class="lang-btn"/g) ?? []).length, 1, `${page} has ${(html.match(/class="lang-btn"/g) ?? []).length} language buttons, not one`);
        assert.match(html, /A<span>\/<\/span><span lang="zh-Hans">文<\/span>/, `${page} lost the A/文 glyph`);
        assert.match(html, /<dialog id="lang-dialog"/, `${page} has no language dialog`);
        assert.equal((html.match(/<dialog /g) ?? []).length, 1, `${page} has more than one dialog`);
    }
});

test('the three home pages are one site in three locales: each lists the same alternates, and the picker marks its own', () => {
    const alternateSets = new Map();
    for (const [page, locale] of [['index.html', 'en'], ['es/index.html', 'es'], ['zh/index.html', 'zh-Hans']]) {
        const html = read(page);
        assert.match(html, new RegExp(`<html lang="${locale}"`), `${page} is not ${locale}`);
        const tags = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(m => m[1]);
        assert.deepEqual(tags.sort(), ['en', 'es', 'x-default', 'zh-Hans'], `${page} has the alternates ${tags.join(', ')}`);
        const checked = [...html.matchAll(/<a href="[^"]+" hreflang="([^"]+)" aria-current="true"/g)].map(m => m[1]);
        assert.deepEqual(checked, [locale], `${page}'s picker checks ${checked.join(', ')}, not its own locale`);
        alternateSets.set(page, tags.length);
        // The mechanism is static: a page per locale, not a redirect and not a script that rewrites the address.
        assert.doesNotMatch(html, /http-equiv="refresh"|location\.href\s*=/, `${page} redirects instead of serving its locale`);
    }
    assert.deepEqual([...alternateSets.values()], [4, 4, 4]);
});

test('the home page points at every vibe startup, and the list is the family', () => {
    const html = read('index.html');
    for (const name of ['VibeStartup', 'VibeCAD', 'VibeCode', 'VibeCloud', 'VibeCut', 'VibeForce', 'VibeFund', 'VibeGov'])
        assert.ok(html.includes(`class="eco-name">${name}<`), `the home page does not list ${name}`);
    const outgoing = [...html.matchAll(/<a [^>]*href="(https:\/\/[^"]+)"/g)].map(m => new URL(m[1]).host);
    assert.deepEqual([...new Set(outgoing)].sort(), ['vibecad.pro', 'vibecode.ooo', 'vibecloud.pro', 'vibecut.me', 'vibeforce.pro', 'vibefund.pro', 'vibegov.pro', 'vibestartup.us'].sort());
});

test('every sample co-founder is fictional and carries no way to reach a person', () => {
    assert.equal(PROFILES.length, 10);
    for (const profile of PROFILES) {
        assert.match(profile.id, /^sample-/, `${profile.id} is not marked a sample`);
        assert.equal(profile.fictional, true, `${profile.name} is not marked fictional`);
        for (const forbidden of ['photo', 'image', 'email', 'phone', 'url', 'avatar'])
            assert.equal(profile[forbidden], undefined, `${profile.name} carries a ${forbidden}`);
        assert.ok(CRAFTS.some(c => profile.crafts.includes(c)), `${profile.name} has a craft nobody can ask for`);
        assert.ok(profile.domains.every(d => DOMAINS.includes(d)), `${profile.name} builds in a domain the form does not offer`);
        assert.ok(COMMITMENTS.includes(profile.commitment), `${profile.name} commits to ${profile.commitment}`);
    }
});

test('the bench ranks the co-founder who fills the gap first, and says why', () => {
    const founder = { craft: 'code', domain: 'robotics', commitment: 'full-time' };
    const ranked = rankCoFounders(PROFILES, founder);
    assert.equal(ranked.length, PROFILES.length);
    assert.deepEqual([...ranked].sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id)), ranked, 'the list is not ordered best first');
    const top = ranked[0];
    assert.ok(!top.profile.crafts.includes('code'), `${top.profile.name} brings the craft the founder already has`);
    assert.ok(top.profile.domains.includes('robotics'), `${top.profile.name} does not build in the founder's domain`);
    assert.ok(top.reasons.some(r => r.key === 'domain'), 'the match gives no domain reason');
    assert.ok(top.reasons.some(r => r.key === 'gap'), 'the match gives no gap reason');
    // A reason is said once: the craft the founder lacks is the gap, and it is not repeated as "also covers".
    const texts = top.reasons.map(r => `${r.key}:${r.value}`);
    assert.equal(new Set(texts).size, texts.length, `a reason is said twice: ${texts.join(', ')}`);
    // A co-founder who shares the founder's craft cannot earn the gap points.
    const same = rankCoFounders(PROFILES, { craft: 'hardware', domain: 'cad', commitment: 'part-time' }).find(r => r.profile.crafts.includes('hardware'));
    assert.ok(!same.reasons.some(r => r.key === 'gap'), `${same.profile.name} earns gap points for the founder's own craft`);
    // The most a match can score is the same domain, both other crafts and the same commitment.
    const best = Math.max(...ranked.map(r => r.score));
    assert.ok(best <= MAX_SCORE, `a match scored ${best}, above ${MAX_SCORE}`);
    assert.throws(() => rankCoFounders(PROFILES, { craft: 'astrology', domain: 'startup', commitment: 'full-time' }), /craft/);
});

test('every reason a match gives has words in every locale', () => {
    const founder = { craft: 'code', domain: 'startup', commitment: 'full-time' };
    for (const { reasons } of rankCoFounders(PROFILES, founder))
        for (const reason of reasons)
            for (const locale of LOCALES) {
                const key = reason.key === 'domain' ? `domain.${reason.value}` : reason.key.startsWith('commitment') ? `commitment.${reason.value}` : `craft.${reason.value}`;
                assert.ok(STRINGS[locale][key], `${locale} lacks ${key}`);
                const words = t(locale, `reason.${reason.key}`, { value: t(locale, key) });
                assert.ok(!words.includes('{'), `${locale} leaves a placeholder in "${words}"`);
            }
});

test('the founding agreement carries the split, the vesting, the cliff and both names', () => {
    const profile = PROFILES[0];
    const text = foundingAgreement({ founderName: 'Ada', profile, date: new Date('2026-10-26T00:00:00Z') });
    for (const needle of ['Ada', profile.name, '50%', 'four years', 'one-year cliff', '2026-10-26', profile.line])
        assert.ok(text.includes(needle), `the agreement does not say ${needle}`);
    assert.match(text, /not legal advice/i);
    // A founder who types no name gets a draft that still reads.
    assert.match(foundingAgreement({ founderName: '  ', profile }), /^# Founding agreement \(draft\)/);
});

test('a locale is read from its tag, and every English word has its Spanish and Chinese', () => {
    assert.equal(localeOf('zh-Hans'), 'zh-Hans');
    assert.equal(localeOf('zh-CN'), 'zh-Hans');
    assert.equal(localeOf('es-MX'), 'es');
    assert.equal(localeOf('en-GB'), 'en');
    assert.equal(localeOf(undefined), 'en');
    const english = Object.keys(STRINGS.en);
    for (const locale of ['es', 'zh-Hans']) {
        const missing = english.filter(key => !STRINGS[locale][key]);
        assert.deepEqual(missing, [], `${locale} lacks ${missing.join(', ')}`);
        const extra = Object.keys(STRINGS[locale]).filter(key => !STRINGS.en[key]);
        assert.deepEqual(extra, [], `${locale} has keys English does not: ${extra.join(', ')}`);
        // A translation keeps every placeholder its English has, so nothing renders as `{value}`.
        for (const key of english) {
            const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
            assert.deepEqual(placeholders(STRINGS[locale][key]), placeholders(STRINGS.en[key]), `${locale}'s ${key} has other placeholders`);
        }
    }
});

test('about and privacy are one page in three locales: each lists the other two, and no translation is the English page', () => {
    // A page per locale is the site's static-locale mechanism; the alternates of `about.html` are the three about pages,
    // not the home pages, so a browser that asks for Spanish is offered the Spanish about page and no other.
    const main = html => (html.match(/<main>([\s\S]*?)<\/main>/) ?? [, ''])[1];
    const shape = text => ({
        headings: (text.match(/<h[12][^>]*>/g) ?? []).length,
        paragraphs: (text.match(/<p[^>]*>/g) ?? []).length,
        items: (text.match(/<li[^>]*>/g) ?? []).length,
    });
    for (const name of ['about.html', 'privacy.html']) {
        const pages = { en: name, es: `es/${name}`, 'zh-Hans': `zh/${name}` };
        for (const [locale, page] of Object.entries(pages)) {
            assert.ok(existsSync(path.join(root, page)), `${page} is missing`);
            const html = read(page);
            assert.match(html, new RegExp(`<html lang="${locale}"`), `${page} is not ${locale}`);
            const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(([, tag, href]) => [tag, href]));
            assert.deepEqual(Object.keys(alternates).sort(), ['en', 'es', 'x-default', 'zh-Hans'], `${page} has the alternates ${Object.keys(alternates).join(', ')}`);
            for (const [tag, target] of Object.entries(pages)) {
                const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(page), alternates[tag]));
                assert.equal(resolved, target, `${page}'s ${tag} alternate points at ${alternates[tag]} (${resolved}), not ${target}`);
            }
            assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(page), alternates['x-default'])), name, `${page}'s x-default is not the English page`);
            // The picker offers the same three pages, and marks the one being read.
            const from = html.indexOf('class="lang-list"');
            const list = html.slice(from, html.indexOf('</ul>', from));
            const offered = [...list.matchAll(/<a href="([^"]+)" hreflang="([^"]+)"( aria-current="true")?/g)].map(m => ({ href: m[1], tag: m[2], current: Boolean(m[3]) }));
            assert.deepEqual(offered.map(o => o.tag), ['en', 'es', 'zh-Hans'], `${page}'s picker offers ${offered.map(o => o.tag).join(', ')}`);
            assert.deepEqual(offered.filter(o => o.current).map(o => o.tag), [locale], `${page}'s picker checks ${offered.filter(o => o.current).map(o => o.tag).join(', ')}, not its own locale`);
            for (const option of offered)
                assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(page), option.href)), pages[option.tag], `${page}'s picker sends ${option.tag} to ${option.href}`);
        }
        // The same sections, in other words: a page copied from the English one keeps its sentences.
        const english = main(read(name));
        for (const page of [`es/${name}`, `zh/${name}`]) {
            const translated = main(read(page));
            assert.deepEqual(shape(translated), shape(english), `${page} does not hold the same sections as ${name}`);
            for (const sentence of english.split(/<p[^>]*>|<li[^>]*>|<h[12][^>]*>/).map(part => part.replace(/<[^>]+>/g, '').trim()).filter(part => part.split(/\s+/).length >= 8))
                assert.ok(!translated.includes(sentence.split(/\s+/).slice(0, 6).join(' ')), `${page} carries the English sentence "${sentence.slice(0, 60)}…"`);
        }
    }
});

test('the home page and the bench link the about and privacy page of the language being read', () => {
    for (const [page, folder] of [['index.html', ''], ['es/index.html', 'es/'], ['zh/index.html', 'zh/']]) {
        for (const name of ['about.html', 'privacy.html']) {
            const refs = [...read(page).matchAll(new RegExp(`href="([^"]*${name})"`, 'g'))].map(m => path.posix.normalize(path.posix.join(path.posix.dirname(page), m[1])));
            assert.ok(refs.includes(`${folder}${name}`), `${page} does not link ${folder}${name} (it links ${refs.join(', ') || 'none'})`);
            if (folder) assert.ok(!refs.includes(name), `${page} links the English ${name}`);
        }
    }
    // The bench is one page in three languages: its links move with the language (app.js), so the two static hrefs are
    // the English ones, and app.js carries a folder for each locale.
    const app = read('app/index.html');
    assert.equal((app.match(/data-page="about\.html"/g) ?? []).length, 2, 'the bench does not mark both its about links');
    assert.equal((app.match(/data-page="privacy\.html"/g) ?? []).length, 1, 'the bench does not mark its privacy link');
    const script = read('app/app.js');
    for (const folder of ["'../es/'", "'../zh/'"]) assert.ok(script.includes(folder), `the bench's links do not follow the language to ${folder}`);
    for (const name of ['about.html', 'privacy.html']) {
        assert.ok(files.has(`es/${name}`) && files.has(`zh/${name}`), `the bench links ${name} in a locale that has none`);
    }
});

test('site.json names the site this folder is deployed as', () => {
    const manifest = JSON.parse(read('site.json'));
    assert.equal(manifest.slug, 'vibefounder');
    assert.equal(manifest.status, 'active');
    assert.ok(manifest.description && manifest.description.length > 40, 'the description is the site\'s line in the sites app');
});
