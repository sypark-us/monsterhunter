# Campaign implementation plan

Goal: ship a complete compact five-chapter story campaign and replace prototype presentation with scene exploration and focused conversations.

Architecture: keep the deterministic engine and static browser delivery. Add authored campaign data, individual local artwork, and a separate procedural soundtrack module. Preserve Chapter 1 behavior and migrate existing autosaves.

Specification: ../specs/campaign.md. Work proceeds inline on `fix/scene-character-staging`. The user authorized implementation and automatic push/merge.

1. Scene staging: reproduce off-center selection, add location placements and dialogue-aware bounds, verify all locations on desktop/mobile.
2. Campaign: write failing tests for transitions, legal full-game routes, all endings, relationships, upgrades, deadlines, and save restoration; implement content and engine changes; run those tests.
3. Art/audio: generate individual transparent character assets, bundle backgrounds, map all cast members; implement eight original score arrangements and controllable ambience; inspect decoding and playback in Chromium.
4. Player interface: expose chapter advancement, story outcomes, relationships, ability allocation, history, save slots, and settings; walk the fresh campaign and save/resume paths with trusted browser input.
5. Release: review diffs and verification evidence, fix material findings, update README and credits, push, create and merge a PR, and verify the deployed build.

Evidence must distinguish implemented features from content targets. In particular, runtime tests cannot establish a 4–6 hour playtime, professional soundtrack quality, or full simulation of the hundred participants.
