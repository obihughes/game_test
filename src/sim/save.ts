import { BALANCE } from './balance.ts';
import { setNextFishId } from './fish.ts';
import {
  createInitialState,
  type AutoFeederConfig,
  type AutoFertilizerConfig,
  type GameState,
} from './state.ts';

const SAVE_KEY = 'fish-tank-save-v2';

export interface SaveData {
  money: number;
  fish: GameState['fish'];
  nextEntityId: number;
  /** Optional — absent in saves created before automation was added. */
  autoFeeder?: AutoFeederConfig;
  /** Optional — absent in saves created before automation was added. */
  autoFertilizer?: AutoFertilizerConfig;
}

export function serializeState(state: GameState): SaveData {
  return {
    money: state.money,
    fish: state.fish.map((f) => ({ ...f })),
    nextEntityId: state.nextEntityId,
    autoFeeder: { ...state.autoFeeder },
    autoFertilizer: { ...state.autoFertilizer },
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
    // Older saves predate breedCooldown/eatingTimer/lastEatKind — default
    // missing fields so upgraded clients don't crash on old save data.
    state.fish = data.fish.map((f) => ({
      ...f,
      breedCooldown: f.breedCooldown ?? 0,
      eatingTimer: f.eatingTimer ?? 0,
      lastEatKind: f.lastEatKind ?? null,
    }));
    state.nextEntityId = data.nextEntityId;
    state.algae = [];
    state.algaeSpawnTimer = BALANCE.ALGAE_SPAWN_INTERVAL;
    state.food = [];
    state.fertilizerTimer = 0;
    state.fishFeedTimer = 0;
    state.autosaveTimer = 0;

    // Older saves predate automation — fall back to the defaults already
    // set by createInitialState() when missing. Timers reset to 0 so
    // automation triggers promptly on load rather than waiting out a
    // stale countdown.
    if (data.autoFeeder) {
      state.autoFeeder = { ...data.autoFeeder, timer: 0 };
    } else {
      state.autoFeeder.timer = 0;
    }
    if (data.autoFertilizer) {
      state.autoFertilizer = { ...data.autoFertilizer, timer: 0 };
    } else {
      state.autoFertilizer.timer = 0;
    }

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
