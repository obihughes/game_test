import type { StoryQuestDef } from '@/game/story/types.ts'

export const STORY_QUESTS: StoryQuestDef[] = [
  {
    id: 'roadside_whispers',
    npcId: 'thorne',
    titleKey: 'story_quest_roadside_whispers_title',
    bodyKey: 'story_quest_roadside_whispers_body',
    completionKey: 'story_quest_roadside_whispers_done',
    objectives: [{ id: 'reach_mirecross', type: 'visit_town', townId: 'mirecross' }],
    rewards: [
      { type: 'gold', amount: 25 },
      { type: 'story_flag', flag: 'veris_contact' },
    ],
  },
  {
    id: 'crossroads_manifest',
    npcId: 'veris',
    titleKey: 'story_quest_crossroads_manifest_title',
    bodyKey: 'story_quest_crossroads_manifest_body',
    completionKey: 'story_quest_crossroads_manifest_done',
    objectives: [{ id: 'reach_crownpost', type: 'visit_town', townId: 'crownpost' }],
    rewards: [
      { type: 'gold', amount: 20 },
      { type: 'story_flag', flag: 'crownpost_scene_seen' },
    ],
  },
  {
    id: 'crown_license',
    npcId: 'aldric',
    titleKey: 'story_quest_crown_license_title',
    bodyKey: 'story_quest_crown_license_body',
    completionKey: 'story_quest_crown_license_done',
    objectives: [{ id: 'deliver_silk', type: 'deliver', townId: 'riversend', goodId: 'silk', qty: 2 }],
    rewards: [
      { type: 'gold', amount: 140 },
      { type: 'story_flag', flag: 'backed_crown' },
      { type: 'relationship', npcId: 'aldric', amount: 10 },
    ],
  },
  {
    id: 'quiet_relay',
    npcId: 'lyris',
    titleKey: 'story_quest_quiet_relay_title',
    bodyKey: 'story_quest_quiet_relay_body',
    completionKey: 'story_quest_quiet_relay_done',
    objectives: [{ id: 'deliver_rope', type: 'deliver', townId: 'fenward', goodId: 'rope', qty: 2 }],
    rewards: [
      { type: 'gold', amount: 110 },
      { type: 'story_flag', flag: 'backed_resistance' },
      { type: 'relationship', npcId: 'lyris', amount: 12 },
    ],
  },
  {
    id: 'harbor_tally',
    npcId: 'kess',
    titleKey: 'story_quest_harbor_tally_title',
    bodyKey: 'story_quest_harbor_tally_body',
    completionKey: 'story_quest_harbor_tally_done',
    conditions: [
      { type: 'story_quest_status', questId: 'crown_license', status: 'completed' },
    ],
    objectives: [{ id: 'deliver_timber', type: 'deliver', townId: 'riversend', goodId: 'timber', qty: 2 }],
    rewards: [
      { type: 'gold', amount: 90 },
      { type: 'story_flag', flag: 'harbor_trust' },
      { type: 'relationship', npcId: 'kess', amount: 10 },
    ],
  },
  {
    id: 'fen_relay',
    npcId: 'caera',
    titleKey: 'story_quest_fen_relay_title',
    bodyKey: 'story_quest_fen_relay_body',
    completionKey: 'story_quest_fen_relay_done',
    conditions: [
      { type: 'story_quest_status', questId: 'quiet_relay', status: 'completed' },
    ],
    objectives: [{ id: 'deliver_pitch', type: 'deliver', townId: 'saltmere', goodId: 'pitch', qty: 2 }],
    rewards: [
      { type: 'item', goodId: 'cart_upgrade_kit', qty: 1 },
      { type: 'story_flag', flag: 'reed_route_open' },
      { type: 'relationship', npcId: 'caera', amount: 14 },
    ],
  },
  {
    id: 'miners_union',
    npcId: 'brennan',
    titleKey: 'story_quest_miners_union_title',
    bodyKey: 'story_quest_miners_union_body',
    completionKey: 'story_quest_miners_union_done',
    objectives: [{ id: 'deliver_grain', type: 'deliver', townId: 'stoneholt', goodId: 'grain', qty: 3 }],
    rewards: [
      { type: 'item', goodId: 'metal_tools', qty: 2 },
      { type: 'story_flag', flag: 'miners_backed' },
      { type: 'relationship', npcId: 'brennan', amount: 10 },
    ],
  },
  {
    id: 'double_booked',
    npcId: 'veris',
    titleKey: 'story_quest_double_booked_title',
    bodyKey: 'story_quest_double_booked_body',
    completionKey: 'story_quest_double_booked_done',
    conditions: [
      {
        type: 'all_of',
        conditions: [
          { type: 'story_quest_status', questId: 'crown_license', status: 'completed' },
          { type: 'story_quest_status', questId: 'quiet_relay', status: 'completed' },
        ],
      },
    ],
    objectives: [{ id: 'deliver_wine', type: 'deliver', townId: 'saltmere', goodId: 'wine', qty: 1 }],
    rewards: [
      { type: 'item', goodId: 'elixir_of_insight', qty: 1 },
      { type: 'story_flag', flag: 'double_agent' },
      { type: 'easter_egg', easterEggId: 'veris_crown_seal' },
      { type: 'relationship', npcId: 'veris', amount: 15 },
    ],
  },
]
