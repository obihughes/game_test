# Game module map

## Run the game (no typing)

- **Double-click** [`Run-game-Edge.bat`](../Run-game-Edge.bat) in the project folder: starts the dev server in a window and opens **Microsoft Edge** to `http://localhost:5173` (not your default browser).
- **Cursor / VS Code:** **Terminal → Run Task…** → **Run game (dev server)** (no browser) or **Run game + open Edge** (uses Vite’s `--open msedge`).
- **CLI:** `npm run dev` does **not** auto-open a browser ([`vite.config.ts`](../vite.config.ts) sets `server.open: false`). Use `npm run dev:edge` when you want Edge from the terminal.

Read this first when editing a slice of the game. Each row is intentionally isolated: change **copy** in `src/content`, **numbers** in `src/game/economy`, **map visuals** in `src/ui/map` + `src/content/mapLayout.ts`, **world connections** in `src/game/world`.

| Concern | Folder | Edit here for |
| ------- | ------ | ------------- |
| Shared types, initial save version | `src/game/core/` | `GameState` (incl. `activeMerchantId`, `inventoryCostBasis`, `tradeGoldSpent` / `tradeGoldEarned` for net trade HUD), IDs, `createInitialState` (starting `gold` here), `SAVE_VERSION` |
| Towns, routes, travel rules | `src/game/world/` | Which towns exist, edges, tolls, base travel days |
| Goods, merchants, buy/sell | `src/game/economy/` | `goods.ts` (names, weights, icons), `merchants.ts` (per-town stalls, `effectivePriceRow` + `bestSellPriceAtTown`, `isLocalDeal`), `prices.ts` (`PriceRow`, `getEffectivePrice` daily variance); rules in `buySell.ts` (`buyGood` / `sellGood`, `averageInventoryBuyPrice`; cost basis + trade totals updated on trade) |
| Cart tiers, horses, hires, capacity math | `src/game/caravan/` | Upgrade costs, horse caps, hire / `dismissHire`, `HIRE_UPKEEP_PER_DAY`, `capacity.ts` |
| Quest chain and flags | `src/game/quests/` | `definitions.ts` strings keys, `questLogic.ts` completion rules |
| Save/load | `src/game/persistence/` | Storage key; save shape migration also in `src/store/gameStore.ts` (Zustand `migrate` + `version`, currently v4 for trade stats) |
| Player-facing text (dialog, flavor) | `src/content/dialog/` | `dialog.ts` keyed strings |
| Location lore + market panel backgrounds | `src/content/locationContent.ts` | `LOCATION_STORIES`, `getLocationPanelBackground` |
| Pixel town icons (map + UI) | `src/ui/icons/LocationPixelIcon.tsx` | `LocationPixelIcon`, `MapLocationGlyph` |
| Map node positions (visual only) | `src/content/mapLayout.ts` | x/y per town id |
| Map rendering / colors | `src/ui/map/` + `src/ui/screens/MapTravelScreen.tsx` | Map visual styles in `map.module.css`, `mapTheme.ts`; interactive travel in `MapTravelScreen` |
| Global UI shell | `src/App.tsx`, `src/app.css` | Tabs, layout, fixed `gold-hud` (🪙 + balance + net trade on every tab) |
| Screens | `src/ui/screens/` | Market (`TownScreen`: local-deal badge, sell all, effective prices), map (`MapTravelScreen`: `computeTravelLeg` toll/days + cargo tips), caravan (`CaravanScreen`: dismiss hire, upkeep text) |
| React + Zustand wiring | `src/store/gameStore.ts` | `travelTo` (guard toll / scout days via `computeTravelLeg`), `setActiveMerchant`, `buy` / `sell`, `hire` / `dismissHire` |

## Import convention

- Prefer `@/game/...`, `@/content/...`, `@/store/...`, `@/ui/...` (see `vite.config.ts` and `tsconfig.json`).
- Simulation stays pure under `src/game/`; React only orchestrates in `src/store` and `src/ui`.
