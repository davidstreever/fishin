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
- True rest is the best chance to reel. The steady-resistance playtest adds a safe quiet state between pulls with 55% of ordinary retrieval, no additional tension or outward run, and no stamina recovery. True rests retain full retrieval and recover 0.75% maximum stamina per second. At each ordinary quiet-window start, true-rest chance is 15% + 70% × (1 − remaining stamina fraction): 15% while fresh, rising to 85% when spent. Existing pull strengths, aggression checks, durations, line limits, and Hold Pressure rules remain. Feint keeps its scripted true-rest window. Apply this shared experiment in its own PR so it can be reverted independently of fish-stat changes; it does not include the earlier weight-based retrieval experiment.
- Hold Pressure is a learned technique. It adds no tension, reduces line loss, and increases fish stamina drain.
- Gear Hold Pressure experiment: reels retain their retrieval benefit and reduce the share of a fish's run conceded while holding pressure (Old/Aluminum/Carbon/Titanium: 30%/27%/24%/21%). Rods retain tension control and multiply Hold Pressure stamina drain (Old/Fiberglass/Graphite/Boron: 1.00/1.10/1.22/1.35). Starter behavior is unchanged. Test both together, particularly trophy salmon on T3; keep this experiment in its own PR so the combined change can be reverted without undoing salmon tuning.
- Preserve the existing special fish abilities, including Pickerel Feint, Brook Trout Quick Recovery, and the Yellow Perch and White Perch Quick Reaction. Quick Reaction's opening run lasts at least 2.1 seconds so it cannot be reeled through with starter gear; Yellow Perch fight power is 1.9, and White Perch fight power is 2.2.
- Freshwater fishing currently feels good. Do not broadly rebalance it without playtest evidence.
- The Old Timer should suggest upgrading fishing gear by fall, or sooner after the player first breaks a line while fighting a bass. Make it a contextual, one-time hint rather than a repeated reminder.
- The line is the primary fight visualization. A tension display should answer how close the line is to breaking: weight sets its baseline, surges move it toward danger, rest lets it settle, and its maximum means imminent failure.

- White Perch playtest target: on T2, feel about as demanding as Yellow Perch on T1. Test aggression 0.62 and stamina multiplier 0.90; retain fighting power 2.2, stamina drain 1.10, and shared Quick Reaction. Keep nervousness tuning separate.

## Current playtest observations

- In a clean T1 playthrough, the player bought the Maine Fishing Atlas and repaired the truck in time to explore other spots by summer; that progression felt good.
- Brook Trout and Chain Pickerel fights feel good. Later October 3 tests found normal-weight bass too easy on T1 without Hold Pressure; trophy bass remained fun. Trial Smallmouth fight power 2.8 (from 2.5) and Largemouth 3.0 (from 2.8), retaining aggression, stamina, nibble values, and no special abilities. Smallmouth should be a real T1 fight; Largemouth should encourage T2 upgrades. Skilled T1 catches remain acceptable; T1 trophies may be nearly impossible. Manual playtests should confirm readability and the reward for upgrades.
- At Big Lake in summer, Deep tackle with Grubs produced five Yellow Perch in five catches. Inspect the actual depth and encounter distribution before changing weights; the streak made Deep feel overly perch-heavy.
- Pumpkinseed feels less common than desired in the early random-depth Fishing Hole playthrough; collect more encounter data before changing its weight.
- A 5.07 lb Landlocked Salmon was landed with T1 gear in 8.9 seconds with 83.6% stamina remaining. That was too easy for the intended late-game freshwater fight. Raise its fight power from 2.5 to 3.0 and aggression from 0.82 to 0.92 using the shared fight model. Landlocked Salmon are endgame freshwater fish: T1 gear should be a substantial disadvantage even against normal weights, with upgrades making a clear difference. Salmon should fight persistently and generally be more depleted by landing; judge this through playtesting. Playtest small, normal, and trophy salmon on T1 and upgraded gear before further tuning.

