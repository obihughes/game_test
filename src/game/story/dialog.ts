import { STORY_DIALOG_NODES, STORY_NPCS, STORY_QUESTS } from '@/content/story/index.ts'
import type { GameState, TownId } from '@/game/core/types.ts'
import type {
  StoryCondition,
  StoryDialogNode,
  StoryDialogOption,
  StoryDialogResult,
  StoryNpcDef,
  StoryQuestDef,
} from './types.ts'
import { ensureStoryState, getNpcRelationship, getStoryFlag, getStoryQuestStatus } from './state.ts'
import { applyStoryEffect, applyStoryProgression } from './questLogic.ts'

function getNode(nodeId: string): StoryDialogNode | undefined {
  return STORY_DIALOG_NODES.find((node) => node.id === nodeId)
}

function getQuestDef(questId: string): StoryQuestDef | undefined {
  return STORY_QUESTS.find((quest) => quest.id === questId)
}

export function evaluateStoryCondition(state: GameState, condition: StoryCondition): boolean {
  switch (condition.type) {
    case 'story_flag':
      return getStoryFlag(state, condition.flag) === (condition.value ?? true)
    case 'system_quest_flag':
      return Boolean(state.questFlags[condition.flag]) === (condition.value ?? true)
    case 'story_quest_status':
      return getStoryQuestStatus(state, condition.questId) === condition.status
    case 'gold_at_least':
      return state.gold >= condition.amount
    case 'inventory_at_least':
      return (state.inventory[condition.goodId] ?? 0) >= condition.qty
    case 'current_town':
      return state.location === condition.townId
    case 'relationship_at_least':
      return getNpcRelationship(state, condition.npcId).favor >= condition.favor
    case 'all_of':
      return condition.conditions.every((entry) => evaluateStoryCondition(state, entry))
    case 'any_of':
      return condition.conditions.some((entry) => evaluateStoryCondition(state, entry))
  }
}

function conditionsPass(state: GameState, conditions?: StoryCondition[]): boolean {
  return (conditions ?? []).every((condition) => evaluateStoryCondition(state, condition))
}

export function getStoryNpcById(npcId: string): StoryNpcDef | undefined {
  return STORY_NPCS.find((npc) => npc.id === npcId)
}

export function getStoryNpcsForTown(townId: TownId): StoryNpcDef[] {
  return STORY_NPCS.filter((npc) => npc.townId === townId)
}

export function getStoryNode(nodeId: string): StoryDialogNode | undefined {
  return getNode(nodeId)
}

export function getVisibleOptions(
  state: GameState,
  nodeId: string,
): StoryDialogOption[] {
  const node = getNode(nodeId)
  if (!node) return []
  return node.options.filter((option) => conditionsPass(state, option.conditions))
}

export function getRootNodeId(
  state: GameState,
  npcId: string,
): string | null {
  const candidates = STORY_DIALOG_NODES
    .filter((node) => node.npcId === npcId && node.isRoot)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  for (const node of candidates) {
    if (conditionsPass(state, node.conditions)) return node.id
  }
  return null
}

export function startStoryConversation(
  state: GameState,
  npcId: string,
): StoryDialogResult {
  let nextState = ensureStoryState(state)
  const nodeId = getRootNodeId(nextState, npcId)
  if (!nodeId) return { state: nextState, nextNodeId: null }
  const relationship = getNpcRelationship(nextState, npcId)
  nextState = {
    ...nextState,
    story: {
      ...nextState.story,
      npcRelationships: {
        ...nextState.story.npcRelationships,
        [npcId]: {
          ...relationship,
          timesSpokenTo: relationship.timesSpokenTo + 1,
          lastSpokenDay: nextState.day,
        },
      },
    },
  }
  return { state: nextState, nextNodeId: nodeId }
}

export function chooseStoryOption(
  state: GameState,
  nodeId: string,
  optionId: string,
): StoryDialogResult {
  const nextState = ensureStoryState(state)
  const node = getNode(nodeId)
  if (!node || !conditionsPass(nextState, node.conditions)) {
    return { state: nextState, nextNodeId: null }
  }
  const option = node.options.find((entry) => entry.id === optionId)
  if (!option || !conditionsPass(nextState, option.conditions)) {
    return { state: nextState, nextNodeId: nodeId }
  }
  let resolvedState = nextState
  for (const effect of option.effects ?? []) {
    resolvedState = applyStoryEffect(resolvedState, effect)
  }
  resolvedState = applyStoryProgression(resolvedState)
  if (option.closes) return { state: resolvedState, nextNodeId: null }
  if (!option.nextNodeId) return { state: resolvedState, nextNodeId: null }
  const nextNode = getNode(option.nextNodeId)
  if (!nextNode || !conditionsPass(resolvedState, nextNode.conditions)) {
    return { state: resolvedState, nextNodeId: null }
  }
  return { state: resolvedState, nextNodeId: nextNode.id }
}

export function getAvailableStoryQuestsForNpc(
  state: GameState,
  npcId: string,
): StoryQuestDef[] {
  const nextState = ensureStoryState(state)
  return STORY_QUESTS.filter((quest) => {
    if (quest.npcId !== npcId) return false
    return getStoryQuestStatus(nextState, quest.id) === 'active' || conditionsPass(nextState, quest.conditions)
  })
}

export function getNpcQuestSummary(
  state: GameState,
  npcId: string,
): { active: StoryQuestDef[]; completed: StoryQuestDef[] } {
  const nextState = ensureStoryState(state)
  return {
    active: STORY_QUESTS.filter(
      (quest) => quest.npcId === npcId && getStoryQuestStatus(nextState, quest.id) === 'active',
    ),
    completed: STORY_QUESTS.filter(
      (quest) => quest.npcId === npcId && getStoryQuestStatus(nextState, quest.id) === 'completed',
    ),
  }
}

export function getStoryQuestCompletionLine(questId: string): string | null {
  return getQuestDef(questId)?.completionKey ?? null
}
