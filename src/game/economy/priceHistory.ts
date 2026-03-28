import { townMarketPriceRow } from './merchants.ts'
import type { GoodId, TownId } from '../core/types.ts'

export interface PricePoint {
  day: number
  buy: number
  sell: number
}

/**
 * Returns price history for a good at a town market over the last `lookback` days.
 * Fully deterministic — no stored state needed.
 */
export function getPriceTrend(
  townId: TownId,
  goodId: GoodId,
  currentDay: number,
  lookback = 7,
): PricePoint[] {
  const points: PricePoint[] = []
  for (let i = lookback - 1; i >= 0; i--) {
    const day = Math.max(1, currentDay - i)
    const row = townMarketPriceRow(townId, goodId, day)
    if (row) {
      points.push({ day, buy: row.buy, sell: row.sell })
    }
  }
  return points
}

export type TrendDirection = 'up' | 'down' | 'flat'

/**
 * Compares today's buy price to the 5-day average to determine trend direction.
 */
export function getPriceTrendDirection(
  townId: TownId,
  goodId: GoodId,
  currentDay: number,
): TrendDirection {
  const history = getPriceTrend(townId, goodId, currentDay, 6)
  if (history.length < 2) return 'flat'
  const today = history[history.length - 1]!.buy
  const past = history.slice(0, -1)
  const avg = past.reduce((sum, p) => sum + p.buy, 0) / past.length
  const diff = today - avg
  const threshold = avg * 0.04
  if (diff > threshold) return 'up'
  if (diff < -threshold) return 'down'
  return 'flat'
}

export function trendArrow(dir: TrendDirection): string {
  if (dir === 'up') return '↑'
  if (dir === 'down') return '↓'
  return '→'
}
