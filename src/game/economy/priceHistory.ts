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
  const startDay = Math.max(1, currentDay - lookback + 1)
  for (let day = startDay; day <= currentDay; day++) {
    const row = townMarketPriceRow(townId, goodId, day)
    if (row) {
      points.push({ day, buy: row.buy, sell: row.sell })
    }
  }
  return points
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface VisitPriceComparison {
  currentPrice: number
  previousPrice: number
  percentChange: number
  direction: TrendDirection
}

export function getVisitPriceComparison(
  townId: TownId,
  goodId: GoodId,
  currentDay: number,
  previousVisitDay: number | undefined,
  priceKind: 'buy' | 'sell',
): VisitPriceComparison | null {
  if (!previousVisitDay || previousVisitDay < 1 || previousVisitDay >= currentDay) return null

  const currentRow = townMarketPriceRow(townId, goodId, currentDay)
  const previousRow = townMarketPriceRow(townId, goodId, previousVisitDay)
  const currentPrice = currentRow?.[priceKind] ?? 0
  const previousPrice = previousRow?.[priceKind] ?? 0
  if (currentPrice <= 0 || previousPrice <= 0) return null

  const rawPercentChange = ((currentPrice - previousPrice) / previousPrice) * 100
  const percentChange = Math.round(rawPercentChange * 10) / 10
  const direction: TrendDirection =
    currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'flat'

  return {
    currentPrice,
    previousPrice,
    percentChange,
    direction,
  }
}

export function trendArrow(dir: TrendDirection): string {
  if (dir === 'up') return '↑'
  if (dir === 'down') return '↓'
  return '→'
}
