import type { GameResult, GameState, HireRole } from '../core/types.ts'
import { CART_TIERS } from './cartTiers.ts'
import { HORSE_COST, maxHorsesForCart } from './horses.ts'
import { HIRE_COST } from './hires.ts'

export function upgradeCart(state: GameState): GameResult {
  const nextTier = state.caravan.cartTier + 1
  if (nextTier >= CART_TIERS.length) {
    return { ok: false, reason: 'Cart is already fully upgraded.' }
  }
  const cost = CART_TIERS[nextTier]!.upgradeCost
  if (state.gold < cost) {
    return { ok: false, reason: 'Not enough gold for this wagon.' }
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - cost,
      caravan: { ...state.caravan, cartTier: nextTier },
    },
  }
}

export function buyHorse(state: GameState): GameResult {
  const cap = maxHorsesForCart(state.caravan.cartTier)
  if (state.caravan.horses >= cap) {
    return { ok: false, reason: 'Your wagon cannot support more horses yet.' }
  }
  if (state.gold < HORSE_COST) {
    return { ok: false, reason: 'Not enough gold for a horse.' }
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - HORSE_COST,
      caravan: { ...state.caravan, horses: state.caravan.horses + 1 },
    },
  }
}

export function hireRole(state: GameState, role: HireRole): GameResult {
  if (state.caravan.hires[role]! >= 1) {
    return { ok: false, reason: 'That role is already filled.' }
  }
  const cost = HIRE_COST[role]
  if (state.gold < cost) {
    return { ok: false, reason: 'Not enough gold to hire.' }
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - cost,
      caravan: {
        ...state.caravan,
        hires: { ...state.caravan.hires, [role]: 1 },
      },
    },
  }
}

export function dismissHire(state: GameState, role: HireRole): GameResult {
  if (state.caravan.hires[role]! <= 0) {
    return { ok: false, reason: 'Nobody to dismiss.' }
  }
  return {
    ok: true,
    state: {
      ...state,
      caravan: {
        ...state.caravan,
        hires: { ...state.caravan.hires, [role]: 0 },
      },
    },
  }
}

export function dailyHireCost(state: GameState): number {
  let c = 0
  if (state.caravan.hires.guard! > 0) c += 1
  if (state.caravan.hires.scout! > 0) c += 2
  return c
}

export function applyDailyUpkeep(state: GameState): GameState {
  const cost = dailyHireCost(state)
  if (cost <= 0) return state
  const gold = Math.max(0, state.gold - cost)
  return { ...state, gold }
}