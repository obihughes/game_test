/**
 * Curved road segments for the world map (viewBox ~0–100).
 * Bend sign is stable per undirected edge so A→B matches B→A.
 */
export function edgeBend(from: string, to: string): number {
  const [a, b] = [from, to].sort()
  let h = 0
  const k = `${a}|${b}`
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0
  return h % 2 === 0 ? 1 : -1
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
  const offset = Math.min(16, Math.max(3.8, len * 0.36)) * bend
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
  const nudge = 2.35 * bend
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
