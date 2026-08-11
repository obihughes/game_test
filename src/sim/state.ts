import type { FishSpecies } from './balance.ts';
import { BALANCE } from './balance.ts';
import { createFish, setNextFishId } from './fish.ts';

export interface Algae {
  id: number;
  x: number;
  y: number;
}

export interface FoodPellet {
  id: number;
  x: number;
  y: number;
  lifetime: number;
}

/** Player-configurable automation that periodically drops food pellets. */
export interface AutoFeederConfig {
  unlocked: boolean;
  enabled: boolean;
  /** Pellets dropped per cycle. */
  amount: number;
  /** Seconds between cycles. */
  frequency: number;
  /** Seconds remaining until the next cycle. */
  timer: number;
}

/** Player-configurable automation that periodically re-applies the fertilizer buff. */
export interface AutoFertilizerConfig {
  unlocked: boolean;
  enabled: boolean;
  /** Seconds between cycles. */
  frequency: number;
  /** Seconds remaining until the next cycle. */
  timer: number;
}

export interface GameState {
  money: number;
  fish: import('./fish.ts').Fish[];
  algae: Algae[];
  algaeSpawnTimer: number;
  /** Manually dropped fish food — any fish can eat these to satisfy hunger. */
  food: FoodPellet[];
  /** Seconds remaining on the fertilizer buff; 0 means inactive. */
  fertilizerTimer: number;
  /** Seconds remaining on the fish feed buff; 0 means inactive. */
  fishFeedTimer: number;
  autoFeeder: AutoFeederConfig;
  autoFertilizer: AutoFertilizerConfig;
  nextEntityId: number;
  autosaveTimer: number;
}

function allocId(state: GameState): number {
  return state.nextEntityId++;
}

export function createInitialState(): GameState {
  const state: GameState = {
    money: BALANCE.STARTING_MONEY,
    fish: [],
    algae: [],
    algaeSpawnTimer: BALANCE.ALGAE_SPAWN_INTERVAL,
    food: [],
    fertilizerTimer: 0,
    fishFeedTimer: 0,
    autoFeeder: {
      unlocked: false,
      enabled: true,
      amount: BALANCE.AUTO_FEEDER_DEFAULT_AMOUNT,
      frequency: BALANCE.AUTO_FEEDER_DEFAULT_FREQUENCY,
      timer: BALANCE.AUTO_FEEDER_DEFAULT_FREQUENCY,
    },
    autoFertilizer: {
      unlocked: false,
      enabled: true,
      frequency: BALANCE.AUTO_FERTILIZER_DEFAULT_FREQUENCY,
      timer: BALANCE.AUTO_FERTILIZER_DEFAULT_FREQUENCY,
    },
    nextEntityId: 1,
    autosaveTimer: 0,
  };

  const starter = createFish(
    'tilapia',
    BALANCE.TANK_WIDTH * 0.5,
    BALANCE.TANK_HEIGHT * 0.5,
    allocId(state),
  );
  state.fish.push(starter);
  setNextFishId(state.nextEntityId);
  return state;
}

export function canDropFood(state: GameState): boolean {
  return (
    state.money >= BALANCE.PELLET_COST &&
    state.food.length < BALANCE.MAX_PELLETS
  );
}

export function dropFood(state: GameState, x: number, y: number): boolean {
  if (!canDropFood(state)) return false;

  state.money -= BALANCE.PELLET_COST;
  state.food.push({
    id: allocId(state),
    x: Math.max(20, Math.min(BALANCE.TANK_WIDTH - 20, x)),
    y: Math.max(20, Math.min(BALANCE.TANK_HEIGHT - 60, y)),
    lifetime: BALANCE.PELLET_LIFETIME,
  });
  return true;
}

export function isFertilizerActive(state: GameState): boolean {
  return state.fertilizerTimer > 0;
}

export function isFishFeedActive(state: GameState): boolean {
  return state.fishFeedTimer > 0;
}

