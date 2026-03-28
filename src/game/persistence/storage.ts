import { createInitialState, SAVE_VERSION, type GameState } from '../core/index.ts'

export function migrateState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') {
    return createInitialState()
  }
  const o = raw as Record<string, unknown>
  const version = typeof o.version === 'number' ? o.version : 0
  if (version < 1 || version > SAVE_VERSION) {
    return createInitialState()
  }
  let g = o as unknown as GameState & { activeMerchantId?: string }
  if (g.version < 6) {
    const { activeMerchantId: _legacyActiveMerchantId, ...rest } = g
    g = { ...rest, version: SAVE_VERSION }
  }
  if (!g.inventoryCostBasis || typeof g.inventoryCostBasis !== 'object') {
    g = { ...g, inventoryCostBasis: {}, version: SAVE_VERSION }
  }
  if (typeof g.tradeGoldSpent !== 'number') {
    g = { ...g, tradeGoldSpent: 0, version: SAVE_VERSION }
  }
  if (typeof g.tradeGoldEarned !== 'number') {
    g = { ...g, tradeGoldEarned: 0, version: SAVE_VERSION }
  }
  return g
}

export function serializeState(state: GameState): string {
  return JSON.stringify(state)
}

export function parseState(json: string): GameState {
  try {
    const data: unknown = JSON.parse(json)
    return migrateState(data)
  } catch {
    return createInitialState()
  }
}
