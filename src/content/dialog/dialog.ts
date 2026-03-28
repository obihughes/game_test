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
  quest_post_wealth_title: 'A merchant’s purse',
  quest_post_wealth_body:
    'Word counts more when you count more than others. Grow your purse to at least 1000 crowns.',
  quest_post_delivery_title: 'Silk to the river',
  quest_post_delivery_body:
    'The harbormaster at Riversend wants a show of silk. Deliver at least 5 silk bolts there while you are in town.',
  quest_post_caravan_title: 'Long caravan',
  quest_post_caravan_body:
    'The crown road is long. Fully upgrade your wagon to a Long caravan — the largest rig the road allows.',
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
  good_crown_amber: 'Tree-blood set like honey; the crown tax man smiles anyway.',
  good_fen_spice: 'Pungent enough to wake the dead — or at least the cook.',
  ui_welcome: 'You arrive under a pale sky. Markets cough smoke; carts groan.',
}

export function getDialog(key: string): string {
  return DIALOG[key] ?? key
}