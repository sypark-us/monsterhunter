# The Hundred — campaign and presentation specification

The authorized direction is a browser story RPG: ordinary-looking humans, conversational inference, dangerous conditional rituals, and a human life worth protecting. Authorization includes implementation, push, merge, and deployment after verification.

## Design

Exploration shows smaller characters composed into each location. Selection presents one larger, centered character above the dialogue. Leaving restores the location cast. Location changes must clear conversation focus. Portraits must stay distinct and accessible on desktop and mobile.

The campaign has five playable chapters with different confrontations, persistent relationships, four upgradeable abilities, rent and energy consequences, and three final resolutions. Thirty illustrated, interactive characters populate the campaign: twelve recurring leads and eighteen supporting people with authored scenes. This is a compact first campaign, not a claim of 4–6 hours of content or 100 fully simulated hosts.

Artwork uses individual generated character assets rather than enlarged cells of the old compressed atlas. Nine locations have locally bundled backgrounds. Eight authored instrumental arrangements use browser audio with separate music and ambience volume controls. No voice acting is claimed.

## Acceptance criteria

- Scene characters fit their own non-overlapping bounds; selecting any character centers them and removes other portraits from focus; leave and travel restore exploration.
- All five chapters can be completed from a fresh game using legal actions. Three distinct campaign endings are reachable. The original chapter's innocent kill, rival trap, and deadline remain fatal.
- Relationships and upgrades persist across chapters and affect later options. Rent affects the human-life outcome. Meal/work/rest cannot create free unlimited progression.
- New artwork decodes, remains sharp at its actual rendered size, and has transparent surroundings. No visual lookup uses hidden possession.
- Save slots, autosave migration, dialogue history, text-speed settings, audio controls, keyboard selection, and mobile travel remain usable.
- Executed story tests and a cold Chromium walkthrough provide evidence before merge. Deployment is checked against the published version.

## Structure and verification

`src/campaign.js` owns authored campaign content. `src/engine.js` owns progression, consequences, hidden identities, and save validation. `src/ui.js` renders public state. `src/audio.js` owns the score. `src/visual-assets.js` owns public asset mappings.

Run `node --test tests/*.test.cjs`, `node scripts/prepare-art.cjs`, and `node scripts/browser-smoke.cjs`. Use `playwright-cli` for independent interactive walkthroughs. No backend, paid API integration, account system, action combat, or multiplayer is in scope.
