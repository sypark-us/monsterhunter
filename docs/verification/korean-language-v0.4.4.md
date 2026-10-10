# Korean language v0.4.4

English and 한국어 can be selected on the opening screen or in the menu. The preference is stored independently in `hundred-language`. All five chapters, thirty characters, nine locations, Help, action costs, history, settings and three endings have Korean presentation. Original English story state, topic IDs and save slots remain unchanged. Legacy v0.4.2 conversation history is also translated.

The small presentation adapter remembers original English text across repeated switches. Dialogue is translated before the existing typewriter. Contextual relationship labels distinguish the Close button from a close relationship. A local Noto Sans KR WOFF2 subset supplies 800 catalog/ASCII characters under the bundled SIL Open Font License; `scripts/prepare-korean-font.py` refreshes it when catalogs change. Translation coverage, font coverage and font integrity run offline in CI.

Executed evidence:

- `node --test tests/*.test.cjs`: 61 passed. New checks cover every authored scene and ending, guidance/options/history throughout all five routes, unchanged engine state, dynamic costs/accessibility, the exact Korean ritual phrase, English fallback and bundled font coverage/integrity. Initial localization tests failed before the adapter existed.
- `node scripts/prepare-art.cjs`: 51 generated assets and all legacy bundled photographs verified; no artwork changed.
- `node scripts/browser-smoke.cjs` with the installed Playwright runtime: passed the complete English campaign, all three English resolutions and existing 260-actor projection checks across five viewports. The added Korean run passed all five chapters, all three ending labels and the selected protect ending, repeated language switches, asynchronous audio labels, history, typewriter interruption, save-slot preservation, reload/resume, learned Help, credits and three viewport layouts. Both runs reported no JavaScript page errors. Korean screenshots were captured at 1440×900, 390×667 and 844×390.
- Independent code/content review checked Korean consent, ritual conditions, timelines, terminology and public guidance. Browser review caught language-source retention in asynchronous audio and relationship labels, and font specificity in character name plates. These were corrected and independently rechecked.
- Korean mobile verification caught a clipped first reply at 390×667. A Korean-only scrolling greeting area and minimum response area fixed it. Independent review confirmed the entire first reply is visible, the reply responds to a trusted click, and Korean character names display readable glyphs at 390×667 and 844×390.

Browser evidence is written under `screenshots/` and uploaded by CI. Automated coverage verifies authored text and mechanics; Korean writing may still benefit from native-speaker playtesting. The pre-existing favicon 404 is unrelated to JavaScript runtime checks.
