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
  fish: {
    id: 'fish',
    name: 'Barrel of smoked fish',
    weightPerUnit: 2,
    dialogFlavorId: 'good_fish',
    icon: '🐟',
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
}

export const GOOD_IDS = Object.keys(GOODS) as GoodId[]

export function goodWeight(g: Good): number {
  return g.weightPerUnit
}
