import type { TownId } from '@/game/core/types.ts'
import { getDialog } from './dialog/dialog.ts'
import type { Season } from '@/game/world/seasons.ts'

/** Short lore shown on the market panel for the current town. */
export const LOCATION_STORIES: Record<TownId, string> = {
  ashenford:
    'Ashenford rose where the old crown road met a vein of iron and coal. Forges never quite cool here — amber light leaks through shutter slats at dusk, and merchants swear the ash in the wind tastes of struck flints. The square still remembers armies passing through; now it remembers carts.',
  mirecross:
    "Mirecross is less a town than a stubborn idea at a swamp crossroads. Raised plank paths keep boots above the sucking mud, while pole-lamps bob in the fog like will-o'-wisps wearing ledgers. Caravans pause to argue tolls, swap rumors of safer routes, and pretend the reed-shadows are not listening.",
  riversend:
    'Riversend clings to the last wide bend before the water spills toward the sea. Cranes creak, gulls argue over scraps, and the tide rearranges the docks faster than the harbormaster can shout. Anything that travels by river or road ends up counted, taxed, or toasted in a waterfront tavern here.',
  crownpost:
    'Crownpost grew where the old toll ring met a crown warehouse of stamped resin and sealed wax. Clerks argue in three languages; carts queue under banners that never quite match the season. Amber and duty receipts stack higher than common sense.',
  fenward:
    'Fenward is a line of stilt sheds above sucking mud, where spice crates steam in the cold and pole-lamps throw long shadows. What the fen does not swallow, the night market sells twice — once before midnight and once after.',
  stoneholt:
    'Stoneholt is a mining camp carved into the high pass above Ashenford, where the mountain gives up coal and iron in exchange for everything else. Lanterns burn at noon in the tunnels; the men who work them eat whatever the road brings up, and pay whatever it costs.',
  saltmere:
    'Saltmere clings to the salt flats south of Riversend, where shallow pans bake in the sun and the wind carries brine a mile inland. The town exists for one reason — salt — and trades everything it cannot make for whatever the coast road will carry.',
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
  crownpost: [
    'radial-gradient(ellipse 100% 80% at 50% 20%, rgba(180, 140, 80, 0.2) 0%, transparent 50%)',
    'radial-gradient(circle at 80% 80%, rgba(100, 80, 50, 0.15) 0%, transparent 40%)',
    'linear-gradient(170deg, #16120e 0%, #0e0c0a 55%, #121008 100%)',
  ].join(', '),
  fenward: [
    'radial-gradient(ellipse 90% 70% at 30% 100%, rgba(45, 75, 55, 0.35) 0%, transparent 50%)',
    'radial-gradient(circle at 70% 10%, rgba(60, 90, 70, 0.12) 0%, transparent 35%)',
    'linear-gradient(185deg, #0c100e 0%, #081210 50%, #060d0c 100%)',
  ].join(', '),
  stoneholt: [
    'radial-gradient(ellipse 110% 80% at 20% 95%, rgba(60, 50, 40, 0.45) 0%, transparent 55%)',
    'radial-gradient(circle at 75% 25%, rgba(120, 100, 70, 0.10) 0%, transparent 40%)',
    'linear-gradient(175deg, #100e0c 0%, #0a0806 50%, #0e0c0a 100%)',
  ].join(', '),
  saltmere: [
    'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(80, 110, 130, 0.35) 0%, transparent 55%)',
    'radial-gradient(circle at 15% 20%, rgba(200, 220, 230, 0.07) 0%, transparent 35%)',
    'linear-gradient(190deg, #0a0f12 0%, #060c10 50%, #0b1016 100%)',
  ].join(', '),
}

export function getLocationStory(townId: TownId): string {
  return LOCATION_STORIES[townId] ?? LOCATION_STORIES.ashenford
}

export function getLocationPanelBackground(townId: TownId): { background: string } {
  const background = LOCATION_PANEL_BACKGROUNDS[townId] ?? LOCATION_PANEL_BACKGROUNDS.ashenford
  return { background }
}

/**
 * Returns a short arrival vignette for a town based on season and visit count.
 * visitCount: how many times the player has visited this town (including this visit).
 */
export function getArrivalVignette(townId: TownId, season: Season, visitCount: number): string {
  const bucket = visitCount <= 1 ? 'first' : visitCount <= 4 ? 'returning' : 'regular'
  // Try specific bucket, fall back to 'returning', then 'first'
  const key = `arrive_${townId}_${season}_${bucket}`
  const fallback = `arrive_${townId}_${season}_returning`
  const firstVisit = `arrive_${townId}_${season}_first`
  const result = getDialog(key)
  if (result !== key) return result
  const r2 = getDialog(fallback)
  if (r2 !== fallback) return r2
  return getDialog(firstVisit)
}
