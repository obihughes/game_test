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
import { applyTravel, computeTravelLeg } from '@/game/world/travel.ts'
import { findRoute, type Route } from '@/game/world/routes.ts'
import {
  dailyHireCost,
  upgradeCart as upgradeCartAction,
  buyHorse,
  hireRole,
  dismissHire as dismissHireAction,
} from '@/game/caravan/actions.ts'
import { buyGood, sellGood } from '@/game/economy/buySell.ts'
import { applyQuestProgress } from '@/game/quests/questLogic.ts'
import { STORAGE_KEY } from '@/game/persistence/constants.ts'
import {
  buildWarehouse as buildWarehouseAction,
  upgradeWarehouse as upgradeWarehouseAction,
  depositGoods as depositGoodsAction,
  withdrawGoods as withdrawGoodsAction,
  processRecipe as processRecipeAction,
} from '@/game/investments/warehouse.ts'

export interface CartItem {
  goodId: GoodId
  qty: number
  kind: 'buy' | 'sell'
  merchantId: MerchantId
}

export interface GameStore {
  game: GameState
  lastError: string | null
  travelTo: (destination: TownId) => void
  setActiveMerchant: (merchantId: MerchantId) => void
  buy: (goodId: GoodId, qty: number) => void
  sell: (goodId: GoodId, qty: number) => void
  buyAtMerchant: (goodId: GoodId, qty: number, merchantId: MerchantId) => void
  sellToMerchant: (goodId: GoodId, qty: number, merchantId: MerchantId) => void
  /** Execute a batch of buy/sell operations in sequence; stops on first error. */
  executeBatch: (items: CartItem[]) => void
  upgradeCart: () => void
  purchaseHorse: () => void
  hire: (role: HireRole) => void
  dismissHire: (role: HireRole) => void
  buildWarehouse: (townId: TownId) => void
  upgradeWarehouse: (townId: TownId) => void
  depositGoods: (townId: TownId, goodId: GoodId, qty: number) => void
  withdrawGoods: (townId: TownId, goodId: GoodId, qty: number) => void
  processRecipe: (townId: TownId, recipeId: string) => void
  clearError: () => void
  reset: () => void
}

function applyUpkeepForTravel(
  stateAfterTravel: GameState,
  stateBeforeTravel: GameState,
  route: Route,
): GameState {
  const { days } = computeTravelLeg(stateBeforeTravel, route)
  const rate = dailyHireCost(stateAfterTravel)
  if (rate <= 0) return stateAfterTravel
  return { ...stateAfterTravel, gold: Math.max(0, stateAfterTravel.gold - rate * days) }
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
          let next = applyUpkeepForTravel(r.state, before, route)
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

      buyAtMerchant: (goodId, qty, merchantId) =>
        set((s) => {
          const r = buyGood(s.game, goodId, qty, merchantId)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = applyQuestProgress({ ...r.state, activeMerchantId: merchantId })
          return { game: next, lastError: null }
        }),

      sellToMerchant: (goodId, qty, merchantId) =>
        set((s) => {
          const r = sellGood(s.game, goodId, qty, merchantId)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = applyQuestProgress({ ...r.state, activeMerchantId: merchantId })
          return { game: next, lastError: null }
        }),

      executeBatch: (items) =>
        set((s) => {
          let state = s.game
          const orderedItems = [
            ...items.filter((item) => item.kind === 'sell'),
            ...items.filter((item) => item.kind === 'buy'),
          ]
          for (const item of orderedItems) {
            const r =
              item.kind === 'buy'
                ? buyGood(state, item.goodId, item.qty, item.merchantId)
                : sellGood(state, item.goodId, item.qty, item.merchantId)
            if (!r.ok) return { ...s, lastError: r.reason }
            state = { ...r.state, activeMerchantId: item.merchantId }
          }
          return { game: applyQuestProgress(state), lastError: null }
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

      dismissHire: (role) =>
        set((s) => {
          const r = dismissHireAction(s.game, role)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: applyQuestProgress(r.state), lastError: null }
        }),

      buildWarehouse: (townId) =>
        set((s) => {
          const r = buildWarehouseAction(s.game, townId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),

      upgradeWarehouse: (townId) =>
        set((s) => {
          const r = upgradeWarehouseAction(s.game, townId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),

      depositGoods: (townId, goodId, qty) =>
        set((s) => {
          const r = depositGoodsAction(s.game, townId, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),

      withdrawGoods: (townId, goodId, qty) =>
        set((s) => {
          const r = withdrawGoodsAction(s.game, townId, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),

      processRecipe: (townId, recipeId) =>
        set((s) => {
          const r = processRecipeAction(s.game, townId, recipeId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ game: state.game }),
      version: 5,
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
        if (!g.inventoryCostBasis || typeof g.inventoryCostBasis !== 'object') {
          g = { ...g, inventoryCostBasis: {}, version: SAVE_VERSION }
        }
        if (typeof g.tradeGoldSpent !== 'number') {
          g = { ...g, tradeGoldSpent: 0, version: SAVE_VERSION }
        }
        if (typeof g.tradeGoldEarned !== 'number') {
          g = { ...g, tradeGoldEarned: 0, version: SAVE_VERSION }
        }
        if (!g.townWarehouses || typeof g.townWarehouses !== 'object') {
          g = { ...g, townWarehouses: {}, version: SAVE_VERSION }
        }
        return { game: g, lastError: null }
      },
    },
  ),
)