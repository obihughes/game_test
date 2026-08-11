import type { GameState } from '../sim/state.ts';
import { canDropFood } from '../sim/state.ts';
import { BALANCE } from '../sim/balance.ts';

export class Hud {
  private readonly root: HTMLElement;
  private readonly moneyEl: HTMLElement;
  private readonly fishCountEl: HTMLElement;
  private readonly buffsEl: HTMLElement;
  private readonly hintEl: HTMLElement;
  private getState: () => GameState;

  constructor(
    container: HTMLElement,
    getState: () => GameState,
    onAddMoney?: () => void,
  ) {
    this.getState = getState;
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.innerHTML = `
      <div class="hud-panel">
        <div class="hud-row"><span class="label">Money</span><span id="hud-money">$0</span></div>
        <div class="hud-row"><span class="label">Fish</span><span id="hud-fish-count">0</span></div>
        <div class="hud-buffs" id="hud-buffs"></div>
        <button type="button" class="hud-debug-btn" id="hud-add-money">+$100</button>
        <div class="hud-hint" id="hud-hint">Click open water to feed, click a fish to sell it</div>
      </div>
    `;
    container.appendChild(this.root);
    this.moneyEl = this.root.querySelector('#hud-money')!;
    this.fishCountEl = this.root.querySelector('#hud-fish-count')!;
    this.buffsEl = this.root.querySelector('#hud-buffs')!;
    this.hintEl = this.root.querySelector('#hud-hint')!;

    const addMoneyBtn = this.root.querySelector('#hud-add-money')!;
    addMoneyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const state = this.getState();
      state.money += 100;
      this.update(state);
      onAddMoney?.();
    });
  }

  update(state: GameState): void {
    this.moneyEl.textContent = `$${Math.floor(state.money)}`;

    const tilapiaCount = state.fish.filter(
      (f) => !f.dead && f.species === 'tilapia',
    ).length;
    const bassCount = state.fish.filter(
      (f) => !f.dead && f.species === 'bass',
    ).length;
    this.fishCountEl.textContent = `${tilapiaCount} tilapia / ${bassCount} bass`;

    const buffs: string[] = [];
    if (state.fertilizerTimer > 0) {
      buffs.push(`Fertilizer ${Math.ceil(state.fertilizerTimer)}s`);
    }
    if (state.fishFeedTimer > 0) {
      buffs.push(`Fish Feed ${Math.ceil(state.fishFeedTimer)}s`);
    }
    this.buffsEl.textContent = buffs.join(' | ');

    if (!canDropFood(state)) {
      this.hintEl.textContent =
        state.money < BALANCE.PELLET_COST
          ? 'Not enough money to feed'
          : 'Max pellets in tank — wait for fish to eat';
    } else {
      this.hintEl.textContent = `Click open water to feed ($${BALANCE.PELLET_COST}), click a fish to sell it`;
    }
  }

  destroy(): void {
    this.root.remove();
  }
}
