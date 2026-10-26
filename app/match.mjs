/*
 * The founding bench, as a pure module: no DOM, no storage, no network. `app.js` draws it; `test/site.test.mjs`
 * checks it and every page. A reason carries a key and its values, never a sentence, because the sentences live in
 * strings.mjs in three languages.
 */

/** The crafts a founder can claim. A co-founder's gaps are read against them. */
export const CRAFTS = ['code', 'cad', 'hardware', 'design', 'growth', 'ops'];
/** The domains of the vibe ecosystem, plus the two general ones a young company picks. */
export const DOMAINS = ['startup', 'robotics', 'cad', 'code', 'cloud', 'video', 'ops', 'gov', 'finance'];
export const COMMITMENTS = ['full-time', 'part-time'];

const WEIGHT = { domain: 3, gap: 2, craft: 1, commitment: 2 };
/** The most a match can score: the same domain, both of the other crafts, the same commitment. */
export const MAX_SCORE = WEIGHT.domain + WEIGHT.gap + 2 * WEIGHT.craft + WEIGHT.commitment;

/**
 * Rank the sample co-founders for one founder: highest score first, then the id, so a run is stable.
 * Each reason is `{ key, value }` — `domain` (the domain both build in), `craft` (a craft the co-founder brings and
 * the founder did not claim), `commitment` (the same commitment) or `commitmentMismatch`.
 * Returns `[{ profile, score, reasons }]`.
 */
export function rankCoFounders(profiles, founder) {
    if (!founder || !CRAFTS.includes(founder.craft)) throw Error('a founder names one craft');
    if (!DOMAINS.includes(founder.domain)) throw Error('a founder names one domain');
    if (!COMMITMENTS.includes(founder.commitment)) throw Error('a founder names one commitment');
    return profiles
        .map(profile => {
            const reasons = [];
            let score = 0;
            if (profile.domains.includes(founder.domain)) {
                score += WEIGHT.domain;
                reasons.push({ key: 'domain', value: founder.domain });
            }
            const brings = profile.crafts.filter(craft => craft !== founder.craft);
            if (brings.length === profile.crafts.length) {
                score += WEIGHT.gap;
                reasons.push({ key: 'gap', value: profile.crafts[0] });
            }
            // The first craft the founder lacks is the gap; the rest are what else the co-founder covers, said once each.
            for (const [i, craft] of brings.entries()) {
                score += WEIGHT.craft;
                if (i > 0) reasons.push({ key: 'craft', value: craft });
            }
            if (profile.commitment === founder.commitment) {
                score += WEIGHT.commitment;
                reasons.push({ key: 'commitment', value: profile.commitment });
            } else
                reasons.push({ key: 'commitmentMismatch', value: profile.commitment });
            return { profile, score, reasons };
        })
        .sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id));
}

/**
 * The founding agreement, as Markdown, for one founder and one co-founder: the terms a first version can draft and a
 * lawyer can then correct. It is a draft, and it says so.
 */
export function foundingAgreement({ founderName, profile, date = new Date() }) {
    const name = (founderName ?? '').trim() || 'The founder';
    const day = date.toISOString().slice(0, 10);
    return `# Founding agreement (draft)

Between ${name} ("the founder") and ${profile.name} ("the co-founder"), ${day}.

This is a draft. It is not legal advice. A lawyer reads it before either person signs it.

## 1. The company
The founders start one company, for the work in section 4. Each founder gives it that work and the intellectual
property it makes. The company owns its name, its code, its designs and its records.

## 2. Founder equity
The founders hold the company equally: 50% each, on a fully diluted basis, unless both agree to another split in
writing before the first share is issued.

## 3. Vesting
Each founder's shares vest over four years, monthly, with a one-year cliff. If a founder leaves before the first
anniversary, they keep nothing; after it, they keep the vested part and the company may buy back the rest at the
price the founders record today.

## 4. Work
- ${name}: product and the customer, full responsibility for what ships.
- ${profile.name}: ${profile.line}

## 5. Decisions
Either founder may decide anything the other has not objected to in writing within two working days. These need both
founders: taking investment, selling the company, borrowing money, hiring or letting go a person, changing this
agreement, or spending more than the company holds.

## 6. Leaving
A founder who leaves stops working for the company, keeps their vested shares, and hands over every account, key and
record. The company keeps a copy of the code and the designs.

## 7. What this draft does not settle
The jurisdiction, the share class, tax, the buy-back price and the dispute route. A lawyer adds them.
`;
}
