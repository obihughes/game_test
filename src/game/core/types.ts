export type TownId = string
export type GoodId = string
export type MerchantId = string

export type HireRole = 'guard' | 'scout'

export interface CaravanState {
  cartTier: number
  horses: number
  hires: Record<HireRole, number>
}

export interface WarehouseState {
  level: 1 | 2
  stored: Partial<Record<GoodId, number>>
}

export interface GameState {
  version: number
  gold: number
  day: number
  location: TownId
  /** Which stall you are trading at; must match a merchant in `location`. */
  activeMerchantId: MerchantId
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
}

export type GameResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string }