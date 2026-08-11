# Architecture

## Overview

The game separates **simulation** (pure TypeScript) from **rendering** (Phaser 4) and **UI** (DOM overlay).

```mermaid
flowchart LR
  Input["Pointer input"] --> Sim
  Sim["sim/ (pure TS)"] --> Render["render/ (Phaser)"]
  Sim --> Save["localStorage"]
  Sim --> UI["ui/ (HTML overlay)"]
  UI --> Sim
```

## Data flow

1. **TankScene.update()** calls `advance(state, dt)` each frame. When fast forward is on, `dt` is multiplied by `FAST_FORWARD_MULTIPLIER` (4×) before sim and FX updates; input stays real-time.
2. Simulation updates fish AI (with hunger-scaled perception radius so hungrier fish search further for food, hunger-scaled speed so hungrier fish swim faster, and predator-avoidance steering so smaller fish flee nearby bass), hunger, pellet sinking/lifetime, algae spawning, pellet/algae eating, bass hunting smaller fish, fish breeding, fish feed passive growth, and buff timers — no Phaser imports. Steering and eating share a single nearest-food search per fish per frame (`updateFish` in `tick.ts`) rather than searching once for movement and again for eat-range, to keep per-frame cost from spiking once fish become hungry. Predator detection runs first each frame — fish within half the flee radius of a bass skip food-seeking/wandering entirely and only flee, while fish further away blend flee steering in alongside normal behavior.
3. **TankScene** reads entity positions and syncs Phaser sprites by entity `id`.
4. Pointer clicks call sim functions in priority order: remove a dead fish, sell a living fish, otherwise drop a food pellet at the click position (`dropFood`).
5. HUD reads `GameState` every frame; the Shop re-renders only when money or buffs change (after purchases or sales) so button elements are not destroyed mid-click.
6. **save.ts** serializes fish, money, and entity IDs to `localStorage` every 10 seconds (pellets, algae, and buff timers are not persisted — they reset on load).

## Page layout and scale

The HTML shell uses a `#stage` wrapper around `#game-container` and `#ui-overlay`:

- `#game-container` has a fixed aspect ratio (`4 / 3`) and `width: min(800px, calc(100vw - 32px))` so Phaser's `Scale.FIT` has a stable box to measure.
- `#ui-overlay` is `position: absolute` inside `#stage`, keeping the HUD and Shop aligned with the tank rather than the browser window.
- `expandParent: false` in [src/main.ts](../src/main.ts) prevents Phaser from resizing the parent and creating a scale-up feedback loop.

## Entity sync pattern

Each sim entity has a numeric `id`. Phaser maintains `Map<id, Sprite>`:

- Create sprite when entity appears.
- Update position/texture each frame, selecting from 4 animated tail frames based on `fish.swimPhase`.
- Apply sprite tints and alpha for hunger state (white when fed, warm amber when hungry, pale when starving, gray when dead).
- Destroy sprite when entity is removed.

## Why this split

- Save/load is trivial (plain JSON objects).
- Balance tuning is one file (`balance.ts`).
- Procedural textures can be swapped for image sprites later without touching sim code.
