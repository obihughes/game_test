import type { GameResult, GameState, GoodId, TownId, WarehouseState } from '../core/types.ts'
import { GOODS } from '../economy/goods.ts'

export const WAREHOUSE_BUILD_COST = 200
export const WAREHOUSE_UPGRADE_COST = 400
export const WAREHOUSE_CAPACITY: Record<1 | 2, number> = { 1: 20, 2: 50 }

export interface ProcessingRecipe {
  id: string
  label: string
  inputs: { goodId: GoodId; qty: number }[]
  goldCost: number
  outputs: { goodId: GoodId; qty: number }[]
  description: string
}

export const PROCESSING_RECIPES: ProcessingRecipe[] = [
  {
    id: 'herbs_to_moss',
    label: 'Distil herbs → Dreaming moss',
    inputs: [{ goodId: 'herbs', qty: 4 }],
    goldCost: 5,
    outputs: [{ goodId: 'dreaming_moss', qty: 1 }],
    description: 'Slow-dry and bind dried herbs into a potent dreaming moss cake.',
  },
  {
    id: 'salt_fish',
    label: 'Salt-cure fresh fish',
    inputs: [
      { goodId: 'fresh_fish', qty: 2 },
      { goodId: 'salt', qty: 1 },
    ],
    goldCost: 4,
    outputs: [{ goodId: 'salted_fish', qty: 2 }],
    description: 'Pack fresh fish into salt-filled casks to preserve them for long journeys.',
  },
  {
    id: 'smoke_fish',
    label: 'Smoke fresh fish',
    inputs: [
      { goodId: 'fresh_fish', qty: 3 },
      { goodId: 'peat', qty: 1 },
    ],
    goldCost: 6,
    outputs: [{ goodId: 'smoked_fish', qty: 2 }],
    description: 'Slow-smoke fish over peat bricks in the warehouse smokehouse — rich flavour, long shelf life.',
  },
  {
    id: 'ferment_fish_sauce',
    label: 'Ferment fish sauce',
    inputs: [
      { goodId: 'salted_fish', qty: 4 },
    ],
    goldCost: 8,
    outputs: [{ goodId: 'fish_sauce', qty: 1 }],
    description: 'Age salted fish in sealed jugs until they break down into pungent, prized fish sauce.',
  },
  {
    id: 'render_tallow',
    label: 'Render tallow candles',
    inputs: [{ goodId: 'peat', qty: 3 }],
    goldCost: 2,
    outputs: [{ goodId: 'tallow', qty: 2 }],
    description: 'Burn peat down to rendered fat and wick it into tallow candles — cheap light for dark towns.',
  },
  {
    id: 'char_coal',
    label: 'Char timber → coal',
    inputs: [{ goodId: 'timber', qty: 2 }],
    goldCost: 3,
    outputs: [{ goodId: 'coal', qty: 3 }],
    description: 'Slow-char timber bundles in a sealed kiln to produce dense coal bricks worth far more than the wood.',
  },
]

function warehouseWeight(stored: Partial<Record<GoodId, number>>): number {
  let total = 0
  for (const [id, qty] of Object.entries(stored)) {
    const g = GOODS[id as GoodId]
    total += (g?.weightPerUnit ?? 1) * (qty ?? 0)
  }
  return total
}

export function getWarehouseCapacity(wh: WarehouseState): number {
  return WAREHOUSE_CAPACITY[wh.level]
}

export function getWarehouseUsed(wh: WarehouseState): number {
  return warehouseWeight(wh.stored)
}

export function buildWarehouse(state: GameState, townId: TownId): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to build a warehouse.' }
  }
  if (state.townWarehouses[townId]) {
    return { ok: false, reason: 'A warehouse already exists here.' }
  }
  if (state.gold < WAREHOUSE_BUILD_COST) {
    return { ok: false, reason: `Not enough gold. Need ${WAREHOUSE_BUILD_COST}g.` }
  }
  const newWarehouse: WarehouseState = { level: 1, stored: {} }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - WAREHOUSE_BUILD_COST,
      townWarehouses: { ...state.townWarehouses, [townId]: newWarehouse },
    },
  }
}

