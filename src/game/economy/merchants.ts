import type { GoodId, MerchantId, TownId } from '../core/types.ts'
import { getEffectivePrice, type PriceRow } from './prices.ts'

/** What kind of stall this is — stock is chosen by role so each merchant has a clear specialty. */
export type MerchantTradeRole =
  | 'blacksmith'
  | 'general_market'
  | 'bonds_scribe'
  | 'fen_gatherer'
  | 'dry_goods_post'
  | 'occult_merchant'
  | 'fishmonger'
  | 'harbor_factor'
  | 'night_market'

export interface MerchantDef {
  id: MerchantId
  role: MerchantTradeRole
  /** Short label for the stall type (shown in trade UI). */
  roleLabel: string
  label: string
  tagline: string
  icon: string
  /** Goods this merchant will buy from or sell to you; per town, roles keep non-overlapping stock. */
  catalog: Partial<Record<GoodId, PriceRow>>
}

const ASHENFORD: MerchantDef[] = [
  {
    id: 'ashenford_blacksmith',
    role: 'blacksmith',
    roleLabel: 'Blacksmith',
    label: 'Hearth & Hammer',
    tagline: 'Iron runs cheap where the mountain bleeds.',
    icon: '🔥',
    catalog: {
      iron: { buy: 11, sell: 7 },
      obsidian_glass: { buy: 14, sell: 9 },
      chain_gang_tools: { buy: 26, sell: 16 },
    },
  },
  {
    id: 'ashenford_ash_market',
    role: 'general_market',
    roleLabel: 'Market hall',
    label: 'Ash Market stall',
    tagline: 'Bolt silk, barrel fish, whatever the crown road brings.',
    icon: '🛒',
    catalog: {
      silk: { buy: 28, sell: 17 },
      wine: { buy: 16, sell: 9 },
      salt: { buy: 22, sell: 13 },
      fish: { buy: 24, sell: 14 },
      rope: { buy: 9, sell: 5 },
    },
  },
  {
    id: 'ashenford_binder',
    role: 'bonds_scribe',
    roleLabel: 'Scribe & bonds',
    label: 'Binder of contracts',
    tagline: 'Passage debt and the herbs that keep hands steady enough to sign.',
    icon: '📋',
    catalog: {
      indenture_scroll: { buy: 45, sell: 28 },
      herbs: { buy: 12, sell: 7 },
    },
  },
]

const MIRECROSS: MerchantDef[] = [
  {
    id: 'mirecross_fen_vendor',
    role: 'fen_gatherer',
    roleLabel: 'Fen gatherer',
    label: 'Fen reed-merchant',
    tagline: 'Peat bricks, river fish, and mossy remedies from the fog.',
    icon: '🌫️',
    catalog: {
      peat: { buy: 6, sell: 4 },
      fish: { buy: 26, sell: 15 },
      herbs: { buy: 8, sell: 5 },
    },
  },
  {
    id: 'mirecross_reed_house',
    role: 'dry_goods_post',
    roleLabel: 'Dry goods',
    label: 'Reed House trading post',
    tagline: 'Silk off the crown road, rope that does not rot too fast.',
    icon: '🏚️',
    catalog: {
      silk: { buy: 24, sell: 14 },
      rope: { buy: 8, sell: 5 },
      wine: { buy: 13, sell: 8 },
      salt: { buy: 18, sell: 11 },
      iron: { buy: 24, sell: 14 },
    },
  },
  {
    id: 'mirecross_moss_witch',
    role: 'occult_merchant',
    roleLabel: 'Occult trader',
    label: 'The moss witch',
    tagline: 'Bottled voices, lucky bones, no refunds if you dream wrong.',
    icon: '🐸',
    catalog: {
      dreaming_moss: { buy: 7, sell: 4 },
      bottled_echo: { buy: 28, sell: 17 },
      lucky_carp_bone: { buy: 18, sell: 11 },
    },
  },
]

const RIVERSEND: MerchantDef[] = [
  {
    id: 'riversend_fishmonger',
    role: 'fishmonger',
    roleLabel: 'Fishmonger',
    label: 'Smoke & scales',
    tagline: 'Fish cheap as river water; salt and tokens from the catch.',
    icon: '🎣',
    catalog: {
      fish: { buy: 7, sell: 4 },
      salt: { buy: 12, sell: 7 },
      lucky_carp_bone: { buy: 14, sell: 8 },
    },
  },
  {
    id: 'riversend_harbor',
    role: 'harbor_factor',
    roleLabel: 'Harbor factor',
    label: 'Harbor factor',
    tagline: 'Tar, rope, and luxe bolts off the last ship that tied up.',
    icon: '⚓',
    catalog: {
      rope: { buy: 7, sell: 4 },
      wine: { buy: 18, sell: 11 },
      silk: { buy: 34, sell: 20 },
      iron: { buy: 20, sell: 12 },
    },
  },
  {
    id: 'riversend_tide_market',
    role: 'night_market',
    roleLabel: 'Night market',
    label: 'Tide Market',
    tagline: 'Open when the bell rings; moon herbs and fen moss on the side.',
    icon: '🌙',
    catalog: {
      herbs: { buy: 7, sell: 4 },
      dreaming_moss: { buy: 9, sell: 5 },
    },
  },
]

