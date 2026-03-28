import type { TownId } from '@/game/core/types.ts'

export interface MapNodePosition {
  x: number
  y: number
}

export const MAP_POSITIONS: Record<TownId, MapNodePosition> = {
  ashenford: { x: 18, y: 62 },
  mirecross: { x: 48, y: 38 },
  riversend: { x: 78, y: 68 },
}