export function upgradeWarehouse(state: GameState, townId: TownId): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to upgrade the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here yet.' }
  if (wh.level >= 2) return { ok: false, reason: 'Warehouse is already fully upgraded.' }
  if (state.gold < WAREHOUSE_UPGRADE_COST) {
    return { ok: false, reason: `Not enough gold. Need ${WAREHOUSE_UPGRADE_COST}g.` }
  }
  const upgraded: WarehouseState = { ...wh, level: 2 }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - WAREHOUSE_UPGRADE_COST,
      townWarehouses: { ...state.townWarehouses, [townId]: upgraded },
    },
  }
}

export function depositGoods(state: GameState, townId: TownId, goodId: GoodId, qty: number): GameResult {
  if (qty <= 0) return { ok: false, reason: 'Invalid quantity.' }
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to use the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const have = state.inventory[goodId] ?? 0
  if (have < qty) return { ok: false, reason: "You don't carry that many." }
  const good = GOODS[goodId]
  if (!good) return { ok: false, reason: 'Unknown good.' }
  const addWeight = good.weightPerUnit * qty
  const used = getWarehouseUsed(wh)
  const cap = getWarehouseCapacity(wh)
  if (used + addWeight > cap) {
    return { ok: false, reason: `Not enough warehouse space. (${cap - used} wt free)` }
  }
  const newInv = { ...state.inventory, [goodId]: have - qty }
  if (newInv[goodId] === 0) delete newInv[goodId]
  const newStored = { ...wh.stored, [goodId]: (wh.stored[goodId] ?? 0) + qty }
  const newWh: WarehouseState = { ...wh, stored: newStored }
  return {
    ok: true,
    state: {
      ...state,
      inventory: newInv,
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
    },
  }
}

export function withdrawGoods(state: GameState, townId: TownId, goodId: GoodId, qty: number): GameResult {
  if (qty <= 0) return { ok: false, reason: 'Invalid quantity.' }
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to use the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const stored = wh.stored[goodId] ?? 0
  if (stored < qty) return { ok: false, reason: "Not that many stored here." }
  const good = GOODS[goodId]
  if (!good) return { ok: false, reason: 'Unknown good.' }
  const newStored = { ...wh.stored, [goodId]: stored - qty }
  if (newStored[goodId] === 0) delete newStored[goodId]
  const newWh: WarehouseState = { ...wh, stored: newStored }
  return {
    ok: true,
    state: {
      ...state,
      inventory: { ...state.inventory, [goodId]: (state.inventory[goodId] ?? 0) + qty },
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
    },
  }
}

export function processRecipe(state: GameState, townId: TownId, recipeId: string): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to use the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const recipe = PROCESSING_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return { ok: false, reason: 'Unknown recipe.' }
  if (state.gold < recipe.goldCost) {
    return { ok: false, reason: `Need ${recipe.goldCost}g processing fee.` }
  }
  for (const input of recipe.inputs) {
    const have = state.inventory[input.goodId] ?? 0
    if (have < input.qty) {
      const g = GOODS[input.goodId]
      return { ok: false, reason: `Need ${input.qty}× ${g?.name ?? input.goodId} in your cargo.` }
    }
  }
  let newInv = { ...state.inventory }
  for (const input of recipe.inputs) {
    const next = (newInv[input.goodId] ?? 0) - input.qty
    if (next <= 0) delete newInv[input.goodId]
    else newInv[input.goodId] = next
  }
  for (const output of recipe.outputs) {
    newInv = { ...newInv, [output.goodId]: (newInv[output.goodId] ?? 0) + output.qty }
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - recipe.goldCost,
      inventory: newInv,
    },
  }
}
