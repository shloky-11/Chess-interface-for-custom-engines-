# Grandmaster Studio — Windows Chess with Custom Engines & Real-Time Analysis

A Windows-ready, offline-first chess desktop application (PWA) featuring modular chess engine management, custom JS/WASM engine import, seamless difficulty tuning (400–3200+ ELO), real-time evaluation with dynamic eval bar, best-move overlay arrows, blunder alerts, and a classic tournament green vinyl & mahogany board aesthetic.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions synthesize the user's clarified answers from Phase 1. Review before proceeding to build:

- **Confirmed Decision 1 (Engine System)**: Built-in high-performance Stockfish engine emulation with tiered ELO levels (400 Novice to 3200+ Super GM) coupled with an **Engine Manager** to import, benchmark, and switch custom JS/WASM engines.
- **Confirmed Decision 2 (Real-Time Move Analysis)**: Live dynamic eval bar with centipawn and mate counters, SVG overlay arrows showing the engine's best continuation line, and immediate move classification badges (Best, Excellent, Good, Inaccuracy, Mistake, Blunder).
- **Confirmed Decision 3 (Aesthetic Direction)**: Classic Tournament green vinyl (`#739552` / `#EBECD0`) with dark mahogany framing (`#2B1810`), Windows Fluent dark app chassis (`#121214`), and vector Staunton chess pieces.
- **Confirmed Decision 4 (Offline & Windows Desktop PWA)**: Full offline service worker caching via `vite-plugin-pwa` with a dedicated Windows install header button and window frame controls.

---

### 1. Overview & Core Concept

- **What It Does**: Grandmaster Studio provides an offline-capable, Windows-native chess experience. Players can play against the computer at granular ELO levels (400 to 3200+), analyze positions in real-time as moves are played, or import custom chess engines via JS scripts or WebAssembly workers.
- **Target Audience / Persona**: Chess enthusiasts, tournament players reviewing games, students practicing against tailored difficulty levels, and engine developers wanting to benchmark and test custom chess algorithms.
- **Key Value**: Unlike browser-only chess sites that require an active internet connection, Grandmaster Studio runs 100% client-side with zero latency, provides instant tactical feedback on blunders, and allows seamless hot-swapping of engines without reload.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Quick Game Start**: Player launches app, selects side (White, Black, or Random), chooses game mode (Casual, Rapid 10+0, Blitz 5+3, or Custom Time), and picks engine difficulty via an interactive ELO slider.
2. **Active Gameplay & Real-Time Evaluation**:
   - As pieces are moved (drag-and-drop or click-to-move with valid move highlights), the board emits realistic sound effects (move, capture, check, castle).
   - The **Dynamic Eval Bar** on the left shifts smoothly between white and black advantage with numerical readout (`+1.4` or `M3`).
   - If real-time analysis is enabled, an SVG ghost arrow illustrates the engine's recommended move, and each played move is instantly classified with a badge (e.g. `Blunder (-2.8)`, `Inaccuracy`, `Best Move`).
3. **Engine Management & Custom Import**:
   - Player opens the **Engines Modal** to select from pre-installed engines (Stockfish 16, Positional Bot, Aggressive Tactical Bot, Fast Blitz Minimax) or click **"Import Engine"** to upload a `.js` or `.wasm` worker script.
   - Test imported engines with a built-in UCI benchmark benchmark suite (nodes per second, time to depth 10).
4. **Post-Game & Review Mode**:
   - Review past moves using step forward/backward buttons or keyboard arrows.
   - Interactive evaluation graph plotting centipawn evaluation across the whole game with move list and blunder callouts.
   - Export PGN or FEN to clipboard or download file.

#### Visual Identity & Theme
- **Aesthetic Direction**: Classic Tournament meets Modern Windows Fluent Dark. Rich tournament green vinyl board flanked by polished mahogany borders, enclosed in a dark slate Windows window frame (`#0F1117`).
- **Color Palette & Distribution**:
  - *60% Neutral Canvas*: Slate `#0D1117` and zinc `#18181B` backdrop for distraction-free focus.
  - *30% Board & Structure*: Tournament light squares `#EBECD0`, tournament dark squares `#739552`, mahogany trim `#2D1810` / `#3E2723`, card surfaces `#1F242D` with hairline borders `#2D333B`.
  - *10% Focal Accents*: Turn indicator emerald `#10B981`, blunder alert crimson `#EF4444`, best move cyan `#06B6D4`, evaluation gold `#F59E0B`.
- **Typography & Hierarchy**:
  - Display face: `Plus Jakarta Sans` for bold, legible headings and window title.
  - Body & Notation: `Outfit` and `DM Sans` for move lists and controls.
  - Tabular Numerals: Monospace `JetBrains Mono` / `font-mono tabular-nums` for timers, ELO sliders, and centipawn evaluations.
