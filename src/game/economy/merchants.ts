import type { GoodId, MerchantId, TownId } from '../core/types.ts'
import type { PriceRow } from './prices.ts'

export interface MerchantDef {
  id: MerchantId
  label: string
  tagline: string
  icon: string
  /** Goods this merchant will buy from or sell to you; omitted goods are not traded here. */
  catalog: Partial<Record<GoodId, PriceRow>>
}

const ASHENFORD: MerchantDef[] = [
  {
    id: 'ashenford_blacksmith',
    label: 'Hearth & Hammer',
    tagline: 'Iron runs cheap where the mountain bleeds.',
    icon: '🔥',
    catalog: {
      iron: { buy: 11, sell: 7 },
      obsidian_glass: { buy: 14, sell: 9 },
      chain_gang_tools: { buy: 26, sell: 16 },
      rope: { buy: 10, sell: 6 },
    },
  },
  {
    id: 'ashenford_ash_market',
    label: 'Ash Market stall',
    tagline: 'A bit of everything the caravans cough up.',
    icon: '🛒',
    catalog: {
      iron: { buy: 19, sell: 11 },
      silk: { buy: 28, sell: 17 },
      wine: { buy: 16, sell: 9 },
      herbs: { buy: 10, sell: 6 },
      rope: { buy: 9, sell: 5 },
      salt: { buy: 22, sell: 13 },
      fish: { buy: 24, sell: 14 },
    },
  },
  {
    id: 'ashenford_binder',
    label: 'Binder of contracts',
    tagline: 'Passage debt, indenture, and tools for those who work it off.',
    icon: '📋',
    catalog: {
      indenture_scroll: { buy: 45, sell: 28 },
      chain_gang_tools: { buy: 24, sell: 15 },
      herbs: { buy: 12, sell: 7 },
      rope: { buy: 11, sell: 7 },
    },
  },
]

const MIRECROSS: MerchantDef[] = [
  {
    id: 'mirecross_fen_vendor',
    label: 'Fen reed-merchant',
    tagline: 'Peat, moss, and whatever the fog leaves behind.',
    icon: '🌫️',
    catalog: {
      peat: { buy: 6, sell: 4 },
      dreaming_moss: { buy: 9, sell: 5 },
      herbs: { buy: 8, sell: 5 },
      bottled_echo: { buy: 32, sell: 19 },
      fish: { buy: 26, sell: 15 },
      silk: { buy: 30, sell: 18 },
    },
  },
  {
    id: 'mirecross_reed_house',
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
    label: 'The moss witch',
    tagline: 'Bottled voices, lucky bones, no refunds if you dream wrong.',
    icon: '🐸',
    catalog: {
      dreaming_moss: { buy: 7, sell: 4 },
      bottled_echo: { buy: 28, sell: 17 },
      lucky_carp_bone: { buy: 18, sell: 11 },
      herbs: { buy: 11, sell: 6 },
      peat: { buy: 9, sell: 5 },
    },
  },
]

const RIVERSEND: MerchantDef[] = [
  {
    id: 'riversend_fishmonger',
    label: 'Smoke & scales',
    tagline: 'Fish cheap as river water; the rest pays for the smoke.',
    icon: '🎣',
    catalog: {
      fish: { buy: 7, sell: 4 },
      salt: { buy: 12, sell: 7 },
      lucky_carp_bone: { buy: 14, sell: 8 },
      rope: { buy: 9, sell: 5 },
    },
  },
  {
    id: 'riversend_harbor',
    label: 'Harbor factor',
    tagline: 'Tar, rope, and what the tide forgot on the pilings.',
    icon: '⚓',
    catalog: {
      salt: { buy: 10, sell: 6 },
      rope: { buy: 7, sell: 4 },
      wine: { buy: 18, sell: 11 },
      fish: { buy: 12, sell: 7 },
      silk: { buy: 34, sell: 20 },
      iron: { buy: 20, sell: 12 },
    },
  },
  {
    id: 'riversend_tide_market',
    label: 'Tide Market',
    tagline: 'Open when the bell rings; prices follow the moon.',
    icon: '🌙',
    catalog: {
      fish: { buy: 10, sell: 6 },
      wine: { buy: 21, sell: 12 },
      herbs: { buy: 7, sell: 4 },
      rope: { buy: 8, sell: 5 },
      salt: { buy: 11, sell: 7 },
      silk: { buy: 30, sell: 18 },
    },
  },
]

export const MERCHANTS_BY_TOWN: Record<TownId, MerchantDef[]> = {
  ashenford: ASHENFORD,
  mirecross: MIRECROSS,
  riversend: RIVERSEND,
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

const medianCache = new Map<GoodId, number>()

/** Median buy price for a good across all merchants who list it (for “local deal” UI). */
export function medianBuyPrice(goodId: GoodId): number {
  const c = medianCache.get(goodId)
  if (c !== undefined) return c
  const buys: number[] = []
  for (const town of Object.values(MERCHANTS_BY_TOWN)) {
    for (const m of town) {
      const row = m.catalog[goodId]
      if (row) buys.push(row.buy)
    }
  }
  buys.sort((a, b) => a - b)
  const mid = Math.floor(buys.length / 2)
  const med = buys.length === 0 ? 0 : buys.length % 2 ? buys[mid]! : (buys[mid - 1]! + buys[mid]!) / 2
  medianCache.set(goodId, med)
  return med
}

export function isLocalDeal(townId: TownId, merchantId: MerchantId, goodId: GoodId): boolean {
  const row = priceRowFor(townId, merchantId, goodId)
  if (!row) return false
  const med = medianBuyPrice(goodId)
  if (med <= 0) return false
  return row.buy < med * 0.92
}
