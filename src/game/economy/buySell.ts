import type { GameResult, GameState, GoodId, MerchantId } from '../core/types.ts'
import { GOODS } from './goods.ts'
import { isMerchantAtTown, priceRowFor } from './merchants.ts'
import { spareCapacity } from '../caravan/capacity.ts'

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
  const row = priceRowFor(state.location, merchantId, goodId)
  if (!row) return { ok: false, reason: 'Not sold here.' }
  const cost = row.buy * qty
  if (state.gold < cost) {
    return { ok: false, reason: 'Not enough gold.' }
  }
  const weightAdd = good.weightPerUnit * qty
  if (weightAdd > spareCapacity(state)) {
    return { ok: false, reason: 'Not enough cargo space.' }
  }
  const nextInv = { ...state.inventory, [goodId]: (state.inventory[goodId] ?? 0) + qty }
  return {
    ok: true,
    state: { ...state, gold: state.gold - cost, inventory: nextInv },
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
  const row = priceRowFor(state.location, merchantId, goodId)
  if (!row) return { ok: false, reason: 'No buyer here.' }
  const gain = row.sell * qty
  const next = have - qty
  const nextInv = { ...state.inventory }
  if (next <= 0) delete nextInv[goodId]
  else nextInv[goodId] = next
  return { ok: true, state: { ...state, gold: state.gold + gain, inventory: nextInv } }
}
