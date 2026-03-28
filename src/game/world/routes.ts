import type { TownId } from '../core/types.ts'

export interface Route {
  from: TownId
  to: TownId
  baseDays: number
  toll: number
}

export const ROUTES: Route[] = [
  { from: 'ashenford', to: 'mirecross', baseDays: 2, toll: 0 },
  { from: 'mirecross', to: 'ashenford', baseDays: 2, toll: 0 },
  { from: 'mirecross', to: 'riversend', baseDays: 3, toll: 5 },
  { from: 'riversend', to: 'mirecross', baseDays: 3, toll: 5 },
  { from: 'ashenford', to: 'riversend', baseDays: 5, toll: 12 },
  { from: 'riversend', to: 'ashenford', baseDays: 5, toll: 12 },
]

export function findRoute(from: TownId, to: TownId): Route | undefined {
  return ROUTES.find((r) => r.from === from && r.to === to)
}