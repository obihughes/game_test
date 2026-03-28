import type { GoodId } from '../core/types.ts'

export interface Good {
  id: GoodId
  name: string
  weightPerUnit: number
  dialogFlavorId: string
}

export const GOODS: Record<GoodId, Good> = {
  iron: { id: 'iron', name: 'Iron ingots', weightPerUnit: 2, dialogFlavorId: 'good_iron' },
  silk: { id: 'silk', name: 'Silk bolts', weightPerUnit: 1, dialogFlavorId: 'good_silk' },
  wine: { id: 'wine', name: 'River wine', weightPerUnit: 1, dialogFlavorId: 'good_wine' },
  herbs: { id: 'herbs', name: 'Dried herbs', weightPerUnit: 1, dialogFlavorId: 'good_herbs' },
}

export const GOOD_IDS = Object.keys(GOODS) as GoodId[]

export function goodWeight(g: Good): number {
  return g.weightPerUnit
}