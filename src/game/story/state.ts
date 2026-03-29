import type { GameState, NpcRelationshipState, StoryState } from '@/game/core/types.ts'

export function createEmptyStoryState(): StoryState {
  return {
    flags: {},
    activeQuestIds: [],
    completedQuestIds: [],
    questProgress: {},
    npcRelationships: {},
    unlockedEasterEggs: [],
  }
}

export function ensureStoryState(state: GameState): GameState {
  const story = state.story && typeof state.story === 'object' ? state.story : createEmptyStoryState()
  return {
    ...state,
    story: {
      flags: story.flags && typeof story.flags === 'object' ? story.flags : {},
      activeQuestIds: Array.isArray(story.activeQuestIds) ? story.activeQuestIds : [],
      completedQuestIds: Array.isArray(story.completedQuestIds) ? story.completedQuestIds : [],
      questProgress: story.questProgress && typeof story.questProgress === 'object' ? story.questProgress : {},
      npcRelationships:
        story.npcRelationships && typeof story.npcRelationships === 'object' ? story.npcRelationships : {},
      unlockedEasterEggs: Array.isArray(story.unlockedEasterEggs) ? story.unlockedEasterEggs : [],
    },
  }
}

export function getStoryFlag(state: GameState, flag: string): boolean {
  return Boolean(state.story.flags[flag])
}

export function getStoryQuestStatus(
  state: GameState,
  questId: string,
): 'inactive' | 'active' | 'completed' {
  if (state.story.completedQuestIds.includes(questId)) return 'completed'
  if (state.story.activeQuestIds.includes(questId)) return 'active'
  return 'inactive'
}

export function getNpcRelationship(
  state: GameState,
  npcId: string,
): NpcRelationshipState {
  return (
    state.story.npcRelationships[npcId] ?? {
      timesSpokenTo: 0,
      lastSpokenDay: 0,
      favor: 0,
    }
  )
}
