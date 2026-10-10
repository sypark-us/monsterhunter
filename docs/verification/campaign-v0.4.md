# Campaign v0.4 verification

Executed locally on 2026-10-10 before release:

- `node --test tests/*.test.cjs`: 30 tests passed, including all eighteen supporting scenes and single-use rewards.
- `node scripts/prepare-art.cjs`: integrity verified for thirty transparent character PNGs, nine generated environment PNGs, and retained legacy art.
- `node scripts/browser-smoke.cjs`: fresh five-chapter route, all three endings, all thirty character assets and selection, nine locations, desktop/tablet/390×667 phone staging, slot restoration, history, persisted settings, keyboard reveal, and audio context/on/off checks passed. No page errors.
- Independent campaign review found no progression blockers; a ferry continuity issue was corrected by placing Henry's recovery scene in Chapter 4.
- Independent UI review verified modal key isolation, phone dialogue bounds, intro focus, keyboard reveal, and the final phone grounding fix. Character buttons have gaps and feet/name labels clear the dialogue.

Browser audio verification establishes operation, not a listening-quality assessment. Playtime, voice acting, expression sets, and simulation of all hundred hosts are outside this release.

Browser result:

```json
{
  "passed": true,
  "chapters": 5,
  "endings": 3,
  "locations": 9,
  "characters": 30,
  "viewports": 3,
  "saveSlots": true,
  "history": true,
  "textSpeed": true,
  "audioContext": true,
  "pageErrors": []
}
```
