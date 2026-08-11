/** Every tunable gameplay number lives here. */
export const BALANCE = {
  TANK_WIDTH: 800,
  TANK_HEIGHT: 600,

  STARTING_MONEY: 100,

  // Manual feeding — click open water to drop a pellet any fish can eat.
  PELLET_COST: 5,
  PELLET_LIFETIME: 8,
  PELLET_SINK_SPEED: 40,
  PELLET_EAT_RADIUS: 26,
  MAX_PELLETS: 8,

  HUNGER_RATE: 0.5,
  HUNGRY_THRESHOLD: 40,
  STARVING_THRESHOLD: 75,
  DEATH_THRESHOLD: 100,
  MEAL_SATISFACTION: 45,

  FISH_BASE_SPEED: 55,
  FISH_WANDER_STRENGTH: 80,
  FISH_SEEK_STRENGTH: 120,
  FISH_PERCEPTION_RADIUS: 150,
  FISH_BOUNDARY_MARGIN: 55,

  // Growth is decoupled from raw meal count: each meal only adds a partial
  // amount of growth progress, so fish need many feeding cycles to grow.
  GROWTH_PER_MEAL: 0.5,
  GROWTH_TO_MEDIUM: 6,
  GROWTH_TO_LARGE: 15,

  // Algae — spawns automatically in the tank as tilapia food.
  ALGAE_SPAWN_INTERVAL: 3,
  ALGAE_MAX: 15,
  ALGAE_LIFETIME: 20,
  ALGAE_EAT_RADIUS: 26,

  // Fertilizer — timed buff that speeds up algae spawning.
  FERTILIZER_COST: 30,
  FERTILIZER_DURATION: 60,
  FERTILIZER_SPAWN_MULTIPLIER: 2.5,

  // Fish feed — timed buff that grants a small amount of passive growth.
  // Deliberately weak compared to actually feeding fish — it's a boost,
  // not a substitute for eating.
  FISH_FEED_COST: 40,
  FISH_FEED_DURATION: 45,
  FISH_FEED_GROWTH_RATE: 0.05,

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
