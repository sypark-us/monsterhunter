# Location scale correction

The background previously used a cover crop while characters used viewport-height sizes, independent width caps, separate phone anchors, and a dialogue foot clamp. Changing the screen could therefore move a character across the room and shrink their body relative to its furniture. Apartment, clinic, and diner figures were also undersized at the desktop baseline.

Use the generated background's 1672 × 941 coordinate system for floor anchors and visible character dimensions. Each location has an effective horizon and perspective multiplier calibrated visually against furniture and doors; activity pose factors account for sitting and crouching. These values are artistic estimates, not recovered camera intrinsics.

A single camera transforms the background and characters together. Frame the full landscape scene on narrow screens and reserve HUD space by moving or scaling the entire scene. Use the full scheduled cast to keep framing stable between chapters. Crop transparent sprite margins with source-content bounds while preserving the artwork's aspect ratio. Conversation mode retains the separate centered portrait.

Acceptance: all nine locations preserve character/background proportions and floor anchors across desktop, tablet, phone, ultrawide, and short landscape; every scheduled character remains selectable without overlap or dialogue obstruction; selected portraits return correctly to their exploration poses; existing campaign progression and saves continue to work.

Verification: focused geometry tests, full campaign and asset checks, real Chromium measurements with inverse background projection, location screenshots, independent implementation and visual review, and a fresh public deployment check.
