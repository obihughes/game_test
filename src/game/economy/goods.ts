import type { GoodId } from '../core/types.ts'

export interface Good {
  id: GoodId
  name: string
  weightPerUnit: number
  dialogFlavorId: string
  /** Shown in lists and cards (emoji / symbol). */
  icon: string
}

export const GOODS: Record<GoodId, Good> = {
  iron: {
    id: 'iron',
    name: 'Iron ingots',
    weightPerUnit: 2,
    dialogFlavorId: 'good_iron',
    icon: '⚙️',
  },
  silk: {
    id: 'silk',
    name: 'Silk bolts',
    weightPerUnit: 1,
    dialogFlavorId: 'good_silk',
    icon: '🧵',
  },
  wine: {
    id: 'wine',
    name: 'River wine',
    weightPerUnit: 1,
    dialogFlavorId: 'good_wine',
    icon: '🍷',
  },
  herbs: {
    id: 'herbs',
    name: 'Dried herbs',
    weightPerUnit: 1,
    dialogFlavorId: 'good_herbs',
    icon: '🌿',
  },
  fresh_fish: {
    id: 'fresh_fish',
    name: 'Fresh fish',
    weightPerUnit: 2,
    dialogFlavorId: 'good_fresh_fish',
    icon: '🐟',
  },
  salted_fish: {
    id: 'salted_fish',
    name: 'Salt fish',
    weightPerUnit: 2,
    dialogFlavorId: 'good_salted_fish',
    icon: '🥩',
  },
  smoked_fish: {
    id: 'smoked_fish',
    name: 'Smoked fish',
    weightPerUnit: 2,
    dialogFlavorId: 'good_smoked_fish',
    icon: '🍖',
  },
  fish_sauce: {
    id: 'fish_sauce',
    name: 'Fish sauce (jug)',
    weightPerUnit: 1,
    dialogFlavorId: 'good_fish_sauce',
    icon: '🫙',
  },
  salt: {
    id: 'salt',
    name: 'Sack of salt',
    weightPerUnit: 2,
    dialogFlavorId: 'good_salt',
    icon: '🧂',
  },
  rope: {
    id: 'rope',
    name: 'Coiled hemp rope',
    weightPerUnit: 1,
    dialogFlavorId: 'good_rope',
    icon: '🪢',
  },
  peat: {
    id: 'peat',
    name: 'Bricks of peat',
    weightPerUnit: 2,
    dialogFlavorId: 'good_peat',
    icon: '🟤',
  },
  obsidian_glass: {
    id: 'obsidian_glass',
    name: 'Obsidian glass panes',
    weightPerUnit: 1,
    dialogFlavorId: 'good_obsidian_glass',
    icon: '🪟',
  },
  dreaming_moss: {
    id: 'dreaming_moss',
    name: 'Dreaming moss',
    weightPerUnit: 1,
    dialogFlavorId: 'good_dreaming_moss',
    icon: '🫧',
  },
  crown_amber: {
    id: 'crown_amber',
    name: 'Crown amber',
    weightPerUnit: 1,
    dialogFlavorId: 'good_crown_amber',
    icon: '💎',
  },
  fen_spice: {
    id: 'fen_spice',
    name: 'Fen spice crate',
    weightPerUnit: 2,
    dialogFlavorId: 'good_fen_spice',
    icon: '🧄',
  },
  coal: {
    id: 'coal',
    name: 'Sack of coal',
    weightPerUnit: 2,
    dialogFlavorId: 'good_coal',
    icon: '🪨',
  },
  metal_tools: {
    id: 'metal_tools',
    name: 'Iron tools (crate)',
    weightPerUnit: 2,
    dialogFlavorId: 'good_metal_tools',
    icon: '🔨',
  },
  grain: {
    id: 'grain',
    name: 'Grain sack',
    weightPerUnit: 2,
    dialogFlavorId: 'good_grain',
    icon: '🌾',
  },
  timber: {
    id: 'timber',
    name: 'Timber bundle',
    weightPerUnit: 3,
    dialogFlavorId: 'good_timber',
    icon: '🪵',
  },
  pitch: {
    id: 'pitch',
    name: 'Pitch barrel',
    weightPerUnit: 2,
    dialogFlavorId: 'good_pitch',
    icon: '🛢️',
  },
  tallow: {
    id: 'tallow',
    name: 'Tallow candles',
    weightPerUnit: 1,
    dialogFlavorId: 'good_tallow',
    icon: '🕯️',
  },
  polished_amber: {
    id: 'polished_amber',
    name: 'Polished amber',
    weightPerUnit: 1,
    dialogFlavorId: 'good_polished_amber',
    icon: '🟡',
  },
  seasoned_spice: {
    id: 'seasoned_spice',
    name: 'Seasoned spice blend',
    weightPerUnit: 1,
    dialogFlavorId: 'good_seasoned_spice',
    icon: '🫙',
  },
  cut_glass: {
    id: 'cut_glass',
    name: 'Cut obsidian glass',
    weightPerUnit: 1,
    dialogFlavorId: 'good_cut_glass',
    icon: '💠',
  },
}

export const GOOD_IDS = Object.keys(GOODS) as GoodId[]

export function goodWeight(g: Good): number {
  return g.weightPerUnit
}
