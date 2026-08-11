# Changelog

## 0.4.0 — 2026-08-11

### Changed — Smoother swim paths

- Idle wander targets used to be picked completely at random anywhere in the tank interior, so fed fish would frequently reverse direction and zigzag. New targets are now biased into a forward-facing cone (`WANDER_FORWARD_CONE`) based on the fish's current heading, so cruising reads as sweeping arcs instead of random darting
- Random jitter that nudges heading each frame was toned down (angular jitter `1.5 → 0.6`, steering contribution `0.12/0.08 → 0.05/0.04`) and a new per-frame drag (`FISH_WANDER_DRAG`, 0.97) smooths out direction changes so turns feel gradual rather than snapped
- Arrival radius for wander targets raised from 45px to 65px so fish begin turning toward their next destination earlier, avoiding abrupt stop-and-turn moments

### Added — Predator avoidance

- Smaller fish now notice nearby bass within `FLEE_DETECTION_RADIUS` (120px) and steer away via a new `applyFlee()` steering force — previously prey had zero awareness of predators and only "escaped" by chance
- Inside half the detection radius (60px), fleeing fully overrides food-seeking and wandering; beyond that, flee steering is blended in alongside normal behavior so a hungry fish still drifts toward food while easing away from danger
- Fleeing grants a temporary speed boost (`FLEE_SPEED_BOOST`, 1.3×) so the getaway is visibly urgent

### Added — Hunger affects swim speed

- Fish now swim faster as they get hungrier: `HUNGRY_SPEED_MULTIPLIER` (1.25×) and `STARVING_SPEED_MULTIPLIER` (1.5×) raise the speed cap in `limitSpeed()`, which previously capped every fish at the same base speed regardless of hunger stage
- Speed boosts from hunger and fleeing don't stack multiplicatively — `limitSpeed()` takes the larger of the two multipliers so a starving fish that's also fleeing doesn't move unrealistically fast

## 0.3.1 — 2026-08-11

### Fixed — Lag spike when fish become hungry

- Each hungry/starving fish was scanning pellets/algae/prey **twice per frame** — once in `updateFish` for steering, once more in separate `tryEatPellet`/`tryEatAlgae`/`tryHuntFish` passes for eating. These are now merged into a single search in `tick.ts`'s `updateFish`, reusing the steering target for the eat-range check
- All fish previously started at a fixed `hunger: 10` and increased at the same rate, so a batch of fish would all cross the hungry threshold on the same frame, spiking search cost all at once ("thundering herd"). Starting hunger is now randomized (5–15) to spread out the transition
- `TankScene.playBeep()` created a brand new `AudioContext` on every call — expensive, and frequent while hungry fish are actively eating. Now a single `AudioContext` is created lazily and reused for the scene's lifetime
- `syncFish`/`syncAlgae`/`syncFood` allocated a new `Set` (via `.map()`) every frame just to prune stale sprites; replaced with a per-frame tick tag stored on each sprite's data, avoiding the allocation
- `Hud.update()` ran two `Array.filter()` passes over all fish and rewrote `textContent` on every DOM node every frame regardless of change; now counts fish in one loop and only touches the DOM when a value actually changes

## 0.3.0 — 2026-08-11

### Fixed — Idle fish stuck at tank edges

- Fed fish no longer ping-pong along the walls — they now cruise toward random interior waypoints and pick a new one on arrival or after hitting a boundary

### Added — Fast forward

- HUD **Fast Forward** toggle runs the simulation at 4× speed (hunger, growth, spawning, buff timers, and autosave all scale together; clicks stay at normal speed)

### Changed — Algae persistence

- Algae no longer despawn on a timer — they persist until a tilapia eats them (removes per-frame lifetime updates)

### Fixed — Hungry fish couldn't find food across the tank

- Tilapia searching for algae and bass searching for prey only looked within a fixed radius (150px/180px) — far smaller than the 800×600 tank — so hungry fish often couldn't "see" food that existed elsewhere and just wandered instead of eating
- Search radius now scales with hunger stage: hungry fish search 2.5× further, and starving fish search the *entire tank*, guaranteeing they'll head for any available food/prey instead of starving next to it
- Starving fish now also seek food 1.8× more aggressively (`STARVING_SEEK_MULTIPLIER`) so they visibly race toward it instead of drifting

### Added — Reproduction

- Two same-species fish that are both grown (medium+), well-fed (hunger ≤ 50), and off cooldown will breed automatically when they swim within 60px of each other, producing a new small fish at their midpoint
- Each fish has a 30s cooldown after breeding before it can breed again
- Total tank population is capped at 20 fish (`MAX_FISH`) — breeding pauses at the cap
- New `breedCooldown` field added to the `Fish` entity; old saves default it to 0 (ready to breed) on load

## 0.2.1 — 2026-08-10

### Fixed — Feeding and growth balance

- Restored manual pellet feeding (click open water, $5/pellet, up to 8 on screen): any fish — tilapia or bass — can now seek and eat pellets to satisfy hunger, addressing the gap where the only "feeding" action (the Fish Feed buff) grew fish without ever reducing hunger
- Growth is now decoupled from raw meal count: each meal only grants partial growth progress (`GROWTH_PER_MEAL`), and the thresholds to reach medium/large were raised, so fish need roughly 12 and 30 meals respectively instead of 3 and 7 — no more growing a full stage from a couple of feedings
- Fish Feed buff's passive growth rate cut 10× (0.5 → 0.05 progress/sec) so it acts as a minor boost rather than an instant-grow button, and it still does not reduce hunger — pellets/algae/prey are the only way to do that
- Hunger rate more than halved (1.2 → 0.5 points/sec), so fish take roughly a minute to go from fed to hungry and about three minutes total before starving to death
- Click priority is now: remove dead fish → sell a living fish (click directly on it) → otherwise drop a pellet at the click position