- **Interactive Feedback & Audio**:
  - Web Audio API synthesizer for natural piece clacks, captures, and alert chimes without external audio asset dependencies.
  - Smooth 150ms CSS compositor transitions for piece movement and eval bar height tweening.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Engine Architecture (Web Worker & UCI Protocol Emulation)**
  - *Chosen Approach*: Decouple engine evaluation from the React rendering thread using a dedicated Web Worker running a Stockfish/minimax UCI engine with adjustable depth and error injection (for ELO scaling).
  - *Why*: Prevents UI thread stuttering during deep calculations, allowing 60 FPS smooth dragging and real-time eval bar animations while the engine calculates depth 18+.
  - *Alternatives Considered*: Running search on the main thread would freeze the UI on higher depths.
- **Decision 2: Custom Engine Import Interface**
  - *Chosen Approach*: Support standard Web Worker JavaScript files adhering to UCI protocol (`position fen ...`, `go depth ...`, `bestmove ...`) or standardized JS evaluation function signatures, with pre-validated fallback templates.
  - *Why*: Allows users to drop in custom bot scripts, test student algorithms, or load custom opening books safely inside an isolated sandboxed worker.
- **Decision 3: Chess Rules & State Engine (`chess.js`)**
  - *Chosen Approach*: Use `chess.js` for battle-tested FEN/PGN generation, 3-fold repetition detection, 50-move rule, en passant, promotion dialog, and legal move generation.
  - *Why*: Eliminates rule bugs and guarantees FIDE-compliant rule enforcement.
- **Decision 4: Full Offline PWA with Windows App Chrome**
  - *Chosen Approach*: Configure `vite-plugin-pwa` with service worker precaching and an in-app "Install Windows App" prompt.
  - *Why*: Delivers an authentic desktop software feeling on Windows 11 with offline capability on flights or without internet.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Windows Title Bar & App Controls                     │
│  [Grandmaster Studio]     [Engine: Stockfish 16] [ELO: 1650] [Install] │
├───────────────────────────────┬────────────────────────────────────────┤
│                               │                                        │
│  ┌──┐ ┌─────────────────────┐ │  ┌──────────────────────────────────┐  │
│  │E │ │  Classic Tournament │ │  │ Top: Opponent Card & Clock       │  │
│  │v │ │  Green Vinyl Board  │ │  ├──────────────────────────────────┤  │
│  │a │ │  (8x8 SVG Pieces,   │ │  │ Real-Time Move Analysis HUD:     │  │
│  │l │ │   Best Move Arrows, │ │  │  • Move accuracy badge           │  │
│  │  │ │   Square Highlights)│ │  │  • Engine top line (PV)          │  │
│  │B │ │                     │ │  │  • Advantage meter (+0.8)        │  │
│  │a │ │                     │ │  ├──────────────────────────────────┤  │
│  │r │ └─────────────────────┘ │  │ Notation / PGN Move Scroll List  │  │
│  └──┘ ┌─────────────────────┐ │  ├──────────────────────────────────┤  │
│       │ Game Controls       │ │  │ Bottom: Player Card & Clock      │  │
│       │ Flip · Undo · Resign│ │  ├──────────────────────────────────┤  │
│       └─────────────────────┘ │  │ Engine Controls & Difficulty Bar │  │
│                               │  └──────────────────────────────────┘  │
├───────────────────────────────┴────────────────────────────────────────┤
│ Modals: Engine Manager · Engine Importer · Game Setup · Evaluation Graph│
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Data Lifecycle
- **`GameState`**: Stores FEN, move history, turn, active time control, check/checkmate status, captured pieces per side, and game outcome.
- **`EngineState`**: Active engine ID, calculating status, current depth, evaluation score (centipawns / mate count), best move coordinates, principal variation (PV).
- **`EngineRegistry`**: Default engines (Stockfish 16 NNUE, Tactical Aggressor, Positional Grandmaster, Rapid Blitz Bot) + User Imported Engines saved to `localStorage` / IndexedDB.
- **`AnalysisState`**: Move-by-move evaluation cache allowing instantaneous post-game graph plotting and blunder identification.

---

### Verification & Testing Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to confirm zero TypeScript and syntax errors.
2. **Move Validation & FIDE Rules**: Verify pawn promotion modal, castling, en passant, checkmate, stalemate, and draw conditions.
3. **Engine Evaluation & Real-Time Arrows**: Test that playing moves immediately triggers real-time evaluation, updating the dynamic eval bar and rendering best-move arrows.
4. **Difficulty Scaling**: Confirm that adjusting the ELO slider correctly modifies engine search depth and error margin.
5. **Custom Engine Import**: Verify importing a custom JS engine script, running a benchmark, and playing a game against it.
6. **Offline Capability & Install**: Validate PWA service worker registration and in-app install prompt.
