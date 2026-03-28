# Game module map

## Run the game (no typing)

- **Double-click** [`Run-game-Edge.bat`](../Run-game-Edge.bat) in the project folder: starts the dev server in a window and opens **Microsoft Edge** to `http://localhost:5173` (not your default browser).
- **Cursor / VS Code:** **Terminal ? Run Task?** ? **Run game (dev server)** (no browser) or **Run game + open Edge** (uses Vite's `--open msedge`).
- **CLI:** `npm run dev` does **not** auto-open a browser ([`vite.config.ts`](../vite.config.ts) sets `server.open: false`). Use `npm run dev:edge` when you want Edge from the terminal.

Read this first when editing a slice of the game. Each row is intentionally isolated: change **copy** in `src/content`, **numbers** in `src/game/economy`, **map visuals** in `src/ui/map` + `src/content/mapLayout.ts`, **world connections** in `src/game/world`.

| Concern | Folder | Edit here for |
| ------- | ------ | ------------- |
| Shared types, initial save version | `src/game/core/` | `GameState` (incl. `activeMerchantId`, `inventoryCostBasis`, `tradeGoldSpent` / `tradeGoldEarned`, `townWarehouses`), IDs, `createInitialState`, `SAVE_VERSION` (currently v5) |
| Towns, routes, travel rules | `src/game/world/` | 7 towns (ashenford, mirecross, riversend, crownpost, fenward, **stoneholt**, **saltmere**), edges, tolls, base travel days; **`seasons.ts`** ? `getSeason`, `getSeasonLabel`, `getSeasonPriceMultiplier`, `getSeasonTravelPenalty`, `getSeasonModifierLabel` (season computed from `day`, no stored state; 28 days/season) |
| Goods, merchants, buy/sell | `src/game/economy/` | `goods.ts` (21 goods: iron, silk, wine, herbs, **fresh_fish, salted_fish, smoked_fish, fish_sauce**, salt, rope, peat, obsidian_glass, dreaming_moss, crown_amber, fen_spice, **coal, metal_tools, grain, timber, pitch, tallow**); `merchants.ts` (per-town stalls for all 7 towns, `effectivePriceRow` + `bestSellPriceAtTown`, `isLocalDeal`), `prices.ts` (`getEffectivePrice` ? daily variance ? season multiplier); rules in `buySell.ts`; **`priceHistory.ts`** ? `getPriceTrend`, `getPriceTrendDirection`, `trendArrow` (deterministic, no stored state) |
| Cart tiers, horses, hires, capacity math | `src/game/caravan/` | Upgrade costs, horse caps, hire / `dismissHire`, `HIRE_UPKEEP_PER_DAY`, `capacity.ts` |
| Quest chain and flags | `src/game/quests/` | `definitions.ts` strings keys, `questLogic.ts` completion rules |
| Town warehouse investments | `src/game/investments/` | `warehouse.ts` ? `buildWarehouse`, `upgradeWarehouse`, `depositGoods`, `withdrawGoods`, `processRecipe`, `PROCESSING_RECIPES`; `WAREHOUSE_BUILD_COST=200`, `WAREHOUSE_UPGRADE_COST=400`, capacity Lv1=20 / Lv2=50 wt; **6 recipes**: herbs?dreaming_moss, salt_fish (fresh_fish+salt?salted_fish), smoke_fish (fresh_fish+peat?smoked_fish), ferment_fish_sauce (salted_fish?fish_sauce), **render_tallow** (peat?tallow), **char_coal** (timber?coal) |
| Save/load | `src/game/persistence/` | Storage key; save shape migration also in `src/store/gameStore.ts` (Zustand `migrate` + `version`, currently v5) |
| Player-facing text (dialog, flavor) | `src/content/dialog/` | `dialog.ts` keyed strings |
| Location lore + market panel backgrounds | `src/content/locationContent.ts` | `LOCATION_STORIES`, `getLocationPanelBackground` ? all 7 towns |
| Pixel town icons (map + UI) | `src/ui/icons/LocationPixelIcon.tsx` | `LocationPixelIcon`, `MapLocationGlyph` ? all 7 towns have unique pixel art glyphs (ashenford=forge, mirecross=twin-hut, riversend=harbour, crownpost=fortress, fenward=stilt-village, **stoneholt=mine-shaft**, **saltmere=salt-pans**) |
| Map node positions (visual only) | `src/content/mapLayout.ts` | x/y per town id; optional `labelDy` / `labelDx` / `labelAnchor` |
| Map rendering / colors | `src/ui/map/` (`mapEdgeGeometry.ts`: hand-tuned per-route road curves + offset `Nd` anchors) + `src/ui/screens/MapTravelScreen.tsx` | Two-column layout: full map left, info panel + destinations sidebar right; travel confirmation modal with cost breakdown + season warning |
| Global UI shell | src/App.tsx, src/app.css | Tabs, full-width layout, fixed gold-hud; quest panel as compact horizontal strip below main content |
| Screens | `src/ui/screens/` | Market (`TownScreen`: merchant cards, trend arrows, season badges, Max buy, sparklines, Warehouse tab); map (`MapTravelScreen`: travel confirm modal); caravan (`CaravanScreen`) |
| React + Zustand wiring | `src/store/gameStore.ts` | `travelTo`, `buy` / `sell`, `executeBatch` (multi-item cart checkout), `hire` / `dismissHire`, `buildWarehouse`, `upgradeWarehouse`, `depositGoods`, `withdrawGoods`, `processRecipe` |

## Fish processing chain (warehouse)

The fish economy is a multi-step processing chain centered on the warehouse:

| Step | Recipe | Inputs | Fee | Outputs | Notes |
|------|--------|--------|-----|---------|-------|
| 1 | Salt-cure | 2? fresh_fish + 1? salt | 4g | 2? salted_fish | Preserves for long trade |
| 2 | Smoke | 3? fresh_fish + 1? peat | 6g | 2? smoked_fish | Premium product |
| 3 | Ferment | 4? salted_fish | 8g | 1? fish_sauce | Luxury condiment, highest value |

**Buy cheap:** fresh_fish at Saltmere (5g) or Riversend (6g) or Mirecross/Fenward (~10-11g).
**Sell high:** fish_sauce at Crownpost (48g buy price), Fenward (46g), Mirecross (44g).

## New goods processing chains (warehouse)

| Recipe | Inputs | Fee | Outputs | Best location |
|--------|--------|-----|---------|---------------|
| render_tallow | 3? peat | 2g | 2? tallow | Mirecross (cheap peat) |
| char_coal | 2? timber | 3g | 3? coal | Ashenford or Stoneholt (sell coal dear at Riversend/Fenward) |

## Regional trade identities

| Town | Cheap exports | Expensive imports |
|------|---------------|-------------------|
| Stoneholt | coal, iron, metal_tools, obsidian_glass | grain, wine, herbs, silk |
| Ashenford | coal, iron, metal_tools, obsidian_glass | salt, fresh_fish, grain, tallow |
| Mirecross | peat, timber, herbs, tallow, dreaming_moss | iron, coal, metal_tools, grain |
| Riversend | fresh_fish, salted_fish, salt, rope | coal, metal_tools, grain, timber, pitch |
| Crownpost | crown_amber, silk, wine, grain | coal, timber, metal_tools, pitch |
| Fenward | fen_spice, peat, pitch, timber, dreaming_moss | grain, metal_tools, coal, salt |
| Saltmere | salt, fresh_fish, rope, pitch | grain, coal, metal_tools, timber |

## Import convention

- Prefer `@/game/...`, `@/content/...`, `@/store/...`, `@/ui/...` (see `vite.config.ts` and `tsconfig.json`).
- Simulation stays pure under `src/game/`; React only orchestrates in `src/store` and `src/ui`.
