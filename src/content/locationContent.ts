import type { TownId } from '@/game/core/types.ts'

/** Short lore shown on the market panel for the current town. */
export const LOCATION_STORIES: Record<TownId, string> = {
  ashenford:
    'Ashenford rose where the old crown road met a vein of iron and coal. Forges never quite cool here — amber light leaks through shutter slats at dusk, and merchants swear the ash in the wind tastes of struck flints. The square still remembers armies passing through; now it remembers carts.',
  mirecross:
    "Mirecross is less a town than a stubborn idea at a swamp crossroads. Raised plank paths keep boots above the sucking mud, while pole-lamps bob in the fog like will-o'-wisps wearing ledgers. Caravans pause to argue tolls, swap rumors of safer routes, and pretend the reed-shadows are not listening.",
  riversend:
    'Riversend clings to the last wide bend before the water spills toward the sea. Cranes creak, gulls argue over scraps, and the tide rearranges the docks faster than the harbormaster can shout. Anything that travels by river or road ends up counted, taxed, or toasted in a waterfront tavern here.',
}

/** Layered gradients for the market panel; keyed by town id. */
const LOCATION_PANEL_BACKGROUNDS: Record<string, string> = {
  ashenford: [
    'radial-gradient(ellipse 120% 80% at 15% 90%, rgba(196, 92, 44, 0.22) 0%, transparent 55%)',
    'radial-gradient(circle at 80% 20%, rgba(201, 166, 107, 0.12) 0%, transparent 45%)',
    'linear-gradient(165deg, #1a100c 0%, #0c0806 50%, #120b08 100%)',
  ].join(', '),
  mirecross: [
    'radial-gradient(ellipse 100% 70% at 50% 100%, rgba(45, 85, 72, 0.35) 0%, transparent 50%)',
    'radial-gradient(circle at 20% 30%, rgba(110, 130, 118, 0.15) 0%, transparent 40%)',
    'linear-gradient(180deg, #0e1211 0%, #0a1512 45%, #060d0c 100%)',
  ].join(', '),
  riversend: [
    'radial-gradient(ellipse 110% 90% at 55% 85%, rgba(38, 78, 96, 0.45) 0%, transparent 55%)',
    'radial-gradient(circle at 10% 15%, rgba(180, 196, 210, 0.08) 0%, transparent 35%)',
    'linear-gradient(195deg, #0a1014 0%, #060a0f 55%, #0b1418 100%)',
  ].join(', '),
}

export function getLocationStory(townId: TownId): string {
  return LOCATION_STORIES[townId] ?? LOCATION_STORIES.ashenford
}

export function getLocationPanelBackground(townId: TownId): { background: string } {
  const background = LOCATION_PANEL_BACKGROUNDS[townId] ?? LOCATION_PANEL_BACKGROUNDS.ashenford
  return { background }
}
