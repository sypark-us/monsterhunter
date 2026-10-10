# Story clarity and conversation progression v0.4.3

First conversations now introduce unfamiliar speakers and use questions grounded in their work or the immediate situation. Specific follow-ups require the exchange that introduced their subject, including Owen's photographs, Marcus's brother, Daniel's shift and Iris's friend. These requirements reuse existing chapter-local flags; existing saves need no migration and no extra introduction action is charged.

The approved clarity update also adds a concrete first lead, persistent chapter context and learned rules in Story & Help, state-aware next conversations, public character roles, the actual 02:00 deadline and exact action costs. Trap warnings and failure text describe the chosen action.

Executed checks on the release candidate:

- `node --test tests/*.test.cjs`: 57 tests passed. New behavioral coverage includes hidden/rejected follow-ups before their prerequisites, unlocking after the correct exchange, unrelated witness flags, chapter-local requirements, save/restore, free introductions, persistent guidance, cost parity and distinct trap outcomes. Behavioral regressions were observed failing before their fixes.
- `node scripts/prepare-art.cjs`: all 51 generated assets and the legacy artwork bundle verified; no raster artwork changed.
- `node scripts/browser-smoke.cjs` with the installed Playwright runtime: the complete five-chapter campaign and all three endings passed. Thirty characters, nine locations, twelve activity/portrait transitions, saves, history, settings and real audio remained functional with no JavaScript page errors.
- The browser walk measured 260 actor projections across five viewports (1440×900, 768×1024, 390×667, 2560×900 and 844×390). Characters retain their scale relative to the background and remain clear of dialogue.
- Trusted browser input verified first introductions, familiar return greetings, Daniel's personal follow-up, Vincent's invitation, Owen's photo follow-up and Marcus's brother follow-up. Reading help and introductions does not charge time; learned ritual text survives later conversations and reload. Unknown ritual answers remain hidden.
- Independent engine/content review exercised 67 scheduled encounters, all five main routes, supporting-witness alternatives and ability shortcuts without a blocking issue. The final optional personal-topic gates were separately reviewed and passed 33 relevant tests.
- Independent visual review caught an 844×390 regression where longer greetings left only 17 pixels for replies. A two-column landscape conversation layout fixed it; a new browser assertion first failed, then passed with a complete first reply inside the visible response area. Reinspection confirmed independent text scrolling and a successful real click. At 390×667, the goal and next lead are visible near the top of Story & Help.

Browser screenshots and `result.json` are generated under `screenshots/` and uploaded by CI as `story-visual-smoke`. The local server's pre-existing missing favicon request is not a JavaScript error. Automated checks prove prerequisites, routes and layout behavior; whether the revised writing feels natural still benefits from player feedback.
