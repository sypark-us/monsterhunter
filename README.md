# The Hundred: Hong Kong — Campaign v0.4.3

A single-player supernatural story RPG played in a browser. One hundred demons have attached themselves to human hosts. Your demon remembers its powers through conversation, while you try to keep your own life intact.

[Play the game](https://sypark-us.github.io/monsterhunter/).

## Playing

Choose a location. Characters appear within the environment; click one to bring them to the center for a conversation. End the conversation to return to the scene. Nobody is visually identified as possessed or innocent. Listen to what people say, compare their accounts, and learn the conditions of each ritual. A wrong killing or a rival's conversational trap can end your run.

The opening gives you a first lead, and the scene's next-conversation hint changes as you learn. **Story & Help** keeps the chapter's context and your learned ritual rules available after travel or reloading. Unfamiliar characters introduce themselves; follow-up questions depend on what has actually been discussed. Each reply shows its time and resource cost. Reading and opening help are free; each night's deadline is 02:00.

Time, energy, food, work, and rent matter. Your relationships and ability upgrades carry into later chapters and unlock alternative conversations. After a chapter victory, allocate your demon point and continue. The final chapter offers three resolutions, with availability affected by your earlier choices.

## Included in this release

- Five playable chapters: The First Vow, Borrowed Breath, The Last Crossing, What the City Keeps, and The Hundredth Name.
- Thirty illustrated, clickable characters: twelve recurring leads and eighteen supporting people with their own conversations.
- Nine locations, including the night clinic, market, ferry pier, and rooftop.
- Thirty individual 1024 × 1536 transparent character images, replacing the old compressed shared portrait sheet in the live UI.
- Authored positions and depth for each location, plus twelve seated, working, and crouching exploration poses. Clicking a character opens their centered conversation portrait; leaving returns them to their activity.
- Characters and backgrounds share one scale, calibrated against each location's furniture and floor perspective. Narrow screens frame the whole scene to preserve those proportions.
- Persistent relationships; Sense, Intelligence, Charisma, and Dominion dialogue alternatives; rent and human-connection consequences.
- Eight original synthesized instrumental themes, rain ambience, interaction sounds, and separate volume controls. Audio is generated locally by Web Audio; these are not recorded orchestral tracks or voice acting.
- Autosave, three manual save slots, legacy v0.3 autosave migration, conversation history, text-speed controls, and keyboard dialogue selection.
- Three campaign endings and the original fatal ritual, trap, and deadline paths.

This is a compact first campaign. A 4–6 hour playtime, multiple expression sets per character, voice acting, and 100 fully simulated hosts are not claimed for this release. The expansion design and implementation plan are in `docs/`.

## Local play

Open `index.html` in a modern browser, or serve this directory:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit <http://127.0.0.1:4173/>. All artwork and game code are bundled. Playing requires no accounts, paid services, or network requests. Browser-local saves stay on the device and origin where you create them.

## Verification

Requires Node.js 20+:

```bash
node --test tests/*.test.cjs
node scripts/prepare-art.cjs
```

For browser checks, install Playwright and Chromium, then run:

```bash
npm install --no-save --package-lock=false --ignore-scripts --no-audit --no-fund playwright@1.55.1
npx playwright install chromium
node scripts/browser-smoke.cjs
```

The browser walkthrough plays all five chapters, exercises all three endings, checks all thirty character assets across desktop, tablet, phone, ultrawide, and short landscape layouts, and verifies saves, history, settings, and a real audio context. It measures character size and floor position relative to the background at every viewport. Screenshots and its result are written to `screenshots/`.

## Source structure

- `src/story.js`: original chapter and English story text.
- `src/campaign.js`: later chapters, cast, schedules, relationship requirements, and endings.
- `src/engine.js`: deterministic actions, strict rituals, progression, consequences, and save validation.
- `src/ui.js`: exploration/conversation presentation, history, saves, and settings.
- `src/audio.js`: eight original browser-synthesized instrumental arrangements.
- `src/visual-assets.js`: public artwork mapping; no hidden identity lookup.
- `assets/characters/`: individual high-resolution character cutouts.
- `assets/backgrounds/`: bundled photography and generated environments.
- `credits.html`: artwork attribution and audio credits.

This is separate from `sypark-us/guess_who`, the procedurally generated version. The campaign remains handcrafted and conversation-driven, with no evidence inventory or investigation checklist.
