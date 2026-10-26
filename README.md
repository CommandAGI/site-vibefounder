# site-vibefounder

The site of **VibeFounder**, the founder-facing hub of the vibe ecosystem: a startup of CommandAGI's vibe family
(`org-vibefounder`). A static folder served by CommandAGI's site hosting, mounted in the CommandAGI repository at
`seed/drive/platform/org-vibefounder/sites/vibefounder`.

Live at <https://vibefounder.commandagi.app>. The brand's own domains (`vibefounder.dev`, `vibefounder.lol`) stay on
their current hosts until the integrator moves them; `vibefounder.dev` serves VibeGov today.

## what is here

- `index.html`, `es/index.html`, `zh/index.html` — the home page in the three locales the site ships. The English page
  is at `/`, Spanish at `/es/`, Simplified Chinese at `/zh/`. Each page carries its own `<html lang>`, the same
  `hreflang` alternates, and the footer's one language button (the **A/文** glyph) that opens a dialog of plain links to
  the other locales' static pages. `lang.js` adds the dialog's fallbacks and the browser-language hint; there is no
  redirect.
- `about.html`, `privacy.html` — what VibeFounder is, and what the site keeps (nothing: the bench runs in the browser).
  English only for now (`docs/next.md` in the CommandAGI repository says so).
- `app/` — the founding bench, the working first version:
  - `match.mjs` — pure: `rankCoFounders` scores ten sample co-founders on the domain they share, the craft the founder
    lacks and the hours they can give, and `foundingAgreement` drafts the agreement. No DOM, no storage, no network.
  - `profiles.mjs` — the sample co-founders. Every one is fictional (`fictional: true`, an id that starts with
    `sample-`), with no photograph and no way to reach a person.
  - `strings.mjs` — the app's words in `en`, `es` and `zh-Hans`, with `t()` and `localeOf()`.
  - `app.js` — the page: the form, the ranked list, the agreement (copy or download `.md`) and the first week's
    checklist. Answers live in the tab's session storage, the checklist and the language in local storage.
- `test/site.test.mjs` — the site's own tests: every local link resolves, every page carries its policy and the one
  A/文 button, the three locale homes have the same alternates, the matching ranks the gap first, and every English
  word has its Spanish and Chinese.
- `site.json` — the site hosting manifest (slug `vibefounder`).

The page's policy is `connect-src 'none'`: nothing on this site reaches the network. The ecosystem list links out to the
other vibe startups' own sites, and those links are the only way off.

## the look

The tokens and the type are CommandAGI's public sites' (`sites/components/1-tokens.css` in the CommandAGI repository,
the owner's code): a warm paper ground and warm ink, a serif for display, one grotesk for text, a mono for records,
square corners, no gradients, dark from `prefers-color-scheme`.

## run and deploy

```sh
node --test test/site.test.mjs            # the site's own tests (Node 22 or newer; no dependencies)
python3 -m http.server 8080               # look at it: http://localhost:8080/
commandagi sites deploy --prod .          # production at https://vibefounder.commandagi.app
```

A `git push` of `main` deploys production where the site's folder is a repository CommandAGI hosts; the CommandAGI
copy of this folder is a shallow submodule, so a push here does not reach it by itself. Deploy from the folder:

```sh
commandagi sites deploy --prod seed/drive/platform/org-vibefounder/sites/vibefounder
```

## domains

| domain | kind | locale it serves |
|---|---|---|
| `vibefounder.dev` | primary (and the contact's domain) | English — the generic TLD is an alias of the primary |
| `vibefounder.lol` | alias of the primary | English |
| `vibefounder.commandagi.app` | the platform's production address | English at `/`, with `/es/` and `/zh/` beside it |

A country-code domain would be a translation-specific deployment of the same site in that locale; this brand has none
yet, so no such deployment is recorded. `hello@vibefounder.dev` is the contact. Add a custom domain with
`commandagi sites domains vibefounder add <domain>`; DNS is the integrator's, not this repository's.
