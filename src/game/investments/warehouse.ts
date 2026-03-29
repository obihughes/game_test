import type {
  GameResult,
  GameState,
  GoodId,
  ProcessingJob,
  TownId,
  WarehouseFacilityId,
  WarehouseState,
} from '../core/types.ts'
import { GOODS } from '../economy/goods.ts'

export const WAREHOUSE_BUILD_COST = 200
export const WAREHOUSE_UPGRADE_COST = 400
export const WAREHOUSE_CAPACITY: Record<1 | 2, number> = { 1: 20, 2: 50 }

export interface WarehouseFacilityDefinition {
  id: WarehouseFacilityId
  label: string
  description: string
  buildCost: number
  upgradeCost: number
}

export const WAREHOUSE_FACILITIES: Record<WarehouseFacilityId, WarehouseFacilityDefinition> = {
  smokehouse: {
    id: 'smokehouse',
    label: 'Smokehouse',
    description: 'Handles salting, smoking, and other preservation work.',
    buildCost: 120,
    upgradeCost: 140,
  },
  workshop: {
    id: 'workshop',
    label: 'Workshop',
    description: 'A bench-and-anvil floor for tools, rope work, amber, and wagon fittings.',
    buildCost: 135,
    upgradeCost: 160,
  },
  stillhouse: {
    id: 'stillhouse',
    label: 'Stillhouse',
    description: 'For tinctures, moss cakes, spice blends, and strong-smelling fermentations.',
    buildCost: 125,
    upgradeCost: 150,
  },
  kiln: {
    id: 'kiln',
    label: 'Kiln',
    description: 'A hot chamber for coal, pitch, glass cutting, and rendered fats.',
    buildCost: 145,
    upgradeCost: 170,
  },
}

export interface ProcessingRecipe {
  id: string
  label: string
  inputs: { goodId: GoodId; qty: number }[]
  goldCost: number
  outputs: { goodId: GoodId; qty: number }[]
  description: string
  /** If set, recipe is only available at this specific town. */
  townId?: TownId
  /** Days required before output is ready. 0 = instant (legacy behaviour). */
  daysRequired: number
  facilityRequired?: WarehouseFacilityId
  facilityLevel?: number
}

