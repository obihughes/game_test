import type { GoodId } from '@/game/core/types.ts'

interface GoodIconProps {
  goodId: GoodId
  size?: number
  className?: string
}

/**
 * Simple 16x16 pixel icons for goods, inspired by Kenney's item sets.
 * SVG-rendered for crisp scaling and easy theming.
 */
const ICON_SVG_DATA: Record<GoodId, string> = {
  iron: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="10" height="12" fill="#8b7355" stroke="#5a4a3a" stroke-width="1"/>
      <rect x="5" y="4" width="6" height="8" fill="#a0826d"/>
      <rect x="6" y="5" width="4" height="6" fill="#c9a66b"/>
    </svg>
  `,
  silk: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 4 3 Q 8 2 12 3 L 12 13 Q 8 14 4 13 Z" fill="#e8d5c4" stroke="#8b7071" stroke-width="1"/>
      <path d="M 6 5 Q 8 4.5 10 5 L 10 11 Q 8 11.5 6 11 Z" fill="#f5ead9"/>
    </svg>
  `,
  wine: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 5 2 L 4 6 Q 4 10 8 11 Q 12 10 12 6 L 11 2 Z" fill="#8b3a3a" stroke="#5c2a2a" stroke-width="1"/>
      <rect x="7" y="1" width="2" height="1" fill="#8b7355"/>
      <path d="M 8 11 L 7 14 L 9 14 Z" fill="#a0826d"/>
    </svg>
  `,
  herbs: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 5 8 Q 4 6 5 3" stroke="#2d5a2d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M 8 9 Q 7 5 8 2" stroke="#3d7a3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M 11 8 Q 12 6 11 3" stroke="#2d5a2d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="5" cy="3" r="1.5" fill="#4a9a4a"/>
      <circle cx="8" cy="2" r="1.5" fill="#5aaa5a"/>
      <circle cx="11" cy="3" r="1.5" fill="#4a9a4a"/>
      <ellipse cx="8" cy="10" rx="3" ry="2" fill="#3d6a3d" opacity="0.6"/>
    </svg>
  `,
  fresh_fish: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 3 8 Q 5 5 10 5 Q 12 8 10 11 Q 5 11 3 8 Z" fill="#7ab8d4" stroke="#4a88a4" stroke-width="1"/>
      <circle cx="9" cy="8" r="1" fill="#1a1a2a"/>
      <path d="M 11 6 L 14 4 L 12 8 L 14 12 L 11 10 Z" fill="#5a98b4"/>
      <path d="M 5 7 Q 7 6 9 7" stroke="#a0d8f0" stroke-width="0.8" fill="none"/>
    </svg>
  `,
  salted_fish: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="12" height="8" fill="#8b6a47" stroke="#5a3a27" stroke-width="1" rx="1"/>
      <rect x="3" y="6" width="10" height="6" fill="#a07850"/>
      <rect x="4" y="3" width="8" height="3" fill="#c8c8b8" stroke="#a0a090" stroke-width="0.5" rx="1"/>
      <rect x="5" y="7" width="2" height="1" fill="#f0f0e0" opacity="0.7"/>
      <rect x="9" y="8" width="2" height="1" fill="#f0f0e0" opacity="0.7"/>
      <rect x="6" y="9" width="2" height="1" fill="#f0f0e0" opacity="0.7"/>
    </svg>
  `,
  smoked_fish: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 3 9 Q 5 6 10 6 Q 12 9 10 12 Q 5 12 3 9 Z" fill="#7a4a28" stroke="#4a2a10" stroke-width="1"/>
      <circle cx="9" cy="9" r="1" fill="#1a0a00"/>
      <path d="M 11 7 L 14 5 L 12 9 L 14 13 L 11 11 Z" fill="#5a3018"/>
      <path d="M 5 5 Q 6 3 5 1" stroke="#888888" stroke-width="0.8" fill="none" opacity="0.6"/>
      <path d="M 8 4 Q 9 2 8 0" stroke="#888888" stroke-width="0.8" fill="none" opacity="0.5"/>
    </svg>
  `,
  fish_sauce: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="6" height="7" fill="#8b5a20" stroke="#5a3010" stroke-width="1" rx="1"/>
      <rect x="6" y="8" width="4" height="5" fill="#b07830"/>
      <path d="M 6 7 Q 8 5 10 7" fill="#8b5a20" stroke="#5a3010" stroke-width="0.8"/>
      <rect x="7" y="4" width="2" height="3" fill="#a06828" stroke="#5a3010" stroke-width="0.5"/>
      <rect x="6" y="3" width="4" height="1" fill="#c89040" rx="0.5"/>
      <circle cx="8" cy="10" r="1" fill="#d4a040" opacity="0.6"/>
    </svg>
  `,
  salt: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="10" height="10" fill="#f5f5f0" stroke="#d8d8d0" stroke-width="1"/>
      <rect x="4" y="4" width="3" height="3" fill="#e8e8e0"/>
      <rect x="9" y="4" width="3" height="3" fill="#e8e8e0"/>
      <rect x="4" y="9" width="3" height="3" fill="#e8e8e0"/>
      <rect x="9" y="9" width="3" height="3" fill="#e8e8e0"/>
    </svg>
  `,
  rope: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 3 3 Q 6 6 8 3 Q 10 6 13 3" stroke="#8b6a47" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 3 8 Q 6 11 8 8 Q 10 11 13 8" stroke="#8b6a47" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 3 13 Q 6 10 8 13 Q 10 10 13 13" stroke="#8b6a47" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  peat: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" fill="#4a3a2a" stroke="#3a2a1a" stroke-width="1"/>
      <rect x="3" y="3" width="5" height="5" fill="#5a4a3a"/>
      <rect x="8" y="3" width="5" height="5" fill="#5a4a3a"/>
      <rect x="3" y="8" width="5" height="5" fill="#5a4a3a"/>
      <rect x="8" y="8" width="5" height="5" fill="#5a4a3a"/>
    </svg>
  `,
  obsidian_glass: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,2 14,6 14,14 2,14 2,6" fill="#1a1a2e" stroke="#0f0f1e" stroke-width="1"/>
      <polygon points="10,4 12,6 12,12 8,12" fill="#2d2d5f" opacity="0.7"/>
      <polygon points="6,6 8,5 9,8 7,9" fill="#4a4a8f" opacity="0.5"/>
    </svg>
  `,
  dreaming_moss: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="5" r="2" fill="#5a6a5a"/>
      <circle cx="10" cy="4" r="2.5" fill="#5a7a6a"/>
      <circle cx="8" cy="9" r="2" fill="#5a6a5a"/>
      <circle cx="3" cy="11" r="1.5" fill="#6a8a6a"/>
      <circle cx="12" cy="10" r="1.5" fill="#5a7a6a"/>
      <circle cx="6" cy="13" r="1" fill="#7a9a7a"/>
      <circle cx="11" cy="13" r="1" fill="#6a8a6a"/>
    </svg>
  `,
  crown_amber: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="9" rx="5" ry="4" fill="#d4a020" stroke="#8b6914" stroke-width="1"/>
      <ellipse cx="8" cy="8" rx="3" ry="2.5" fill="#f0c040" opacity="0.85"/>
      <circle cx="6" cy="7" r="0.8" fill="#fff8e0" opacity="0.6"/>
    </svg>
  `,
  fen_spice: `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="10" height="9" fill="#6a4a32" stroke="#4a3020" stroke-width="1" rx="1"/>
      <rect x="4" y="5" width="8" height="6" fill="#8b5a3a"/>
      <circle cx="6" cy="7" r="0.8" fill="#c04040"/>
      <circle cx="9" cy="8" r="0.7" fill="#d08040"/>
      <circle cx="7" cy="9" r="0.6" fill="#e0c060"/>
    </svg>
  `,
}

export function GoodIcon({ goodId, size = 24, className = '' }: GoodIconProps) {
  const svg = ICON_SVG_DATA[goodId]

  if (!svg) {
    return <div className={`good-icon good-icon--placeholder ${className}`} style={{ width: size, height: size }} />
  }

  return (
    <div
      className={`good-icon ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        lineHeight: 0,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
