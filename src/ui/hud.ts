import type { GameState } from '../sim/state.ts';
import { canDropFood } from '../sim/state.ts';
import { BALANCE } from '../sim/balance.ts';

export interface HudOptions {
  onAddMoney?: () => void;
  onToggleFastForward?: () => void;
  getFastForward?: () => boolean;
}

export class Hud {
  private readonly root: HTMLElement;
  private readonly moneyEl: HTMLElement;
  private readonly fishCountEl: HTMLElement;
  private readonly buffsEl: HTMLElement;
  private readonly hintEl: HTMLElement;
  private readonly fastForwardBtn: HTMLButtonElement;
  private getState: () => GameState;
  private readonly options: HudOptions;
  private lastMoneyText = '';
  private lastFishCountText = '';
  private lastBuffsText = '';
  private lastHintText = '';
  private lastFastForwardActive: boolean | null = null;

  constructor(
    container: HTMLElement,
    getState: () => GameState,
    options: HudOptions = {},
  ) {
    this.getState = getState;
    this.options = options;
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.innerHTML = `
      <div class="hud-panel">
        <div class="hud-row"><span class="label">Money</span><span id="hud-money">$0</span></div>
        <div class="hud-row"><span class="label">Fish</span><span id="hud-fish-count">0</span></div>
        <div class="hud-buffs" id="hud-buffs"></div>
        <button type="button" class="hud-speed-btn" id="hud-fast-forward">Fast Forward</button>
        <button type="button" class="hud-debug-btn" id="hud-add-money">+$100</button>
        <div class="hud-hint" id="hud-hint">Click open water to feed, click a fish to sell it</div>
      </div>
    `;
    container.appendChild(this.root);
    this.moneyEl = this.root.querySelector('#hud-money')!;
    this.fishCountEl = this.root.querySelector('#hud-fish-count')!;
    this.buffsEl = this.root.querySelector('#hud-buffs')!;
    this.hintEl = this.root.querySelector('#hud-hint')!;
    this.fastForwardBtn = this.root.querySelector('#hud-fast-forward')!;

    this.fastForwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.options.onToggleFastForward?.();
      this.updateFastForwardButton();
    });

    const addMoneyBtn = this.root.querySelector('#hud-add-money')!;
    addMoneyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const state = this.getState();
      state.money += 100;
      this.update(state);
      this.options.onAddMoney?.();
    });
  }

  private updateFastForwardButton(): void {
    const active = this.options.getFastForward?.() ?? false;
    if (active === this.lastFastForwardActive) return;
    this.lastFastForwardActive = active;
    this.fastForwardBtn.classList.toggle('active', active);
    this.fastForwardBtn.textContent = active
      ? `Fast Forward (${BALANCE.FAST_FORWARD_MULTIPLIER}x)`
      : 'Fast Forward';
  }

  update(state: GameState): void {
    const moneyText = `$${Math.floor(state.money)}`;
    if (moneyText !== this.lastMoneyText) {
      this.lastMoneyText = moneyText;
      this.moneyEl.textContent = moneyText;
    }

    let tilapiaCount = 0;
    let bassCount = 0;
    for (const f of state.fish) {
      if (f.dead) continue;
      if (f.species === 'tilapia') tilapiaCount++;
      else if (f.species === 'bass') bassCount++;
    }
    const fishCountText = `${tilapiaCount} tilapia / ${bassCount} bass`;
    if (fishCountText !== this.lastFishCountText) {
      this.lastFishCountText = fishCountText;
      this.fishCountEl.textContent = fishCountText;
    }

    const buffs: string[] = [];
    if (state.fertilizerTimer > 0) {
      buffs.push(`Fertilizer ${Math.ceil(state.fertilizerTimer)}s`);
    }
    if (state.fishFeedTimer > 0) {
      buffs.push(`Fish Feed ${Math.ceil(state.fishFeedTimer)}s`);
    }
    const buffsText = buffs.join(' | ');
    if (buffsText !== this.lastBuffsText) {
      this.lastBuffsText = buffsText;
      this.buffsEl.textContent = buffsText;
    }

    const hintText = !canDropFood(state)
      ? state.money < BALANCE.PELLET_COST
        ? 'Not enough money to feed'
        : 'Max pellets in tank — wait for fish to eat'
      : `Click open water to feed ($${BALANCE.PELLET_COST}), click a fish to sell it`;
    if (hintText !== this.lastHintText) {
      this.lastHintText = hintText;
      this.hintEl.textContent = hintText;
    }

    this.updateFastForwardButton();
  }

  destroy(): void {
    this.root.remove();
  }
}