const CROWNPOST: MerchantDef[] = [
  {
    id: 'crownpost_exchange',
    role: 'general_market',
    roleLabel: 'Crown exchange',
    label: 'Amber & duty house',
    tagline: 'Amber stamped for the crown; clerks hum different numbers after noon.',
    icon: '🏛️',
    catalog: {
      crown_amber: { buy: 42, sell: 26 },
      wine: { buy: 15, sell: 9 },
      silk: { buy: 30, sell: 18 },
      herbs: { buy: 11, sell: 6 },
    },
  },
  {
    id: 'crownpost_roadhouse',
    role: 'dry_goods_post',
    roleLabel: 'Road factor',
    label: 'Post road factor',
    tagline: 'Iron, rope, and glass for caravans sworn to the long bend.',
    icon: '📦',
    catalog: {
      iron: { buy: 13, sell: 8 },
      rope: { buy: 10, sell: 6 },
      obsidian_glass: { buy: 15, sell: 9 },
      salt: { buy: 20, sell: 12 },
    },
  },
]

const FENWARD: MerchantDef[] = [
  {
    id: 'fenward_spice',
    role: 'fen_gatherer',
    roleLabel: 'Spice broker',
    label: 'Stilt market',
    tagline: 'Spice from the fen edge; peat and moss for those who slog through.',
    icon: '🛖',
    catalog: {
      fen_spice: { buy: 38, sell: 22 },
      peat: { buy: 7, sell: 4 },
      dreaming_moss: { buy: 8, sell: 5 },
      fish: { buy: 22, sell: 13 },
    },
  },
  {
    id: 'fenward_night',
    role: 'night_market',
    roleLabel: 'Night dock',
    label: 'Night dock',
    tagline: 'Echo bottles and fish bones when the fog lifts.',
    icon: '🌑',
    catalog: {
      bottled_echo: { buy: 28, sell: 17 },
      lucky_carp_bone: { buy: 16, sell: 10 },
      herbs: { buy: 9, sell: 5 },
    },
  },
]

export const MERCHANTS_BY_TOWN: Record<TownId, MerchantDef[]> = {
  ashenford: ASHENFORD,
  mirecross: MIRECROSS,
  riversend: RIVERSEND,
  crownpost: CROWNPOST,
  fenward: FENWARD,
}

export function merchantsForTown(townId: TownId): MerchantDef[] {
  return MERCHANTS_BY_TOWN[townId] ?? []
}

export function defaultMerchantIdForTown(townId: TownId): MerchantId {
  const list = merchantsForTown(townId)
  return list[0]?.id ?? ''
}

export function merchantDef(townId: TownId, merchantId: MerchantId): MerchantDef | undefined {
  return merchantsForTown(townId).find((m) => m.id === merchantId)
}

export function isMerchantAtTown(townId: TownId, merchantId: MerchantId): boolean {
  return merchantsForTown(townId).some((m) => m.id === merchantId)
}

export function priceRowFor(
  townId: TownId,
  merchantId: MerchantId,
  goodId: GoodId,
): PriceRow | undefined {
  const m = merchantDef(townId, merchantId)
  return m?.catalog[goodId]
}

/** Buy/sell for this day after deterministic market variance. */
export function effectivePriceRow(
  townId: TownId,
  merchantId: MerchantId,
  goodId: GoodId,
  day: number,
): PriceRow | undefined {
  const row = priceRowFor(townId, merchantId, goodId)
  if (!row) return undefined
  return {
    buy: getEffectivePrice(row.buy, day, merchantId, goodId, 'buy'),
    sell: getEffectivePrice(row.sell, day, merchantId, goodId, 'sell'),
  }
}

/** Best per-unit sell price (what any merchant here pays) for a good today. */
export function bestSellPriceAtTown(townId: TownId, goodId: GoodId, day: number): number {
  let best = 0
  for (const m of merchantsForTown(townId)) {
    const row = effectivePriceRow(townId, m.id, goodId, day)
    if (row && row.sell > best) best = row.sell
  }
  return best
}

/** Median effective buy price for a good across all merchants who list it (this day). */
export function medianEffectiveBuyPrice(goodId: GoodId, day: number): number {
  const buys: number[] = []
  for (const town of Object.values(MERCHANTS_BY_TOWN)) {
    for (const m of town) {
      const row = m.catalog[goodId]
      if (row) {
        buys.push(getEffectivePrice(row.buy, day, m.id, goodId, 'buy'))
      }
    }
  }
  buys.sort((a, b) => a - b)
  const mid = Math.floor(buys.length / 2)
  return buys.length === 0 ? 0 : buys.length % 2 ? buys[mid]! : (buys[mid - 1]! + buys[mid]!) / 2
}

/** Median of base catalog buy prices (no daily variance). */
export function medianBuyPrice(goodId: GoodId): number {
  const buys: number[] = []
  for (const town of Object.values(MERCHANTS_BY_TOWN)) {
    for (const m of town) {
      const row = m.catalog[goodId]
      if (row) buys.push(row.buy)
    }
  }
  buys.sort((a, b) => a - b)
  const mid = Math.floor(buys.length / 2)
  return buys.length === 0 ? 0 : buys.length % 2 ? buys[mid]! : (buys[mid - 1]! + buys[mid]!) / 2
}

export function isLocalDeal(
  townId: TownId,
  merchantId: MerchantId,
  goodId: GoodId,
  day: number,
): boolean {
  const eff = effectivePriceRow(townId, merchantId, goodId, day)
  if (!eff) return false
  const med = medianEffectiveBuyPrice(goodId, day)
  if (med <= 0) return false
  return eff.buy < med * 0.92
}
