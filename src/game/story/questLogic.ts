import { STORY_QUESTS } from '@/content/story/index.ts'
import type { GameState, GoodId } from '@/game/core/types.ts'
import { GOODS } from '@/game/economy/goods.ts'
import { TOWNS } from '@/game/world/towns.ts'
import type { StoryEffect, StoryQuestDef, StoryQuestObjective, StoryQuestReward } from './types.ts'
import { ensureStoryState, getNpcRelationship, getStoryFlag, getStoryQuestStatus } from './state.ts'

function getQuestDef(questId: string): StoryQuestDef | undefined {
  return STORY_QUESTS.find((quest) => quest.id === questId)
}

function addRewardItem(state: GameState, goodId: GoodId, qty: number): GameState {
  const had = state.inventory[goodId] ?? 0
  return {
    ...state,
    inventory: {
      ...state.inventory,
      [goodId]: had + qty,
    },
  }
}

function removeCargoWithCostBasis(
  state: GameState,
  goodId: GoodId,
  qty: number,
): Pick<GameState, 'inventory' | 'inventoryCostBasis'> {
  const have = state.inventory[goodId] ?? 0
  const basis = state.inventoryCostBasis[goodId] ?? 0
  const nextQty = Math.max(0, have - qty)
  const consumedBasis = have > 0 ? (basis * Math.min(qty, have)) / have : 0
  const inventory = { ...state.inventory, [goodId]: nextQty }
  const inventoryCostBasis = { ...state.inventoryCostBasis }
  if (nextQty <= 0) delete inventory[goodId]
  const remainingBasis = basis - consumedBasis
  if (nextQty <= 0 || remainingBasis <= 0) delete inventoryCostBasis[goodId]
  else inventoryCostBasis[goodId] = remainingBasis
  return { inventory, inventoryCostBasis }
}

function evaluateObjective(state: GameState, objective: StoryQuestObjective): boolean {
  switch (objective.type) {
    case 'visit_town':
      return state.location === objective.townId
    case 'deliver':
      return state.location === objective.townId && (state.inventory[objective.goodId] ?? 0) >= objective.qty
    case 'have_gold':
      return state.gold >= objective.amount
    case 'have_item':
      return (state.inventory[objective.goodId] ?? 0) >= objective.qty
    case 'story_flag':
      return getStoryFlag(state, objective.flag)
    case 'system_quest_flag':
      return Boolean(state.questFlags[objective.flag])
  }
}

function consumeObjective(state: GameState, objective: StoryQuestObjective): GameState {
  if (objective.type !== 'deliver') return state
  const consumed = removeCargoWithCostBasis(state, objective.goodId, objective.qty)
  return {
    ...state,
    inventory: consumed.inventory,
    inventoryCostBasis: consumed.inventoryCostBasis,
  }
}

function applyReward(state: GameState, reward: StoryQuestReward): GameState {
  switch (reward.type) {
    case 'gold':
      return { ...state, gold: state.gold + reward.amount }
    case 'item':
      return addRewardItem(state, reward.goodId, reward.qty)
    case 'story_flag':
      return {
        ...state,
        story: {
          ...state.story,
          flags: {
            ...state.story.flags,
            [reward.flag]: reward.value ?? true,
          },
        },
      }
    case 'relationship': {
      const rel = getNpcRelationship(state, reward.npcId)
      return {
        ...state,
        story: {
          ...state.story,
          npcRelationships: {
            ...state.story.npcRelationships,
            [reward.npcId]: {
              ...rel,
              favor: rel.favor + reward.amount,
            },
          },
        },
      }
    }
    case 'easter_egg':
      return {
        ...state,
        story: {
          ...state.story,
          unlockedEasterEggs: state.story.unlockedEasterEggs.includes(reward.easterEggId)
            ? state.story.unlockedEasterEggs
            : [...state.story.unlockedEasterEggs, reward.easterEggId],
        },
      }
  }
}

export function startStoryQuest(state: GameState, questId: string): GameState {
  const nextState = ensureStoryState(state)
  const quest = getQuestDef(questId)
  if (!quest) return nextState
  const status = getStoryQuestStatus(nextState, questId)
  if (status !== 'inactive') return nextState
  return {
    ...nextState,
    story: {
      ...nextState.story,
      activeQuestIds: [...nextState.story.activeQuestIds, questId],
      questProgress: {
        ...nextState.story.questProgress,
        [questId]: {
          status: 'active',
          startedDay: nextState.day,
        },
      },
    },
  }
}