export const PROCESSING_RECIPES: ProcessingRecipe[] = [
  {
    id: 'herbs_to_moss',
    label: 'Distil herbs → Dreaming moss',
    inputs: [{ goodId: 'herbs', qty: 2 }],
    goldCost: 2,
    outputs: [{ goodId: 'dreaming_moss', qty: 2 }],
    description: 'Slow-dry and bind dried herbs into dreaming moss cakes.',
    daysRequired: 0,
    facilityRequired: 'stillhouse',
    facilityLevel: 1,
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
    daysRequired: 0,
    facilityRequired: 'smokehouse',
    facilityLevel: 1,
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
    daysRequired: 0,
    facilityRequired: 'smokehouse',
    facilityLevel: 1,
  },
  {
    id: 'ferment_fish_sauce',
    label: 'Ferment fish sauce',
    inputs: [{ goodId: 'salted_fish', qty: 2 }],
    goldCost: 4,
    outputs: [{ goodId: 'fish_sauce', qty: 1 }],
    description: 'Age salted fish in sealed jugs until they break down into pungent, prized fish sauce.',
    daysRequired: 0,
    facilityRequired: 'stillhouse',
    facilityLevel: 1,
  },
  {
    id: 'render_tallow',
    label: 'Render tallow candles',
    inputs: [{ goodId: 'peat', qty: 3 }],
    goldCost: 2,
    outputs: [{ goodId: 'tallow', qty: 2 }],
    description: 'Burn peat down to rendered fat and wick it into tallow candles — cheap light for dark towns.',
    daysRequired: 0,
    facilityRequired: 'kiln',
    facilityLevel: 1,
  },
  {
    id: 'char_coal',
    label: 'Char timber → coal',
    inputs: [{ goodId: 'timber', qty: 2 }],
    goldCost: 3,
    outputs: [{ goodId: 'coal', qty: 3 }],
    description: 'Slow-char timber bundles in a sealed kiln to produce dense coal bricks worth far more than the wood.',
    daysRequired: 0,
    facilityRequired: 'kiln',
    facilityLevel: 1,
  },
  {
    id: 'medicinal_tincture',
    label: 'Steep medicinal tincture',
    inputs: [
      { goodId: 'herbs', qty: 2 },
      { goodId: 'wine', qty: 1 },
    ],
    goldCost: 5,
    outputs: [{ goodId: 'medicinal_tincture', qty: 1 }],
    description: 'Steep dried herbs in river wine until the bottle turns sharp and restorative.',
    daysRequired: 0,
    facilityRequired: 'stillhouse',
    facilityLevel: 1,
  },
  {
    id: 'forge_tools',
    label: 'Forge iron tools',
    inputs: [
      { goodId: 'iron', qty: 2 },
      { goodId: 'coal', qty: 1 },
    ],
    goldCost: 8,
    outputs: [{ goodId: 'metal_tools', qty: 2 }],
    description: "Stoneholt's mountain forge turns raw iron and coal into finished tools worth double on the road.",
    townId: 'stoneholt',
    daysRequired: 3,
    facilityRequired: 'workshop',
    facilityLevel: 1,
  },
  {
    id: 'brew_pitch',
    label: 'Brew pitch from fen wood',
    inputs: [
      { goodId: 'peat', qty: 2 },
      { goodId: 'timber', qty: 1 },
    ],
    goldCost: 5,
    outputs: [{ goodId: 'pitch', qty: 2 }],
    description: 'Render fen peat and timber in Fenward stills to produce thick pitch barrels prized by shipwrights.',
    townId: 'fenward',
    daysRequired: 2,
    facilityRequired: 'kiln',
    facilityLevel: 2,
  },
  {
    id: 'press_rope',
    label: 'Press hemp rope',
    inputs: [
      { goodId: 'herbs', qty: 2 },
      { goodId: 'timber', qty: 1 },
    ],
    goldCost: 4,
    outputs: [{ goodId: 'rope', qty: 3 }],
    description: "Mirecross rope-walkers twist river hemp and bark fibre into coiled rope on the crossroads' long walk.",
    townId: 'mirecross',
    daysRequired: 2,
    facilityRequired: 'workshop',
    facilityLevel: 1,
  },
  {
    id: 'amber_polish',
    label: 'Polish crown amber',
    inputs: [
      { goodId: 'crown_amber', qty: 1 },
      { goodId: 'tallow', qty: 1 },
    ],
    goldCost: 10,
    outputs: [{ goodId: 'polished_amber', qty: 1 }],
    description: 'Crownpost gem-cutters buff raw amber with tallow paste until it catches the light like bottled sun.',
    townId: 'crownpost',
    daysRequired: 3,
    facilityRequired: 'workshop',
    facilityLevel: 2,
  },
  {
    id: 'spice_blend',
    label: 'Blend seasoned spice',
    inputs: [
      { goodId: 'fen_spice', qty: 1 },
      { goodId: 'salt', qty: 1 },
    ],
    goldCost: 6,
    outputs: [{ goodId: 'seasoned_spice', qty: 2 }],
    description: 'Saltmere spice-blenders combine fen spice and sea salt into a seasoned blend that commands a premium at inland tables.',
    townId: 'saltmere',
    daysRequired: 2,
    facilityRequired: 'stillhouse',
    facilityLevel: 1,
  },
  {
    id: 'cut_glass',
    label: 'Cut obsidian glass',
    inputs: [
      { goodId: 'obsidian_glass', qty: 2 },
      { goodId: 'coal', qty: 1 },
    ],
    goldCost: 7,
    outputs: [{ goodId: 'cut_glass', qty: 2 }],
    description: "Stoneholt's glass-cutters use coal-heated tools to score and split obsidian panes into fine decorative pieces.",
    townId: 'stoneholt',
    daysRequired: 3,
    facilityRequired: 'kiln',
    facilityLevel: 2,
  },
  {
    id: 'cart_upgrade_kit',
    label: 'Assemble cart upgrade kit',
    inputs: [
      { goodId: 'metal_tools', qty: 1 },
      { goodId: 'timber', qty: 1 },
      { goodId: 'rope', qty: 1 },
    ],
    goldCost: 9,
    outputs: [{ goodId: 'cart_upgrade_kit', qty: 1 }],
    description: 'Reinforce braces, lash fresh rigging, and bundle a heavy kit fit for a wagon overhaul.',
    daysRequired: 2,
    facilityRequired: 'workshop',
    facilityLevel: 2,
  },
  {
    id: 'elixir_of_insight',
    label: 'Distil elixir of insight',
    inputs: [
      { goodId: 'medicinal_tincture', qty: 1 },
      { goodId: 'dreaming_moss', qty: 1 },
    ],
    goldCost: 8,
    outputs: [{ goodId: 'elixir_of_insight', qty: 1 }],
    description: 'Clarify tincture over dreaming moss vapours to brew a focused draught prized by veteran caravaneers.',
    daysRequired: 3,
    facilityRequired: 'stillhouse',
    facilityLevel: 2,
  },
]

