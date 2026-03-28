export const DIALOG: Record<string, string> = {
  quest_intro_travel_title: 'Reach the crossroads',
  quest_intro_travel_body:
    'The steward whispers of better prices in Mirecross. Travel there before your coin goes stale.',
  quest_intro_profit_title: 'Fill your purse',
  quest_intro_profit_body:
    'Grow your purse to at least 220 crowns. Buy cheap, sell dear, and mind the tolls.',
  quest_intro_caravan_title: 'Invest in the road',
  quest_intro_caravan_body:
    'Upgrade your wagon, buy a horse, or hire a guard—prove you mean to stay on the trade road.',
  good_iron: 'Cold iron, good for nails and nerves.',
  good_silk: 'Light as gossip, costly as scandal.',
  good_wine: 'The river folk swear by this vintage.',
  good_herbs: 'Bundled for healers and cooks alike.',
  good_fish: 'Smoked until the bones forgive you.',
  good_salt: 'Worth its weight in arguments.',
  good_rope: 'Holds knots, grudges, and small fortunes.',
  good_peat: 'Burns slow; smells like the swamp’s childhood.',
  good_obsidian_glass: 'Volcano spit, cut flat — sharp as gossip.',
  good_dreaming_moss: 'Sleeps when you do not. Do not ask which.',
  good_bottled_echo: 'Someone’s last word, stoppered for resale.',
  good_chain_gang_tools: 'Heavy iron for work that outlasts the worker.',
  good_indenture_scroll: 'Signed in ink that remembers your thumb.',
  good_lucky_carp_bone: 'The fish lost; you might still win.',
  ui_welcome: 'You arrive under a pale sky. Markets cough smoke; carts groan.',
}

export function getDialog(key: string): string {
  return DIALOG[key] ?? key
}