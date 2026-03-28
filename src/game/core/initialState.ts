import type { GameState } from './types.ts'

export const SAVE_VERSION = 6

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    gold: 420,
    day: 1,
    location: 'ashenford',
    inventory: {},
    inventoryCostBasis: {},
    tradeGoldSpent: 0,
    tradeGoldEarned: 0,
    caravan: {
      cartTier: 0,
      horses: 0,
      hires: { guard: 0, scout: 0 },
    },
    questFlags: {},
    activeQuestId: 'intro_travel',
    townWarehouses: {},
  }
}