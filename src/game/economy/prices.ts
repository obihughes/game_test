import type { GoodId } from '../core/types.ts'

/** Buy/sell crowns per unit at a merchant who lists this good. */
export interface PriceRow {
  buy: number
  sell: number
}

/** @deprecated Use merchant catalogs in merchants.ts */
export type TownPriceTable = Record<GoodId, PriceRow>
