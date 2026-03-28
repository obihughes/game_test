export interface QuestDef {
  id: string
  titleKey: string
  bodyKey: string
}

export const QUESTS: QuestDef[] = [
  {
    id: 'intro_travel',
    titleKey: 'quest_intro_travel_title',
    bodyKey: 'quest_intro_travel_body',
  },
  {
    id: 'intro_profit',
    titleKey: 'quest_intro_profit_title',
    bodyKey: 'quest_intro_profit_body',
  },
  {
    id: 'intro_caravan',
    titleKey: 'quest_intro_caravan_title',
    bodyKey: 'quest_intro_caravan_body',
  },
]