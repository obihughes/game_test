import type { TownId } from '../core/types.ts'

export interface Town {
  id: TownId
  name: string
}

export const TOWNS: Record<TownId, Town> = {
  ashenford: { id: 'ashenford', name: 'Ashenford' },
  mirecross: { id: 'mirecross', name: 'Mirecross' },
  riversend: { id: 'riversend', name: 'Riversend' },
  crownpost: { id: 'crownpost', name: 'Crownpost' },
  fenward: { id: 'fenward', name: 'Fenward' },
  stoneholt: { id: 'stoneholt', name: 'Stoneholt' },
  saltmere: { id: 'saltmere', name: 'Saltmere' },
}

export const TOWN_IDS = Object.keys(TOWNS) as TownId[]