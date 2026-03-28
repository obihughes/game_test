import type { GoodId } from '../core/types.ts'
import { getSeasonPriceMultiplier } from '../world/seasons.ts'

/** Buy/sell crowns per unit at a merchant who lists this good. */
export interface PriceRow {
  buy: number
  sell: number
}

/** @deprecated Use merchant catalogs in merchants.ts */
export type TownPriceTable = Record<GoodId, PriceRow>

function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261
  for (const p of parts) {
    const s = String(p)
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
  }
  return h >>> 0
}

/**
 * Deterministic daily variance (~±15% of base) plus season modifier.
 * Same inputs always yield same price.
 */
export function getEffectivePrice(
  basePrice: number,
  day: number,
  merchantId: string,
  goodId: string,
  which: 'buy' | 'sell',
): number {
  if (basePrice <= 0) return 0
  const seed = hashSeed(day, merchantId, goodId, which)
  const r = (seed % 10001) / 10000
  const dailyMult = 0.85 + r * 0.3
  const seasonMult = getSeasonPriceMultiplier(goodId, day)
  return Math.max(1, Math.round(basePrice * dailyMult * seasonMult))
}
