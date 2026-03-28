import type { GameResult, GameState, GoodId, MerchantId } from '../core/types.ts'
import { GOODS } from './goods.ts'
import { effectivePriceRow, isMerchantAtTown } from './merchants.ts'
import { spareCapacity } from '../caravan/capacity.ts'

/** Weighted average buy price per unit for stock on hand; null if empty or unknown (pre-tracking save). */
export function averageInventoryBuyPrice(state: GameState, goodId: GoodId): number | null {
  const qty = state.inventory[goodId] ?? 0
  if (qty <= 0) return null
  const basis = state.inventoryCostBasis[goodId]
  if (basis === undefined || basis <= 0) return null
  return basis / qty
}

export function buyGood(
  state: GameState,
  goodId: GoodId,
  qty: number,
  merchantId: MerchantId,
): GameResult {
  if (qty <= 0) return { ok: false, reason: 'Invalid amount.' }
  if (!merchantId || !isMerchantAtTown(state.location, merchantId)) {
    return { ok: false, reason: 'No merchant selected.' }
  }
  const good = GOODS[goodId]
  if (!good) return { ok: false, reason: 'Unknown good.' }
  const row = effectivePriceRow(state.location, merchantId, goodId, state.day)
  if (!row) return { ok: false, reason: 'Not sold here.' }
  const cost = row.buy * qty
  if (state.gold < cost) {
    return { ok: false, reason: 'Not enough gold.' }
  }
  const weightAdd = good.weightPerUnit * qty
  if (weightAdd > spareCapacity(state)) {
    return { ok: false, reason: 'Not enough cargo space.' }
  }
  const had = state.inventory[goodId] ?? 0
  const nextInv = { ...state.inventory, [goodId]: had + qty }
  const prevBasis = state.inventoryCostBasis[goodId] ?? 0
  const nextCostBasis = { ...state.inventoryCostBasis, [goodId]: prevBasis + cost }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - cost,
      inventory: nextInv,
      inventoryCostBasis: nextCostBasis,
      tradeGoldSpent: state.tradeGoldSpent + cost,
    },
  }
}

export function sellGood(
  state: GameState,
  goodId: GoodId,
  qty: number,
  merchantId: MerchantId,
): GameResult {
  if (qty <= 0) return { ok: false, reason: 'Invalid amount.' }
  if (!merchantId || !isMerchantAtTown(state.location, merchantId)) {
    return { ok: false, reason: 'No merchant selected.' }
  }
  const have = state.inventory[goodId] ?? 0
  if (have < qty) {
    return { ok: false, reason: "You don't carry that many." }
  }
  const row = effectivePriceRow(state.location, merchantId, goodId, state.day)
  if (!row) return { ok: false, reason: 'No buyer here.' }
  const gain = row.sell * qty
  const next = have - qty
  const nextInv = { ...state.inventory }
  if (next <= 0) delete nextInv[goodId]
  else nextInv[goodId] = next
  const basis = state.inventoryCostBasis[goodId] ?? 0
  const nextCostBasis = { ...state.inventoryCostBasis }
  if (next <= 0) delete nextCostBasis[goodId]
  else nextCostBasis[goodId] = (basis * next) / have
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold + gain,
      inventory: nextInv,
      inventoryCostBasis: nextCostBasis,
      tradeGoldEarned: state.tradeGoldEarned + gain,
    },
  }
}
