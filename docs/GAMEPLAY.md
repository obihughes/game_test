# Gameplay

## Goal

Manage a fish farm: let algae grow to feed your tilapia, keep bass fed so they don't starve, grow your fish, and sell them for money to expand your tank.

## Controls

| Action | How |
|--------|-----|
| Sell a fish | Click a living fish |
| Remove dead fish | Click a dead fish on the sand |
| Shop | Use buttons in the top-right panel |

## Algae

- Spawns automatically in the tank every 3 seconds (up to 15 at a time), no player action needed.
- Each algae despawns after 20 seconds if uneaten.
- **Fertilizer** (see Shop) speeds up spawning by 2.5× for its duration.

## Fish behavior

- **Tilapia** — herbivore. When hungry, seeks the nearest algae within 150px and eats it. When fed, wanders.
- **Bass** — predator. When hungry, hunts the nearest fish (of any species, including other bass) that is strictly smaller than itself, within 180px, and eats it on contact. A small bass cannot eat anything; a fish of equal or larger size is always safe.
- **Dead** — fish that starve sink to the sand; click to remove them.

Hunger increases at 1.2 points/second. Eating (algae for tilapia, prey for bass) reduces hunger by 45 and counts as a meal toward growth.

## Growth

Fish grow based on meals eaten (from algae, prey, or fish feed).

| Stage | Meals required |
|-------|----------------|
| Small | 0 |
| Medium | 3 |
| Large | 7 |

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
| Fish feed | $40 | 45s | All living fish gain passive growth over time |

Buying a buff while one is already active refreshes its remaining duration.

## Starting state

- $100 starting money
- 1 tilapia

## Balance constants

All numbers live in [src/sim/balance.ts](../src/sim/balance.ts).
