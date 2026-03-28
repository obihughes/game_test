import type { GameState } from './types.ts'

export const SAVE_VERSION = 1

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    gold: 120,
    day: 1,
    location: 'ashenford',
    inventory: {},
    caravan: {
      cartTier: 0,
      horses: 0,
      hires: { guard: 0, scout: 0 },
    },
    questFlags: {},
    activeQuestId: 'intro_travel',
  }
}