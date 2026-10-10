# Location scale v0.4.2

Characters and backgrounds now share a source-image coordinate system and camera. Interior scale was calibrated against doors, counters, and stools; mobile preserves the full scene. Transparent sprite margins no longer affect apparent body size, and dialogue clearance moves or scales the entire scene. Short landscape conversations use a closer portrait crop.

Executed checks:

- 35 Node tests passed, including every scheduled floor anchor, camera invariance, interior reference proportions, and the existing campaign.
- All 51 generated asset hashes and the legacy artwork bundle verified. No raster assets changed.
- Full Chromium campaign walkthrough passed at 1440×900, 768×1024, 390×667, 2560×900, and 844×390. It measured each actor's visible crop against the background transform and verified authored width, height, center, and floor position within one CSS pixel.
- All thirty characters were selectable, all twelve activity poses switched to their centered portraits and returned, and actor bounds remained separated and clear of dialogue. All five chapters, three endings, save slots, history, settings, and the real audio context passed with no page errors.
- Screenshots captured all nine locations at each viewport. Independent visual review inspected apartment, diner, and street scenes on desktop, tablet, and phone; root inspection also covered clinic, market, and hotel.
- Independent code review found no blocking issue. Additional chapter-one checks at 320×568 confirmed visible, clickable actors; the final landscape close-up adjustment was separately reviewed.

Portrait screens intentionally display the landscape environment with unused space above and below it. Distant figures remain small relative to foreground figures; minimum 44-pixel hit areas preserve selection usability without enlarging their artwork. The perspective calibration is an artistic estimate rather than a physically measured camera model.

Browser screenshots and `result.json` are generated under `screenshots/` and uploaded by CI as `story-visual-smoke`.
