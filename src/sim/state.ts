import type { FishSpecies } from './balance.ts';
import { BALANCE } from './balance.ts';
import { createFish, setNextFishId } from './fish.ts';

export interface Algae {
  id: number;
  x: number;
  y: number;
  lifetime: number;
}

export interface GameState {
  money: number;
  fish: import('./fish.ts').Fish[];
  algae: Algae[];
  algaeSpawnTimer: number;
  /** Seconds remaining on the fertilizer buff; 0 means inactive. */
  fertilizerTimer: number;
  /** Seconds remaining on the fish feed buff; 0 means inactive. */
  fishFeedTimer: number;
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
    fertilizerTimer: 0,
    fishFeedTimer: 0,
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
