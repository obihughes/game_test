# Game module map

## Run the game (no typing)

- **Double-click** [`Run-game-Edge.bat`](../Run-game-Edge.bat) in the project folder: starts the dev server in a window and opens **Microsoft Edge** to `http://localhost:5173` (not your default browser).
- **Cursor / VS Code:** **Terminal → Run Task…** → **Run game (dev server)** (no browser) or **Run game + open Edge** (uses Vite’s `--open msedge`).
- **CLI:** `npm run dev` does **not** auto-open a browser ([`vite.config.ts`](../vite.config.ts) sets `server.open: false`). Use `npm run dev:edge` when you want Edge from the terminal.

Read this first when editing a slice of the game. Each row is intentionally isolated: change **copy** in `src/content`, **numbers** in `src/game/economy`, **map visuals** in `src/ui/map` + `src/content/mapLayout.ts`, **world connections** in `src/game/world`.

| Concern | Folder | Edit here for |
| ------- | ------ | ------------- |
| Shared types, initial save version | `src/game/core/` | `GameState`, IDs, `createInitialState` |
| Towns, routes, travel rules | `src/game/world/` | Which towns exist, edges, tolls, base travel days |
| Goods, buy/sell prices | `src/game/economy/` | `goods.ts`, `prices.ts`; rules in `buySell.ts` |
| Cart tiers, horses, hires, capacity math | `src/game/caravan/` | Upgrade costs, horse caps, hire costs, `capacity.ts` |
| Quest chain and flags | `src/game/quests/` | `definitions.ts` strings keys, `questLogic.ts` completion rules |
| Save/load | `src/game/persistence/` | Storage key, migration |
| Player-facing text (dialog, flavor) | `src/content/dialog/` | `dialog.ts` keyed strings |
| Location lore + market panel backgrounds | `src/content/locationContent.ts` | `LOCATION_STORIES`, `getLocationPanelBackground` |
| Pixel town icons (map + UI) | `src/ui/icons/LocationPixelIcon.tsx` | `LocationPixelIcon`, `MapLocationGlyph` |
| Map node positions (visual only) | `src/content/mapLayout.ts` | x/y per town id |
| Map rendering / colors | `src/ui/map/` | `MapView.tsx`, `map.module.css`, `mapTheme.ts` |
| Global UI shell | `src/App.tsx`, `src/app.css` | Tabs, layout |
| Screens | `src/ui/screens/` | Market, travel list, caravan upgrades |
| React + Zustand wiring | `src/store/gameStore.ts` | Actions that call pure game functions |

## Import convention

- Prefer `@/game/...`, `@/content/...`, `@/store/...`, `@/ui/...` (see `vite.config.ts` and `tsconfig.json`).
- Simulation stays pure under `src/game/`; React only orchestrates in `src/store` and `src/ui`.
