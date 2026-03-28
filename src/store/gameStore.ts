import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createInitialState,
  SAVE_VERSION,
  type GameState,
  type GoodId,
  type HireRole,
  type MerchantId,
  type TownId,
} from '@/game/core/index.ts'
import { defaultMerchantIdForTown, isMerchantAtTown } from '@/game/economy/merchants.ts'
import { applyTravel } from '@/game/world/travel.ts'
import { findRoute } from '@/game/world/routes.ts'
import { travelDaysFor } from '@/game/caravan/horses.ts'
import { dailyHireCost, upgradeCart as upgradeCartAction, buyHorse, hireRole } from '@/game/caravan/actions.ts'
import { buyGood, sellGood } from '@/game/economy/buySell.ts'
import { applyQuestProgress } from '@/game/quests/questLogic.ts'
import { STORAGE_KEY } from '@/game/persistence/constants.ts'

export interface GameStore {
  game: GameState
  lastError: string | null
  travelTo: (destination: TownId) => void
  setActiveMerchant: (merchantId: MerchantId) => void
  buy: (goodId: GoodId, qty: number) => void
  sell: (goodId: GoodId, qty: number) => void
  upgradeCart: () => void
  purchaseHorse: () => void
  hire: (role: HireRole) => void
  clearError: () => void
  reset: () => void
}

function applyUpkeepForTravel(state: GameState, baseDays: number, horses: number): GameState {
  const days = travelDaysFor(baseDays, horses)
  const rate = dailyHireCost(state)
  if (rate <= 0) return state
  return { ...state, gold: Math.max(0, state.gold - rate * days) }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: createInitialState(),
      lastError: null,
      clearError: () => set({ lastError: null }),
      reset: () => set({ game: createInitialState(), lastError: null }),

      travelTo: (destination) =>
        set((s) => {
          const route = findRoute(s.game.location, destination)
          if (!route) {
            return { ...s, lastError: 'No route to that town.' }
          }
          const before = s.game
          const r = applyTravel(before, destination)
          if (!r.ok) {
            return { ...s, lastError: r.reason }
          }
          let next = applyUpkeepForTravel(r.state, route.baseDays, before.caravan.horses)
          next = {
            ...next,
            activeMerchantId: defaultMerchantIdForTown(destination),
          }
          next = applyQuestProgress(next)
          return { game: next, lastError: null }
        }),

      setActiveMerchant: (merchantId) =>
        set((s) => {
          if (!isMerchantAtTown(s.game.location, merchantId)) {
            return { ...s, lastError: 'That merchant is not here.' }
          }
          return { game: { ...s.game, activeMerchantId: merchantId }, lastError: null }
        }),

      buy: (goodId, qty) =>
        set((s) => {
          const r = buyGood(s.game, goodId, qty, s.game.activeMerchantId)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = applyQuestProgress(r.state)
          return { game: next, lastError: null }
        }),

      sell: (goodId, qty) =>
        set((s) => {
          const r = sellGood(s.game, goodId, qty, s.game.activeMerchantId)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = applyQuestProgress(r.state)
          return { game: next, lastError: null }
        }),

      upgradeCart: () =>
        set((s) => {
          const r = upgradeCartAction(s.game)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: applyQuestProgress(r.state), lastError: null }
        }),

      purchaseHorse: () =>
        set((s) => {
          const r = buyHorse(s.game)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: applyQuestProgress(r.state), lastError: null }
        }),

      hire: (role) =>
        set((s) => {
          const r = hireRole(s.game, role)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: applyQuestProgress(r.state), lastError: null }
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ game: state.game }),
      version: 2,
      migrate: (persisted) => {
        const p = persisted as { game?: GameState }
        if (!p.game || typeof p.game.version !== 'number') {
          return { game: createInitialState(), lastError: null }
        }
        let g = p.game
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
        return { game: g, lastError: null }
      },
    },
  ),
)