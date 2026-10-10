# Contextual staging v0.4.1

The release replaces count-based standing rows with stable per-character location anchors and twelve separate exploration activity sprites. Depth sets scale and draw order; mobile has its own blocking. Transparent bottom padding is cropped in CSS using measured source foot lines, preserving original raster proportions. Conversation mode keeps the original centered portrait.

Executed checks:

- 33 Node tests passed, covering every chapter schedule, distinct floor depths, location-specific layouts, transparent activity assets, and the existing campaign.
- All 51 generated asset hashes verified by prepare-art.
- Full Chromium campaign walkthrough passed at 1440×900, 768×1024, and 390×667: all thirty characters, twelve activity→portrait→activity transitions, dialogue clearance, separated targets, all five chapters and three endings, saves, history, settings, and audio. It captured all nine locations at each viewport.
- Independent review verified the location assignments, perspective order, selected screenshots, and floor contact.
- After fixing short-screen HUD overlap, independent review passed 20 scene fixtures at 320×568 and 667×390, with actual decoded images and 48 trusted select/leave cycles. No remaining blocking finding or page error.
- The Impeccable mechanical detector ran in degraded regex mode because parser modules were unavailable. Its findings concerned existing accent borders and the dynamically populated backdrop; actual image loading and placement were checked in Chromium.

Browser result:

```json
{
  "passed": true,
  "chapters": 5,
  "endings": 3,
  "locations": 9,
  "characters": 30,
  "activities": 12,
  "viewports": 3,
  "groundDepths": true,
  "feetClearDialogue": true,
  "saveSlots": true,
  "history": true,
  "textSpeed": true,
  "audioContext": true,
  "pageErrors": []
}
```
