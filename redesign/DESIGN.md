# VibeFounder 2027: the duet

*By the multiplayer-tools designer. I have spent years drawing the moment two cursors meet in one file. This site is
that moment, for founders.*

## concept

Two people building one thing. Everything on the page is made by two hands: a cobalt one and a marigold one. Where
they overlap, the colour of the company appears: in OKLCH the mix of cobalt and marigold is a rose on oxblood's hue,
so the overlap of the two founders *is* the brand. Proof of work over bios: the page shows things made, never
adjectives about people.

## type

One family, the full range: **Schibsted Grotesk** variable (wght 400–900, roman and italic), self-hosted, subset to
Latin, Latin Extended-A and punctuation (56 KB + 59 KB woff2), `font-display: swap` with a metric-matched Arial fallback
(`size-adjust`, `ascent-override`).

- Display: 900, tracking −0.05em, line-height 0.86, `clamp(3.4rem, 11vw, 12.5rem)`. Headings are composed, not
  typed: one idea, three to six words.
- Scale: ratio 1.333 from 1.0625rem body (17 px), 400 weight, line-height 1.5, measure ≤ 58ch.
- Italic = the co-founder's voice (marigold-side words). Roman = yours.
- Numerals: tabular lining in the vesting track and scores (`font-variant-numeric: tabular-nums`).
- `text-wrap: balance` on headings, `pretty` on paragraphs.

## colour (OKLCH, sRGB fallback first)

| token | value | use | contrast on parchment |
|---|---|---|---|
| `--paper` | `oklch(0.937 0.022 80.7)` #f2e9da | ground | — |
| `--ink` | `oklch(0.27 0.06 355)` #3b1726 | text | 12.9:1 |
| `--oxblood` | `oklch(0.379 0.107 356.8)` #6c2443 | the company, rules, toolbar | 8.9:1 |
| `--cobalt` | `oklch(0.496 0.212 267.4)` #2f4fd8 | person A ("you") | 5.6:1 |
| `--marigold` | `oklch(0.793 0.159 78.7)` #f2ad1c | person B, fills only; text on it is ink | ink on it 7.8:1 |
| `--duo` | `color-mix(in oklch, cobalt, marigold)` ≈ #de5397 | where the two overlap | fills only |

No gradient between the two people ever: they stay two colours, and only their overlap is the third.

## shape language: the name tag

The multiplayer name tag is the site's one shape: a rectangle with its **top-left corner square** (where the cursor
points) and the other three at `0.9em`. Buttons, labels and chips are name tags. Panels have no radius at all and are
drawn as 2 px oxblood rules, never cards with shadows.

## nav: the tool dock

No top nav. The wordmark sits top-left; navigation is a **floating tool dock at the bottom centre**, oxblood, like
the toolbar of a canvas tool: numbered tools (1 Bench, 2 Half, 3 Proof, 4 Agreement, 5 Rooms) and the bench as the
primary tool. Keys 1–5 jump when focus is not in a field. At 390 and 320 the dock spans the width, labels shorten.

## layout

- 1440 / 2560: a 12-column canvas with a faint dot grid (`radial-gradient` 24 px, 8 % oxblood) on the paper; sections
  are full-bleed plates. 2560 caps the text column at 1600 px and lets media bleed.
- 768: plates stack; the hero thing sits under the headline.
- 390: the headline is 3 lines at ~3.6rem; the dock is full-width; the ring scene is a 300 px ring with the controls
  under it.
- 320: nothing scrolls sideways; dock labels drop to numbers + one word; headline 3.1rem.

## motion: presence

Everything that moves is moved by a cursor. Ease `cubic-bezier(.2,.9,.25,1.12)` (a hand that overshoots a hair and
settles). No fades from nowhere.

- Hero: the two cursors co-write the headline word by word; each word lands in its writer's colour; the last word is
  selected by both and turns duo. Beside it they co-build a small device (cobalt draws the board, marigold the
  enclosure; the overlap fills duo). Once, ~4 s, then they idle.
- The missing half (scroll-driven, `animation-timeline: view()`): the six-craft ring draws itself as it enters.
  Choosing your craft fills it cobalt; the real matcher picks the sample co-founder who covers the gap; their crafts
  fill marigold.
- The agreement: the vesting track fills month by month with scroll; the cliff at month 12 is a hard step.
- Reduced motion: every scene is a composed still (final state), cursors parked, videos replaced by their posters,
  no scroll-linked motion. Nothing flashes.

## media plan (fal; NOTES.md has the prompts and costs)

One art direction: overhead, parchment linen bench, soft north light, film grain, only hands and forearms; the two
people are told apart only by sleeve colour (cobalt, marigold). No faces, nothing posing as a user or customer; each
plate carries "Generated film/image, not real people".

1. `duet` — fullscreen section video (10 s loop): two pairs of hands fit a board into an enclosure.
2. `sheet` — half-bleed video (5 s): two pencils draw toward each other; the agreement section.
3. `proof` — still (4:5): a flat lay of things made; the proof-of-work plate.

Encoding: AV1 (`libaom-av1`) + H.264 fallback, ≤ 3 MB per loop, 1280 px wide, muted, `playsinline loop`, poster
frame as AVIF/JPEG, `preload="none"` and started by an IntersectionObserver beyond the first screen.

## sections

1. **Hero** — "Find the other half of your company." co-written by two cursors; the co-built device; CTA "Open the
   founding bench" (name tag); a quiet line: sample people, fictional, nothing sent.
2. **One bench** — fullscreen film; "One bench. Two pairs of hands."
3. **The missing half** — the ring; you pick your craft; the real matcher answers with a sample co-founder.
4. **Proof, not bios** — the flat-lay plate; a bio struck out by a cobalt line; what a sample person shipped.
5. **The agreement** — the drawing film; 50 · 50; the 48-month track and the cliff; "Draft yours at the bench".
6. **The rest of the room** — the eight vibe startups as a huge typographic roster; each row lifts a name tag on hover.
7. **Talk** — "A co-founder is a conversation." the address in display size.

## signature moment

The two cursors finishing the headline together: both select "company", and the selection turns duo.

## don'ts

No cards, no shadows, no gradients, no icons in squares, no stock people, no faces, no counts, no testimonials, no
glow. No second typeface. Never use marigold for text. Never let the two colours blend except at an overlap.
