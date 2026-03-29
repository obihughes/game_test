import type { GameState, GoodId, TownId } from '@/game/core/types.ts'

export interface StoryNpcDef {
  id: string
  /** Key into `NpcPortrait` pixel art; defaults to `id` when omitted. */
  portraitId?: string
  townId: TownId
  name: string
  title: string
  shortDescriptionKey: string
}

export type StoryCondition =
  | { type: 'story_flag'; flag: string; value?: boolean }
  | { type: 'system_quest_flag'; flag: string; value?: boolean }
  | { type: 'story_quest_status'; questId: string; status: 'inactive' | 'active' | 'completed' }
  | { type: 'gold_at_least'; amount: number }
  | { type: 'inventory_at_least'; goodId: GoodId; qty: number }
  | { type: 'current_town'; townId: TownId }
  | { type: 'relationship_at_least'; npcId: string; favor: number }
  | { type: 'all_of'; conditions: StoryCondition[] }
  | { type: 'any_of'; conditions: StoryCondition[] }

export type StoryEffect =
  | { type: 'set_story_flag'; flag: string; value?: boolean }
  | { type: 'adjust_relationship'; npcId: string; amount: number }
  | { type: 'start_story_quest'; questId: string }
  | { type: 'grant_gold'; amount: number }
  | { type: 'grant_item'; goodId: GoodId; qty: number }
  | { type: 'pay_gold'; amount: number }
  | { type: 'unlock_easter_egg'; easterEggId: string }

export interface StoryDialogOption {
  id: string
  textKey: string
  nextNodeId?: string
  conditions?: StoryCondition[]
  effects?: StoryEffect[]
  closes?: boolean
}

export interface StoryDialogNode {
  id: string
  npcId: string
  textKey: string
  conditions?: StoryCondition[]
  options: StoryDialogOption[]
  isRoot?: boolean
  priority?: number
}

export type StoryQuestObjective =
  | { id: string; type: 'visit_town'; townId: TownId }
  | { id: string; type: 'deliver'; townId: TownId; goodId: GoodId; qty: number }
  | { id: string; type: 'have_gold'; amount: number }
  | { id: string; type: 'have_item'; goodId: GoodId; qty: number }
  | { id: string; type: 'story_flag'; flag: string }
  | { id: string; type: 'system_quest_flag'; flag: string }

export type StoryQuestReward =
  | { type: 'gold'; amount: number }
  | { type: 'item'; goodId: GoodId; qty: number }
  | { type: 'story_flag'; flag: string; value?: boolean }
  | { type: 'relationship'; npcId: string; amount: number }
  | { type: 'easter_egg'; easterEggId: string }

export interface StoryQuestDef {
  id: string
  npcId: string
  titleKey: string
  bodyKey: string
  completionKey?: string
  objectives: StoryQuestObjective[]
  rewards: StoryQuestReward[]
  conditions?: StoryCondition[]
}

export interface StoryDialogResult {
  state: GameState
  nextNodeId: string | null
}
