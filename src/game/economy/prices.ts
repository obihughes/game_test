import type { GoodId } from '../core/types.ts'
import type { TownId } from '../core/types.ts'

export interface PriceRow {
  buy: number
  sell: number
}

export type TownPriceTable = Record<GoodId, PriceRow>

export const PRICES_BY_TOWN: Record<TownId, TownPriceTable> = {
  ashenford: {
    iron: { buy: 18, sell: 11 },
    silk: { buy: 28, sell: 17 },
    wine: { buy: 14, sell: 8 },
    herbs: { buy: 9, sell: 5 },
  },
  mirecross: {
    iron: { buy: 22, sell: 13 },
    silk: { buy: 24, sell: 14 },
    wine: { buy: 12, sell: 7 },
    herbs: { buy: 11, sell: 6 },
  },
  riversend: {
    iron: { buy: 16, sell: 10 },
    silk: { buy: 32, sell: 19 },
    wine: { buy: 20, sell: 12 },
    herbs: { buy: 8, sell: 4 },
  },
}