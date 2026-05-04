<div align="center">

# RPG GAUNTLET

### A turn-based RPG built for the Nordeus Challenge — from zero to deployed in 48 hours

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_+_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Backend-Go_(Golang)-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go"/>
  <img src="https://img.shields.io/badge/AI-Hybrid_Q--Learning_+_Adaptive-8B5CF6?style=for-the-badge&logo=openai&logoColor=white" alt="AI"/>
  <img src="https://img.shields.io/badge/Deployment-Vercel_+_Render-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployed"/>
  <img src="https://img.shields.io/badge/API_Docs-Swagger_/_OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger"/>
  <img src="https://img.shields.io/badge/State-Zustand-FF6B35?style=for-the-badge&logo=react&logoColor=white" alt="Zustand"/>
</p>

<p align="center">
  <strong><a href="https://nordeus-challenge-murex.vercel.app/">Play the live demo</a></strong>
  &nbsp;·&nbsp;
  <strong><a href="#api-documentation--swagger">API Docs</a></strong>
  &nbsp;·&nbsp;
  <strong><a href="#running-locally">Run Locally</a></strong>
</p>

> **Note on the live demo:** The backend runs on Render's free tier. The first request after a period of inactivity may take 20–30 seconds while the server cold-starts. Subsequent requests are fast.

---

*A player picks a move, a Go server resolves it in microseconds, and a hybrid AI answers back.*  
*The design favors server-authoritative state, deterministic battle resolution, and predictable behavior over client-side guesswork.*

</div>

---

## Table of Contents

