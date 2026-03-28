import type { GameState } from '../core/types.ts'

function withQuest(
  state: GameState,
  patch: Partial<GameState>,
): GameState {
  return { ...state, ...patch }
}

export function applyQuestProgress(state: GameState): GameState {
  let s = state

  if (s.activeQuestId === 'intro_travel' && s.location === 'mirecross') {
    s = withQuest(s, {
      questFlags: { ...s.questFlags, intro_travel: true },
      activeQuestId: 'intro_profit',
    })
  }

  if (s.activeQuestId === 'intro_profit' && s.gold >= 220) {
    s = withQuest(s, {
      questFlags: { ...s.questFlags, intro_profit: true },
      activeQuestId: 'intro_caravan',
    })
  }

  if (s.activeQuestId === 'intro_caravan') {
    const upgraded =
      s.caravan.cartTier >= 1 || s.caravan.horses >= 1 || s.caravan.hires.guard! > 0
    if (upgraded) {
      s = withQuest(s, {
        questFlags: { ...s.questFlags, intro_caravan: true },
        activeQuestId: 'post_wealth',
      })
    }
  }

  if (s.activeQuestId === 'post_wealth' && s.gold >= 1000) {
    s = withQuest(s, {
      questFlags: { ...s.questFlags, post_wealth: true },
      activeQuestId: 'post_delivery',
    })
  }

  if (
    s.activeQuestId === 'post_delivery' &&
    s.location === 'riversend' &&
    (s.inventory.silk ?? 0) >= 5
  ) {
    s = withQuest(s, {
      questFlags: { ...s.questFlags, post_delivery: true },
      activeQuestId: 'post_caravan',
    })
  }

  if (s.activeQuestId === 'post_caravan' && s.caravan.cartTier >= 3) {
    s = withQuest(s, {
      questFlags: { ...s.questFlags, post_caravan: true },
      activeQuestId: null,
    })
  }

  return s
}