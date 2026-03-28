import type { GoodId, MerchantId, TownId } from '../core/types.ts'
import { GOOD_IDS } from './goods.ts'
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
  | 'mine_factor'
  | 'supply_post'
  | 'salt_factor'
  | 'coastal_trader'
  | 'grain_merchant'
  | 'tallow_chandler'

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
    tagline: 'Iron and coal run cheap where the mountain bleeds.',
    icon: '🔥',
    catalog: {
      iron: { buy: 10, sell: 6 },
      coal: { buy: 8, sell: 5 },
      metal_tools: { buy: 18, sell: 11 },
      obsidian_glass: { buy: 13, sell: 8 },
    },
  },
  {
    id: 'ashenford_ash_market',
    role: 'general_market',
    roleLabel: 'Market hall',
    label: 'Ash Market stall',
    tagline: 'Miners need salt, fish, and grain — and pay dearly for all three.',
    icon: '🛒',
    catalog: {
      silk: { buy: 28, sell: 22 },
      wine: { buy: 16, sell: 13 },
      salt: { buy: 22, sell: 16 },
      fresh_fish: { buy: 16, sell: 10 },
      salted_fish: { buy: 24, sell: 18 },
      smoked_fish: { buy: 32, sell: 24 },
      grain: { buy: 16, sell: 12 },
      tallow: { buy: 15, sell: 11 },
      herbs: { buy: 12, sell: 7 },
      rope: { buy: 9, sell: 5 },
      crown_amber: { buy: 58, sell: 44 },
      fen_spice: { buy: 46, sell: 34 },
    },
  },
]

const MIRECROSS: MerchantDef[] = [
  {
    id: 'mirecross_fen_vendor',
    role: 'fen_gatherer',
    roleLabel: 'Fen gatherer',
    label: 'Fen reed-merchant',
    tagline: 'Peat, timber, and river catch — the fen provides what the road forgets.',
    icon: '🌫️',
    catalog: {
      peat: { buy: 4, sell: 2 },
      timber: { buy: 11, sell: 7 },
      fresh_fish: { buy: 9, sell: 5 },
      fish_sauce: { buy: 42, sell: 30 },
      herbs: { buy: 7, sell: 4 },
      tallow: { buy: 8, sell: 6 },
    },
  },
  {
    id: 'mirecross_reed_house',
    role: 'dry_goods_post',
    roleLabel: 'Dry goods',
    label: 'Reed House trading post',
    tagline: 'Iron and coal cost blood here — bring some from the mountain.',
    icon: '🏚️',
    catalog: {
      silk: { buy: 22, sell: 16 },
      rope: { buy: 8, sell: 5 },
      wine: { buy: 12, sell: 8 },
      salt: { buy: 18, sell: 11 },
      iron: { buy: 26, sell: 16 },
      coal: { buy: 20, sell: 12 },
      metal_tools: { buy: 28, sell: 17 },
      grain: { buy: 10, sell: 6 },
    },
  },
  {
    id: 'mirecross_moss_witch',
    role: 'occult_merchant',
    roleLabel: 'Occult trader',
    label: 'The moss witch',
    tagline: 'Dreaming moss and fen remedies — no refunds if you dream wrong.',
    icon: '🐸',
    catalog: {
      dreaming_moss: { buy: 6, sell: 4 },
      herbs: { buy: 7, sell: 4 },
      peat: { buy: 4, sell: 2 },
    },
  },
]

