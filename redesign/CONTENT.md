# VibeFounder: the audit (2026-10-26)

What the site was before the 2027 redesign, what works, and what it claims. The redesign keeps every row of
"keeps" below.

## routes

| route | what it is | works? |
|---|---|---|
| `/` `/es/` `/zh/` | the home page in three locales, static, with `hreflang` alternates | yes |
| `/app/` (`?lang=en\|es\|zh`) | the founding bench: form → ranked sample co-founders → founding agreement (copy, download `.md`) → the first week's checklist | yes, all in the browser |
| `/about.html` `/es/about.html` `/zh/about.html` | what VibeFounder is | yes |
| `/privacy.html` + `es/` `zh/` | what the site keeps: nothing | yes |
| `/team.html`, `/team-ivana-petrovic.html`, `/team-grace-achieng.html` | the two AI-agent co-founders, generated portraits, "AI agent" badge | yes (English only) |

## real workflows (keeps)

- **Matching** (`app/match.mjs`, pure): a founder names a craft, a domain and a commitment; ten sample co-founders are
  ranked by shared domain (3), the craft the founder lacks (2), other crafts (1 each), same commitment (2); max 9.
- **The founding agreement** (`foundingAgreement`): 50/50, four years of vesting with a one-year cliff, IP assigned,
  joint decisions, "not legal advice". Copy, or download `founding-agreement.md`.
- **The first week's checklist**: eight items in `localStorage`.
- **Three locales** everywhere but the team pages; the one A/文 language button and its dialog; the browser-language
  hint (`lang.js`).
- **The ecosystem list**: eight links out to the vibe startups' own domains.
- **Contact**: `mailto:hello@vibefounder.dev`.
- **Policy**: `connect-src 'none'`; nothing leaves the page.

## what is a demo

Everything on the bench runs on ten fictional sample co-founders (`fictional: true`, id `sample-…`, no photo, no
contact). No real person is matched. The agreement is a draft for a lawyer. The team are AI agents with generated
faces, disclosed as such.

## claims

- No user counts, no testimonials, no logos, no press. Keep it that way.
- "A person reads it" (contact): kept.
- The ecosystem links point at domains the site does not control; the hint says so.

## what the redesign adds

- Generated film and stills (fal), labeled "generated, not real people" where they appear.
- The home page runs the real matcher (`match.mjs`) in its "missing half" scene, on the same sample people.
