import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createInitialState,
  SAVE_VERSION,
  type GameState,
  type GoodId,
  type HireRole,
  type TownId,
} from '@/game/core/index.ts'
import type { WarehouseFacilityId } from '@/game/core/types.ts'
import { applyTravelPlan, computeTravelPlan } from '@/game/world/travel.ts'
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
  buildFacility as buildFacilityAction,
  upgradeWarehouse as upgradeWarehouseAction,
  upgradeFacility as upgradeFacilityAction,
  depositGoods as depositGoodsAction,
  withdrawGoods as withdrawGoodsAction,
  processRecipe as processRecipeAction,
  startTimedJob as startTimedJobAction,
  collectJob as collectJobAction,
} from '@/game/investments/warehouse.ts'
import { rollEncounter } from '@/game/events/encounters.ts'
import { useItem as useItemAction } from '@/game/inventory/useItem.ts'
import {
  applyStoryProgression,
  chooseStoryOption as chooseStoryOptionAction,
  createEmptyStoryState,
  startStoryConversation as startStoryConversationAction,
} from '@/game/story/index.ts'

export interface CartItem {
  goodId: GoodId
  qty: number
  kind: 'buy' | 'sell'
}

/** Info passed back from travelTo so the UI can run an animation. */
export interface TravelResult {
  success: true
  fromTown: TownId
  toTown: TownId
  days: number
  routeNames: string[]
}

export interface GameStore {
  game: GameState
  lastError: string | null
  travelTo: (destination: TownId) => TravelResult | false
  dismissEncounter: () => void
  buy: (goodId: GoodId, qty: number) => void
  sell: (goodId: GoodId, qty: number) => void
  /** Execute a batch of buy/sell operations in sequence; stops on first error. */
  executeBatch: (items: CartItem[]) => void
  upgradeCart: () => void
  purchaseHorse: () => void
  hire: (role: HireRole) => void
  dismissHire: (role: HireRole) => void
  buildWarehouse: (townId: TownId) => void
  upgradeWarehouse: (townId: TownId) => void
  buildFacility: (townId: TownId, facilityId: WarehouseFacilityId) => void
  upgradeFacility: (townId: TownId, facilityId: WarehouseFacilityId) => void
  depositGoods: (townId: TownId, goodId: GoodId, qty: number) => void
  withdrawGoods: (townId: TownId, goodId: GoodId, qty: number) => void
  processRecipe: (townId: TownId, recipeId: string) => void
  startTimedJob: (townId: TownId, recipeId: string) => void
  collectJob: (townId: TownId, jobId: string) => void
  useItem: (goodId: GoodId) => void
  startStoryConversation: (npcId: string) => string | null
  chooseStoryOption: (nodeId: string, optionId: string) => string | null
  clearError: () => void
  reset: () => void
}

function applyUpkeepForTravel(stateAfterTravel: GameState, days: number): GameState {
  const rate = dailyHireCost(stateAfterTravel)
  if (rate <= 0) return stateAfterTravel
  return { ...stateAfterTravel, gold: Math.max(0, stateAfterTravel.gold - rate * days) }
}

