export type TownId = string
export type GoodId = string
export type MerchantId = string

export type HireRole = 'guard' | 'scout'
export type WarehouseFacilityId = 'smokehouse' | 'workshop' | 'stillhouse' | 'kiln'
export type CaravanBuffId = 'well_fed' | 'high_morale' | 'alertness' | 'insight'

export interface CaravanBuffState {
  expiresOnDay: number
  sourceGoodId: GoodId
}

export interface CaravanState {
  cartTier: number
  horses: number
  hires: Record<HireRole, number>
  buffs: Partial<Record<CaravanBuffId, CaravanBuffState>>
  bonusCapacity: number
}

/** A timed crafting job running in a warehouse. */
export interface ProcessingJob {
  id: string
  recipeId: string
  startDay: number
  daysRequired: number
  /** Snapshot of cost basis consumed at job start, to be distributed to outputs on collect. */
  inputCostBasis: number
  outputs: { goodId: GoodId; qty: number }[]
}

export interface WarehouseState {
  level: 1 | 2
  stored: Partial<Record<GoodId, number>>
  facilities: Partial<Record<WarehouseFacilityId, number>>
  /** Active timed crafting jobs. */
  activeJobs: ProcessingJob[]
}

/** A travel encounter that resolved during the last trip. */
export interface TravelEncounter {
  id: string
  text: string
  /** Optional mechanical effect summary shown to player. */
  effectText?: string
}

export interface GameState {
  version: number
  gold: number
  day: number
  location: TownId
  inventory: Record<GoodId, number>
  /** Total gold paid for units still held (per good); average buy = value / inventory count. */
  inventoryCostBasis: Partial<Record<GoodId, number>>
  /** Lifetime gold spent on purchases (this save). */
  tradeGoldSpent: number
  /** Lifetime gold received from sales (this save). */
  tradeGoldEarned: number
  caravan: CaravanState
  questFlags: Record<string, boolean>
  activeQuestId: string | null
  /** Warehouses built in each town. */
  townWarehouses: Partial<Record<TownId, WarehouseState>>
  /** How many times the player has visited each town (incremented on arrival). */
  townVisits: Partial<Record<TownId, number>>
  /** The last encounter that occurred during travel, cleared when dismissed. */
  lastEncounter: TravelEncounter | null
}

export type GameResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string }