import type {
  AutoFeederConfigUpdate,
  AutoFertilizerConfigUpdate,
  GameState,
} from '../sim/state.ts';
import {
  buyFish,
  buyFertilizer,
  buyFishFeed,
  removeDeadFish,
  sellFish,
} from '../sim/state.ts';
import type { FishSpecies } from '../sim/balance.ts';
import { BALANCE } from '../sim/balance.ts';

export interface ShopCallbacks {
  onBuyFish: (species: FishSpecies) => void;
  onBuyFertilizer: () => void;
  onBuyFishFeed: () => void;
  onUnlockAutoFeeder: () => void;
  onUnlockAutoFertilizer: () => void;
  onConfigAutoFeeder: (update: AutoFeederConfigUpdate) => void;
  onConfigAutoFertilizer: (update: AutoFertilizerConfigUpdate) => void;
}

export class Shop {
  private readonly root: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly callbacks: ShopCallbacks;
  private getState: () => GameState;
  private collapsed = false;

  constructor(
    container: HTMLElement,
    getState: () => GameState,
    callbacks: ShopCallbacks,
  ) {
    this.getState = getState;
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.className = 'shop';
    this.panel = document.createElement('div');
    this.panel.className = 'shop-panel';
    this.root.appendChild(this.panel);
    container.appendChild(this.root);

    this.root.addEventListener('click', (e) => {
      const toggle = (e.target as HTMLElement).closest('.shop-toggle') as
        | HTMLElement
        | null;
      if (toggle) {
        e.stopPropagation();
        this.collapsed = !this.collapsed;
        this.render();
        return;
      }

      const target = (e.target as HTMLElement).closest('.shop-btn') as
        | HTMLElement
        | null;
      if (!target || target.hasAttribute('disabled')) return;
      e.stopPropagation();
      const action = target.dataset.action;
      switch (action) {
        case 'buy-tilapia':
          this.callbacks.onBuyFish('tilapia');
          break;
        case 'buy-bass':
          this.callbacks.onBuyFish('bass');
          break;
        case 'buy-fertilizer':
          this.callbacks.onBuyFertilizer();
          break;
        case 'buy-fish-feed':
          this.callbacks.onBuyFishFeed();
          break;
        case 'unlock-auto-feeder':
          this.callbacks.onUnlockAutoFeeder();
          break;
        case 'unlock-auto-fertilizer':
          this.callbacks.onUnlockAutoFertilizer();
          break;
      }
      this.render();
    });

    // Sliders/checkboxes update config live without a full re-render, so
    // dragging a range input doesn't rebuild the DOM out from under the
    // pointer mid-drag. Displayed labels are patched in place instead.
    this.root.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.dataset.control === 'auto-feeder-amount') {
        e.stopPropagation();
        this.callbacks.onConfigAutoFeeder({ amount: Number(el.value) });
        this.updateAutoFeederLabels();
      } else if (el.dataset.control === 'auto-feeder-frequency') {
        e.stopPropagation();
        this.callbacks.onConfigAutoFeeder({ frequency: Number(el.value) });
        this.updateAutoFeederLabels();
      } else if (el.dataset.control === 'auto-fertilizer-frequency') {
        e.stopPropagation();
        this.callbacks.onConfigAutoFertilizer({ frequency: Number(el.value) });
        this.updateAutoFertilizerLabels();
      }
    });

    this.root.addEventListener('change', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.dataset.control === 'auto-feeder-enabled') {
        e.stopPropagation();
        this.callbacks.onConfigAutoFeeder({ enabled: el.checked });
      } else if (el.dataset.control === 'auto-fertilizer-enabled') {
        e.stopPropagation();
        this.callbacks.onConfigAutoFertilizer({ enabled: el.checked });
      } else {
        return;
      }
      this.render();
    });

    this.render();
  }

  private updateAutoFeederLabels(): void {
    const state = this.getState();
    const amountLabel = this.panel.querySelector('#auto-feeder-amount-label');
    const freqLabel = this.panel.querySelector('#auto-feeder-frequency-label');
    if (amountLabel) amountLabel.textContent = `${state.autoFeeder.amount}`;
    if (freqLabel) freqLabel.textContent = `${state.autoFeeder.frequency}s`;
  }

  private updateAutoFertilizerLabels(): void {
    const state = this.getState();
    const freqLabel = this.panel.querySelector(
      '#auto-fertilizer-frequency-label',
    );
    if (freqLabel) freqLabel.textContent = `${state.autoFertilizer.frequency}s`;
  }

  private render(): void {
    const state = this.getState();

    this.panel.classList.toggle('collapsed', this.collapsed);

    const fertilizerActive = state.fertilizerTimer > 0;
    const fishFeedActive = state.fishFeedTimer > 0;

    this.panel.innerHTML = `
      <button type="button" class="shop-toggle" aria-expanded="${!this.collapsed}">
        Shop <span class="shop-toggle-icon">${this.collapsed ? '▸' : '▾'}</span>
      </button>
      <div class="shop-body">
        <button class="shop-btn" data-action="buy-tilapia" ${state.money < BALANCE.FISH_PRICES.tilapia ? 'disabled' : ''}>
          Tilapia — $${BALANCE.FISH_PRICES.tilapia}
        </button>
        <button class="shop-btn" data-action="buy-bass" ${state.money < BALANCE.FISH_PRICES.bass ? 'disabled' : ''}>
          Bass — $${BALANCE.FISH_PRICES.bass}
        </button>
        <hr />
        <button class="shop-btn" data-action="buy-fertilizer" ${state.money < BALANCE.FERTILIZER_COST ? 'disabled' : ''}>
          ${fertilizerActive ? `Fertilizer (${Math.ceil(state.fertilizerTimer)}s left)` : `Fertilizer — $${BALANCE.FERTILIZER_COST}`}
        </button>
        <button class="shop-btn" data-action="buy-fish-feed" ${state.money < BALANCE.FISH_FEED_COST ? 'disabled' : ''}>
          ${fishFeedActive ? `Fish Feed (${Math.ceil(state.fishFeedTimer)}s left)` : `Fish Feed — $${BALANCE.FISH_FEED_COST}`}
        </button>
        <hr />
        ${this.renderAutoFeeder(state)}
        ${this.renderAutoFertilizer(state)}
      </div>
    `;
  }

  private renderAutoFeeder(state: GameState): string {
    const feeder = state.autoFeeder;
    if (!feeder.unlocked) {
      return `
        <button class="shop-btn" data-action="unlock-auto-feeder" ${state.money < BALANCE.AUTO_FEEDER_UNLOCK_COST ? 'disabled' : ''}>
          Unlock Auto Feeder — $${BALANCE.AUTO_FEEDER_UNLOCK_COST}
        </button>
      `;
    }
    return `
      <div class="auto-panel">
        <label class="auto-panel-header">
          <span>Auto Feeder</span>
          <input type="checkbox" data-control="auto-feeder-enabled" ${feeder.enabled ? 'checked' : ''} />
        </label>
        <div class="auto-row">
          <span class="auto-row-label">Amount</span>
          <input type="range" data-control="auto-feeder-amount"
            min="${BALANCE.AUTO_FEEDER_MIN_AMOUNT}" max="${BALANCE.AUTO_FEEDER_MAX_AMOUNT}"
            step="1" value="${feeder.amount}" />
          <span class="auto-row-value" id="auto-feeder-amount-label">${feeder.amount}</span>
        </div>
        <div class="auto-row">
          <span class="auto-row-label">Every</span>
          <input type="range" data-control="auto-feeder-frequency"
            min="${BALANCE.AUTO_FEEDER_MIN_FREQUENCY}" max="${BALANCE.AUTO_FEEDER_MAX_FREQUENCY}"
            step="1" value="${feeder.frequency}" />
          <span class="auto-row-value" id="auto-feeder-frequency-label">${feeder.frequency}s</span>
        </div>
      </div>
    `;
  }

  private renderAutoFertilizer(state: GameState): string {
    const fertilizer = state.autoFertilizer;
    if (!fertilizer.unlocked) {
      return `
        <button class="shop-btn" data-action="unlock-auto-fertilizer" ${state.money < BALANCE.AUTO_FERTILIZER_UNLOCK_COST ? 'disabled' : ''}>
          Unlock Auto Fertilizer — $${BALANCE.AUTO_FERTILIZER_UNLOCK_COST}
        </button>
      `;
    }
    return `
      <div class="auto-panel">
        <label class="auto-panel-header">
          <span>Auto Fertilizer</span>
          <input type="checkbox" data-control="auto-fertilizer-enabled" ${fertilizer.enabled ? 'checked' : ''} />
        </label>
        <div class="auto-row">
          <span class="auto-row-label">Every</span>
          <input type="range" data-control="auto-fertilizer-frequency"
            min="${BALANCE.AUTO_FERTILIZER_MIN_FREQUENCY}" max="${BALANCE.AUTO_FERTILIZER_MAX_FREQUENCY}"
            step="1" value="${fertilizer.frequency}" />
          <span class="auto-row-value" id="auto-fertilizer-frequency-label">${fertilizer.frequency}s</span>
        </div>
      </div>
    `;
  }

  update(): void {
    this.render();
  }

  destroy(): void {
    this.root.remove();
  }
}

export {
  buyFish,
  buyFertilizer,
  buyFishFeed,
  removeDeadFish,
  sellFish,
};
