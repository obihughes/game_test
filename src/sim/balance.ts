/** Every tunable gameplay number lives here. */
export const BALANCE = {
  TANK_WIDTH: 800,
  TANK_HEIGHT: 600,

  STARTING_MONEY: 100,

  HUNGER_RATE: 1.2,
  HUNGRY_THRESHOLD: 40,
  STARVING_THRESHOLD: 75,
  DEATH_THRESHOLD: 100,
  MEAL_SATISFACTION: 45,

  FISH_BASE_SPEED: 55,
  FISH_WANDER_STRENGTH: 80,
  FISH_SEEK_STRENGTH: 120,
  FISH_PERCEPTION_RADIUS: 150,
  FISH_BOUNDARY_MARGIN: 55,

  MEALS_TO_MEDIUM: 3,
  MEALS_TO_LARGE: 7,

  // Algae — spawns automatically in the tank as tilapia food.
  ALGAE_SPAWN_INTERVAL: 3,
  ALGAE_MAX: 15,
  ALGAE_LIFETIME: 20,
  ALGAE_EAT_RADIUS: 26,

  // Fertilizer — timed buff that speeds up algae spawning.
  FERTILIZER_COST: 30,
  FERTILIZER_DURATION: 60,
  FERTILIZER_SPAWN_MULTIPLIER: 2.5,

  // Fish feed — timed buff that grants passive growth to all fish.
  FISH_FEED_COST: 40,
  FISH_FEED_DURATION: 45,
  FISH_FEED_GROWTH_RATE: 0.5,

  // Bass predation.
  BASS_HUNT_RADIUS: 180,
  BASS_EAT_RADIUS: 30,

  FISH_PRICES: { tilapia: 15, bass: 40 } as const,
  SELL_PRICES: {
    tilapia: { small: 10, medium: 30, large: 75 },
    bass: { small: 20, medium: 50, large: 120 },
  } as const,

  AUTOSAVE_INTERVAL: 10,
} as const;

export type FishSpecies = keyof typeof BALANCE.FISH_PRICES;
export type GrowthStage = 'small' | 'medium' | 'large';
export type HungerStage = 'fed' | 'hungry' | 'starving';