export function allRecipesForTown(townId: TownId): ProcessingRecipe[] {
  return PROCESSING_RECIPES.filter((recipe) => !recipe.townId || recipe.townId === townId)
}

export function getFacilityLevel(wh: WarehouseState | undefined, facilityId: WarehouseFacilityId): number {
  return wh?.facilities[facilityId] ?? 0
}

export function isRecipeUnlocked(wh: WarehouseState | undefined, recipe: ProcessingRecipe): boolean {
  if (!recipe.facilityRequired) return true
  const requiredLevel = recipe.facilityLevel ?? 1
  return getFacilityLevel(wh, recipe.facilityRequired) >= requiredLevel
}

export function recipesForTown(townId: TownId, wh?: WarehouseState): ProcessingRecipe[] {
  const recipes = allRecipesForTown(townId)
  if (!wh) return recipes
  return recipes.filter((recipe) => isRecipeUnlocked(wh, recipe))
}

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
  const newWarehouse: WarehouseState = { level: 1, stored: {}, facilities: {}, activeJobs: [] }
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

export function buildFacility(
  state: GameState,
  townId: TownId,
  facilityId: WarehouseFacilityId,
): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to improve the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here yet.' }
  const facility = WAREHOUSE_FACILITIES[facilityId]
  if (!facility) return { ok: false, reason: 'Unknown facility.' }
  if (getFacilityLevel(wh, facilityId) > 0) {
    return { ok: false, reason: `${facility.label} is already built.` }
  }
  if (state.gold < facility.buildCost) {
    return { ok: false, reason: `Not enough gold. Need ${facility.buildCost}g.` }
  }
  const newWh: WarehouseState = {
    ...wh,
    facilities: { ...wh.facilities, [facilityId]: 1 },
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - facility.buildCost,
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
    },
  }
}

export function upgradeFacility(
  state: GameState,
  townId: TownId,
  facilityId: WarehouseFacilityId,
): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to improve the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here yet.' }
  const facility = WAREHOUSE_FACILITIES[facilityId]
  if (!facility) return { ok: false, reason: 'Unknown facility.' }
  const level = getFacilityLevel(wh, facilityId)
  if (level <= 0) {
    return { ok: false, reason: `${facility.label} has not been built yet.` }
  }
  if (level >= 2) {
    return { ok: false, reason: `${facility.label} is already fully upgraded.` }
  }
  if (wh.level < 2) {
    return { ok: false, reason: 'Upgrade the warehouse to Level 2 before improving facilities further.' }
  }
  if (state.gold < facility.upgradeCost) {
    return { ok: false, reason: `Not enough gold. Need ${facility.upgradeCost}g.` }
  }
  const newWh: WarehouseState = {
    ...wh,
    facilities: { ...wh.facilities, [facilityId]: 2 },
  }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - facility.upgradeCost,
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
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
  if (stored < qty) return { ok: false, reason: 'Not that many stored here.' }
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

function resolveRecipe(townId: TownId, wh: WarehouseState, recipeId: string): ProcessingRecipe | null {
  const recipe = PROCESSING_RECIPES.find((entry) => entry.id === recipeId)
  if (!recipe) return null
  if (recipe.townId && recipe.townId !== townId) return null
  if (!isRecipeUnlocked(wh, recipe)) return null
  return recipe
}

function consumeRecipeInputs(
  state: GameState,
  recipe: ProcessingRecipe,
): {
  inventory: Record<GoodId, number>
  inventoryCostBasis: Partial<Record<GoodId, number>>
  totalCraftBasis: number
} {
  let newInv = { ...state.inventory }
  const newCostBasis = { ...state.inventoryCostBasis }
  let totalCraftBasis = recipe.goldCost
  for (const input of recipe.inputs) {
    const have = state.inventory[input.goodId] ?? 0
    const basis = state.inventoryCostBasis[input.goodId] ?? 0
    const consumedBasis = have > 0 ? (basis * input.qty) / have : 0
    totalCraftBasis += consumedBasis
    const next = (newInv[input.goodId] ?? 0) - input.qty
    if (next <= 0) delete newInv[input.goodId]
    else newInv[input.goodId] = next
    const nextBasis = basis - consumedBasis
    if (next <= 0 || nextBasis <= 0) delete newCostBasis[input.goodId]
    else newCostBasis[input.goodId] = nextBasis
  }
  return { inventory: newInv, inventoryCostBasis: newCostBasis, totalCraftBasis }
}