## 0.2.0 — 2026-08-10

### Changed — Farm mechanic overhaul

- Replaced the feed-and-collect-coins loop with a farm management sim: algae spawns automatically in the tank, tilapia eat algae, and money comes from selling grown fish
- Removed manual food dropping, coins, and the old food-quality/max-pellets upgrades
- Removed `guppy`, `goldfish`, `angelfish` species; added `tilapia` (herbivore, eats algae) and `bass` (predator, hunts fish smaller than itself when hungry)
- Bass gains growth from eating smaller fish, just like tilapia gain growth from eating algae
- Added **Fertilizer** ($30, 60s) — timed buff that speeds up algae spawning 2.5×
- Added **Fish Feed** ($40, 45s) — timed buff that grants all living fish passive growth over time
- Click a living fish to sell it for money based on species and growth stage; click a dead fish to remove it
- Save format bumped to `fish-tank-save-v2`; old saves are ignored and a fresh game starts with 1 tilapia and $100
- HUD now shows fish counts by species and active buff timers instead of pellet count and feed hints
- Shop now sells tilapia/bass and the two buffs instead of the old species and upgrades

## 0.1.7 — 2026-08-10

### Added

- Shop panel is now collapsible via a toggle header (Shop ▾ / Shop ▸) to reduce on-screen clutter
- Debug `+$100` button in the HUD for testing purchases without running out of money

## 0.1.6 — 2026-08-10

### Fixed

- UI overlay no longer blocks most of the tank: HUD and Shop now positioned in top-left corner with compact, minimal design
- Reduced padding, margins, and font sizes throughout UI panels
- Mobile-optimized UI: hint text hidden on small screens, all text truncated appropriately
- Shop panel now fits neatly in corner instead of expanding across screen

## 0.1.5 — 2026-08-10

### Fixed

- Fish now face the correct direction while swimming: sprite flip reversed so fish face direction of movement
- Fish no longer spasm at tank edges: replaced hard velocity reversal with smooth damping and soft steering to encourage swimming away from boundaries
- Wander behavior now includes soft repulsion zone (80px from edges) that gently nudges fish back toward center without erratic oscillation

### Improved

- UI now responsive and mobile-friendly: flex layout stacks vertically on small screens and side-by-side on larger screens (900px+)
- Reduced padding and fonts on mobile to prevent UI cutoff; scales up smoothly on desktop
- HUD and Shop panels now properly aligned with tank on all screen sizes

## 0.1.4 — 2026-08-10

### Fixed

- Shop buy buttons no longer fail to register clicks: the shop panel is no longer rebuilt every frame (which destroyed button elements before mouse-up could complete a click)
- UI overlay given `z-index: 1` so shop buttons reliably sit above the Phaser canvas

## 0.1.3 — 2026-08-10

### Fixed

- Tank canvas no longer overflows the browser window: `#stage` wrapper constrains size, UI overlay anchors to the tank, and Phaser `expandParent: false` prevents scale feedback loop
- Fish are ~1.8× larger on a 176×128 texture canvas so they are clearly visible in the tank
- Dead fish sink to the sand instead of floating behind the HUD panel
- Saves with no fish and insufficient money to buy one now restore the starter goldfish

### Changed

- Hunger rate slowed from 4 to 1.2 points/second (~75s before starvation death)
- Meal satisfaction increased from 35 to 45; pellet eat radius 18 → 26
- Fish boundary margin increased from 30 to 55 to keep fish away from HUD edges

## 0.1.2 — 2026-08-10

### Added

- Richer fish models with improved silhouettes, shading, and species-specific visual identity
- Animated tail-swish effect (4 frames) that drives from simulation's swimPhase
- Hunger and death states now apply sprite tints instead of baking into textures, preserving species colors

### Fixed

- Fish texture clipping bug: drawings now centered on larger canvas (112x80) so full bodies including tails render correctly
- Reduced texture set from 54 to 36 while gaining animation, improving performance and memory
- Hunger state no longer overwrites species identity; hungry/starving fish retain their species colors with tint overlay

## 0.1.1 — 2026-08-10

### Added

- `launch.bat` — double-click quick launcher for Windows
- `npm run start` — starts dev server and opens the game in your browser
- `vite.config.ts` — enables auto-open on dev server start

## 0.1.0 — 2026-08-10

### Added

- Phaser 4 + TypeScript + Vite project scaffold
- Pure TypeScript simulation layer (fish, food, coins, economy)
- Procedural fish textures (goldfish, angelfish, guppy) with growth and hunger variants
- Tank scene with wander/seek AI, feeding, hunger, starvation, death
- Coin drops, click-to-collect, money HUD
- Shop: buy fish, food quality upgrade, max pellets upgrade
- Fish growth stages (small → medium → large)
- localStorage autosave every 10 seconds
- Bubble particles, eat/coin visual effects
- Synthetic beep sounds via Web Audio API