const RIVERSEND: MerchantDef[] = [
  {
    id: 'riversend_fishmonger',
    role: 'fishmonger',
    roleLabel: 'Fishmonger',
    label: 'Smoke & scales',
    tagline: 'Fresh catch cheap as river water; we buy back what you cure.',
    icon: '🎣',
    catalog: {
      fresh_fish: { buy: 6, sell: 4 },
      salted_fish: { buy: 14, sell: 10 },
      smoked_fish: { buy: 18, sell: 14 },
      salt: { buy: 8, sell: 5 },
      peat: { buy: 8, sell: 6 },
    },
  },
  {
    id: 'riversend_harbor',
    role: 'harbor_factor',
    roleLabel: 'Harbor factor',
    label: 'Harbor factor',
    tagline: 'Ships need pitch, rope, and timber — all dear when the tide is in.',
    icon: '⚓',
    catalog: {
      rope: { buy: 7, sell: 4 },
      pitch: { buy: 22, sell: 13 },
      timber: { buy: 24, sell: 14 },
      wine: { buy: 18, sell: 14 },
      silk: { buy: 34, sell: 24 },
      coal: { buy: 22, sell: 13 },
      metal_tools: { buy: 32, sell: 19 },
      grain: { buy: 18, sell: 11 },
      crown_amber: { buy: 54, sell: 40 },
      obsidian_glass: { buy: 20, sell: 14 },
    },
  },
  {
    id: 'riversend_tide_market',
    role: 'night_market',
    roleLabel: 'Night market',
    label: 'Tide Market',
    tagline: 'Open when the bell rings; moon herbs, fen moss, and fish sauce on the side.',
    icon: '🌙',
    catalog: {
      herbs: { buy: 7, sell: 4 },
      dreaming_moss: { buy: 12, sell: 9 },
      fish_sauce: { buy: 28, sell: 22 },
      iron: { buy: 20, sell: 12 },
      fen_spice: { buy: 46, sell: 34 },
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
      crown_amber: { buy: 38, sell: 24 },
      wine: { buy: 12, sell: 8 },
      silk: { buy: 20, sell: 14 },
      grain: { buy: 10, sell: 6 },
      herbs: { buy: 11, sell: 6 },
      smoked_fish: { buy: 34, sell: 25 },
      fish_sauce: { buy: 44, sell: 34 },
      tallow: { buy: 13, sell: 11 },
      fen_spice: { buy: 48, sell: 36 },
      dreaming_moss: { buy: 14, sell: 10 },
      obsidian_glass: { buy: 20, sell: 14 },
    },
  },
  {
    id: 'crownpost_roadhouse',
    role: 'dry_goods_post',
    roleLabel: 'Road factor',
    label: 'Post road factor',
    tagline: 'Coal, timber, and tools — the crown road eats them faster than we stock them.',
    icon: '📦',
    catalog: {
      iron: { buy: 13, sell: 8 },
      rope: { buy: 10, sell: 7 },
      obsidian_glass: { buy: 15, sell: 11 },
      salt: { buy: 20, sell: 12 },
      coal: { buy: 18, sell: 11 },
      timber: { buy: 22, sell: 13 },
      metal_tools: { buy: 26, sell: 16 },
      pitch: { buy: 20, sell: 12 },
    },
  },
]

const FENWARD: MerchantDef[] = [
  {
    id: 'fenward_spice',
    role: 'fen_gatherer',
    roleLabel: 'Spice broker',
    label: 'Stilt market',
    tagline: 'Pitch, spice, and timber from the fen edge — bring grain if you want to eat.',
    icon: '🛖',
    catalog: {
      fen_spice: { buy: 30, sell: 18 },
      peat: { buy: 5, sell: 3 },
      pitch: { buy: 11, sell: 7 },
      timber: { buy: 12, sell: 7 },
      dreaming_moss: { buy: 8, sell: 5 },
      fresh_fish: { buy: 11, sell: 6 },
      smoked_fish: { buy: 22, sell: 16 },
      fish_sauce: { buy: 38, sell: 30 },
    },
  },
  {
    id: 'fenward_night',
    role: 'night_market',
    roleLabel: 'Night dock',
    label: 'Night dock',
    tagline: 'Grain, tools, and coal — the fen pays dearly for what it cannot make.',
    icon: '🌑',
    catalog: {
      dreaming_moss: { buy: 12, sell: 8 },
      herbs: { buy: 9, sell: 5 },
      grain: { buy: 20, sell: 14 },
      coal: { buy: 22, sell: 15 },
      metal_tools: { buy: 34, sell: 24 },
      salt: { buy: 18, sell: 12 },
    },
  },
]

const STONEHOLT: MerchantDef[] = [
  {
    id: 'stoneholt_mine_factor',
    role: 'mine_factor',
    roleLabel: 'Mine factor',
    label: 'Deep Seam trading post',
    tagline: 'Coal and iron straight from the rock — cheapest this side of the mountain.',
    icon: '⛏️',
    catalog: {
      coal: { buy: 6, sell: 4 },
      iron: { buy: 9, sell: 5 },
      metal_tools: { buy: 16, sell: 10 },
      obsidian_glass: { buy: 11, sell: 7 },
    },
  },
  {
    id: 'stoneholt_supply_post',
    role: 'supply_post',
    roleLabel: 'Supply post',
    label: "Miner's supply post",
    tagline: 'Grain, wine, and silk cost double up here — but the miners will pay it.',
    icon: '🏕️',
    catalog: {
      grain: { buy: 20, sell: 12 },
      wine: { buy: 22, sell: 17 },
      herbs: { buy: 15, sell: 9 },
      silk: { buy: 32, sell: 24 },
      rope: { buy: 11, sell: 7 },
      salt: { buy: 24, sell: 14 },
      crown_amber: { buy: 56, sell: 44 },
    },
  },
]