function addRecipeOutputs(
  inventory: Record<GoodId, number>,
  inventoryCostBasis: Partial<Record<GoodId, number>>,
  outputs: { goodId: GoodId; qty: number }[],
  totalCraftBasis: number,
): {
  inventory: Record<GoodId, number>
  inventoryCostBasis: Partial<Record<GoodId, number>>
} {
  let nextInventory = { ...inventory }
  const nextCostBasis = { ...inventoryCostBasis }
  const totalOutputQty = outputs.reduce((sum, output) => sum + output.qty, 0)
  for (const output of outputs) {
    nextInventory = {
      ...nextInventory,
      [output.goodId]: (nextInventory[output.goodId] ?? 0) + output.qty,
    }
    if (totalOutputQty > 0 && totalCraftBasis > 0) {
      const outputBasis = (totalCraftBasis * output.qty) / totalOutputQty
      nextCostBasis[output.goodId] = (nextCostBasis[output.goodId] ?? 0) + outputBasis
    }
  }
  return { inventory: nextInventory, inventoryCostBasis: nextCostBasis }
}

export function processRecipe(state: GameState, townId: TownId, recipeId: string): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to use the warehouse.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const recipe = resolveRecipe(townId, wh, recipeId)
  if (!recipe) return { ok: false, reason: 'Recipe is not unlocked here yet.' }
  if (recipe.daysRequired > 0) {
    return { ok: false, reason: 'This recipe requires time — use "Start job" instead.' }
  }
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
  const consumed = consumeRecipeInputs(state, recipe)
  const crafted = addRecipeOutputs(
    consumed.inventory,
    consumed.inventoryCostBasis,
    recipe.outputs,
    consumed.totalCraftBasis,
  )
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - recipe.goldCost,
      inventory: crafted.inventory,
      inventoryCostBasis: crafted.inventoryCostBasis,
    },
  }
}

let _jobIdCounter = 0
function newJobId(): string {
  return `job_${Date.now()}_${++_jobIdCounter}`
}

/** Start a timed processing job (daysRequired > 0). Inputs consumed immediately. */
export function startTimedJob(state: GameState, townId: TownId, recipeId: string): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to start a job.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const recipe = resolveRecipe(townId, wh, recipeId)
  if (!recipe) return { ok: false, reason: 'Recipe is not unlocked here yet.' }
  if (recipe.daysRequired === 0) {
    return { ok: false, reason: 'This recipe is instant — use the process button.' }
  }
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
  const consumed = consumeRecipeInputs(state, recipe)
  const job: ProcessingJob = {
    id: newJobId(),
    recipeId,
    startDay: state.day,
    daysRequired: recipe.daysRequired,
    inputCostBasis: consumed.totalCraftBasis,
    outputs: recipe.outputs,
  }
  const newWh: WarehouseState = { ...wh, activeJobs: [...(wh.activeJobs ?? []), job] }
  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - recipe.goldCost,
      inventory: consumed.inventory,
      inventoryCostBasis: consumed.inventoryCostBasis,
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
    },
  }
}

/** Collect a completed timed job. Outputs go to player inventory. */
export function collectJob(state: GameState, townId: TownId, jobId: string): GameResult {
  if (state.location !== townId) {
    return { ok: false, reason: 'You must be in the town to collect.' }
  }
  const wh = state.townWarehouses[townId]
  if (!wh) return { ok: false, reason: 'No warehouse here.' }
  const job = (wh.activeJobs ?? []).find((j) => j.id === jobId)
  if (!job) return { ok: false, reason: 'Job not found.' }
  const daysElapsed = state.day - job.startDay
  if (daysElapsed < job.daysRequired) {
    const remaining = job.daysRequired - daysElapsed
    return { ok: false, reason: `Not ready yet — ${remaining} day${remaining === 1 ? '' : 's'} remaining.` }
  }
  const crafted = addRecipeOutputs(
    state.inventory,
    state.inventoryCostBasis,
    job.outputs,
    job.inputCostBasis,
  )
  const newJobs = (wh.activeJobs ?? []).filter((j) => j.id !== jobId)
  const newWh: WarehouseState = { ...wh, activeJobs: newJobs }
  return {
    ok: true,
    state: {
      ...state,
      inventory: crafted.inventory,
      inventoryCostBasis: crafted.inventoryCostBasis,
      townWarehouses: { ...state.townWarehouses, [townId]: newWh },
    },
  }
}
