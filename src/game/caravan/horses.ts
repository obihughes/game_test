import { tierConfig } from './cartTiers.ts'

export const HORSE_COST = 85
export const MAX_HORSES = 4

/** Each horse shaves one day off travel, minimum one day. */
export function travelDaysFor(baseDays: number, horses: number): number {
  return Math.max(1, baseDays - horses)
}

/** Extra cargo capacity from horses pulling the wagon. */
export function capacityBonusFromHorses(horses: number): number {
  return horses * 12
}

export function maxHorsesForCart(cartTier: number): number {
  const cap = tierConfig(cartTier).capacity
  return cap >= 160 ? MAX_HORSES : Math.min(3, MAX_HORSES)
}