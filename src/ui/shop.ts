import type { GameState } from '../sim/state.ts';
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
      }
      this.render();
    });

    this.render();
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
