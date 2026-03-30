# Game module map

## Run the game (no typing)

- **Double-click** [`Run-game-Edge.bat`](../Run-game-Edge.bat) in the project folder: starts the dev server in a window and opens **Microsoft Edge** to `http://localhost:5173` (not your default browser).
- **Cursor / VS Code:** **Terminal > Run Task** > **Run game (dev server)** (no browser) or **Run game + open Edge** (uses Vite's `--open msedge`).
- **CLI:** `npm run dev` does **not** auto-open a browser ([`vite.config.ts`](../vite.config.ts) sets `server.open: false`). Use `npm run dev:edge` when you want Edge from the terminal.

Read this first when editing a slice of the game. Each row is intentionally isolated: change **copy** in `src/content`, **numbers** in `src/game/economy`, **map visuals** in `src/ui/map` + `src/content/mapLayout.ts`, **world connections** in `src/game/world`.

| Concern | Folder | Edit here for |
| ------- | ------ | ------------- |
| Shared types, initial save version | `src/game/core/` | `GameState` (incl. `inventoryCostBasis`, `tradeGoldSpent` / `tradeGoldEarned`, `townWarehouses`, `townVisits`, **`townLastVisitDay` / `townPreviousVisitDay`**, `lastEncounter`, **`story`**), `WarehouseState` (incl. `facilities`, `activeJobs: ProcessingJob[]`), `CaravanState` (incl. `buffs`, `bonusCapacity`), `ProcessingJob`, `TravelEncounter`, **`StoryState`**, IDs, `createInitialState`, `SAVE_VERSION` (currently **v10**) |
| Towns, routes, travel rules | `src/game/world/` | 7 towns (ashenford, mirecross, riversend, crownpost, fenward, **stoneholt**, **saltmere**), edges, tolls, base travel days; **`routes.ts`** includes `findTravelPath` for automatic multi-leg routing; **`travel.ts`** includes `computeTravelPlan` / `applyTravelPlan`; **`seasons.ts`** — `getSeason`, `getSeasonLabel`, `getSeasonPriceMultiplier`, `getSeasonTravelPenalty`, `getSeasonModifierLabel` (28 days/season); **`townEconomy.ts`** — per-town market backstory, thriving industries, import-demand reasons, and fallback demand multipliers |
| Goods, merchants, buy/sell | `src/game/economy/` | `goods.ts` (**27 goods**: base trade goods plus **medicinal_tincture**, **cart_upgrade_kit**, **elixir_of_insight**); `merchants.ts` — town price identity, `townMarketPriceRow`, `bestSellOfferAtTown`, `bestSellPriceAtTown`, `townPrimaryGoods`, `townDemandGoods`, townwide fallback buyer floor; `prices.ts` (`getEffectivePrice`); rules in `buySell.ts`; **`priceHistory.ts`** — `getPriceTrend`, `getVisitPriceComparison`, `trendArrow` (deterministic visit-over-visit comparisons) |
| Cart tiers, horses, hires, capacity math | `src/game/caravan/` | Upgrade costs, horse caps, hire / `dismissHire`, `HIRE_UPKEEP_PER_DAY`, `capacity.ts` (includes permanent `bonusCapacity` from item use) |
| Quest chain and flags | `src/game/quests/` | `definitions.ts` strings keys, `questLogic.ts` completion rules |
| Branching story, NPC dialog, road quests | `src/game/story/` + `src/content/story/` | `src/content/story/` holds NPC roster, dialog trees, and story quest definitions; `src/game/story/` evaluates conditions, applies dialog effects, tracks NPC favor, progresses story quests, grants rewards, and exposes town NPC lookups / active road-story summaries |
| Town warehouse investments | `src/game/investments/` | `warehouse.ts` — `buildWarehouse`, `upgradeWarehouse`, **`buildFacility` / `upgradeFacility`**, `depositGoods`, `withdrawGoods`, `processRecipe` (instant), **`startTimedJob`** / **`collectJob`** (timed), `allRecipesForTown`, `recipesForTown`, `isRecipeUnlocked`; `WAREHOUSE_BUILD_COST=200`, `WAREHOUSE_UPGRADE_COST=400`, capacity Lv1=20 / Lv2=50 wt; 4 facilities (`smokehouse`, `workshop`, `stillhouse`, `kiln`) gate **14 recipes** including multi-step chains for `medicinal_tincture`, `cart_upgrade_kit`, and `elixir_of_insight` |
| Travel events | `src/game/events/` | **`encounters.ts`** — `rollEncounter` (deterministic seed from day+route, reduced by `alertness` / `insight` buffs); 11 encounter types (road_merchant_offer, bandit_toll, shortcut_found, trader_rumour, broken_wheel, mountain_pass_cold, river_mist, salt_flat_wind, pilgrim_camp, abandoned_cart, crown_inspector); route-specific encounters for mountain/river/salt roads; encounter cargo changes keep inventory cost basis aligned |
| Save/load | `src/game/persistence/` | Storage key; save shape migration also in `src/store/gameStore.ts` (Zustand `migrate` + `version`, currently **v10**; migrates caravan buffs / bonus capacity, warehouse facilities, **town visit day tracking**, and **branching story state** alongside earlier townVisits / encounter / activeJobs defaults) |
| Player-facing text (dialog, flavor) | `src/content/dialog/` | `dialog.ts` keyed strings; **arrival vignettes** keyed as `arrive_{townId}_{season}_{visitBucket}` (first/returning/regular x 4 seasons x 7 towns = 56 vignettes); also stores **story NPC**, **story quest**, **dialog node**, and **easter egg** copy |
| Location lore + market panel backgrounds | `src/content/locationContent.ts` | `LOCATION_STORIES`, `getLocationPanelBackground`, **`getArrivalVignette`** (season + visit-count based) — all 7 towns; market backdrop gradients still live here while procedural SVG scene art + ambient animation live in `src/ui/screens/MarketBackdrop.tsx` |
| Pixel town icons (map + UI) | `src/ui/icons/LocationPixelIcon.tsx` | `LocationPixelIcon`, `MapLocationGlyph` — all 7 towns have unique pixel art glyphs (ashenford=forge, mirecross=twin-hut, riversend=harbour, crownpost=fortress, fenward=stilt-village, **stoneholt=mine-shaft**, **saltmere=salt-pans**) |
| **NPC pixel portraits** | `src/ui/icons/NpcPortrait.tsx` | 16×16 bust sprites (`portraitPixels` / `NpcPortrait`). `StoryNpcDef.portraitId` in `src/content/story/npcs.ts` selects art (fallback: NPC `id`, then placeholder). **People** tab: small portrait on each card, large in dialog header; CSS idle bob + fade-in in `src/app.css`. |
| **Market backdrop motion** | `src/ui/screens/MarketBackdrop.tsx` + `src/app.css` | Per-town `<g>` classes: forge flicker, reeds sway, water ripple, banners wave, fen lamps bob, mine smoke drift, salt masts sway (`@keyframes` prefixed `forgeFlicker`, `reedsWay`, etc.). |
| Map node positions (visual only) | `src/content/mapLayout.ts` | x/y per town id; optional `labelDy` / `labelDx` / `labelAnchor` |
| Map rendering / colors | `src/ui/map/` (`mapEdgeGeometry.ts`: hand-tuned per-route road curves + offset `Nd` anchors) + `src/ui/screens/MapTravelScreen.tsx` | Two-column layout: full map left, info panel + destinations sidebar right; hover previews show the full chained route; **`onTravelStart`** callback passes `TravelResult` to parent for animation |
| Global UI shell | src/App.tsx, src/app.css | Tabs, full-width layout, fixed gold-hud; quest panel as compact horizontal strip below main content; **`TravelAnimation`** overlay (CSS-animated caravan, route display, day counter); **`EncounterModal`** (road encounter dialog with optional gold effect) |
| Screens | `src/ui/screens/` + `src/ui/` | Market (`TownScreen`: unified market board where each row shows town buy data, **your carried amount**, **average buy price**, and local sell data together; local specialties sorted first, Market tip inline with town title, wanted-good callouts, town-economy backstory, sticky trade summary, **arrival vignette** (seasonal, visit-aware, dismissible), **visit-over-visit market price percentages** beside listed prices, **People tab with `NpcPanel` for branching story conversations**, Warehouse tab with facility cards, locked/unlocked recipe requirements, instant recipes, **town-specific timed recipes**, **active job progress bars with collect button**, and a town-specific ambient backdrop via `MarketBackdrop.tsx`); map (`MapTravelScreen`); caravan (`CaravanScreen`: cargo list now exposes direct item use plus active buff readout); quest strip (`QuestPanel`: main task + active road stories) |
| React + Zustand wiring | `src/store/gameStore.ts` | `travelTo` (returns `TravelResult | false`; rolls encounter, increments townVisits, shifts **town last/previous visit days**, stores lastEncounter), `buy` / `sell`, `executeBatch`, `hire` / `dismissHire`, `buildWarehouse`, `upgradeWarehouse`, **`buildFacility` / `upgradeFacility`**, `depositGoods`, `withdrawGoods`, `processRecipe`, **`startTimedJob`**, **`collectJob`**, **`useItem`**, **`dismissEncounter`**, **`startStoryConversation`**, **`chooseStoryOption`**; uses a shared finalize step so both the linear quest chain and branching road stories advance after relevant state changes |

## Interactive cargo items

These goods now have direct non-market use from the caravan screen:

| Good | Use effect |
|------|------------|
| grain | Feeds the team, granting **Well Fed** (`-1` travel day per leg while active) |
| wine | Grants **High Morale** (extra toll discount when guarded) |
| herbs | Grants **Alertness** (safer roads, fewer costly encounters) |
| metal_tools | Consumed for `+2` permanent cargo capacity |
| cart_upgrade_kit | Consumed for `+15` permanent cargo capacity |
| elixir_of_insight | Grants **Insight** (safer and faster travel for longer) |

## Fish processing chain (warehouse)

The fish economy is a multi-step processing chain centered on the warehouse:

| Step | Recipe | Inputs | Fee | Outputs | Notes |
|------|--------|--------|-----|---------|-------|
| 1 | Salt-cure | 2x fresh_fish + 1x salt | 4g | 2x salted_fish | Preserves for long trade |
| 2 | Smoke | 3x fresh_fish + 1x peat | 6g | 2x smoked_fish | Premium product |
| 3 | Ferment | 2x salted_fish | 4g | 1x fish_sauce | Luxury condiment, highest value |

**Buy cheap:** fresh_fish at Saltmere (5g) or Riversend (6g), then process into preserved fish lines.
**Sell high:** fish_sauce at Crownpost, Fenward, or Mirecross; smoked fish at Ashenford or Crownpost.

## Town-specific crafting chains (timed, warehouse)

These recipes are only available at the named town's warehouse and take days to complete. Inputs are consumed immediately; outputs collected on return.

| Recipe | Town | Inputs | Fee | Outputs | Days | Notes |
|--------|------|--------|-----|---------|------|-------|
| forge_tools | Stoneholt | 2x iron + 1x coal | 8g | 2x metal_tools | 3 | Best iron/coal prices nearby |
| cut_glass | Stoneholt | 2x obsidian_glass + 1x coal | 7g | 2x cut_glass | 3 | Sells well at Riversend/Crownpost |
| brew_pitch | Fenward | 2x peat + 1x timber | 5g | 2x pitch | 2 | Cheap inputs at Fenward |
| press_rope | Mirecross | 2x herbs + 1x timber | 4g | 3x rope | 2 | Cheap herbs/timber at Mirecross |
| amber_polish | Crownpost | 1x crown_amber + 1x tallow | 10g | 1x polished_amber | 3 | High-value luxury good |
| spice_blend | Saltmere | 1x fen_spice + 1x salt | 6g | 2x seasoned_spice | 2 | Salt cheap at Saltmere |

## New goods processing chains (warehouse)

| Recipe | Inputs | Fee | Outputs | Best location |
|--------|--------|-----|---------|---------------|
| herbs_to_moss | 2x herbs | 2g | 2x dreaming_moss | Mirecross for inputs, Crownpost/Fenward for sales |
| render_tallow | 3x peat | 2g | 2x tallow | Mirecross (cheap peat) |
| char_coal | 2x timber | 3g | 3x coal | Ashenford or Stoneholt (sell coal dear at Riversend/Fenward) |

## Regional trade identities

| Town | Cheap exports | Expensive imports |
|------|---------------|-------------------|
| Stoneholt | coal, iron, metal_tools, obsidian_glass | grain, wine, herbs, silk |
| Ashenford | coal, iron, metal_tools, obsidian_glass | salt, fish, grain, tallow, crown_amber, fen_spice |
| Mirecross | peat, timber, herbs, tallow, dreaming_moss | iron, coal, metal_tools, grain, fish_sauce |
| Riversend | fresh_fish, salt fish, smoked fish, salt, rope | coal, metal_tools, grain, timber, pitch, crown_amber, fen_spice |
| Crownpost | crown_amber, silk, wine, grain | smoked_fish, fish_sauce, fen_spice, dreaming_moss, obsidian_glass, polished_amber |
| Fenward | fen_spice, peat, pitch, timber, dreaming_moss | grain, metal_tools, coal, salt, fish_sauce |
| Saltmere | salt, fresh_fish, rope, pitch, salt fish, smoked fish, seasoned_spice | grain, coal, metal_tools, timber |

## Regional industries and demand logic

The town economy layer gives each region:

- a short market backstory explaining **why** demand exists beyond the named merchant stalls
- a list of **thriving industries** tied to geography, town size, and logistics
- explicit **import-demand reasons** (for example: Stoneholt buys grain because the ridge cannot feed its miners; Fenward buys tools because wet timber work destroys them; Saltmere buys coal and timber to keep the pans, boats, and piers working)
- a **fallback town buyer floor** for carried goods, so staples like food still move through inns, quartermasters, street buyers, and small traders even when no stall is actively listing them that day

## Import convention

- Prefer `@/game/...`, `@/content/...`, `@/store/...`, `@/ui/...` (see `vite.config.ts` and `tsconfig.json`).
- Simulation stays pure under `src/game/`; React only orchestrates in `src/store` and `src/ui`.
