# Story clarity

Build · peer-reviewed · task. Integration branch: main. User approved the proposed clarity improvements after reporting that the game was hard to follow.

The live opening gives no concrete first step; public character roles are omitted, ritual teaching is transient, and chapter openings disappear after one interaction. The actual 02:00 deadline and action costs are also unexplained. This change should help a new or returning player explain their situation and choose a useful next conversation.

## Scope and acceptance

- Replace vague onboarding with a short explanation of the shared human/demon predicament, survival stakes, and first lead. Reading itself never advances time.
- Add a reusable Story & Help panel with this chapter's opening, goal, one state-aware conversational lead, and rules learned so far. Reopening it after travel or restoring an existing save must retain context without exposing hidden identities or unlearned ritual answers.
- Show the selected character's existing public role, explain that new information unlocks replies, and distinguish exhausted conversations from finished chapters.
- Following the user's report of unnatural questions to strangers, introduce unfamiliar speakers during their first conversation, rephrase questions that assume an invitation or undisclosed fact, and gate genuine follow-ups on the relevant earlier topic. Introductions remain free and do not add a mandatory click.
- Display the real deadline and action costs, derived from the engine's existing rules. Correct trap failure prose that currently describes an unrelated action.
- Preserve campaign routes, savings, character/background scale, centered portraits, and ordinary-looking characters. No clue inventory, suspect scores, chapter rewrites, or balance changes.

## Tasks

1. Guidance module and tests: `src/guidance.js`, `tests/guidance.test.cjs`; pure `describe(state)` returns premise, persistent opening, goal, next lead and learned rules. RED→GREEN before UI integration.
2. Engine feedback and tests: expose deadline/remaining time and visible-option costs from the actual action calculation; supply action-specific trap endings. RED→GREEN with legal actions and chapter fixtures.
3. Presentation: integrate guidance into `index.html`/`src/ui.js`, show roles, costs, deadline and a scrollable Story & Help panel; keep the stage readable across five existing viewport fixtures.
4. First conversations: authored first greetings and natural question wording in `story.js`/`campaign.js`; optional `requiresTopics` uses the existing chapter-specific used-topic flags in `engine.js`. Prove missing prerequisites hide and reject a follow-up, completed topics unlock it, and another chapter's same topic name does not unlock it.
5. Verify: new/resumed browser flows, chapter context after travel, rule recall after the transient whisper clears, first-conversation continuity, no hint spoilers, full campaign/geometry/audio/save checks and independent review. Ship v0.4.3 after CI; verify public code freshness and interactions.

## Evidence

Baseline: cold live-browser session `mh-clarity-audit` confirmed the vague intro and unchanged “Listen to the city” objective after Begin. Source audit confirmed transient context and missing role/cost presentation. Implementation and release evidence will be recorded in `docs/verification/story-clarity-v0.4.3.md`.
