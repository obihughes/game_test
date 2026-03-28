import { useMemo, type CSSProperties } from 'react'
import { findRoute, ROUTES, TOWNS, type Town } from '@/game/world/index.ts'
import { MAP_POSITIONS } from '@/content/mapLayout.ts'
import { MapLocationGlyph } from '@/ui/icons/LocationPixelIcon.tsx'
import { mapTheme } from './mapTheme.ts'
import { edgeBend, roadPathD } from './mapEdgeGeometry.ts'
import styles from './map.module.css'

interface MapViewProps {
  location: string
  onSelectTown: (id: string) => void
}

export function MapView({ location, onSelectTown }: MapViewProps) {
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

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 100 100"
      role="img"
      aria-label="World map"
      style={
        {
          '--map-road': mapTheme.road,
          '--map-label': mapTheme.label,
        } as CSSProperties
      }
    >
      {edges.map((e) => {
        const a = MAP_POSITIONS[e.from as keyof typeof MAP_POSITIONS]
        const b = MAP_POSITIONS[e.to as keyof typeof MAP_POSITIONS]
        if (!a || !b) return null
        const bend = edgeBend(e.from, e.to)
        return (
          <path
            key={`${e.from}-${e.to}`}
            className={styles.road}
            d={roadPathD(a.x, a.y, b.x, b.y, bend)}
          />
        )
      })}
      {(Object.values(TOWNS) as Town[]).map((t) => {
        const pos = MAP_POSITIONS[t.id]
        if (!pos) return null
        const here = t.id === location
        const route = findRoute(location, t.id)
        const canGo = Boolean(route)
        const dim = !(canGo || here)
        return (
          <g key={t.id} className={here ? styles.townCurrentWrap : undefined}>
            <circle
              className={styles.townHit}
              cx={pos.x}
              cy={pos.y}
              r={7.5}
              fill="rgba(0,0,0,0.02)"
              opacity={dim ? 0.45 : 1}
              style={{
                cursor: canGo && !here ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (canGo && !here) onSelectTown(t.id)
              }}
            />
            <g style={{ pointerEvents: 'none' as const }} opacity={dim ? 0.45 : 1}>
              <MapLocationGlyph townId={t.id} x={pos.x} y={pos.y} size={here ? 9 : 7} />
            </g>
            <text
              className={styles.label}
              x={pos.x + (pos.labelDx ?? 0)}
              y={pos.y + (pos.labelDy ?? -7)}
              textAnchor={pos.labelAnchor ?? 'middle'}
            >
              {t.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}