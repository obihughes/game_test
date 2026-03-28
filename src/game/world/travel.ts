import type { GameResult, GameState } from '../core/types.ts'
import { travelDaysFor } from '../caravan/horses.ts'
import { findRoute } from './routes.ts'

export function applyTravel(state: GameState, destination: string): GameResult {
  const route = findRoute(state.location, destination)
  if (!route) {
    return { ok: false, reason: 'No route to that town.' }
  }
  if (state.gold < route.toll) {
    return { ok: false, reason: 'Not enough gold for tolls and provisions.' }
  }
  const days = travelDaysFor(route.baseDays, state.caravan.horses)
  const next: GameState = {
    ...state,
    location: destination,
    day: state.day + days,
    gold: state.gold - route.toll,
  }
  return { ok: true, state: next }
}