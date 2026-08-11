# Gameplay

## Goal

Manage a fish farm: feed your fish (manually with pellets, or let tilapia graze on algae), keep bass fed so they don't turn to hunting, grow your fish slowly over many meals, and sell them for money to expand your tank.

## Controls

| Action | How |
|--------|-----|
| Feed fish | Click open water to drop a pellet ($5) — any fish can eat it |
| Fast forward | Toggle **Fast Forward** in the top-left HUD panel (4× simulation speed) |
| Sell a fish | Click directly on a living fish |
| Remove dead fish | Click a dead fish on the sand |
| Shop | Use buttons in the top-right panel |

## Feeding

There are three ways a fish satisfies hunger, all equally effective:

- **Pellets** — click open water to drop one ($5, up to 8 on screen at once). Any fish (tilapia or bass) will seek and eat the nearest pellet before falling back to their species-specific food.
- **Algae** — spawns automatically in the tank every 3 seconds (up to 15 at a time) and persists until a tilapia eats it. **Fertilizer** (see Shop) speeds up spawning by 2.5× for its duration.
- **Prey** — bass hunt and eat the nearest fish smaller than themselves (any species, including other bass) if no pellet or prey is closer. Feed your bass pellets to keep it from hunting your other fish.

Hunger increases at 0.5 points/second — fish take roughly a minute to go from fed to hungry, and about three minutes total before starving to death, so there's no need to feed constantly.

Eating anything (pellet, algae, or prey) reduces hunger by 45 points and counts as one meal toward growth.

## Fish behavior

- **Tilapia** — herbivore. When hungry, seeks the nearest pellet, then algae. A fed fish only notices food within 150px, but the search range grows the hungrier a fish gets: **hungry** fish search 2.5× further (375px), and **starving** fish search the entire tank so they always find food if any exists.
- **Bass** — predator. When hungry, seeks the nearest pellet, then the nearest smaller fish, and eats it on contact. Base range is 180px for prey (150px for pellets), scaled by hunger the same way as tilapia. A small bass cannot eat anything; a fish of equal or larger size is always safe. Starving fish also swim toward food 1.8× more urgently.
- **Predator avoidance** — any fish smaller than a nearby bass will notice it within 120px and dart away. Very close encounters (within 60px) override eating/wandering entirely until the fish is safely clear; at longer range the fish still drifts away from the bass while continuing to eat or cruise.
- **Hunger and speed** — fed fish cruise at normal speed, hungry fish swim 1.25× faster, and starving fish swim 1.5× faster, so a fish's urgency is visible at a glance. Fleeing a predator gives a similar (1.3×) burst of speed; these boosts don't add together, so a fish is never faster than the single largest boost that applies.
- **Idle swimming** — fed fish cruise along smooth, sweeping paths rather than picking new random destinations on every arrival; they favor continuing in roughly their current direction instead of doubling back.
- **Dead** — fish that starve sink to the sand; click to remove them.

## Reproduction

Two grown, well-fed fish of the **same species** that swim close together will breed automatically:

- Both fish must be at least **medium** growth stage
- Both fish must have hunger at or below 50 (roughly "fed" or just past it)
- Both fish must be off their breeding cooldown (30s after each breeding)
- They must be within 60px of each other

When a pair breeds, a new **small** fish of that species appears at their midpoint, and both parents get a 30-second cooldown before they can breed again. The tank is capped at **20 total fish** — breeding pauses once the cap is reached (selling or losing fish makes room again).

Bass can and will eat newborn small fish just like any other prey, so an unfed bass population naturally limits how many babies survive.

## Growth

Growth is deliberately slow and decoupled from raw meal count — each meal only adds partial growth progress, so a fish needs many feeding cycles to visibly grow, not just one.

| Stage | Growth progress required | Approx. meals needed |
|-------|---------------------------|-----------------------|
| Small | 0 | 0 |
| Medium | 6 | ~12 |
| Large | 15 | ~30 |

## Selling fish

Click a living fish to sell it immediately for money based on species and growth stage:

| Species | Small | Medium | Large |
|---------|-------|--------|-------|
| Tilapia | $10 | $30 | $75 |
| Bass | $20 | $50 | $120 |

## Species prices (Shop)

| Species | Price |
|---------|-------|
| Tilapia | $15 |
| Bass | $40 |

## Buffs (Shop)

| Buff | Cost | Duration | Effect |
|------|------|----------|--------|
| Fertilizer | $30 | 60s | Algae spawns 2.5× faster |
| Fish feed | $40 | 45s | All living fish gain a small amount of passive growth over time (a boost, not a substitute for feeding — it does not reduce hunger) |

Buying a buff while one is already active refreshes its remaining duration.

## Population cap

The tank holds at most **20 fish** at once (`MAX_FISH`). Breeding stops producing new fish once this cap is hit.

## Starting state

- $100 starting money
- 1 tilapia

## Balance constants

All numbers live in [src/sim/balance.ts](../src/sim/balance.ts).
