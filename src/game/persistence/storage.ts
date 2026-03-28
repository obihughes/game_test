import { createInitialState, SAVE_VERSION, type GameState } from '../core/index.ts'
import { defaultMerchantIdForTown, isMerchantAtTown } from '../economy/merchants.ts'

export function migrateState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') {
    return createInitialState()
  }
  const o = raw as Record<string, unknown>
  const version = typeof o.version === 'number' ? o.version : 0
  if (version < 1 || version > SAVE_VERSION) {
    return createInitialState()
  }
  let g = o as unknown as GameState
  if (
    g.version < 2 ||
    !g.activeMerchantId ||
    !isMerchantAtTown(g.location, g.activeMerchantId)
  ) {
    g = {
      ...g,
      version: SAVE_VERSION,
      activeMerchantId: defaultMerchantIdForTown(g.location),
    }
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
