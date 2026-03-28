import type { GoodId } from '../core/types.ts'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

const SEASON_NAMES: Season[] = ['spring', 'summer', 'autumn', 'winter']
const DAYS_PER_SEASON = 28

export function getSeason(day: number): Season {
  const idx = Math.floor((day - 1) / DAYS_PER_SEASON) % 4
  return SEASON_NAMES[idx]!
}

export function getSeasonLabel(day: number): string {
  const s = getSeason(day)
  const labels: Record<Season, string> = {
    spring: '🌱 Spring',
    summer: '☀️ Summer',
    autumn: '🍂 Autumn',
    winter: '❄️ Winter',
  }
  return labels[s]
}

/**
 * Returns a price multiplier for a good based on the current season.
 * 1.0 = no change; >1 = more expensive; <1 = cheaper.
 */
export function getSeasonPriceMultiplier(goodId: GoodId, day: number): number {
  const season = getSeason(day)
  const modifiers: Partial<Record<GoodId, Partial<Record<Season, number>>>> = {
    fish:         { summer: 0.80, winter: 1.25 },
    peat:         { winter: 1.40, summer: 0.75 },
    herbs:        { spring: 0.85, winter: 1.35 },
    wine:         { autumn: 0.85, winter: 1.20 },
    fen_spice:    { autumn: 0.90, winter: 1.30 },
    dreaming_moss:{ spring: 0.85, winter: 1.20 },
    salt:         { winter: 1.15 },
    rope:         { spring: 1.10, autumn: 0.90 },
    grain:        { autumn: 0.80, spring: 1.15 },
  }
  return modifiers[goodId]?.[season] ?? 1.0
}

/**
 * Extra travel days added by season. Winter roads are harder.
 */
export function getSeasonTravelPenalty(day: number): number {
  return getSeason(day) === 'winter' ? 1 : 0
}

/**
 * Returns a human-readable modifier label for a good in the current season,
 * or null if there is no modifier.
 */
export function getSeasonModifierLabel(goodId: GoodId, day: number): string | null {
  const mult = getSeasonPriceMultiplier(goodId, day)
  if (mult === 1.0) return null
  const season = getSeason(day)
  const seasonName = season.charAt(0).toUpperCase() + season.slice(1)
  const pct = Math.round(Math.abs(mult - 1) * 100)
  return mult > 1 ? `+${pct}% ${seasonName}` : `-${pct}% ${seasonName}`
}
