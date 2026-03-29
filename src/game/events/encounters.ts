import type { GameState, TravelEncounter, TownId } from '../core/types.ts'
import type { Route } from '../world/routes.ts'
import { GOOD_IDS, GOODS } from '../economy/goods.ts'
import { hasActiveBuff } from '../inventory/useItem.ts'

export interface EncounterDef {
  id: string
  /** Roads this encounter can appear on. If empty, can appear on any road. */
  routes?: Array<{ from: TownId; to: TownId }>
  /** Weight relative to other encounters (higher = more common). */
  weight: number
  /** Resolve the encounter: return updated state and display text. */
  resolve: (state: GameState, route: Route, seed: number) => ResolvedEncounter
}

export interface ResolvedEncounter {
  state: GameState
  encounter: TravelEncounter
}

/** Seeded pseudo-random number in [0, 1). */
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

/** Pick a random cargo good the player is carrying, seeded. Returns null if no cargo. */
function pickCargoGood(state: GameState, seed: number): string | null {
  const carried = GOOD_IDS.filter((id) => (state.inventory[id] ?? 0) > 0)
  if (carried.length === 0) return null
  const idx = Math.floor(seededRand(seed * 7) * carried.length)
  return carried[idx] ?? null
}

function removeCargoWithCostBasis(state: GameState, goodId: string, qty: number): Pick<
  GameState,
  'inventory' | 'inventoryCostBasis'
> {
  const have = state.inventory[goodId] ?? 0
  const basis = state.inventoryCostBasis[goodId] ?? 0
  const nextQty = Math.max(0, have - qty)
  const consumedBasis = have > 0 ? (basis * Math.min(qty, have)) / have : 0
  const inventory = { ...state.inventory, [goodId]: nextQty }
  const inventoryCostBasis = { ...state.inventoryCostBasis }
  if (nextQty <= 0) delete inventory[goodId]
  const remainingBasis = basis - consumedBasis
  if (nextQty <= 0 || remainingBasis <= 0) delete inventoryCostBasis[goodId]
  else inventoryCostBasis[goodId] = remainingBasis
  return { inventory, inventoryCostBasis }
}

