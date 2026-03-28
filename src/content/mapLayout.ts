import type { TownId } from '@/game/core/types.ts'

export type MapLabelAnchor = 'start' | 'middle' | 'end'

export interface MapNodePosition {
  x: number
  y: number
  /** Vertical offset for the town name (negative = above the node). */
  labelDy?: number
  /** Horizontal offset for the town name (used with `labelAnchor`). */
  labelDx?: number
  /** SVG text-anchor; default `middle`. */
  labelAnchor?: MapLabelAnchor
}

/** Visual layout only — spaced to reduce edge crossings and label overlap. */
export const MAP_POSITIONS: Record<TownId, MapNodePosition> = {
  stoneholt: { x: 14, y: 42, labelDy: -6 },
  ashenford: { x: 21, y: 65, labelDy: 11 },
  crownpost: { x: 32, y: 47, labelDy: -7 },
  mirecross: { x: 56, y: 43, labelDy: -8 },
  fenward: { x: 63, y: 21, labelDy: -6 },
  riversend: { x: 79, y: 55, labelDy: 10 },
  saltmere: { x: 86, y: 77, labelDy: 9 },
}