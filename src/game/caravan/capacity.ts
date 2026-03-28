import type { GameState, GoodId } from '../core/types.ts'
import { GOODS, goodWeight } from '../economy/goods.ts'
import { tierConfig } from './cartTiers.ts'
import { capacityBonusFromHorses } from './horses.ts'

export function cargoWeight(state: GameState): number {
  let w = 0
  for (const id of Object.keys(state.inventory)) {
    const goodId = id as GoodId
    const n = state.inventory[goodId] ?? 0
    if (n <= 0) continue
    w += goodWeight(GOODS[goodId]!) * n
  }
  return w
}

export function maxCargoWeight(state: GameState): number {
  const base = tierConfig(state.caravan.cartTier).capacity
  return base + capacityBonusFromHorses(state.caravan.horses)
}

export function spareCapacity(state: GameState): number {
  return Math.max(0, maxCargoWeight(state) - cargoWeight(state))
}