const ENCOUNTER_DEFS: EncounterDef[] = [
  {
    id: 'road_merchant_offer',
    weight: 3,
    resolve(state, _route, seed) {
      const goodId = pickCargoGood(state, seed)
      if (!goodId || (state.inventory[goodId] ?? 0) <= 0) {
        return emptyRoadsEncounter(state, seed)
      }
      const good = GOODS[goodId]!
      const bonus = Math.floor(seededRand(seed * 3) * 6) + 4
      const newGold = state.gold + bonus
      const consumed = removeCargoWithCostBasis(state, goodId, 1)
      return {
        state: { ...state, gold: newGold, inventory: consumed.inventory, inventoryCostBasis: consumed.inventoryCostBasis },
        encounter: {
          id: 'road_merchant_offer',
          text: `A travelling merchant spots your wagon and offers a fair price for a unit of ${good.name}. You accept — coin in hand is better than a distant market.`,
          effectText: `Sold 1× ${good.name} for +${bonus}g`,
        },
      }
    },
  },
  {
    id: 'bandit_toll',
    weight: 2,
    resolve(state, _route, seed) {
      const toll = Math.floor(seededRand(seed * 11) * 8) + 3
      if (state.gold < toll) {
        return {
          state,
          encounter: {
            id: 'bandit_toll',
            text: "A pair of masked figures step onto the road, but your guard's hand moves to his blade. They think better of it and melt back into the trees.",
            effectText: 'Guard deterred the bandits.',
          },
        }
      }
      const newGold = Math.max(0, state.gold - toll)
      return {
        state: { ...state, gold: newGold },
        encounter: {
          id: 'bandit_toll',
          text: `Masked figures block the road. They demand ${toll}g to let you pass. You pay — arguing with drawn blades is bad for business.`,
          effectText: `-${toll}g road tax`,
        },
      }
    },
  },
  {
    id: 'shortcut_found',
    weight: 2,
    resolve(state, _route, _seed) {
      return {
        state,
        encounter: {
          id: 'shortcut_found',
          text: "A local farmer waves you down and points to a narrow track through the fields. 'Cuts a half-day off the road,' he says. You take it.",
          effectText: 'Found a shortcut — saved time on the road.',
        },
      }
    },
  },
  {
    id: 'trader_rumour',
    weight: 4,
    resolve(state, route, seed) {
      const demandGoods = ['silk', 'wine', 'dreaming_moss', 'fish_sauce', 'crown_amber', 'fen_spice', 'polished_amber', 'seasoned_spice']
      const idx = Math.floor(seededRand(seed * 13) * demandGoods.length)
      const goodId = demandGoods[idx] ?? 'silk'
      const good = GOODS[goodId]
      const goodName = good?.name ?? goodId
      return {
        state,
        encounter: {
          id: 'trader_rumour',
          text: `A merchant heading the other way leans from his wagon: "Word is ${route.to} is paying over the odds for ${goodName} this season. Shortage, they say."`,
          effectText: `Rumour: high demand for ${goodName} in ${route.to}.`,
        },
      }
    },
  },
  {
    id: 'broken_wheel',
    weight: 1,
    resolve(state, _route, seed) {
      const cost = Math.floor(seededRand(seed * 17) * 10) + 5
      if (state.gold < cost) {
        return {
          state,
          encounter: {
            id: 'broken_wheel',
            text: 'A wheel spoke cracks on a rut. You limp to the next waypost and patch it yourself with rope and curses. It holds.',
            effectText: 'Wheel patched — no gold cost.',
          },
        }
      }
      return {
        state: { ...state, gold: state.gold - cost },
        encounter: {
          id: 'broken_wheel',
          text: `A wheel spoke cracks on a hidden rut. A roadside smith fixes it for ${cost}g — cheaper than losing the load.`,
          effectText: `-${cost}g wheel repair`,
        },
      }
    },
  },
  {
    id: 'mountain_pass_cold',
    weight: 3,
    routes: [
      { from: 'ashenford', to: 'stoneholt' },
      { from: 'stoneholt', to: 'ashenford' },
    ],
    resolve(state, _route, _seed) {
      return {
        state,
        encounter: {
          id: 'mountain_pass_cold',
          text: 'The pass narrows to a cut in the rock. Wind screams through the gap and your horses lean into it. By the time you reach the other side, everyone is silent and cold.',
        },
      }
    },
  },
  {
    id: 'river_mist',
    weight: 3,
    routes: [
      { from: 'riversend', to: 'fenward' },
      { from: 'fenward', to: 'riversend' },
      { from: 'riversend', to: 'mirecross' },
      { from: 'mirecross', to: 'riversend' },
    ],
    resolve(state, _route, _seed) {
      return {
        state,
        encounter: {
          id: 'river_mist',
          text: 'A thick river mist rolls in at dawn. You travel by sound — the creak of the wagon, the lap of water — until the sun burns it off by midday.',
        },
      }
    },
  },
  {
    id: 'salt_flat_wind',
    weight: 3,
    routes: [
      { from: 'riversend', to: 'saltmere' },
      { from: 'saltmere', to: 'riversend' },
    ],
    resolve(state, _route, _seed) {
      return {
        state,
        encounter: {
          id: 'salt_flat_wind',
          text: 'The salt flats stretch flat as a table. The wind off the coast is relentless — it stings the eyes and coats everything in a fine white grit. The horses hate it.',
        },
      }
    },
  },
  {
    id: 'pilgrim_camp',
    weight: 2,
    resolve(state, _route, seed) {
      const bonus = Math.floor(seededRand(seed * 19) * 4) + 2
      return {
        state: { ...state, gold: state.gold + bonus },
        encounter: {
          id: 'pilgrim_camp',
          text: `A pilgrim camp is set up beside the road. They share their fire and press a few coins into your hand for news from the last town. You oblige.`,
          effectText: `+${bonus}g from pilgrims`,
        },
      }
    },
  },
  {
    id: 'abandoned_cart',
    weight: 1,
    resolve(state, _route, seed) {
      const goods = ['rope', 'grain', 'peat', 'herbs', 'salt']
      const idx = Math.floor(seededRand(seed * 23) * goods.length)
      const goodId = goods[idx] ?? 'rope'
      const good = GOODS[goodId]!
      const qty = Math.floor(seededRand(seed * 29) * 2) + 1
      const newInv = { ...state.inventory, [goodId]: (state.inventory[goodId] ?? 0) + qty }
      return {
        state: {
          ...state,
          inventory: newInv,
          inventoryCostBasis: { ...state.inventoryCostBasis, [goodId]: state.inventoryCostBasis[goodId] ?? 0 },
        },
        encounter: {
          id: 'abandoned_cart',
          text: `An abandoned cart sits half in the ditch, wheel broken, owner long gone. You load what's salvageable — ${qty}× ${good.name} — and move on.`,
          effectText: `Found +${qty}× ${good.name}`,
        },
      }
    },
  },
  {
    id: 'crown_inspector',
    weight: 2,
    routes: [
      { from: 'ashenford', to: 'crownpost' },
      { from: 'crownpost', to: 'ashenford' },
      { from: 'crownpost', to: 'riversend' },
      { from: 'riversend', to: 'crownpost' },
    ],
    resolve(state, _route, seed) {
      const fee = Math.floor(seededRand(seed * 31) * 6) + 4
      if (state.gold < fee) {
        return {
          state,
          encounter: {
            id: 'crown_inspector',
            text: "A crown inspector waves you down and checks your manifest. He finds nothing irregular and waves you through with a curt nod.",
          },
        }
      }
      return {
        state: { ...state, gold: state.gold - fee },
        encounter: {
          id: 'crown_inspector',
          text: `A crown inspector flags you down and levies a ${fee}g duty on your cargo. You pay without argument — the crown road is the crown's road.`,
          effectText: `-${fee}g crown duty`,
        },
      }
    },
  },
]

