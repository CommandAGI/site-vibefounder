# VibeFounder 2027: notes

## generated media (fal, 2026-10-26)

Made by `redesign/media.mjs` (the prompts are in that file, `SHOTS`; the shared art direction is `LOOK`), graded and
compressed by `redesign/encode.sh`. The originals are not kept in the repository.

| shot | model | output | fal request | price |
|---|---|---|---|---|
| duet still | `fal-ai/nano-banana-pro` (2K, 16:9) | the first frame of the film | `01a17b50-874d-70a2-a038-273d9d3d04e0` | $0.15 |
| sheet still | `fal-ai/nano-banana-pro` (2K, 16:9) | the first frame of the film | `01a17b50-8743-7403-b201-ca82eca583bc` | $0.15 |
| proof still | `fal-ai/nano-banana-pro` (2K, 4:5) | `media/proof.{avif,jpg}` | `01a17b50-8786-77b3-8d94-a246614b1ebb` | $0.15 |
| duet film, 10 s | `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | `media/duet.{av1.mp4,mp4,jpg}` | `01a17b51-0567-77b2-af71-b63fbc792648` | $0.70 |
| sheet film, 5 s | `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | `media/sheet.{av1.mp4,mp4,jpg}` | `01a17b51-0934-7b52-802f-3cba9e7fc459` | $0.35 |

Total: **$1.50** by fal's list prices (of the $15 allowed); one run, no retries.

Prompts, in short (full text in `media.mjs`): overhead, a parchment linen bench, north light, film grain, only hands
and forearms, one person in cobalt sleeves and one in marigold sleeves, "fictional people, not a real event, no text".
`duet`: the two pairs of hands fit a board into a wooden enclosure. `sheet`: two pencils draw a blue and a yellow line
that meet. `proof`: a flat lay of things made (a soldered board, a printed bracket, a wireframe, a page of code, a
cardboard prototype).

Sizes: duet 366 KB AV1 / 622 KB H.264, sheet 192 KB / 323 KB, posters 68 KB, proof 31 KB AVIF / 116 KB JPEG.

## brand

- `brand/wordmark.svg`: `redesign/wordmark.py` outlines "VibeFounder" from Schibsted Grotesk at weight 860 with the
  site's own kerning ("eF" −70, "Fo" −60 units: the two halves of the name close up) and replaces the tittle of the i
  by the two overlapping squares, cobalt and marigold, with their overlap in the duo colour.
- `brand/favicon.svg`: the same two squares. `brand/og.png` (1200×630) and `brand/touch-icon.png` (180×180) are
  screenshots of `redesign/og.html`.
- `fonts/`: Schibsted Grotesk (OFL, `fonts/OFL.txt`), roman and italic variable, subset to Latin with `pyftsubset`.

## the locales

`redesign/locales.py` writes `es/index.html` and `zh/index.html` from the English home (paths one folder down, then
each string). `redesign/chrome.py` gave about, privacy and the team pages the header, the dock and the wordmark. Edit
the English home, then run `python3 redesign/locales.py .` from the site's folder.

## look and scores (Playwright, 1440 / 768 / 390 / 320 and reduced motion)

Screens checked: home, `es/`, `zh/`, `app/`, about, team, `zh/privacy.html`; none scrolls sideways or throws.
Iterations from the screenshots: the cursor tags left the page at 390 (they now flip to the left of the arrow and stay
on the page); the "50" underline sat under the label (now a text underline); the header links wrapped at 320 (About
moves to the footer under 420 px); the lang hint covered the headline (now in the header's flow); the Chinese
headline ended on a lone "。" for the shared selection (now "做公司。", "build the company").

My own scores, 1–10: art direction 8, brand specificity 9, product expression 8 (the home runs the real matcher),
interaction 8, technical quality 8, craft 8. Average 8.2, none below 8.

Against the set (live, 2026-10-26): the only site with a bottom tool dock as its nav, the only one whose shape is the
multiplayer name tag (one square corner), the only grotesk-only site on parchment, the only cobalt + marigold duotone.
