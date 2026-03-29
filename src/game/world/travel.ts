import type { GameResult, GameState } from '../core/types.ts'
import type { Route } from './routes.ts'
import { travelDaysFor } from '../caravan/horses.ts'
import { findTravelPath } from './routes.ts'
import { getSeasonTravelPenalty } from './seasons.ts'
import { hasActiveBuff, pruneCaravanBuffs } from '../inventory/useItem.ts'

/** Guard: toll reduced ~35%. Scout: one extra day shaved after horse math (min 1 day). Winter adds +1 day. */
export function computeTravelLeg(state: GameState, route: Route): { days: number; toll: number } {
  let days = travelDaysFor(route.baseDays, state.caravan.horses)
  if ((state.caravan.hires.scout ?? 0) > 0) {
    days = Math.max(1, days - 1)
  }
  if (hasActiveBuff(state, 'well_fed')) {
    days = Math.max(1, days - 1)
  }
  if (hasActiveBuff(state, 'insight')) {
    days = Math.max(1, days - 1)
  }
  days += getSeasonTravelPenalty(state.day)
  let toll = route.toll
  if ((state.caravan.hires.guard ?? 0) > 0) {
    toll = Math.floor(toll * 0.65)
    if (hasActiveBuff(state, 'high_morale')) {
      toll = Math.floor(toll * 0.85)
    }
  }
  return { days, toll }
}

export interface TravelPlan {
  routes: Route[]
  days: number
  toll: number
}

export function computeTravelPlan(state: GameState, destination: string): TravelPlan | null {
  const routes = findTravelPath(state.location, destination)
  if (!routes) return null

  let next = state
  let days = 0
  let toll = 0

  for (const route of routes) {
    const leg = computeTravelLeg(next, route)
    days += leg.days
    toll += leg.toll
    next = {
      ...next,
      location: route.to,
      day: next.day + leg.days,
      gold: next.gold - leg.toll,
    }
  }

  return { routes, days, toll }
}

export function applyTravelPlan(state: GameState, plan: TravelPlan): GameResult {
  let next = state

  for (const route of plan.routes) {
    const { days, toll } = computeTravelLeg(next, route)
    if (next.gold < toll) {
      return { ok: false, reason: 'Not enough gold for tolls and provisions.' }
    }

    next = {
      ...next,
      location: route.to,
      day: next.day + days,
      gold: next.gold - toll,
    }
  }

  return { ok: true, state: pruneCaravanBuffs(next) }
}

export function applyTravel(state: GameState, destination: string): GameResult {
  const plan = computeTravelPlan(state, destination)
  if (!plan) {
    return { ok: false, reason: 'No route to that town.' }
  }
  return applyTravelPlan(state, plan)
}