export function buyFish(state: GameState, species: FishSpecies): boolean {
  const price = BALANCE.FISH_PRICES[species];
  if (state.money < price) return false;

  state.money -= price;
  const fish = createFish(
    species,
    80 + Math.random() * (BALANCE.TANK_WIDTH - 160),
    100 + Math.random() * (BALANCE.TANK_HEIGHT - 200),
    allocId(state),
  );
  state.fish.push(fish);
  return true;
}

export function buyFertilizer(state: GameState): boolean {
  if (state.money < BALANCE.FERTILIZER_COST) return false;
  state.money -= BALANCE.FERTILIZER_COST;
  state.fertilizerTimer = BALANCE.FERTILIZER_DURATION;
  return true;
}

export function buyFishFeed(state: GameState): boolean {
  if (state.money < BALANCE.FISH_FEED_COST) return false;
  state.money -= BALANCE.FISH_FEED_COST;
  state.fishFeedTimer = BALANCE.FISH_FEED_DURATION;
  return true;
}

export function unlockAutoFeeder(state: GameState): boolean {
  if (state.autoFeeder.unlocked) return false;
  if (state.money < BALANCE.AUTO_FEEDER_UNLOCK_COST) return false;
  state.money -= BALANCE.AUTO_FEEDER_UNLOCK_COST;
  state.autoFeeder.unlocked = true;
  state.autoFeeder.timer = state.autoFeeder.frequency;
  return true;
}

export function unlockAutoFertilizer(state: GameState): boolean {
  if (state.autoFertilizer.unlocked) return false;
  if (state.money < BALANCE.AUTO_FERTILIZER_UNLOCK_COST) return false;
  state.money -= BALANCE.AUTO_FERTILIZER_UNLOCK_COST;
  state.autoFertilizer.unlocked = true;
  state.autoFertilizer.timer = state.autoFertilizer.frequency;
  return true;
}

export interface AutoFeederConfigUpdate {
  amount?: number;
  frequency?: number;
  enabled?: boolean;
}

export function setAutoFeederConfig(
  state: GameState,
  update: AutoFeederConfigUpdate,
): void {
  const feeder = state.autoFeeder;
  if (update.amount !== undefined) {
    feeder.amount = Math.round(
      Math.max(
        BALANCE.AUTO_FEEDER_MIN_AMOUNT,
        Math.min(BALANCE.AUTO_FEEDER_MAX_AMOUNT, update.amount),
      ),
    );
  }
  if (update.frequency !== undefined) {
    feeder.frequency = Math.max(
      BALANCE.AUTO_FEEDER_MIN_FREQUENCY,
      Math.min(BALANCE.AUTO_FEEDER_MAX_FREQUENCY, update.frequency),
    );
    feeder.timer = Math.min(feeder.timer, feeder.frequency);
  }
  if (update.enabled !== undefined) {
    feeder.enabled = update.enabled;
  }
}

export interface AutoFertilizerConfigUpdate {
  frequency?: number;
  enabled?: boolean;
}

export function setAutoFertilizerConfig(
  state: GameState,
  update: AutoFertilizerConfigUpdate,
): void {
  const fertilizer = state.autoFertilizer;
  if (update.frequency !== undefined) {
    fertilizer.frequency = Math.max(
      BALANCE.AUTO_FERTILIZER_MIN_FREQUENCY,
      Math.min(BALANCE.AUTO_FERTILIZER_MAX_FREQUENCY, update.frequency),
    );
    fertilizer.timer = Math.min(fertilizer.timer, fertilizer.frequency);
  }
  if (update.enabled !== undefined) {
    fertilizer.enabled = update.enabled;
  }
}

export function sellFish(state: GameState, fishId: number): boolean {
  const index = state.fish.findIndex((f) => f.id === fishId);
  if (index === -1) return false;
  const fish = state.fish[index];
  if (fish.dead) return false;

  const price = BALANCE.SELL_PRICES[fish.species][fish.growthStage];
  state.money += price;
  state.fish.splice(index, 1);
  return true;
}

export function removeDeadFish(state: GameState, fishId: number): boolean {
  const fish = state.fish.find((f) => f.id === fishId);
  if (!fish || !fish.dead) return false;
  fish.removePending = true;
  return true;
}
