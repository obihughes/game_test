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
  FISH_WANDER_ARRIVE_RADIUS: 65,
  /** Inset from tank edges when picking idle swim destinations. */
  FISH_WANDER_TARGET_PADDING: 70,
  /** Per-frame velocity multiplier applied before new steering forces, smooths turns. */
  FISH_WANDER_DRAG: 0.97,
  FISH_SEEK_STRENGTH: 120,
  FISH_PERCEPTION_RADIUS: 150,
  FISH_BOUNDARY_MARGIN: 55,

  // Hungry/starving fish search further afield for food than a fed fish
  // idly bumping into it. Starving fish effectively search the whole tank.
  HUNGRY_PERCEPTION_MULTIPLIER: 2.5,
  STARVING_PERCEPTION_MULTIPLIER: 999,
  STARVING_SEEK_MULTIPLIER: 1.8,

  // Hungry fish swim faster out of urgency; starving fish are frantic.
  HUNGRY_SPEED_MULTIPLIER: 1.25,
  STARVING_SPEED_MULTIPLIER: 1.5,

  // Prey (smaller fish) detect and dart away from nearby bass.
  FLEE_DETECTION_RADIUS: 120,
  FLEE_STRENGTH: 150,
  FLEE_SPEED_BOOST: 1.3,

  // Growth is decoupled from raw meal count: each meal only adds a partial
  // amount of growth progress, so fish need many feeding cycles to grow.
  GROWTH_PER_MEAL: 0.5,
  GROWTH_TO_MEDIUM: 6,
  GROWTH_TO_LARGE: 15,

  // Algae — spawns automatically in the tank as tilapia food.
  ALGAE_SPAWN_INTERVAL: 3,
  ALGAE_MAX: 15,
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

  // Reproduction — two well-fed, grown fish of the same species that swim
  // close together will produce a new small fish, up to a population cap.
  BREED_COOLDOWN: 30,
  BREED_MIN_STAGE: 'medium' as GrowthStage,
  BREED_PROXIMITY: 60,
  BREED_MAX_HUNGER: 50,
  MAX_FISH: 20,

  FISH_PRICES: { tilapia: 15, bass: 40 } as const,
  SELL_PRICES: {
    tilapia: { small: 10, medium: 30, large: 75 },
    bass: { small: 20, medium: 50, large: 120 },
  } as const,

  AUTOSAVE_INTERVAL: 10,

  // Fast forward — multiplies simulation delta time while the HUD toggle is on.
  FAST_FORWARD_MULTIPLIER: 4,
} as const;

export type FishSpecies = keyof typeof BALANCE.FISH_PRICES;
export type GrowthStage = 'small' | 'medium' | 'large';
export type HungerStage = 'fed' | 'hungry' | 'starving';
