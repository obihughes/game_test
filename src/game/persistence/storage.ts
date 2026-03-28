import { createInitialState, SAVE_VERSION, type GameState } from '../core/index.ts'

export function migrateState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') {
    return createInitialState()
  }
  const o = raw as Record<string, unknown>
  const version = typeof o.version === 'number' ? o.version : 0
  if (version !== SAVE_VERSION) {
    return createInitialState()
  }
  return o as unknown as GameState
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