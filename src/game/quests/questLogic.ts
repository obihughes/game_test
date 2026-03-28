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
        activeQuestId: null,
      })
    }
  }

  return s
}