function finalizeGameState(state: GameState): GameState {
  return applyStoryProgression(applyQuestProgress(state))
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: createInitialState(),
      lastError: null,
      clearError: () => set({ lastError: null }),
      reset: () => set({ game: createInitialState(), lastError: null }),

      travelTo: (destination) => {
        let result: TravelResult | false = false
        set((s) => {
          const plan = computeTravelPlan(s.game, destination)
          if (!plan) {
            return { ...s, lastError: 'No route to that town.' }
          }

          const before = s.game
          const upkeep = dailyHireCost(before) * plan.days
          if (before.gold < plan.toll + upkeep) {
            return { ...s, lastError: 'Not enough gold for tolls and provisions.' }
          }

          const r = applyTravelPlan(before, plan)
          if (!r.ok) {
            return { ...s, lastError: r.reason }
          }

          let next = applyUpkeepForTravel(r.state, plan.days)

          // Roll encounter on the first leg of the journey
          let encounter = null
          if (plan.routes.length > 0) {
            const resolved = rollEncounter(before, plan.routes[0]!)
            if (resolved) {
              next = {
                ...next,
                gold: resolved.state.gold,
                inventory: resolved.state.inventory,
                inventoryCostBasis: resolved.state.inventoryCostBasis,
                caravan: resolved.state.caravan,
              }
              encounter = resolved.encounter
            }
          }

          // Increment town visit counter
          const prevVisits = next.townVisits ?? {}
          const prevLastVisitDays = next.townLastVisitDay ?? {}
          const prevPreviousVisitDays = next.townPreviousVisitDay ?? {}
          const priorVisitDay = prevLastVisitDays[destination]
          const newVisits = {
            ...prevVisits,
            [destination]: (prevVisits[destination] ?? 0) + 1,
          }
          const newLastVisitDays = {
            ...prevLastVisitDays,
            [destination]: next.day,
          }
          const newPreviousVisitDays =
            typeof priorVisitDay === 'number'
              ? { ...prevPreviousVisitDays, [destination]: priorVisitDay }
              : prevPreviousVisitDays
          next = {
            ...next,
            townVisits: newVisits,
            townLastVisitDay: newLastVisitDays,
            townPreviousVisitDay: newPreviousVisitDays,
            lastEncounter: encounter,
          }

          next = finalizeGameState(next)

          const routeNames = [before.location, ...plan.routes.map((rt) => rt.to)]
          result = {
            success: true,
            fromTown: before.location,
            toTown: destination,
            days: plan.days,
            routeNames,
          }
          return { game: next, lastError: null }
        })
        return result
      },

      dismissEncounter: () =>
        set((s) => ({
          game: { ...s.game, lastEncounter: null },
        })),

      buy: (goodId, qty) =>
        set((s) => {
          const r = buyGood(s.game, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = finalizeGameState(r.state)
          return { game: next, lastError: null }
        }),

      sell: (goodId, qty) =>
        set((s) => {
          const r = sellGood(s.game, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          const next = finalizeGameState(r.state)
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
            const r = item.kind === 'buy' ? buyGood(state, item.goodId, item.qty) : sellGood(state, item.goodId, item.qty)
            if (!r.ok) return { ...s, lastError: r.reason }
            state = r.state
          }
          return { game: finalizeGameState(state), lastError: null }
        }),

      upgradeCart: () =>
        set((s) => {
          const r = upgradeCartAction(s.game)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      purchaseHorse: () =>
        set((s) => {
          const r = buyHorse(s.game)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      hire: (role) =>
        set((s) => {
          const r = hireRole(s.game, role)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      dismissHire: (role) =>
        set((s) => {
          const r = dismissHireAction(s.game, role)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      buildWarehouse: (townId) =>
        set((s) => {
          const r = buildWarehouseAction(s.game, townId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      upgradeWarehouse: (townId) =>
        set((s) => {
          const r = upgradeWarehouseAction(s.game, townId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      buildFacility: (townId, facilityId) =>
        set((s) => {
          const r = buildFacilityAction(s.game, townId, facilityId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      upgradeFacility: (townId, facilityId) =>
        set((s) => {
          const r = upgradeFacilityAction(s.game, townId, facilityId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      depositGoods: (townId, goodId, qty) =>
        set((s) => {
          const r = depositGoodsAction(s.game, townId, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      withdrawGoods: (townId, goodId, qty) =>
        set((s) => {
          const r = withdrawGoodsAction(s.game, townId, goodId, qty)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      processRecipe: (townId, recipeId) =>
        set((s) => {
          const r = processRecipeAction(s.game, townId, recipeId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      startTimedJob: (townId, recipeId) =>
        set((s) => {
          const r = startTimedJobAction(s.game, townId, recipeId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      collectJob: (townId, jobId) =>
        set((s) => {
          const r = collectJobAction(s.game, townId, jobId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: r.state, lastError: null }
        }),

      useItem: (goodId) =>
        set((s) => {
          const r = useItemAction(s.game, goodId)
          if (!r.ok) return { ...s, lastError: r.reason }
          return { game: finalizeGameState(r.state), lastError: null }
        }),

      startStoryConversation: (npcId) => {
        let nextNodeId: string | null = null
        set((s) => {
          const result = startStoryConversationAction(s.game, npcId)
          nextNodeId = result.nextNodeId
          return { game: finalizeGameState(result.state), lastError: null }
        })
        return nextNodeId
      },

      chooseStoryOption: (nodeId, optionId) => {
        let nextNodeId: string | null = null
        set((s) => {
          const result = chooseStoryOptionAction(s.game, nodeId, optionId)
          nextNodeId = result.nextNodeId
          return { game: finalizeGameState(result.state), lastError: null }
        })
        return nextNodeId
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ game: state.game }),
      version: SAVE_VERSION,
      migrate: (persisted) => {
        const p = persisted as { game?: GameState }
        if (!p.game || typeof p.game.version !== 'number') {
          return { game: createInitialState(), lastError: null }
        }
        let g = p.game as GameState & { activeMerchantId?: string }
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
        if (!g.townWarehouses || typeof g.townWarehouses !== 'object') {
          g = { ...g, townWarehouses: {}, version: SAVE_VERSION }
        }
        // v7 migrations
        if (!g.townVisits || typeof g.townVisits !== 'object') {
          g = { ...g, townVisits: { [g.location]: 1 }, version: SAVE_VERSION }
        }
        if (!g.townLastVisitDay || typeof g.townLastVisitDay !== 'object') {
          g = { ...g, townLastVisitDay: { [g.location]: g.day }, version: SAVE_VERSION }
        }
        if (!g.townPreviousVisitDay || typeof g.townPreviousVisitDay !== 'object') {
          g = { ...g, townPreviousVisitDay: {}, version: SAVE_VERSION }
        }
        if (!('lastEncounter' in (g as object))) {
          g = { ...g, lastEncounter: null, version: SAVE_VERSION }
        }
        if (!('story' in (g as object))) {
          g = { ...g, story: createEmptyStoryState(), version: SAVE_VERSION }
        }
        if (!g.caravan || typeof g.caravan !== 'object') {
          return { game: createInitialState(), lastError: null }
        }
        const caravanBuffs =
          g.caravan.buffs && typeof g.caravan.buffs === 'object' ? g.caravan.buffs : {}
        const bonusCapacity = typeof g.caravan.bonusCapacity === 'number' ? g.caravan.bonusCapacity : 0
        g = {
          ...g,
          caravan: { ...g.caravan, buffs: caravanBuffs, bonusCapacity },
          version: SAVE_VERSION,
        }
        // Ensure all warehouses have activeJobs array and facilities map
        const updatedWarehouses = { ...g.townWarehouses }
        for (const townId of Object.keys(updatedWarehouses)) {
          const wh = updatedWarehouses[townId]
          if (!wh) continue
          updatedWarehouses[townId] = {
            ...wh,
            activeJobs: Array.isArray(wh.activeJobs) ? wh.activeJobs : [],
            facilities: wh.facilities && typeof wh.facilities === 'object' ? wh.facilities : {},
          }
        }
        const story = g.story && typeof g.story === 'object' ? g.story : createEmptyStoryState()
        g = {
          ...g,
          townWarehouses: updatedWarehouses,
          story: {
            flags: story.flags && typeof story.flags === 'object' ? story.flags : {},
            activeQuestIds: Array.isArray(story.activeQuestIds) ? story.activeQuestIds : [],
            completedQuestIds: Array.isArray(story.completedQuestIds) ? story.completedQuestIds : [],
            questProgress: story.questProgress && typeof story.questProgress === 'object' ? story.questProgress : {},
            npcRelationships:
              story.npcRelationships && typeof story.npcRelationships === 'object'
                ? story.npcRelationships
                : {},
            unlockedEasterEggs: Array.isArray(story.unlockedEasterEggs) ? story.unlockedEasterEggs : [],
          },
          version: SAVE_VERSION,
        }
        return { game: g, lastError: null }
      },
    },
  ),
)
