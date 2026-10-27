#!/usr/bin/env node
/*
 * The site's generated media, made once on a build machine with fal (never from the page: the key stays here).
 * Each shot is a still (nano-banana-pro), then, when it moves, a clip made from that still (Kling image-to-video).
 * Originals land in --out (outside the repository); `encode.sh` grades and compresses them into media/.
 *
 *   COMMANDAGI_ENV_ROOT=~/Documents/commandagi node redesign/media.mjs --out /tmp/vf-media [--only duet]
 *
 * The key is the fal service account `SVC__FAL__MAIN__API_KEY` (CommandAGI docs/services.md), read from the .env
 * cascade and never printed. What each call was asked and what it cost is in redesign/NOTES.md.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const IMAGE = 'fal-ai/nano-banana-pro';
const VIDEO = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video';

/** The art direction every shot shares: overhead, parchment bench, two people told apart only by sleeve colour. */
const LOOK = 'Overhead top-down camera, flat warm parchment-coloured linen workbench, soft north-window daylight, fine film grain, muted palette of parchment, oxblood and graphite with exactly two saturated colours: one person wears cobalt-blue sleeves, the other marigold-yellow sleeves. Only hands and forearms are visible, never a face. Fictional people, not a real event. No text, no logos, no watermark.';

export const SHOTS = [
    {
        id: 'duet', aspect: '16:9',
        still: `Two pairs of hands from opposite sides of the bench build one small object together: a palm-sized wooden enclosure with a bare green circuit board being lowered into it. The cobalt-sleeved hands hold the board, the marigold-sleeved hands hold the enclosure steady. Scattered around: a pencil, brass screws, a folded paper sketch. ${LOOK}`,
        motion: 'The two pairs of hands work together: the cobalt hands lower the circuit board into the wooden enclosure while the marigold hands turn it to meet them; small, careful, unhurried motion. Static overhead camera, no cuts.',
        duration: '10',
    },
    {
        id: 'sheet', aspect: '16:9',
        still: `One large sheet of paper in the middle of the bench. Two hands hold pencils from opposite sides: a cobalt-sleeved hand draws a blue line from the left, a marigold-sleeved hand draws a yellow line from the right; the two lines are about to meet in the middle. ${LOOK}`,
        motion: 'Both hands draw slowly toward the middle of the sheet until their lines meet. Static overhead camera, no cuts.',
        duration: '5',
    },
    {
        id: 'proof', aspect: '4:5',
        still: `A flat lay of things two people made, arranged in a loose grid like evidence: a hand-soldered circuit board, a 3D-printed bracket, a hand-drawn wireframe on graph paper, a laptop-size printed page of code with pencil marks, a tiny cardboard box prototype. A cobalt-sleeved hand and a marigold-sleeved hand each rest a finger on one object. ${LOOK}`,
    },
];

function falKey() {
    const root = process.env.COMMANDAGI_ENV_ROOT;
    if (process.env.SVC__FAL__MAIN__API_KEY) return process.env.SVC__FAL__MAIN__API_KEY;
    for (const name of ['.env.api', '.env']) {
        const file = root && path.join(root, name);
        if (!file || !existsSync(file)) continue;
        const line = readFileSync(file, 'utf8').split('\n').find(l => l.startsWith('SVC__FAL__MAIN__API_KEY='));
        if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    }
    throw Error('no fal key: set COMMANDAGI_ENV_ROOT to the folder of the .env cascade');
}

/** One queued fal call → its result. The queue survives a slow video; a failure says the status, never the key. */
async function fal(key, model, input) {
    const headers = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' };
    const submit = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers, body: JSON.stringify(input) });
    const queued = await submit.json();
    if (!submit.ok) throw Error(`fal ${model} ${submit.status}: ${JSON.stringify(queued).slice(0, 300)}`);
    for (;;) {
        await new Promise(r => setTimeout(r, 5000));
        const status = await (await fetch(queued.status_url, { headers })).json();
        if (status.status === 'COMPLETED') break;
        if (!['IN_QUEUE', 'IN_PROGRESS'].includes(status.status)) throw Error(`fal ${model}: ${JSON.stringify(status).slice(0, 300)}`);
    }
    const result = await fetch(queued.response_url, { headers });
    const body = await result.json();
    if (!result.ok) throw Error(`fal ${model} result ${result.status}: ${JSON.stringify(body).slice(0, 300)}`);
    return { requestId: queued.request_id, body };
}

async function save(url, file) {
    const res = await fetch(url);
    if (!res.ok) throw Error(`download ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const args = process.argv.slice(2);
const out = args[args.indexOf('--out') + 1];
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (!args.includes('--out') || !out) throw Error('usage: media.mjs --out <folder> [--only <shot>]');
mkdirSync(out, { recursive: true });
const key = falKey();
const log = [];
await Promise.all(SHOTS.filter(s => !only || s.id === only).map(async shot => {
    const image = await fal(key, IMAGE, { prompt: shot.still, num_images: 1, aspect_ratio: shot.aspect, output_format: 'png', resolution: '2K' });
    const imageUrl = image.body.images[0].url;
    await save(imageUrl, path.join(out, `${shot.id}.png`));
    log.push({ shot: shot.id, model: IMAGE, requestId: image.requestId });
    if (!shot.motion) return;
    const video = await fal(key, VIDEO, { prompt: shot.motion, image_url: imageUrl, duration: shot.duration, negative_prompt: 'faces, text, logos, blur, distortion, extra fingers, fast motion, camera movement' });
    await save(video.body.video.url, path.join(out, `${shot.id}.mp4`));
    log.push({ shot: shot.id, model: VIDEO, requestId: video.requestId, seconds: Number(shot.duration) });
}));
writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 2));
console.log(JSON.stringify(log, null, 2));