1. [What Was Built](#what-was-built)
2. [Tech Stack & Why](#tech-stack--why)
3. [Architecture](#architecture)
4. [Hybrid AI System](#hybrid-ai-system)
5. [API Documentation & Swagger](#api-documentation--swagger)
6. [Feature Checklist](#feature-checklist)
7. [Running Locally](#running-locally)
8. [Project Structure](#project-structure)

---

## What Was Built

A fully deployed, full-stack turn-based RPG — **front to back, in 48 hours**.

The surface area of what shipped is wider than typical challenge submissions:

- A **React + TypeScript frontend** with pixel-art sprite rendering via Canvas API, animated hit/attack/hurt frames per character, Framer Motion transitions, and a Zustand global state layer
- A **Go backend** that owns all game logic: damage resolution, buff/debuff lifecycle, XP/level-up curves, shop inventory, and endless mode scaling — compiled to a single binary, no runtime dependencies
- A **hybrid monster AI** (Q-Learning + Adaptive Difficulty) written in Go, with 30,000 training episodes per monster at server startup and per-player online adaptation during play
- A **save system** (localStorage) with resume support, including protection against progress regression on replay
- A **shop**, **move management**, **monster preview modal**, **battle log with timestamps**, **endless mode**, **coin economy**, and a **full post-battle stat screen**
- Complete **Swagger/OpenAPI documentation** auto-generated and served alongside the API
- **Full deployment** — Vercel for frontend, Render for backend — with working CORS, environment config, and cold-start handling

---

## Tech Stack & Why

The stack was chosen to minimize accidental complexity and maximize iteration speed under a hard deadline.

### Frontend — React + TypeScript + Vite

React was the pragmatic choice: component boundaries map naturally to game screens (Menu → Map → Battle → PostBattle), and the ecosystem covers everything from animation (Framer Motion) to state (Zustand) without ceremony. TypeScript catches the category of bugs that compound fast under time pressure — wrong prop shapes, missing fields on API responses, enum mismatches. Vite keeps the dev loop fast.

**Zustand over Redux** — The game state is a single flat store with a small number of actions. Redux would have added boilerplate (actions, reducers, selectors) for no architectural gain. Zustand gives the same guarantees with a fraction of the surface area.

**Canvas API for sprites** — Pixel art at small sizes doesn't compress well as PNG and doesn't scale cleanly with CSS. Rendering directly to a `<canvas>` via a 12×12 pixel grid + palette lookup gives pixel-perfect rendering at any device pixel ratio, sub-millisecond frame switches (idle → attack → hurt), and zero asset dependencies. Every sprite in the game is defined as a `number[][]` and drawn programmatically.

### Backend — Go

Go was the right call for a game server for several concrete reasons:

**Concurrency model.** The AI training runs 30,000 episodes per monster at startup. In Go, this is goroutines with a `sync.RWMutex` protecting the Q-table — no thread pool configuration, no async/await ceremony, no GIL to work around. Each monster trains in parallel; the server is ready faster.

**Single binary deployment.** `go build` produces a self-contained executable. No runtime to install on Render, no dependency resolution at cold-start time. The entire backend — HTTP server, AI engine, battle resolver, config loader — ships as one file.

**Performance headroom.** Battle resolution is a tight loop of integer arithmetic and map lookups. Go handles this at microsecond latency per request. That matters for a game where the perceived responsiveness of the UI depends directly on how fast the server responds.

**Type safety without overhead.** The Pydantic-equivalent in Go is just structs. `models.BattleState`, `models.Move`, `models.MoveResult` — these are the same types used for JSON serialization, internal computation, and the Q-learning state space. No separate validation layer, no ORM, no reflection magic.

**Why not Node/Express or Python/FastAPI?** The AI layer needs genuine parallelism, not cooperative multitasking. Python's GIL would have serialized the training goroutines. Node is single-threaded by default. Go gives real OS threads and a scheduler that actually uses them.

### State Management — Zustand

The full game state — hero stats, encounter index, battle state, move inventory, coins, run config, endless mode — lives in a single Zustand store. Actions are synchronous where possible (equipping a move, applying a buff) and async only where the server is involved (selecting a battle move, loading run config). This makes the state transitions easy to trace and replay bugs straightforward to reproduce.

---

## Architecture

### Request Flow

```
Player picks a move (UI)
    │
    ▼
selectMove() — Zustand action
    │
    ├─ POST /api/monster/move { battle_state, hero_move }
    │       │
    │       ▼
    │   Go server resolves turn:
    │   1. Apply hero move  (damage, heal, buff/debuff)
    │   2. AI picks monster move  (Q-table + adaptive difficulty)
    │   3. Apply monster move
    │   4. Tick active buff durations
    │   5. Compute XP, coins, level-up if HP ≤ 0
    │   6. Return MoveResult
    │
    ▼
Store updated state → React re-renders
    │
    ▼
Damage numbers, sprite animations, HP bar transitions play out
```

### Battle State Machine

The battle follows an explicit state machine — no implicit flags, no shared mutable state between client and server:

```
IDLE
  └─► HERO_SELECTING     (player sees move grid)
        └─► PROCESSING   (API call in flight — UI locked)
              ├─► BATTLE_ONGOING   (neither side dead)
              ├─► VICTORY          (monster HP ≤ 0)
              └─► DEFEAT           (hero HP ≤ 0)
```

The server is authoritative for all HP values, buff stacks, and damage calculation. The client owns display state only (animation frames, damage number overlays, log expansion).

### Component Architecture

```
App
├── MainMenu
├── MapScreen
│   ├── HeroSidebar        (HP, stats, equipped moves, coins)
│   ├── MonsterNode[]      (pixel sprite, difficulty, fight/replay/preview)
│   ├── MoveManagementModal
│   ├── ShopModal
│   └── MonsterPreviewModal
├── BattleScreen
│   ├── BattleCharacter (Knight)  ← Canvas sprite, hit/attack/hurt frames
│   ├── BattleCharacter (Monster) ← Sprite resolved by monster name at runtime
│   ├── MoveButton[]              ← tooltip on hover, type badge, processing lock
│   └── BattleLog                 ← collapsible, timestamped, color-coded by actor
├── PostBattleScreen       (XP, stat gains, new move, slot swap)
├── EndlessScreen
└── PostEndlessScreen
```

---

## Hybrid AI System

The monster AI is not a random number generator dressed up as a system. It is a two-layer architecture written entirely in Go: a Q-learning engine that trains offline at startup, and an adaptive difficulty layer that adjusts per-player in real time.

### Layer 1: Q-Learning (Offline Pre-training)

At server startup, each monster runs **30,000 training episodes** of self-play. The state space is discretized into a compact 7-dimensional representation:

```go
type QLState struct {
    HeroHPBucket    int  // 0–4: (0–20%, 20–40%, 40–60%, 60–80%, 80–100%)
    MonsterHPBucket int  // 0–4
    HeroAtkDebuffed bool
    HeroDefDebuffed bool
    MonsterBuffed   bool
    IsRaging        bool
    Turn            int  // capped at 10+
}
```

The Q-table maps `stateKey → []float64` (one Q-value per move index). Training uses standard Q-learning with shaped rewards:

- Dealing damage: `+0.3 × damage`
- Healing when HP < 50%: `+0.4 × healing`; healing when healthy: `-1.0` (penalized)
- Applying a debuff to hero: `+2.0`
- Self-buff in early turns (≤ turn 2): `+1.5`; late buff: `+0.3`
- Monster defeat: `+20.0`; monster death: `-20.0`

Training hyperparameters:

```
α (learning rate):   0.15
γ (discount):        0.90
ε start:             1.0   (fully exploratory)
ε end:               0.05  (mostly exploitative)
ε decay:             0.9997 per episode
```

After training, the table is frozen and used as the base policy. Unseen states fall through to an adaptive heuristic.

**Why Q-learning and not a rule-based system?** Rule-based systems are easy to predict and easy to exploit. A trained Q-table produces non-obvious action sequences that genuinely depend on game state — defensive buffing when low on HP, choosing high-damage moves when the hero is debuffed, mixing healing into aggressive turns. The behavior emerges from the reward structure, not from hand-coded conditions.

### Layer 2: Adaptive Difficulty (Online, Per-Player)

The Q-table defines the base policy. The adaptive layer monitors each player's win rate per monster in real time using a thread-safe struct:

```go
type AdaptiveAI struct {
    mu            sync.Mutex
    battles       map[string]int
    heroWins      map[string]int
    heroMoveCount map[string]map[string]int // monsterID → moveID → count
}

func (a *AdaptiveAI) AggressionLevel(monsterID string) float64 {
    // Returns win rate: 0.0 (player struggling) → 1.0 (player dominating)
    total := a.battles[monsterID]
    if total < 3 { return 0.5 } // not enough data yet
    return float64(a.heroWins[monsterID]) / float64(total)
}
```

This aggression signal modifies Q-values before action selection:

```go
func (a *RLAgent) SelectMove(monster models.Monster, state models.BattleState) int {
    aggression := Adaptive.AggressionLevel(monster.ID)
    qVals := qt[stateKey(buildQLState(state))]
    adjusted := make([]float64, len(qVals))

    for i, q := range qVals {
        move := monster.Moves[i]
        bonus := 0.0

        if aggression > 0.6 {
            // Player is winning consistently → boost damage and debuff moves
            if move.Effect == "damage" || move.Effect == "damage_debuff" {
                bonus = aggression * 5.0
            }
            // Penalize passive buffing under pressure
            if move.Effect == "buff" {
                bonus = -aggression * 3.0
            }
        }

        if aggression < 0.3 {
            // Player is struggling → flatten distribution toward random
            bonus = rand.Float64() * 2.0
        }

        // Survival override — always heal at critical HP regardless of aggression
        monsterHPPct := float64(state.MonsterHP) / float64(state.MonsterMaxHP)
        if monsterHPPct < 0.25 {
            if move.Effect == "heal" || move.Effect == "drain" {
                bonus += 15.0
            }
        }
        adjusted[i] = q + bonus
    }
    _, best := maxQ(adjusted)
    return best
}
```

### Layer 3: Hero Pattern Detection

The adaptive system also tracks which moves the hero uses most often and counters predictable strategies:

```go
// HeroSpamMove returns the moveID used >50% of the time, or "" if no spam detected
func (a *AdaptiveAI) HeroSpamMove(monsterID string) string {
    moves := a.heroMoveCount[monsterID]
    total := 0
    for _, count := range moves { total += count }
    if total < 5 { return "" } // insufficient data
    for moveID, count := range moves {
        if float64(count)/float64(total) > 0.50 {
            return moveID
        }
    }
    return ""
}
```

If the hero is spamming physical attacks (Slash, Rusty Blade), the monster gets a bonus for choosing Defense buffs or Attack debuffs. The counter-strategy emerges from observed play, not from pre-written rules.

### Online Retraining

After every 50 completed battles, the system asynchronously retrains Q-tables for monsters that appeared in those battles — without blocking the request handler:

```go
func AddExperience(exp Experience) {
    expMu.Lock()
    experienceBuffer = append(experienceBuffer, exp)
    ready := len(experienceBuffer) >= experienceThreshold // 50
    expMu.Unlock()

    if ready && RL != nil {
        go func(exps []Experience) {
            RL.Retrain(cfg.Monsters, exps)
            // Resets buffer after completion
        }(expsCopy)
    }
}
```

The result: a monster that tightens its play against players who win consistently, relaxes against players who are struggling, counters players who spam the same move, and improves its base policy as more battles are played — all running concurrently with the HTTP server in the same Go process.

---

## API Documentation & Swagger

The backend serves full **OpenAPI 3.0 / Swagger UI** documentation automatically — every endpoint, every request body, every response schema, derived directly from the Go struct definitions. No separate documentation step, no risk of docs drifting from the implementation.

**Access the live API docs:**
- **Swagger UI:** `http://localhost:8081/swagger/index.html`
- **OpenAPI JSON:** `http://localhost:8081/swagger/doc.json`

### Why This Matters

Having machine-readable API documentation means the frontend can be developed against the spec, not against live server behavior. When the `MoveResult` response shape changed mid-challenge, the Swagger diff made it immediately visible which frontend calls needed updating. No grep through curl output, no guessing at field names.

It also means every response contract is testable independently of the frontend — you can exercise the full battle resolution logic through the Swagger UI without touching a single line of React.

### Endpoint Reference

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/api/run/config` | Returns `RunConfig`: 5 monsters with stats + full movesets, hero start stats, all learnable moves, shop items |
| `POST` | `/api/monster/move` | Accepts `BattleState` + hero move, returns `MoveResult`: damage, healing, buffs, monster's chosen move, raging flag, monster telegraph |

### Response Models

The full type system exposed by the API:

```
RunConfig          → monsters[], hero_start_stats, all_moves[], shop_items[]
Monster            → id, name, difficulty, stats, moves[], xp_reward, coins_reward, sprite
Move               → id, name, type, effect, base_value, description,
                     target_stat, buff_amount, buff_turns, hp_cost, mana_cost
BattleState        → hero_hp, hero_max_hp, hero_stats, monster_hp, monster_max_hp,
                     monster_stats, monster_id, active_buffs[], turn
MoveResult         → move, damage, healing, new_buffs[], buff_applied,
                     monster_tell, is_raging
ActiveBuff         → affects_who, target_stat, amount, turns_left
ShopItem           → id, name, type, cost, description, move?, stat?, amount?
```

All fields are validated on ingress. Malformed input returns a structured error response with field-level detail — not a 500.

---

## Feature Checklist

### Core Requirements (All Complete)

| Feature | Status | Notes |
|:---|:---:|:---|
| Main Menu with new run button | ✅ | + Resume button when save exists |
| Run map with 5 encounters | ✅ | Pixel sprites per monster, difficulty indicators |
| Enter selected battle | ✅ | Current encounter highlighted with character glow |
| Move management screen | ✅ | MoveManagementModal + 4-slot equip system |
| Equip/swap moves pre-battle | ✅ | Slot assignment from full learned move list |
| Battle screen — hero + monster | ✅ | Canvas pixel sprites, per-character animation frames |
| HP bars for both characters | ✅ | Animated, color-coded (green → yellow → red) |
| Move selection interface | ✅ | 2×2 / 4-col grid, hover tooltips, processing lock |
| Post-battle: new move learned | ✅ | Move card + inline slot-swap UI |
| `GET /api/run/config` | ✅ | 5 monsters, full movesets, hero start state |
| `POST /api/monster/move` | ✅ | Hybrid Q-Learning + Adaptive AI |
| Server-side battle logic | ✅ | All damage, healing, buff resolution in Go |
| Physical attack formula | ✅ | `⌊attack × base_value / defense_factor⌋`, min 1 |
| Magical attack formula | ✅ | `magic × base_value`, bypasses defense entirely |
| Buff/Debuff system with duration | ✅ | Per-turn tick, stacks tracked in `active_buffs[]` |
| Healing moves | ✅ | Scales with Magic stat; drain restores monster HP |
| Progressive difficulty | ✅ | Monster stats scale by encounter index |
| XP system | ✅ | XP awarded per monster, tracked across run |
| Level-up with stat gains | ✅ | Health, Attack, Defense, Magic all scale on level |
| Replay defeated encounters | ✅ | Replay button on past nodes, no progress regression |

### Extras Shipped

| Feature | Notes |
|:---|:---|
| Hybrid Q-Learning AI | 30k episode offline training + per-player adaptive difficulty |
| Hero pattern detection | Monster counters moves hero spams >50% of the time |
| Online AI retraining | Q-tables update asynchronously every 50 battles |
| Endless mode | Infinite scaling, win counter, HP regen every N rounds |
| Shop system | Coin economy, move purchases, stat upgrades |
| Monster Preview Modal | Eye icon on map → full stats + moveset before committing |
| Battle log | Timestamped, collapsible, color-coded by actor |
| Turn counter | Displayed in battle header |
| Monster telegraph | Monster announces next move before executing it |
| Raging state | Visual + AI behavior change when monster HP is critical |
| Save & Resume | `localStorage` persistence, resume from main menu |
| Pixel-art sprites | Canvas-rendered, per-character palettes, 3 animation frames |
| Hit / attack / hurt animations | Frame switching + translate offset + hit flash overlay |
| Slash + Magic VFX | Per-move-type visual effect on attack |
| Damage number popups | Framer Motion float-up animation, color by type |
| Idle bob animation | Continuous idle animation between turns |
| Coin display | Persistent in sidebar and post-battle screen |
| Hero stat gain display | Post-battle shows `+HP`, `+ATK` deltas per stat |
| Swagger / OpenAPI docs | Full API documentation, auto-generated from Go structs |
| Full deployment | Vercel (frontend) + Render (backend), live and accessible |

---

## Running Locally

### Prerequisites

- Node.js 18+
- Go 1.21+

### Backend

```bash
cd rpg-backend
go mod tidy
go run .
```

On first startup the server pre-trains Q-tables for all monsters (~5–10 seconds). Progress is logged per monster:

```
[RL] Training Q-table for Witch (30000 episodes)...
[RL] Done: Witch — 1847 states learned
[RL] Training Q-table for Dragon (30000 episodes)...
...
Server ready on :8081
```

Swagger UI available at: `http://localhost:8081/swagger/index.html`

### Frontend

```bash
cd rpg-frontend
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8081" > .env.local

npm run dev
```

Open `http://localhost:5173`

### Environment Variables

| Variable | Where | Purpose |
|:---|:---|:---|
| `VITE_API_URL` | Frontend `.env.local` | Backend base URL |
| `PORT` | Backend (optional) | Override default port — Render sets this automatically |

No API keys required. The AI system is entirely local — no external model calls.

---

## Project Structure

```
rpg-gauntlet/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── screens/       # BattleScreen, MapScreen, MainMenu, PostBattle, ...
│   │   │   ├── battle/        # BattleCharacter — canvas sprite renderer + VFX
│   │   │   ├── ui/            # MoveButton, MoveManagementModal, ShopModal, ...
│   │   │   └── sprites/       # sprites.ts — pixel grid definitions + color palettes
│   │   ├── store/
│   │   │   └── gamestore.ts   # Zustand store — full game state + all actions
│   │   └── api/
│   │       └── client.ts      # Typed API client — all server calls with response types
│   └── vite.config.ts
│
└── backend/
    ├── main.go                # HTTP server, route registration, Swagger setup
    ├── engine/
    │   ├── rl_agent.go        # Q-Learning: training, state discretization, action selection
    │   ├── adaptive.go        # Adaptive difficulty: win rate tracking, hero pattern detection
    │   └── battle.go          # Damage resolution, buff/debuff lifecycle, healing
    ├── models/
    │   └── models.go          # BattleState, Move, Monster, MoveResult, RunConfig, ...
    └── config/
        └── monsters.json      # Monster definitions, move pools, stat scaling
```

---

<div align="center">

Built for the **Nordeus Challenge** · Deployed on [Vercel](https://vercel.com) + [Render](https://render.com)

**[▶ Play it live](https://nordeus-challenge-murex.vercel.app/)**

</div>