const SALTMERE: MerchantDef[] = [
  {
    id: 'saltmere_salt_factor',
    role: 'salt_factor',
    roleLabel: 'Salt factor',
    label: 'Pan & brine house',
    tagline: 'Salt evaporated from the coast flats — cheapest salt on the road.',
    icon: '🧂',
    catalog: {
      salt: { buy: 6, sell: 4 },
      fresh_fish: { buy: 5, sell: 3 },
      pitch: { buy: 10, sell: 6 },
      rope: { buy: 5, sell: 3 },
    },
  },
  {
    id: 'saltmere_coastal_trader',
    role: 'coastal_trader',
    roleLabel: 'Coastal trader',
    label: 'Saltmere quayside stall',
    tagline: 'We fish and salt — bring grain, coal, and tools or go hungry with us.',
    icon: '🌊',
    catalog: {
      grain: { buy: 20, sell: 12 },
      coal: { buy: 24, sell: 14 },
      metal_tools: { buy: 34, sell: 21 },
      timber: { buy: 26, sell: 16 },
      salted_fish: { buy: 12, sell: 8 },
      smoked_fish: { buy: 16, sell: 12 },
    },
  },
]

export const MERCHANTS_BY_TOWN: Record<TownId, MerchantDef[]> = {
  ashenford: ASHENFORD,
  mirecross: MIRECROSS,
  riversend: RIVERSEND,
  crownpost: CROWNPOST,
  fenward: FENWARD,
  stoneholt: STONEHOLT,
  saltmere: SALTMERE,
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

/** Cheapest base buy price (no daily variance) for a good in town. */
export function bestBaseBuyPriceAtTown(townId: TownId, goodId: GoodId): number {
  let best = Number.POSITIVE_INFINITY
  for (const m of merchantsForTown(townId)) {
    const row = m.catalog[goodId]
    if (row && row.buy < best) best = row.buy
  }
  return Number.isFinite(best) ? best : 0
}

/** Best base sell price (no daily variance) for a good in town. */
export function bestBaseSellPriceAtTown(townId: TownId, goodId: GoodId): number {
  let best = 0
  for (const m of merchantsForTown(townId)) {
    const row = m.catalog[goodId]
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

/** Median of base catalog sell prices (no daily variance). */
export function medianSellPrice(goodId: GoodId): number {
  const sells: number[] = []
  for (const town of Object.values(MERCHANTS_BY_TOWN)) {
    for (const m of town) {
      const row = m.catalog[goodId]
      if (row) sells.push(row.sell)
    }
  }
  sells.sort((a, b) => a - b)
  const mid = Math.floor(sells.length / 2)
  return sells.length === 0 ? 0 : sells.length % 2 ? sells[mid]! : (sells[mid - 1]! + sells[mid]!) / 2
}

/**
 * Goods this town is structurally good at selling to the player.
 * Uses base prices so the town identity stays stable across days.
 */
export function townPrimaryGoods(townId: TownId, limit = 4): GoodId[] {
  return GOOD_IDS
    .map((goodId) => {
      const localBuy = bestBaseBuyPriceAtTown(townId, goodId)
      const median = medianBuyPrice(goodId)
      if (localBuy <= 0 || median <= 0) return null
      const advantage = median - localBuy
      if (advantage <= 0) return null
      return { goodId, score: advantage / median, tieBreak: advantage, localBuy }
    })
    .filter((entry): entry is { goodId: GoodId; score: number; tieBreak: number; localBuy: number } => entry !== null)
    .sort((a, b) => b.score - a.score || b.tieBreak - a.tieBreak || a.localBuy - b.localBuy)
    .slice(0, limit)
    .map((entry) => entry.goodId)
}

/**
 * Goods this town structurally pays above the wider market for.
 * Uses base prices so "wanted here" remains readable and predictable.
 */
export function townDemandGoods(townId: TownId, limit = 4): GoodId[] {
  return GOOD_IDS
    .map((goodId) => {
      const localSell = bestBaseSellPriceAtTown(townId, goodId)
      const median = medianSellPrice(goodId)
      if (localSell <= 0 || median <= 0) return null
      const premium = localSell - median
      if (premium <= 0) return null
      return { goodId, score: premium / median, tieBreak: premium, localSell }
    })
    .filter((entry): entry is { goodId: GoodId; score: number; tieBreak: number; localSell: number } => entry !== null)
    .sort((a, b) => b.score - a.score || b.tieBreak - a.tieBreak || b.localSell - a.localSell)
    .slice(0, limit)
    .map((entry) => entry.goodId)
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
