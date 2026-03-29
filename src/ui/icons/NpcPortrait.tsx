/** Pixel bust portraits (16×16 grid) — same rect pattern as `LocationPixelIcon`. */

type Pixel = readonly [number, number, string]

function row(y: number, x0: number, x1: number, c: string): Pixel[] {
  const out: Pixel[] = []
  for (let x = x0; x <= x1; x++) out.push([x, y, c])
  return out
}

function rect(x0: number, y0: number, x1: number, y1: number, c: string): Pixel[] {
  const out: Pixel[] = []
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push([x, y, c])
  return out
}

/** Smith: leather apron, thick beard, soot, warm skin. */
const THORNE: Pixel[] = [
  ...row(1, 5, 10, '#1a100c'),
  ...row(2, 4, 11, '#2a1810'),
  ...row(3, 4, 11, '#3d2818'),
  ...row(4, 5, 10, '#3d2818'),
  ...rect(5, 5, 10, 7, '#5c4030'),
  ...rect(5, 8, 10, 10, '#c9a66b'),
  ...row(9, 6, 9, '#4a3228'),
  ...row(10, 5, 10, '#4a3228'),
  [7, 9, '#1a0c0c'],
  [8, 9, '#1a0c0c'],
  [7, 10, '#6b4a30'],
  [8, 10, '#6b4a30'],
  ...row(11, 6, 9, '#4a3228'),
  ...row(12, 5, 10, '#5c4030'),
  ...row(13, 6, 9, '#6b5344'),
  ...row(14, 7, 8, '#4a3228'),
  ...row(15, 7, 8, '#3d2818'),
]

/** Tollward: hooded, wary eyes, swamp cloak. */
const VERIS: Pixel[] = [
  ...row(0, 4, 11, '#1a2018'),
  ...row(1, 3, 12, '#24382c'),
  ...row(2, 3, 12, '#2d4a38'),
  ...row(3, 4, 11, '#2d4a38'),
  ...rect(4, 4, 11, 6, '#2d4a38'),
  ...rect(5, 7, 10, 9, '#b8956a'),
  [6, 8, '#1a1410'],
  [9, 8, '#1a1410'],
  [7, 9, '#3d3024'],
  [8, 9, '#3d3024'],
  ...row(10, 6, 9, '#5c4a36'),
  ...row(11, 5, 10, '#2d4a38'),
  ...row(12, 5, 10, '#3d5c48'),
  ...row(13, 6, 9, '#24382c'),
  ...row(14, 7, 8, '#1a2018'),
  ...row(15, 7, 8, '#141814'),
]