const COSTLY_ENCOUNTERS = new Set(['bandit_toll', 'broken_wheel', 'crown_inspector'])

function emptyRoadsEncounter(state: GameState, seed: number): ResolvedEncounter {
  const lines = [
    'The road is quiet today — just the creak of the wagon and the sound of hooves on packed earth.',
    'You pass a milestone marker half-buried in the verge. Someone has scratched a crude map into the stone.',
    'A hawk circles overhead for a mile, then veers off toward the hills. Good omen or bad, the road ahead looks clear.',
    'The road narrows through a stand of old oaks. Sunlight comes through in shafts. For a moment, the journey feels easy.',
  ]
  const idx = Math.floor(seededRand(seed * 37) * lines.length)
  return {
    state,
    encounter: {
      id: 'empty_roads',
      text: lines[idx] ?? lines[0]!,
    },
  }
}

/** Roll whether an encounter happens on a given leg, and which one. Returns null if no encounter. */
export function rollEncounter(state: GameState, route: Route): ResolvedEncounter | null {
  // Deterministic seed from day + route so reloading gives same result
  const seed = state.day * 1000 + route.from.charCodeAt(0) * 100 + route.to.charCodeAt(0)
  const roll = seededRand(seed)
  const alertness = hasActiveBuff(state, 'alertness')
  const insight = hasActiveBuff(state, 'insight')
  const encounterChance = insight ? 0.18 : alertness ? 0.28 : 0.4

  // ~40% chance of an encounter per leg
  if (roll > encounterChance) return null

  // Filter eligible encounters for this route
  const eligible = ENCOUNTER_DEFS.filter((def) => {
    if (!def.routes || def.routes.length === 0) return true
    return def.routes.some((r) => r.from === route.from && r.to === route.to)
  })

  // Weighted random selection
  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0)
  let pick = seededRand(seed * 3) * totalWeight
  for (const def of eligible) {
    pick -= def.weight
    if (pick <= 0) {
      if ((alertness || insight) && COSTLY_ENCOUNTERS.has(def.id)) {
        const avoidRoll = seededRand(seed * 5)
        const avoidChance = insight ? 0.8 : 0.55
        if (avoidRoll <= avoidChance) return null
      }
      return def.resolve(state, route, seed)
    }
  }
  return eligible[0]?.resolve(state, route, seed) ?? null
}