## Testing mode

- One DEBUG checkbox enters isolated Testing Waters, enables forced species selection and live fish stats, and lists every freshwater and saltwater species including locked species. The existing weight bands remain available.
- All rods, reels, tackle, and bait are temporarily available; learned techniques are preserved so tests report the actual unlocked skills. The calendar stays fixed and normal bite/fight rules remain active.
- Log each encounter outcome, exact loss reason, full fish data, fight stats, equipped gear, unlocked techniques, books, conditions, and time spent reeling/holding/idle. The steady-resistance trial also records the fight-model identifier and time in steady resistance versus true rest; state labels must distinguish them. Save test results separately across reloads. Turning testing off restores the normal playthrough; testing catches and progression never enter the normal save.

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
- Reference the protagonist's wife occasionally in morning and night messages. As obsession rises, these moments should give the player early, increasingly clear signs of strain at home rather than making the relationship change arrive without warning. **Writing task for David:** write the actual lines and progression beats; do not generate final dialogue as part of a mechanics pass.

### Open progression decisions

- Work out how quitting the job affects money and the marriage, including whether and when divorce can occur. These outcomes and thresholds are not decided yet.
- The player can also lose the job during the winter while occupied with cleaning Dad's house, or by sleeping through work. Define the conditions and warning beats for each route before implementing them; both should feed the same loss-of-income consequences as quitting.
- Likely direction: quitting removes job income. If fishing earnings cannot cover ordinary living needs, financial security worsens and causes accumulating negative effects that can eventually lead to death. Inadequate sleep should feed the same downward pressure. Decide the pacing and recovery paths before implementation.
- Treat meals and basic sustenance as part of that abstract living-needs system. Do not add an "Eat a meal" button.


## Newspaper and audio

- The Weymouth Wrap has four annual editions. Authored content belongs in game data; facts specific to a run belong in save state.
- A Spring Year 1 report about Dad's death or disappearance should be mundane. The reporter should not insert overt supernatural clues; ordinary facts gain meaning later.
- Use no conventional soundtrack. Future audio should rely on small environmental layers and fishing one-shots. As obsession grows, ordinary sounds may rarely behave incorrectly, without becoming a supernatural soundtrack.


## Freshwater nibble playtest — October 2, 2026

- Species-specific nibble profiles target approximate no-Twitch departures per encounter: Pumpkinseed 1%, Yellow Perch 6.5%, Pickerel 15%, Smallmouth 10%, Largemouth 17.5%, White Perch 10%, Salmon 22.5%, Lake Trout 12.5%, Cusk 7.5%, Charr 4%. Brook Trout remains unchanged at about 42%. These are calculated targets, not raw nervousness values or observed success rates.
- Preserve the free first nibble, existing bite-before-leave formula, Twitch mechanics, fight balance, and saltwater profiles. Playtest both waiting and well-timed Twitch. Departures are already included in Testing Waters logs.


### Freshwater ability trial — October 2, 2026
- Brook Trout: Quick Recovery triggers once per fight at the end of a surge at or below 70% stamina, restoring 25% of maximum stamina. Guaranteed at an eligible surge end; the existing once-per-fight guard remains.
- Pickerel: Feint chance rises from 40% to 55% on eligible surge ends; false rest drops from 1.3s to 0.8s. Follow-up surges last 70% of their usual duration, with their existing strength unchanged.
- Largemouth trial superseded: remove Endurance Fighter without restoring Last Gasp. Use the ordinary fight model; the October 3 power trial is recorded above. Retain aggression, stamina, and nibble values. David's pre-trial player fights were fun and challenging; skilled T1 catches are acceptable. Better gear should improve control and reliability rather than enforce a hard catch gate. Preserve Brook Trout and Pickerel trial tweaks. Lake Trout is the planned candidate for stamina-based retrieval resistance; implement and tune that separately.
- These are trial values awaiting player fight tests, especially average/trophy fish across gear tiers.

