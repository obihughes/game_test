# Fish Tank Game — File Index

## Entry

| File | Purpose |
|------|---------|
| [launch.bat](../launch.bat) | Double-click to install deps (if needed) and start the game |
| [index.html](../index.html) | Page shell: `#stage` wrapper, game canvas, and UI overlay |
| [src/main.ts](../src/main.ts) | Phaser 4 game config and boot |
| [vite.config.ts](../vite.config.ts) | Vite dev server config (auto-opens browser) |

## Simulation (`src/sim/`)

| File | Purpose |
|------|---------|
| [balance.ts](../src/sim/balance.ts) | All tunable gameplay numbers (prices, speeds, hunger rates, growth rates, buffs) |
| [state.ts](../src/sim/state.ts) | GameState, entity creation, pellet/algae/buff state, shop actions |
| [fish.ts](../src/sim/fish.ts) | Fish entity type, growth and hunger helpers |
| [steering.ts](../src/sim/steering.ts) | Wander (forward-biased interior waypoint cruise), seek, flee (predator avoidance), speed limit (scales with hunger/fleeing), boundary clamping, nearest-pellet/algae/prey/predator search (radius scales with hunger stage) |
| [tick.ts](../src/sim/tick.ts) | `advance()` — main simulation loop per frame (predator avoidance, pellet/algae eating, bass hunting, breeding, fish feed, growth) |
| [save.ts](../src/sim/save.ts) | localStorage serialize/load and autosave helpers |

## Rendering (`src/render/`)

| File | Purpose |
|------|---------|
| [TankScene.ts](../src/render/TankScene.ts) | Phaser scene: sync sprites, input (feed on open water, sell on fish, remove dead), UI hooks |
| [textures.ts](../src/render/textures.ts) | Procedural fish textures (tilapia, bass) with animated tail frames, shading, plus pellet and algae textures; hunger/death applied as sprite tints |
| [fx.ts](../src/render/fx.ts) | Bubbles, eat pop, sell effect |

## UI (`src/ui/`)

| File | Purpose |
|------|---------|
| [hud.ts](../src/ui/hud.ts) | Money counter, fish counts, active buff timers, fast-forward toggle, feed/sell hint, debug +$100 button |
| [shop.ts](../src/ui/shop.ts) | Collapsible buy fish (tilapia/bass) and buff (fertilizer/fish feed) buttons |

## Styles

| File | Purpose |
|------|---------|
| [style.css](../src/style.css) | Stage layout, HUD/shop overlay styling |

## Documentation (`docs/`)

| File | Purpose |
|------|---------|
| [INDEX.md](INDEX.md) | This file |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How sim, render, and UI interact |
| [GAMEPLAY.md](GAMEPLAY.md) | Mechanics and balance numbers |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
