/**
 * Curved road segments for the world map (viewBox ~0–100).
 * Each configured value is stored in canonical (sorted) edge order.
 * When callers pass the edge reversed, we flip the sign so the rendered
 * geometry stays identical in screen space.
 */
const EDGE_CURVE_BY_KEY: Record<string, number> = {
  'ashenford|crownpost': 0.7,
  'ashenford|mirecross': -0.18,
  'ashenford|riversend': 1.05,
  'ashenford|stoneholt': -0.55,
  'crownpost|fenward': -1.1,
  'crownpost|mirecross': 0.24,
  'crownpost|riversend': 0.62,
  'fenward|mirecross': 0.35,
  'fenward|riversend': 1.05,
  'mirecross|riversend': -0.12,
  'riversend|saltmere': 0.2,
}

function edgeKey(from: string, to: string): string {
  return [from, to].sort().join('|')
}

function orientCurve(from: string, to: string, canonicalCurve: number): number {
  const [a, b] = [from, to].sort()
  return from === a && to === b ? canonicalCurve : -canonicalCurve
}

export function edgeBend(from: string, to: string): number {
  const key = edgeKey(from, to)
  const configured = EDGE_CURVE_BY_KEY[key]
  if (configured != null) return orientCurve(from, to, configured)

  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  const fallback = h % 2 === 0 ? 0.45 : -0.45
  return orientCurve(from, to, fallback)
}

function chordLength(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  return Math.hypot(dx, dy) || 1e-6
}

/** Control point for quadratic-bezier road from A to B. */
export function roadControlPoint(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bend: number,
): { cx: number; cy: number } {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const dx = bx - ax
  const dy = by - ay
  const len = chordLength(ax, ay, bx, by)
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const curveStrength = Math.abs(bend)
  const offset = Math.min(16, Math.max(3.8, len * 0.36)) * curveStrength * Math.sign(bend)
  return { cx: mx + px * offset, cy: my + py * offset }
}

/** Nudge day-count labels off the stroke (along perpendicular to chord, signed like bend). */
export function roadLabelAnchor(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bend: number,
): { mx: number; my: number } {
  const { mx, my } = roadMidpointAlongCurve(ax, ay, bx, by, bend)
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1e-6
  const px = -dy / len
  const py = dx / len
  const labelSide = bend === 0 ? 1 : Math.sign(bend)
  const nudge = 2.35 * labelSide
  return { mx: mx + px * nudge, my: my + py * nudge }
}

/** SVG path d="M … Q …" from town A to town B. */
export function roadPathD(ax: number, ay: number, bx: number, by: number, bend: number): string {
  const { cx, cy } = roadControlPoint(ax, ay, bx, by, bend)
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`
}

/** Point at t=0.5 along quadratic A → control → B (label anchor). */
export function roadMidpointAlongCurve(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bend: number,
): { mx: number; my: number } {
  const { cx, cy } = roadControlPoint(ax, ay, bx, by, bend)
  const t = 0.5
  const omt = 1 - t
  const mx = omt * omt * ax + 2 * omt * t * cx + t * t * bx
  const my = omt * omt * ay + 2 * omt * t * cy + t * t * by
  return { mx, my }
}