export function applyStoryEffect(state: GameState, effect: StoryEffect): GameState {
  const nextState = ensureStoryState(state)
  switch (effect.type) {
    case 'set_story_flag':
      return {
        ...nextState,
        story: {
          ...nextState.story,
          flags: {
            ...nextState.story.flags,
            [effect.flag]: effect.value ?? true,
          },
        },
      }
    case 'adjust_relationship': {
      const rel = getNpcRelationship(nextState, effect.npcId)
      return {
        ...nextState,
        story: {
          ...nextState.story,
          npcRelationships: {
            ...nextState.story.npcRelationships,
            [effect.npcId]: {
              ...rel,
              favor: rel.favor + effect.amount,
            },
          },
        },
      }
    }
    case 'start_story_quest':
      return startStoryQuest(nextState, effect.questId)
    case 'grant_gold':
      return { ...nextState, gold: nextState.gold + effect.amount }
    case 'grant_item':
      return addRewardItem(nextState, effect.goodId, effect.qty)
    case 'pay_gold':
      return { ...nextState, gold: Math.max(0, nextState.gold - effect.amount) }
    case 'unlock_easter_egg':
      return {
        ...nextState,
        story: {
          ...nextState.story,
          unlockedEasterEggs: nextState.story.unlockedEasterEggs.includes(effect.easterEggId)
            ? nextState.story.unlockedEasterEggs
            : [...nextState.story.unlockedEasterEggs, effect.easterEggId],
        },
      }
  }
}

export function applyStoryProgression(state: GameState): GameState {
  let nextState = ensureStoryState(state)
  for (const questId of nextState.story.activeQuestIds) {
    const quest = getQuestDef(questId)
    if (!quest) continue
    const isComplete = quest.objectives.every((objective) => evaluateObjective(nextState, objective))
    if (!isComplete) continue
    let resolvedState = nextState
    for (const objective of quest.objectives) {
      resolvedState = consumeObjective(resolvedState, objective)
    }
    for (const reward of quest.rewards) {
      resolvedState = applyReward(resolvedState, reward)
    }
    resolvedState = {
      ...resolvedState,
      story: {
        ...resolvedState.story,
        activeQuestIds: resolvedState.story.activeQuestIds.filter((id) => id !== questId),
        completedQuestIds: resolvedState.story.completedQuestIds.includes(questId)
          ? resolvedState.story.completedQuestIds
          : [...resolvedState.story.completedQuestIds, questId],
        questProgress: {
          ...resolvedState.story.questProgress,
          [questId]: {
            ...resolvedState.story.questProgress[questId],
            status: 'completed',
            startedDay: resolvedState.story.questProgress[questId]?.startedDay ?? resolvedState.day,
            completedDay: resolvedState.day,
          },
        },
      },
    }
    nextState = resolvedState
  }
  return nextState
}

export function getStoryQuestById(questId: string): StoryQuestDef | undefined {
  return getQuestDef(questId)
}

export function getActiveStoryQuests(state: GameState): StoryQuestDef[] {
  const nextState = ensureStoryState(state)
  return nextState.story.activeQuestIds
    .map((questId) => getQuestDef(questId))
    .filter((quest): quest is StoryQuestDef => Boolean(quest))
}

export function getObjectiveStatus(
  state: GameState,
  objective: StoryQuestObjective,
): { done: boolean; label: string } {
  switch (objective.type) {
    case 'visit_town':
      return {
        done: evaluateObjective(state, objective),
        label: `Reach ${TOWNS[objective.townId]?.name ?? objective.townId}.`,
      }
    case 'deliver':
      return {
        done: evaluateObjective(state, objective),
        label: `Deliver ${objective.qty} ${GOODS[objective.goodId]?.name ?? objective.goodId} to ${TOWNS[objective.townId]?.name ?? objective.townId}.`,
      }
    case 'have_gold':
      return {
        done: evaluateObjective(state, objective),
        label: `Hold at least ${objective.amount} crowns.`,
      }
    case 'have_item':
      return {
        done: evaluateObjective(state, objective),
        label: `Carry ${objective.qty} ${GOODS[objective.goodId]?.name ?? objective.goodId}.`,
      }
    case 'story_flag':
      return { done: evaluateObjective(state, objective), label: `Advance the road intrigue.` }
    case 'system_quest_flag':
      return { done: evaluateObjective(state, objective), label: `Advance the main trade route.` }
  }
}
