import type { GoodId, TownId } from '../core/types.ts'

export interface TownDemandNote {
  goodId: GoodId
  reason: string
}

export interface TownEconomyProfile {
  marketBackstory: string
  thrivingIndustries: string[]
  importDemand: TownDemandNote[]
  fallbackDemand: Partial<Record<GoodId, number>>
}

const DEFAULT_FALLBACK_DEMAND: Record<GoodId, number> = {
  iron: 0.5,
  silk: 0.4,
  wine: 0.55,
  herbs: 0.58,
  fresh_fish: 0.72,
  salted_fish: 0.68,
  smoked_fish: 0.7,
  fish_sauce: 0.45,
  salt: 0.62,
  rope: 0.5,
  peat: 0.48,
  obsidian_glass: 0.38,
  dreaming_moss: 0.4,
  crown_amber: 0.36,
  fen_spice: 0.42,
  coal: 0.52,
  metal_tools: 0.52,
  grain: 0.68,
  timber: 0.55,
  pitch: 0.5,
  tallow: 0.5,
}

export const TOWN_ECONOMY: Record<TownId, TownEconomyProfile> = {
  ashenford: {
    marketBackstory:
      'Ashenford feeds a forge-city stretched around old army yards. The furnaces never stop for long, so teamsters, smelters, and boarding houses keep buying food, lamp goods, and travel luxuries even when the named stalls are not actively posting for them.',
    thrivingIndustries: ['Iron smelting', 'Tool forging', 'Coal hauling', 'Wagon repair'],
    importDemand: [
      { goodId: 'grain', reason: 'Forge hands and carters need steady grain shipments because little farmland survives under the soot.' },
      { goodId: 'salt', reason: 'Salt keeps meat, hides, and rations usable for crews working long shifts around the furnaces.' },
      { goodId: 'fresh_fish', reason: 'Fresh food disappears fast in a crowded work town with more fires than gardens.' },
      { goodId: 'salted_fish', reason: 'Preserved fish is dependable camp food for miners, guards, and road crews.' },
      { goodId: 'smoked_fish', reason: 'Smoke-cured fish sells to foremen and taverns that want better fare than plain sacks of grain.' },
      { goodId: 'tallow', reason: 'Lanterns, bunkhouses, and late-night workshops burn through cheap light constantly.' },
    ],
    fallbackDemand: {
      grain: 0.82,
      salt: 0.78,
      fresh_fish: 0.8,
      salted_fish: 0.76,
      smoked_fish: 0.8,
      tallow: 0.72,
      herbs: 0.64,
      wine: 0.62,
    },
  },
  mirecross: {
    marketBackstory:
      'Mirecross is a muddy chokepoint rather than a large production town, so its economy revolves around making the swamp livable and keeping travelers moving. Everyday demand comes from ferrymen, reed-cutters, and caravans forced to resupply on bad ground.',
    thrivingIndustries: ['Peat cutting', 'Reed timbering', 'Herbal remedies', 'Swamp ferries'],
    importDemand: [
      { goodId: 'iron', reason: 'Bog tools rot and snap quickly, so iron is always needed to replace blades, nails, and hooks.' },
      { goodId: 'coal', reason: 'Dry heat is scarce in the wet fen, making dense fuel more valuable than raw peat alone.' },
      { goodId: 'metal_tools', reason: 'Carpenters and boatmen pay well for tools that survive mire work.' },
      { goodId: 'grain', reason: 'The fen supports people, not fields, so carts of grain keep the crossroads fed.' },
      { goodId: 'salt', reason: 'Salt preserves fish and keeps swamp meat from spoiling in the damp.' },
    ],
    fallbackDemand: {
      iron: 0.8,
      coal: 0.74,
      metal_tools: 0.82,
      grain: 0.76,
      salt: 0.74,
      wine: 0.58,
      tallow: 0.62,
    },
  },
  riversend: {
    marketBackstory:
      'Riversend sits where river traffic meets sea-going trade, so even goods not on a formal stall sheet can move through chandlers, taverns, and ship crews. The town buys whatever helps load ships faster or feed the waterfront while cargo waits on the tide.',
    thrivingIndustries: ['Ship provisioning', 'Fish curing', 'Rope and sail supply', 'River customs'],
    importDemand: [
      { goodId: 'timber', reason: 'Docks, hull repairs, and new masts keep timber in constant demand.' },
      { goodId: 'pitch', reason: 'Every boatyard and wharf wants pitch for sealing planks, ropes, and barrels.' },
      { goodId: 'rope', reason: 'Lines wear out fast under wet salt wind and heavy cargo work.' },
      { goodId: 'grain', reason: 'Harbor taverns and crews need bulk food that stores well between departures.' },
      { goodId: 'coal', reason: 'Smiths, smokehouses, and chandlers all pay for hotter-burning fuel.' },
    ],
    fallbackDemand: {
      timber: 0.82,
      pitch: 0.8,
      rope: 0.74,
      grain: 0.74,
      coal: 0.72,
      metal_tools: 0.72,
      wine: 0.66,
    },
  },
  crownpost: {
    marketBackstory:
      'Crownpost is the richest ledger town on the road, and its buyers are clerks, officers, and warehouse brokers rather than miners or fishers. Goods that signal status, preserve official stores, or keep the toll district comfortable all find a buyer somewhere behind the customs ring.',
    thrivingIndustries: ['Amber grading', 'Tax warehousing', 'Road logistics', 'Clerk services'],
    importDemand: [
      { goodId: 'smoked_fish', reason: 'Officials and caravan guards want preserved food that travels well and eats better than field rations.' },
      { goodId: 'fish_sauce', reason: 'City kitchens and wealthy tables pay for sharper condiments than inland towns normally see.' },
      { goodId: 'fen_spice', reason: 'Spice is a prestige good here, sold into inns, manor houses, and gift traffic.' },
      { goodId: 'dreaming_moss', reason: 'Apothecaries and discreet buyers in the customs quarter keep a steady whisper-market.' },
      { goodId: 'obsidian_glass', reason: 'Clerks, shrines, and wealthy homes pay for fine dark panes and polished fittings.' },
    ],
    fallbackDemand: {
      smoked_fish: 0.84,
      fish_sauce: 0.8,
      fen_spice: 0.82,
      dreaming_moss: 0.7,
      obsidian_glass: 0.72,
      silk: 0.68,
      wine: 0.66,
    },
  },
  fenward: {
    marketBackstory:
      'Fenward is a small stilt settlement serving marsh gatherers and night-dock smugglers, so it makes good money from what the fen yields but depends on imported staples to keep everyone working. When the formal stalls pass on a cargo, cooks, dockhands, and brokers still take what they can use.',
    thrivingIndustries: ['Spice gathering', 'Pitch boiling', 'Fen timbering', 'Night docking'],
    importDemand: [
      { goodId: 'grain', reason: 'The marsh cannot feed a growing dock town, so grain shipments matter every week.' },
      { goodId: 'metal_tools', reason: 'Axes, hooks, and cutting tools wear down fast in wet wood and peat work.' },
      { goodId: 'coal', reason: 'Dense fuel is prized where damp weather ruins weaker fires.' },
      { goodId: 'salt', reason: 'Salt keeps fish and marsh game marketable beyond the next sunrise.' },
      { goodId: 'fish_sauce', reason: 'Fen cooks and traders both pay for strong preserved flavor that keeps through humid weather.' },
    ],
    fallbackDemand: {
      grain: 0.84,
      metal_tools: 0.86,
      coal: 0.8,
      salt: 0.78,
      fish_sauce: 0.74,
      tallow: 0.62,
    },
  },
  stoneholt: {
    marketBackstory:
      'Stoneholt is a high-pass mining camp with almost no room for farms, herds, or comfort trades. That makes daily necessities easy to move even when the official post is focused on ore, because hungry miners and quartermasters will buy usable supplies straight off a cart.',
    thrivingIndustries: ['Deep mining', 'Ore sorting', 'Camp smithing', 'Pass freight hauling'],
    importDemand: [
      { goodId: 'grain', reason: 'Stoneholt cannot grow enough food on the ridge, so grain is the camp’s baseline necessity.' },
      { goodId: 'salt', reason: 'Salt preserves scarce meat and keeps long-haul camp stores from rotting.' },
      { goodId: 'wine', reason: 'Miners spend freely on morale goods after a hard shift in the tunnels.' },
      { goodId: 'herbs', reason: 'Herbs are bought for poultices, teas, and the endless cough of dust-heavy work.' },
      { goodId: 'rope', reason: 'Winches, lifts, and tunnel crews always need fresh rope in reserve.' },
    ],
    fallbackDemand: {
      grain: 0.88,
      salt: 0.8,
      wine: 0.74,
      herbs: 0.7,
      rope: 0.72,
      fresh_fish: 0.76,
      salted_fish: 0.78,
      smoked_fish: 0.8,
      tallow: 0.74,
    },
  },
  saltmere: {
    marketBackstory:
      'Saltmere lives off brine pans, fishing boats, and wind-beaten coastal trade, so the town sells salt and preserved catch but has to import much of what keeps the shoreline working. Even without a posted stall, crews, salters, and dock cooks will buy practical cargo that the coast cannot spare itself.',
    thrivingIndustries: ['Salt boiling', 'Coastal fishing', 'Fish curing', 'Small-boat repair'],
    importDemand: [
      { goodId: 'grain', reason: 'The flats feed fish and salt pans, not fields, so grain ships are essential.' },
      { goodId: 'coal', reason: 'Hotter fuel speeds boiling, metalwork, and storm-season repairs.' },
      { goodId: 'metal_tools', reason: 'Hooks, knives, and pan tools wear out quickly in brine and wind.' },
      { goodId: 'timber', reason: 'Timber is needed for pier repairs, pan braces, and boat patching.' },
      { goodId: 'wine', reason: 'Coastal crews spend on drink when the catch or salt run is good.' },
    ],
    fallbackDemand: {
      grain: 0.84,
      coal: 0.82,
      metal_tools: 0.86,
      timber: 0.8,
      wine: 0.64,
      tallow: 0.62,
    },
  },
}

export function getTownEconomyProfile(townId: TownId): TownEconomyProfile {
  return TOWN_ECONOMY[townId] ?? TOWN_ECONOMY.ashenford
}

export function getTownDemandReason(townId: TownId, goodId: GoodId): string | null {
  return getTownEconomyProfile(townId).importDemand.find((entry) => entry.goodId === goodId)?.reason ?? null
}

export function getTownFallbackDemandMultiplier(townId: TownId, goodId: GoodId): number {
  return getTownEconomyProfile(townId).fallbackDemand[goodId] ?? DEFAULT_FALLBACK_DEMAND[goodId] ?? 0
}
