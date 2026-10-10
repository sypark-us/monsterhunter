# THE HUNDRED: Hong Kong

A handcrafted, single-player **supernatural visual novel** set in Hong Kong. This is the story-based companion to the procedurally generated `guess_who` game.

## Play

Open `index.html` in a modern desktop browser (Chrome, Edge, Firefox), or use GitHub Pages after it has been enabled for the repository.

No build tools, packages, user accounts, paid AI services, or network access are required.

### How the game works

- Enter a **visual-novel scene** and click **any illustrated anime-style character** to start a conversation.
- Every person initially appears ordinary. **Nobody is marked suspicious or safe.**
- Follow branching scripted dialogue. The information needed to survive comes **only from people's words, reactions, and your choices**.
- There is **no detective notebook, evidence inventory, clue collection, or investigate button**.
- The entity possessing you remembers its powers incompletely. Your understanding develops through conversation.
- A killing spell is governed by strict conditions, not by selecting an "attack" option blindly.
- Killing a human without a demon kills both the victim and your host. A rival demon can also kill you through its conversational trap.
- Time, food, energy, cash, and tomorrow's rent provide lightweight human-life pressures.
- The opening chapter has a successful outcome and several failure paths; the story does not proceed into chapter 2 yet.
- Progress saves automatically in the browser's local storage. Use **Save** for an explicit save, or **New** to restart.

### What is included

- Five original, scalable **illustrated visual-novel backdrops**: apartment, Mong Kok street, tea stall, hotel, and shrine.
- Seven character portraits drawn with soft shaded vector anime-style art (no blocky/pixel people).
- English dialogue, location selection, clickable character illustrations, dialogue choices, and ambient synthesized music.
- Scripted dialogue state, secrets, supernatural attack requirements, income/energy choices, and fixed character relationships.
- One complete interactive **Chapter 1 prologue**.
- English-only UI for now. Narrative and UI are defined in `src/story.js` with stable keys so localization files can be added later.

### Important design distinctions

Unlike `guess_who`, this game has **a predefined cast and plot**. The player doesn't sift through a case-file interface; they decide *who* to speak with, *what* to say, and *when* to take a risk. The story engine alone knows which human hosts carry rival demons. Character portraits never indicate possession.

The dialogue choices that appear depend on what the player has previously said to other characters. These dependencies represent conversational context, not discoverable clue pickups.

## Run tests

Requires Node.js 20+:

```bash
node --test tests/*.test.cjs
```

## Development structure

```
index.html          Visual-novel UI and browser save/audio
src/story.js        Cast, places, fixed conversations, English text
src/engine.js       Conversation consequences and strict supernatural rules
src/art.js          Original illustrated SVG scene and portrait generator
tests/story.test.cjs Branching paths, curse rules and scene/portrait checks
```

## Planned extensions

- Additional chapters, richer conversations, trust and deception arcs.
- Full-screen animated character poses and professionally illustrated raster character/background assets (current art is original anime-inspired vector art).
- Soundtrack composition and additional contextual audio.
- More life-simulation choices tied to the human host.
- Sense, Intelligence, Charisma and Dominion skill checks throughout later chapters.
- Additional translations (`ko`, `zh-HK`) using external dictionaries, keeping the game logic language-independent.

This repository is separate from `sypark-us/guess_who`, which remains the procedurally generated roguelike version.
