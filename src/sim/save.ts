import { BALANCE } from './balance.ts';
import { setNextFishId } from './fish.ts';
import {
  createInitialState,
  type GameState,
} from './state.ts';

const SAVE_KEY = 'fish-tank-save-v2';

export interface SaveData {
  money: number;
  fish: GameState['fish'];
  nextEntityId: number;
}

export function serializeState(state: GameState): SaveData {
  return {
    money: state.money,
    fish: state.fish.map((f) => ({ ...f })),
    nextEntityId: state.nextEntityId,
  };
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    const state = createInitialState();
    const starterFish = state.fish;
    state.money = data.money;
    state.fish = data.fish;
    state.nextEntityId = data.nextEntityId;
    state.algae = [];
    state.algaeSpawnTimer = BALANCE.ALGAE_SPAWN_INTERVAL;
    state.fertilizerTimer = 0;
    state.fishFeedTimer = 0;
    state.autosaveTimer = 0;

    const cheapestFish = Math.min(...Object.values(BALANCE.FISH_PRICES));
    if (state.fish.length === 0 && state.money < cheapestFish) {
      state.fish = starterFish;
    }

    setNextFishId(data.nextEntityId);
    return state;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState(state)));
  } catch {
    // Ignore quota errors in personal play sessions.
  }
}

export function shouldAutosave(state: GameState): boolean {
  return state.autosaveTimer >= BALANCE.AUTOSAVE_INTERVAL;
}

export function resetAutosaveTimer(state: GameState): void {
  state.autosaveTimer = 0;
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
