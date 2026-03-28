import type { GameResult, GameState } from '../core/types.ts'
import type { Route } from './routes.ts'
import { travelDaysFor } from '../caravan/horses.ts'
import { findRoute } from './routes.ts'
import { getSeasonTravelPenalty } from './seasons.ts'

/** Guard: toll reduced ~35%. Scout: one extra day shaved after horse math (min 1 day). Winter adds +1 day. */
export function computeTravelLeg(state: GameState, route: Route): { days: number; toll: number } {
  let days = travelDaysFor(route.baseDays, state.caravan.horses)
  if ((state.caravan.hires.scout ?? 0) > 0) {
    days = Math.max(1, days - 1)
  }
  days += getSeasonTravelPenalty(state.day)
  let toll = route.toll
  if ((state.caravan.hires.guard ?? 0) > 0) {
    toll = Math.floor(toll * 0.65)
  }
  return { days, toll }
}

export function applyTravel(state: GameState, destination: string): GameResult {
  const route = findRoute(state.location, destination)
  if (!route) {
    return { ok: false, reason: 'No route to that town.' }
  }
  const { days, toll } = computeTravelLeg(state, route)
  if (state.gold < toll) {
    return { ok: false, reason: 'Not enough gold for tolls and provisions.' }
  }
  const next: GameState = {
    ...state,
    location: destination,
    day: state.day + days,
    gold: state.gold - toll,
  }
  return { ok: true, state: next }
}