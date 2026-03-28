import { useMemo, useState, type CSSProperties } from 'react'
import { findRoute, ROUTES, TOWNS, type Town } from '@/game/world/index.ts'
import { MAP_POSITIONS } from '@/content/mapLayout.ts'
import { MapLocationGlyph } from '@/ui/icons/LocationPixelIcon.tsx'
import { mapTheme } from '@/ui/map/mapTheme.ts'
import { getLocationStory } from '@/content/locationContent.ts'
import { computeTravelPlan } from '@/game/world/travel.ts'
import { getSeasonTravelPenalty, getSeason } from '@/game/world/seasons.ts'
import { bestSellPriceAtTown } from '@/game/economy/merchants.ts'
import { GOOD_IDS, GOODS } from '@/game/economy/index.ts'
import { dailyHireCost } from '@/game/caravan/actions.ts'
import { useGameStore } from '@/store/gameStore.ts'
import styles from '@/ui/map/map.module.css'
import { edgeBend, roadLabelAnchor, roadPathD } from '@/ui/map/mapEdgeGeometry.ts'

interface MapTravelScreenProps {
  onArriveAtTown?: () => void
}

export function MapTravelScreen({ onArriveAtTown }: MapTravelScreenProps) {
  const game = useGameStore((s) => s.game)
  const travelTo = useGameStore((s) => s.travelTo)
  const lastError = useGameStore((s) => s.lastError)
  const clearError = useGameStore((s) => s.clearError)
  const [hoveredTown, setHoveredTown] = useState<string | null>(null)

  const edges = useMemo(() => {
    const seen = new Set<string>()
    const list: { from: string; to: string }[] = []
    for (const r of ROUTES) {
      const key = [r.from, r.to].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ from: r.from, to: r.to })
    }
    return list
  }, [])

  const reachableTowns = useMemo(
    () => (Object.values(TOWNS) as Town[]).filter((t) => t.id !== game.location && computeTravelPlan(game, t.id)),
    [game],
  )

  const travelPlans = useMemo(() => {
    const plans = new Map<string, ReturnType<typeof computeTravelPlan>>()
    for (const town of Object.values(TOWNS) as Town[]) {
      if (town.id === game.location) continue
      plans.set(town.id, computeTravelPlan(game, town.id))
    }
    return plans
  }, [game])

  const routeMidpoints = useMemo(
    () =>
      edges
        .map((e) => {
          const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
          const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
          if (!a || !b) return null
          const route = findRoute(e.from, e.to) ?? findRoute(e.to, e.from)
          const bend = edgeBend(e.from, e.to)
          const { mx, my } = roadLabelAnchor(a.x, a.y, b.x, b.y, bend)
          return { key: `${e.from}-${e.to}`, from: e.from, to: e.to, mx, my, days: route?.baseDays ?? 0 }
        })
        .filter(Boolean) as { key: string; from: string; to: string; mx: number; my: number; days: number }[],
    [edges],
  )

  const hoveredInfo = useMemo(() => {
    if (!hoveredTown || hoveredTown === game.location) return null
    const plan = travelPlans.get(hoveredTown)
    if (!plan) return null
    const name = TOWNS[hoveredTown]?.name ?? hoveredTown
    const story = getLocationStory(hoveredTown)
    const hintParts: { score: number; line: string }[] = []
    for (const id of GOOD_IDS) {
      const qty = game.inventory[id] ?? 0
      if (qty <= 0) continue
      const hereSell = bestSellPriceAtTown(game.location, id, game.day)
      const thereSell = bestSellPriceAtTown(hoveredTown, id, game.day)
      const perUnit = thereSell - hereSell
      if (perUnit > 0) {
        hintParts.push({ score: perUnit * qty, line: `${GOODS[id]!.name}: +${perUnit}/unit vs here` })
      }
    }
    hintParts.sort((a, b) => b.score - a.score)
    const upkeep = dailyHireCost(game) * plan.days
    const totalCost = plan.toll + upkeep
    const pathNames = [townName(game.location), ...plan.routes.map((route) => townName(route.to))]
    const routeKeys = new Set(plan.routes.map((route) => [route.from, route.to].sort().join('|')))
    return {
      name,
      days: plan.days,
      toll: plan.toll,
      upkeep,
      totalCost,
      goldAfter: game.gold - totalCost,
      story,
      cargoHints: hintParts.slice(0, 2).map((h) => h.line),
      townId: hoveredTown,
      legs: plan.routes.length,
      pathText: pathNames.join(' -> '),
      routeKeys,
      isWinter: getSeason(game.day) === 'winter',
      seasonPenalty: getSeasonTravelPenalty(game.day),
    }
  }, [hoveredTown, game, travelPlans])

  function handleTravelRequest(townId: string) {
    if (townId === game.location) return
    const didTravel = travelTo(townId)
    if (didTravel) onArriveAtTown?.()
  }

  return (
    <section className={styles.mapScreen}>
      {lastError ? (
        <p className="error" role="alert" style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem' }}>
          {lastError}{' '}
          <button type="button" className="linkish" onClick={() => clearError()}>
            Dismiss
          </button>
        </p>
      ) : null}

      <div className={styles.mapWrap}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          role="img"
          aria-label="World map"
          style={{ '--map-road': mapTheme.road, '--map-label': mapTheme.label } as CSSProperties}
        >
          <defs>
            <radialGradient id="mapBg" cx="28%" cy="22%" r="78%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e261e" />
              <stop offset="55%" stopColor="#1c1612" />
              <stop offset="100%" stopColor="#0d0b08" />
            </radialGradient>
            <pattern id="mapDots" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="0.28" fill="#ffffff" fillOpacity="0.045" />
            </pattern>
          </defs>

          <rect width="100" height="100" fill="url(#mapBg)" />
          <rect width="100" height="100" fill="url(#mapDots)" />

          {edges.map((e) => {
            const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
            const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
            if (!a || !b) return null
            const routeKey = [e.from, e.to].sort().join('|')
            const isHoveredRoute = hoveredInfo?.routeKeys.has(routeKey) ?? false
            const isActiveRoute = e.from === game.location || e.to === game.location
            const bend = edgeBend(e.from, e.to)
            const d = roadPathD(a.x, a.y, b.x, b.y, bend)
            return (
              <path
                key={`${e.from}-${e.to}`}
                className={isHoveredRoute ? styles.roadHighlight : styles.road}
                d={d}
                opacity={isHoveredRoute ? 1 : isActiveRoute ? 0.78 : 0.3}
              />
            )
          })}

          {routeMidpoints.map((m) => {
            const isActive = m.from === game.location || m.to === game.location
            return (
              <text
                key={m.key}
                className={styles.routeLabel}
                x={m.mx}
                y={m.my + 1.1}
                opacity={isActive ? 0.92 : 0.34}
              >
                {m.days}d
              </text>
            )
          })}

          {(Object.values(TOWNS) as Town[]).map((t) => {
            const pos = MAP_POSITIONS[t.id]
            if (!pos) return null
            const here = t.id === game.location
            const plan = travelPlans.get(t.id)
            const canGo = Boolean(plan)
            const dim = !(canGo || here)
            const isHovered = hoveredTown === t.id
            return (
              <g key={t.id} className={here ? styles.townCurrentWrap : undefined}>
                <circle
                  className={styles.townHit}
                  cx={pos.x}
                  cy={pos.y}
                  r={8}
                  fill="rgba(0,0,0,0.02)"
                  opacity={dim ? 0.35 : 1}
                  style={{ cursor: canGo && !here ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
                  onClick={() => { if (canGo && !here) handleTravelRequest(t.id) }}
                  onMouseEnter={() => { if (canGo && !here) setHoveredTown(t.id) }}
                  onMouseLeave={() => setHoveredTown(null)}
                />
                <g style={{ pointerEvents: 'none' as const }} opacity={dim ? 0.35 : 1}>
                  <MapLocationGlyph
                    townId={t.id}
                    x={pos.x}
                    y={pos.y}
                    size={here ? 9.5 : isHovered && canGo ? 8.5 : 7.5}
                  />
                </g>
                <text
                  className={styles.label}
                  x={pos.x + (pos.labelDx ?? 0)}
                  y={pos.y + (pos.labelDy ?? -7)}
                  textAnchor={pos.labelAnchor ?? 'middle'}
                  opacity={dim ? 0.35 : 1}
                  fontWeight={here ? '700' : isHovered ? '600' : '500'}
                >
                  {t.name}
                  {here ? ' ◆' : ''}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <aside className={styles.mapSidebar}>
        <div className={styles.infoPanel}>
          {hoveredInfo ? (
            <>
              <div className={styles.infoPanelHeader}>
                <span className={styles.infoPanelName}>{hoveredInfo.name}</span>
                <span className={styles.infoPanelMeta}>
                  {hoveredInfo.days} day{hoveredInfo.days === 1 ? '' : 's'}
                  {hoveredInfo.legs > 1 ? ` · ${hoveredInfo.legs} legs` : ' · Direct road'}
                  {hoveredInfo.toll > 0 ? ` · ${hoveredInfo.toll}g toll` : ' · No toll'}
                </span>
              </div>
              <p className={styles.infoPanelRoute}>{hoveredInfo.pathText}</p>
              {hoveredInfo.story ? <p className={styles.infoPanelStory}>{hoveredInfo.story}</p> : null}
              <p className={styles.infoPanelCost}>
                Total trip: {hoveredInfo.totalCost}g
                {hoveredInfo.upkeep > 0 ? ` (${hoveredInfo.toll}g toll + ${hoveredInfo.upkeep}g upkeep)` : ''}
              </p>
              {hoveredInfo.isWinter && hoveredInfo.seasonPenalty > 0 ? (
                <p className={styles.infoPanelSeason}>
                  Winter slows every leg by +{hoveredInfo.seasonPenalty} day{hoveredInfo.seasonPenalty > 1 ? 's' : ''}.
                </p>
              ) : null}
              {hoveredInfo.cargoHints.length > 0 ? (
                <div className={styles.infoPanelCargo}>
                  <span className={styles.infoPanelCargoLabel}>Cargo advantage: </span>
                  <ul className={styles.infoPanelCargoList}>
                    {hoveredInfo.cargoHints.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button type="button" className={styles.travelBtn} onClick={() => handleTravelRequest(hoveredInfo.townId)}>
                Travel to {hoveredInfo.name} now →
              </button>
            </>
          ) : (
            <p className={styles.infoPanelHint}>Hover a town on the map to preview the full chained route, then click once to travel.</p>
          )}
        </div>

        {reachableTowns.length > 0 ? (
          <div className={styles.destinationList}>
            <h3 className={styles.destinationListTitle}>Destinations</h3>
            <ul className={styles.destinationItems}>
              {reachableTowns.map((t) => {
                const plan = travelPlans.get(t.id)
                if (!plan) return null
                const upkeep = dailyHireCost(game) * plan.days
                return (
                  <li key={t.id} className={styles.destinationItem}>
                    <span className={styles.destinationName}>{t.name}</span>
                    <span className={styles.destinationMeta}>
                      {plan.days}d
                      {plan.routes.length > 1 ? ` · ${plan.routes.length} legs` : ''}
                      {plan.toll + upkeep > 0 ? ` · ${plan.toll + upkeep}g` : ''}
                    </span>
                    <button type="button" className={styles.destinationBtn} onClick={() => handleTravelRequest(t.id)}>
                      Go →
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </aside>
    </section>
  )
}

function townName(townId: string): string {
  return TOWNS[townId]?.name ?? townId
}
