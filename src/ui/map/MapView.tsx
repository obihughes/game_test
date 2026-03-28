import { useMemo, type CSSProperties } from 'react'
import { findRoute, ROUTES, TOWNS, type Town } from '@/game/world/index.ts'
import { MAP_POSITIONS } from '@/content/mapLayout.ts'
import { mapTheme } from './mapTheme.ts'
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
        return (
          <line
            key={`${e.from}-${e.to}`}
            className={styles.road}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
          />
        )
      })}
      {(Object.values(TOWNS) as Town[]).map((t) => {
        const pos = MAP_POSITIONS[t.id]
        if (!pos) return null
        const here = t.id === location
        const route = findRoute(location, t.id)
        const canGo = Boolean(route)
        return (
          <g key={t.id}>
            <circle
              className={`${styles.town} ${here ? styles.townCurrent : ''}`}
              cx={pos.x}
              cy={pos.y}
              r={here ? 5 : 4}
              fill={mapTheme.townFill}
              stroke={mapTheme.townStroke}
              strokeWidth={1.2}
              opacity={canGo || here ? 1 : 0.45}
              onClick={() => {
                if (canGo && !here) onSelectTown(t.id)
              }}
            />
            <text className={styles.label} x={pos.x} y={pos.y - 9}>
              {t.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}