export type TownId = string
export type GoodId = string

export type HireRole = 'guard' | 'scout'

export interface CaravanState {
  cartTier: number
  horses: number
  hires: Record<HireRole, number>
}

export interface GameState {
  version: number
  gold: number
  day: number
  location: TownId
  inventory: Record<GoodId, number>
  caravan: CaravanState
  questFlags: Record<string, boolean>
  activeQuestId: string | null
}

export type GameResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string }