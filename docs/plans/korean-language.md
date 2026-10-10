# Korean language option

Build, peer-reviewed task on `feature/korean-language`, integrating into main. The user requested Korean for the game and has already authorized automatic push and merge. The canonical development skill organizes implementation and independent review; session authorization takes precedence over its ceremonial approval examples.

Acceptance: English and Korean selectors on the opening screen and in the menu; selection persists independently of saves. Switching during a conversation, after a chapter transition or with an existing save changes all public interface and story text without consuming time or modifying game progress. Cover five chapters, thirty characters, learned guidance, history, traps and three endings. Preserve keyboard controls, typewriter text and usable phone/landscape layouts. Keep mechanics and original English save strings independent of presentation.

Tasks:

1. Translation contract and coverage tests, then a small presentation adapter with explicit render boundaries. Root owns `src/i18n.js`, `src/locales/ko-ui.js`, UI integration and tests.
2. Korean story catalog. `korean_story` owns `src/locales/ko-story.js`: character/place metadata, engine messages and main chapter 1–3 scenes.
3. Korean campaign catalog. `korean_campaign` owns `src/locales/ko-campaign.js`: supporting scenes, main chapter 4–5 scenes, endings and guidance.
4. Browser verification: trusted language changes, in-progress and historical conversations, reload/save slots, five Korean chapters and endings; existing English geometry/audio suite. Independent reviewer audits code, coverage, Korean ritual semantics and layout before publishing v0.4.4.

Evidence: new tests must fail before implementation. Manual evidence replaces imported hook gates; no Claude hooks are installed. Release results belong in `docs/verification/korean-language-v0.4.4.md`.

Completed: catalogs and presentation integration, legacy history coverage, bundled font, 61 unit checks, artwork integrity and full English/Korean browser suite. Independent review approved corrected language-source retention and Korean phone/landscape rendering. Evidence is recorded in the release verification document.