/** Harbormaster: tricorn silhouette, weathered face, tall collar. */
const KESS: Pixel[] = [
  ...row(0, 3, 12, '#2a3848'),
  ...row(1, 2, 13, '#3a4a5c'),
  ...row(2, 3, 12, '#4a5c70'),
  ...row(3, 4, 11, '#3a4a5c'),
  ...row(4, 5, 10, '#2a3848'),
  [6, 5, '#d8c8b0'],
  [7, 5, '#d8c8b0'],
  [8, 5, '#d8c8b0'],
  [9, 5, '#d8c8b0'],
  ...rect(5, 6, 10, 8, '#c9a66b'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  [7, 8, '#4a3228'],
  [8, 8, '#4a3228'],
  ...row(9, 6, 9, '#8b7355'),
  ...row(10, 6, 9, '#a08060'),
  ...row(11, 5, 10, '#3a4a58'),
  ...row(12, 5, 10, '#2a3848'),
  ...row(13, 6, 9, '#1a2430'),
  ...row(14, 7, 8, '#2a3848'),
  ...row(15, 7, 8, '#1a2430'),
]

/** Magistrate: pale, severe, dark robes, high collar. */
const ALDRIC: Pixel[] = [
  ...row(1, 5, 10, '#2a2420'),
  ...row(2, 5, 10, '#3a342c'),
  ...row(3, 5, 10, '#e8dcc8'),
  ...row(4, 6, 9, '#e8dcc8'),
  ...rect(5, 5, 10, 8, '#d4c4b0'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  [7, 8, '#5c4a36'],
  [8, 8, '#5c4a36'],
  [7, 9, '#4a3c30'],
  [8, 9, '#4a3c30'],
  ...row(10, 5, 10, '#c4b4a0'),
  ...row(11, 4, 11, '#2a2420'),
  ...row(12, 4, 11, '#1a1814'),
  ...row(13, 5, 10, '#1a1814'),
  ...row(14, 6, 9, '#2a2420'),
  ...row(15, 7, 8, '#c9a620'),
]

/** Factor: sharp features, travel cloak, confident brow. */
const LYRIS: Pixel[] = [
  ...row(1, 6, 9, '#3a2a40'),
  ...row(2, 5, 10, '#4a3a58'),
  ...row(3, 5, 10, '#5c4a68'),
  ...row(4, 5, 10, '#c9a66b'),
  ...rect(5, 5, 10, 7, '#d4b48a'),
  [6, 8, '#1a1410'],
  [9, 8, '#1a1410'],
  [7, 9, '#6b5344'],
  [8, 9, '#6b5344'],
  ...row(10, 6, 9, '#8b6a8a'),
  ...row(11, 5, 10, '#4a3a58'),
  ...row(12, 5, 10, '#3a2a48'),
  ...row(13, 6, 9, '#2a1c30'),
  ...row(14, 7, 8, '#c9a66b'),
  ...row(15, 7, 8, '#5c4a68'),
]

/** Fen broker: reeds in hat, sun-warm skin, practical wrap. */
const CAERA: Pixel[] = [
  ...row(0, 5, 10, '#4a6a3a'),
  ...row(1, 4, 11, '#5a7a4a'),
  ...row(2, 5, 10, '#4a3228'),
  ...row(3, 5, 10, '#6b5344'),
  ...rect(5, 4, 10, 7, '#d4a574'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  [7, 8, '#5c4030'],
  [8, 8, '#5c4030'],
  [7, 9, '#c9745c'],
  [8, 9, '#c9745c'],
  ...row(10, 6, 9, '#b8956a'),
  ...row(11, 5, 10, '#4a6a3a'),
  ...row(12, 5, 10, '#3d5c48'),
  ...row(13, 6, 9, '#2e4228'),
  ...row(14, 7, 8, '#5a7a4a'),
  ...row(15, 7, 8, '#3d5c48'),
]

/** Mine quartermaster: lamp helmet, smudged cheeks, stubble. */
const BRENNAN: Pixel[] = [
  ...row(1, 5, 10, '#4a4a4a'),
  ...row(2, 4, 11, '#6a6a6a'),
  ...row(3, 5, 10, '#5a5a5a'),
  [6, 3, '#f5e6a0'],
  [7, 3, '#f5e6a0'],
  [8, 3, '#f5e6a0'],
  [9, 3, '#f5e6a0'],
  ...rect(5, 4, 10, 7, '#9a8068'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  ...row(8, 6, 9, '#5c4030'),
  [7, 8, '#4a3228'],
  [8, 8, '#4a3228'],
  [7, 9, '#6b5344'],
  [8, 9, '#6b5344'],
  ...row(10, 5, 10, '#8b7355'),
  ...row(11, 5, 10, '#5c4a36'),
  ...row(12, 5, 10, '#4a3228'),
  ...row(13, 6, 9, '#3d2818'),
  ...row(14, 7, 8, '#5c4a36'),
  ...row(15, 7, 8, '#2a2018'),
]

/** Sea captain: wide hat, beard, salt jacket. */
const HALAS: Pixel[] = [
  ...row(0, 3, 12, '#2a3848'),
  ...row(1, 2, 13, '#3a4a5c'),
  ...row(2, 3, 12, '#4a5c70'),
  ...row(3, 5, 10, '#2a3848'),
  ...row(4, 5, 10, '#c9a66b'),
  ...rect(5, 5, 10, 8, '#b8956a'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  [7, 9, '#5c4030'],
  [8, 9, '#5c4030'],
  [7, 10, '#4a3228'],
  [8, 10, '#4a3228'],
  ...row(11, 5, 10, '#3a4a58'),
  ...row(12, 5, 10, '#2a3848'),
  ...row(13, 6, 9, '#1a2830'),
  ...row(14, 7, 8, '#5a7484'),
  ...row(15, 7, 8, '#2a3848'),
]

/** Generic silhouette when `portraitId` is unknown. */
const PLACEHOLDER: Pixel[] = [
  ...row(2, 6, 9, '#3a3028'),
  ...rect(5, 3, 10, 5, '#5c4a36'),
  ...rect(5, 6, 10, 9, '#c9a66b'),
  [6, 7, '#1a1410'],
  [9, 7, '#1a1410'],
  [7, 9, '#4a3228'],
  [8, 9, '#4a3228'],
  ...row(10, 6, 9, '#5c4a36'),
  ...row(11, 5, 10, '#4a3c30'),
  ...row(12, 6, 9, '#3a3028'),
  ...row(14, 7, 8, '#5c4a36'),
]

const PORTRAITS: Record<string, Pixel[]> = {
  thorne: THORNE,
  veris: VERIS,
  kess: KESS,
  aldric: ALDRIC,
  lyris: LYRIS,
  caera: CAERA,
  brennan: BRENNAN,
  halas: HALAS,
}

export function portraitPixels(portraitId: string): Pixel[] {
  return PORTRAITS[portraitId] ?? PLACEHOLDER
}

export interface NpcPortraitProps {
  /** Looks up pixel art; falls back to `npcId`, then placeholder. */
  portraitId?: string | null
  npcId: string
  size: 'small' | 'large'
  className?: string
  title?: string
}

const SIZE_PX = { small: 32, large: 64 } as const

export function NpcPortrait({ portraitId, npcId, size, className = '', title }: NpcPortraitProps) {
  const key = portraitId || npcId
  const pixels = portraitPixels(key)
  const px = SIZE_PX[size]
  const rootClass = `npc-portrait npc-portrait--${size} ${className}`.trim()

  return (
    <div className={rootClass}>
      <svg
        className="npc-portrait__svg"
        width={px}
        height={px}
        viewBox="-1 -1 18 18"
        shapeRendering="crispEdges"
        role={title ? 'img' : 'presentation'}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        {title ? <title>{title}</title> : null}
        <rect x={-1} y={-1} width={18} height={18} fill="rgba(12,10,8,0.92)" />
        {pixels.map(([x, y, fill], i) => (
          <rect key={`${x}-${y}-${i}`} x={x} y={y} width={1} height={1} fill={fill} />
        ))}
      </svg>
    </div>
  )
}
