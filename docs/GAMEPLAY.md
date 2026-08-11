# Gameplay

## Goal

Manage a fish farm: feed your fish (manually with pellets, or let tilapia graze on algae), keep bass fed so they don't turn to hunting, grow your fish slowly over many meals, and sell them for money to expand your tank.

## Controls

| Action | How |
|--------|-----|
| Feed fish | Click open water to drop a pellet ($5) — any fish can eat it |
| Sell a fish | Click directly on a living fish |
| Remove dead fish | Click a dead fish on the sand |
| Shop | Use buttons in the top-right panel |

## Feeding

There are three ways a fish satisfies hunger, all equally effective:

- **Pellets** — click open water to drop one ($5, up to 8 on screen at once). Any fish (tilapia or bass) will seek and eat the nearest pellet before falling back to their species-specific food.
- **Algae** — spawns automatically in the tank every 3 seconds (up to 15 at a time) and despawns after 20 seconds if uneaten. Only tilapia eat algae. **Fertilizer** (see Shop) speeds up spawning by 2.5× for its duration.
- **Prey** — bass hunt and eat the nearest fish smaller than themselves (any species, including other bass) if no pellet or prey is closer. Feed your bass pellets to keep it from hunting your other fish.

Hunger increases at 0.5 points/second — fish take roughly a minute to go from fed to hungry, and about three minutes total before starving to death, so there's no need to feed constantly.

Eating anything (pellet, algae, or prey) reduces hunger by 45 points and counts as one meal toward growth.

## Fish behavior

- **Tilapia** — herbivore. When hungry, seeks the nearest pellet, then algae, within 150px.
- **Bass** — predator. When hungry, seeks the nearest pellet, then the nearest smaller fish, within 180px (150px for pellets), and eats it on contact. A small bass cannot eat anything; a fish of equal or larger size is always safe.
- **Dead** — fish that starve sink to the sand; click to remove them.

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

## Starting state

- $100 starting money
- 1 tilapia

## Balance constants

All numbers live in [src/sim/balance.ts](../src/sim/balance.ts).
