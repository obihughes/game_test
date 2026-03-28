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
  { from: 'ashenford', to: 'crownpost', baseDays: 3, toll: 5 },
  { from: 'crownpost', to: 'ashenford', baseDays: 3, toll: 5 },
  { from: 'crownpost', to: 'mirecross', baseDays: 2, toll: 4 },
  { from: 'mirecross', to: 'crownpost', baseDays: 2, toll: 4 },
  { from: 'crownpost', to: 'riversend', baseDays: 4, toll: 8 },
  { from: 'riversend', to: 'crownpost', baseDays: 4, toll: 8 },
  { from: 'mirecross', to: 'fenward', baseDays: 3, toll: 4 },
  { from: 'fenward', to: 'mirecross', baseDays: 3, toll: 4 },
  { from: 'fenward', to: 'riversend', baseDays: 2, toll: 6 },
  { from: 'riversend', to: 'fenward', baseDays: 2, toll: 6 },
  { from: 'crownpost', to: 'fenward', baseDays: 3, toll: 5 },
  { from: 'fenward', to: 'crownpost', baseDays: 3, toll: 5 },
  // Stoneholt — mountain spur above Ashenford (harsh winter road)
  { from: 'ashenford', to: 'stoneholt', baseDays: 2, toll: 0 },
  { from: 'stoneholt', to: 'ashenford', baseDays: 2, toll: 0 },
  // Saltmere — salt coast spur south of Riversend
  { from: 'riversend', to: 'saltmere', baseDays: 2, toll: 3 },
  { from: 'saltmere', to: 'riversend', baseDays: 2, toll: 3 },
]

export function findRoute(from: TownId, to: TownId): Route | undefined {
  return ROUTES.find((r) => r.from === from && r.to === to)
}

type TravelPathCost = {
  baseDays: number
  legs: number
  toll: number
}

function comparePathCost(a: TravelPathCost, b: TravelPathCost): number {
  if (a.baseDays !== b.baseDays) return a.baseDays - b.baseDays
  if (a.legs !== b.legs) return a.legs - b.legs
  return a.toll - b.toll
}

export function findTravelPath(from: TownId, to: TownId): Route[] | undefined {
  if (from === to) return []

  const frontier: Array<{ town: TownId; path: Route[]; cost: TravelPathCost }> = [
    { town: from, path: [], cost: { baseDays: 0, legs: 0, toll: 0 } },
  ]
  const best = new Map<TownId, TravelPathCost>([[from, { baseDays: 0, legs: 0, toll: 0 }]])

  while (frontier.length > 0) {
    frontier.sort((a, b) => comparePathCost(a.cost, b.cost))
    const current = frontier.shift()!

    if (current.town === to) {
      return current.path
    }

    for (const route of ROUTES) {
      if (route.from !== current.town) continue

      const nextCost = {
        baseDays: current.cost.baseDays + route.baseDays,
        legs: current.cost.legs + 1,
        toll: current.cost.toll + route.toll,
      }
      const previousBest = best.get(route.to)
      if (previousBest && comparePathCost(nextCost, previousBest) >= 0) continue

      best.set(route.to, nextCost)
      frontier.push({
        town: route.to,
        path: [...current.path, route],
        cost: nextCost,
      })
    }
  }

  return undefined
}