# Fishin' design rules

This file records durable decisions for Fishin'. The current files in this folder are the authority for implementation details and numbers. Read them before changing code; do not rebuild from descriptions or old ZIPs.

## Development

- Preserve working behavior unless a change is deliberate. Make small, testable changes that can be playtested separately.
- Do not broadly rebalance systems because their numbers look odd. Discuss balance changes after playtest evidence.
- Keep visual experiments separate from mechanics changes. Preserve the existing version when comparing an experiment so it can be restored.

## Core experience

- Fishin' is a minimalist, old-school browser fishing game set in coastal Maine. Its interface is primarily ASCII and text.
- Real fishing informs the mechanics, but gameability wins. The repeated act of fishing should feel tactile, readable, and fun.
- The world includes freshwater and saltwater species, locations, bait, depth, weather, time of day, seasons, gear, fish knowledge and books, a market, shop, pub, newspaper, work, and sleep.

## Fishing fights

- Do not add lateral line movement. Visible line length represents distance to the fish; shorter means closer to landing. Line color and intensity represent fish effort.
- Fish effort has four graduated states: Rest, Weak, Active, and Strong Surge. A heavy fish is not necessarily aggressive.
- Fish weight creates baseline tension immediately. Effort adds dynamic tension above it. Better rods help with tension; better reels improve retrieval.
- Rest is the best chance to reel. Rest does not add tension; tension settles toward the weight-derived baseline. Stronger effort progressively reduces retrieval and increases tension.
- Hold Pressure is a learned technique. It adds no tension, reduces line loss, and increases fish stamina drain.
- Preserve the existing special fish abilities, including Pickerel Feint, Brook Trout Quick Recovery, Largemouth Last Gasp, and Yellow Perch Quick Reaction.
- Freshwater fishing currently feels good. Do not broadly rebalance it without playtest evidence.
- The line is the primary fight visualization. A tension display should answer how close the line is to breaking: weight sets its baseline, surges move it toward danger, rest lets it settle, and its maximum means imminent failure.

## Interface and world

- Keep the UI compact and old-school. ASCII, CSS, and mechanical-instrument treatments fit. Avoid a polished modern-game HUD. Controls should generally look like text rather than native browser controls. The established red link color is `#ff7777`.
- Preserve the current weather, sky, water, and Old Pier navigation treatments unless there is a specific reason to change them.
- Normal land locations include Fishing Hole, Lazy Brook, Big Lake, Old Pier, Market, Shop, Pub, and Journal.
- Old Pier is the sea-travel hub. There, normal navigation gives way to Back, Coastal Waters, and conditional destinations. Dad's Island must remain completely absent until unlocked.

## Story and progression

- The intended arc is roughly three years and ends in tragedy or a loop. Year 1 is exploration and repeating Dad's mistakes. Year 2 opens Dad's Island and escalates supernatural involvement while ordinary life deteriorates. Year 3 continues that deterioration toward death or disappearance; at sufficiently bad moments, the player may be able to give in and end the run early.
- Supernatural progression should displace ordinary human relationships and daily life with fishing and supernatural relationships, rather than merely make the setting spookier.
- Dad abandoned the protagonist when they were very young. The protagonist did not grow up in Dad's house; exploring it means reconstructing the life of an almost-stranger.
- Pub patrons recognize the protagonist as Dad's child and hold Dad's past behavior against them. The Old Timer has some sympathy; the bartender never warms up. Exactly what Dad did to the patrons remains undecided.
- Dad inherited substantial family money but obsession kept him from meaningfully using it. Dad's father was affected by the same pattern. On later runs, retained knowledge may reveal the inheritance. Finding it should grant genuinely game-breaking financial independence while leaving supernatural and relationship danger intact.
- Dad's likely final sequence is: living on or visiting Dad's Island increasingly; returning to shore in late winter; leaving his boat at Old Pier; going to The Black Dog; driving inland; abandoning his broken-down truck; then being found on the coast. The official cause of death is drowning. The intended eventual realization is that Dad tried to stop too late.
- Spring, summer, and fall are normal playable seasons. Winter should become an intermission and reckoning chapter. Winter Year 1 centers on exploring Dad's House through authored choices, discoveries, and estate consequences, without repetitive cleaning tasks. Later winters evaluate combinations of obsession, security, marriage and family, housing, health and fatigue, and supernatural involvement.

## Newspaper and audio

- The Weymouth Wrap has four annual editions. Authored content belongs in game data; facts specific to a run belong in save state.
- A Spring Year 1 report about Dad's death or disappearance should be mundane. The reporter should not insert overt supernatural clues; ordinary facts gain meaning later.
- Use no conventional soundtrack. Future audio should rely on small environmental layers and fishing one-shots. As obsession grows, ordinary sounds may rarely behave incorrectly, without becoming a supernatural soundtrack.
