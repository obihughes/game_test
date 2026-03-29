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
  quest_post_wealth_title: "A merchant's purse",
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
  good_fresh_fish: 'Pulled from the river this morning — sell it before it remembers.',
  good_salted_fish: 'Packed in salt and patience; lasts the long road.',
  good_smoked_fish: 'Smoked until the bones forgive you.',
  good_fish_sauce: 'Fermented long enough to offend everyone — and season everything.',
  good_salt: 'Worth its weight in arguments.',
  good_rope: 'Holds knots, grudges, and small fortunes.',
  good_peat: "Burns slow; smells like the swamp's childhood.",
  good_obsidian_glass: 'Volcano spit, cut flat — sharp as gossip.',
  good_dreaming_moss: 'Sleeps when you do not. Do not ask which.',
  good_crown_amber: 'Tree-blood set like honey; the crown tax man smiles anyway.',
  good_fen_spice: 'Pungent enough to wake the dead — or at least the cook.',
  good_coal: 'Black rock that burns hot and leaves everything it touches grey.',
  good_metal_tools: 'Hammers, chisels, and blades — the kind of weight that earns its keep.',
  good_medicinal_tincture: 'A bitter bottle steeped long enough to make a traveller stand straighter.',
  good_grain: 'Sacked and sealed; whoever controls the grain controls the winter.',
  good_timber: 'Heavy enough to make your axle groan, worth it when the docks need planking.',
  good_pitch: 'Thick, black, and stubborn — ships drink it, roads hate it.',
  good_tallow: 'Rendered fat pressed into candles; miners and clerks alike curse the dark without it.',
  good_polished_amber: 'Buffed until it glows like trapped sunlight — the crown clerks weigh it twice.',
  good_seasoned_spice: 'Salt and fen spice married in a jar; inland cooks pay dearly for the flavour.',
  good_cut_glass: 'Obsidian scored and split by mountain craftsmen — each pane catches the light differently.',
  good_cart_upgrade_kit: 'Braces, bolts, and fresh rigging bundled for a wagon that plans to survive the next bad road.',
  good_elixir_of_insight: 'A clear draught that sharpens the road ahead and makes a trader trust the right instincts.',

  // Arrival vignettes — keyed as arrive_{townId}_{season}_{visitBucket}
  // visitBucket: 'first', 'returning', 'regular'
  arrive_ashenford_spring_first:
    'Ashenford wakes slowly in the spring thaw. Smoke curls from the forge and the market stalls are being set up for the season.',
  arrive_ashenford_spring_returning:
    'The forge is running again after winter. Ash-dusted traders nod as you pull in — a familiar face on the road.',
  arrive_ashenford_summer_first:
    'Ashenford bakes in summer heat. The forge runs day and night; the smell of hot iron hangs over the whole town.',
  arrive_ashenford_summer_returning:
    'The forge quarter is loud and busy. Smiths work shirtless in the heat. Good time to move iron.',
  arrive_ashenford_autumn_first:
    'Ashenford is stocking up for winter. Grain carts crowd the market square and the blacksmith has a queue out the door.',
  arrive_ashenford_autumn_returning:
    'The mountain air has a bite to it now. Traders are moving fast — everyone wants to make one last run before the passes ice.',
  arrive_ashenford_winter_first:
    'Ashenford in winter is a town of lanterns and low voices. The forge is the warmest place for miles.',
  arrive_ashenford_winter_returning:
    'Snow on the rooftops. The market is thin but the prices are sharp — winter always finds the gaps.',

  arrive_mirecross_spring_first:
    'Mirecross smells of mud and new growth. The fen is thawing and the river traders are back on the water.',
  arrive_mirecross_spring_returning:
    'The crossroads is busy again after winter. Carts from three directions converge and the inn is full.',
  arrive_mirecross_summer_first:
    'Summer at the crossroads means noise and dust. Every merchant on the road passes through here eventually.',
  arrive_mirecross_summer_returning:
    'The fen is thick and green. The moss witch has her stall out early — business is good in summer.',
  arrive_mirecross_autumn_first:
    'Autumn mist clings to the fen. The crossroads market is winding down for the season but the prices are still moving.',
  arrive_mirecross_autumn_returning:
    'The reed beds are turning gold. Peat cutters are stacking their winter stores and the market smells of smoke.',
  arrive_mirecross_winter_first:
    'Mirecross in winter is half-empty. The fen freezes at the edges and the road mud turns to iron underfoot.',
  arrive_mirecross_winter_returning:
    'A cold wind off the fen. The moss witch is the only stall open — she seems to prefer the cold.',

  arrive_riversend_spring_first:
    'Riversend comes alive in spring. The docks are busy, the fishmongers are loud, and the whole town smells of the river.',
  arrive_riversend_spring_returning:
    'The harbor is full of boats back from winter anchorage. The harbor factor is in a buying mood.',
  arrive_riversend_summer_first:
    'Summer at Riversend means the tide market runs all night. The river is high and the fish are running.',
  arrive_riversend_summer_returning:
    'The docks are stacked with timber and rope. Ships are being fitted out and the prices reflect it.',
  arrive_riversend_autumn_first:
    'The autumn catch is in. The fishmongers are working fast before the cold sets in and the river slows.',
  arrive_riversend_autumn_returning:
    'Smoke from the curing houses hangs over the docks. Good time to move smoked fish before the season turns.',
  arrive_riversend_winter_first:
    'Riversend in winter is quieter but not quiet. The harbor never fully sleeps — there is always a ship that needs something.',
  arrive_riversend_winter_returning:
    'Ice on the river edges. The tide market is running on lanterns and the harbor factor is paying premium for coal.',

  arrive_crownpost_spring_first:
    'Crownpost is all stone and ceremony. The crown exchange opens its shutters for the season and the clerks look pleased.',
  arrive_crownpost_spring_returning:
    'The post road is busy again. Crown couriers pass you on the road and the duty house has a queue.',
  arrive_crownpost_summer_first:
    'Crownpost in summer is formal and prosperous. Amber moves fast here and the clerks hum different numbers after noon.',
  arrive_crownpost_summer_returning:
    'The crown exchange is doing brisk business. Silk and amber are moving and the roadhouse factor is well stocked.',
  arrive_crownpost_autumn_first:
    'Autumn in Crownpost means the annual amber assessment. Prices are up and the clerks are busy.',
  arrive_crownpost_autumn_returning:
    'The post road factor is buying everything he can before winter closes the mountain passes.',
  arrive_crownpost_winter_first:
    'Crownpost keeps its fires burning through winter. The exchange never closes — the crown always needs its cut.',
  arrive_crownpost_winter_returning:
    'Snow on the crown road. The duty house is warm and the clerks are glad of the company.',

  arrive_fenward_spring_first:
    'Fenward rises from the mist on stilts. The fen is thawing and the spice brokers are back on their platforms.',
  arrive_fenward_spring_returning:
    'The fen smells of new growth and old water. The stilt market is setting up and the pitch stills are running.',
  arrive_fenward_summer_first:
    'Summer in Fenward is green and loud with insects. The spice harvest is coming in and the brokers are busy.',
  arrive_fenward_summer_returning:
    'The fen is at its fullest. Fen spice is cheap here now — the harvest is good this year.',
  arrive_fenward_autumn_first:
    'Autumn mist is thick on the fen. The stilt market is winding down but the night dock is busy.',
  arrive_fenward_autumn_returning:
    'The fen is going quiet for winter. Last chance to move fen spice before the brokers pack up.',
  arrive_fenward_winter_first:
    'Fenward in winter is eerie — the fen freezes in patches and the stilts creak in the wind.',
  arrive_fenward_winter_returning:
    'The night dock is the only thing running. The fen is frozen and the brokers are huddled around their fires.',

  arrive_stoneholt_spring_first:
    'Stoneholt emerges from winter slowly. The mountain pass is still icy and the forge has been running all season.',
  arrive_stoneholt_spring_returning:
    'The mine factor is buying again. The pass is clearing and the first supply wagons of the year are coming through.',
  arrive_stoneholt_summer_first:
    'Stoneholt in summer is as bright as it gets — which is not very. The mountain blocks the afternoon sun.',
  arrive_stoneholt_summer_returning:
    'The forge is running full shifts. Coal and iron are moving fast and the miners are in good spirits.',
  arrive_stoneholt_autumn_first:
    'Autumn in Stoneholt means stocking up. The miners know winter is coming and they buy everything they can.',
  arrive_stoneholt_autumn_returning:
    'Last supply runs before the pass ices. The supply post is paying over the odds for grain and wine.',
  arrive_stoneholt_winter_first:
    'Stoneholt in winter is a fortress of lantern-light and coal smoke. The forge never stops.',
  arrive_stoneholt_winter_returning:
    'The pass is treacherous. You made it — the miners look at you with something like respect.',

  arrive_saltmere_spring_first:
    'Saltmere wakes up with the spring tides. The salt pans are being cleared and the coastal traders are back.',
  arrive_saltmere_spring_returning:
    'The brine house is open and the salt factor is in a good mood. Spring tides mean good salt.',
  arrive_saltmere_summer_first:
    'Saltmere in summer is all wind and glare. The salt pans are full and the whole coast smells of brine.',
  arrive_saltmere_summer_returning:
    'The salt harvest is at its peak. Cheap salt and fresh fish — good time to stock up.',
  arrive_saltmere_autumn_first:
    'Autumn storms are coming in off the coast. The coastal traders are making their last runs before the weather turns.',
  arrive_saltmere_autumn_returning:
    'The salt pans are being sealed for winter. The factor is selling off his stock before the season ends.',
  arrive_saltmere_winter_first:
    'Saltmere in winter is bleak. The coast is grey, the wind is relentless, and the salt stings everything.',
  arrive_saltmere_winter_returning:
    'The quayside is nearly empty. The coastal trader is the only one still buying — and he is not paying much.',

  ui_welcome: 'You arrive under a pale sky. Markets cough smoke; carts groan.',
  ui_welcome_stoneholt: 'The pass narrows to a cut in the rock. Lanterns burn at noon here.',
  ui_welcome_saltmere: 'Salt-flat wind stings the eyes. The whole town smells of brine and low tide.',
}

export function getDialog(key: string): string {
  return DIALOG[key] ?? key
}
