Fishin' - Reel-vs-Run Fight Patch

Changes in this patch:
- During a fish surge, Reel now directly contests the fish's run on each fight tick.
- Net line movement while reeling is fish pull minus effective reel pull.
- Reel upgrades therefore matter during a run, not only between surges.
- Strong fish can still take line against the player, but much more slowly when actively reeled.
- As fish stamina falls and surge strength weakens, the player can begin gaining line even during a surge.
- Existing tension risk is preserved: reeling against a hard surge still raises tension quickly.
- Hold Pressure behavior is unchanged.
- Fish stats are unchanged in this patch so the systemic change can be playtested cleanly.
- Includes the prior line-display accuracy fix and 60/80/95% line warning thresholds.

Depth tackle progression update:
- Starter tackle casts randomly, weighted heavily toward shallow water.
- Surface Float targets Shallow (95% accuracy).
- Split-Shot Kit targets Mid (85% accuracy).
- Egg Sinker targets Deep (95% accuracy).
- Adjustable Dual Diver targets any available depth (100% accuracy).
- Random remains selectable after buying tackle.
- Legacy Basic Tackle Kit saves migrate to the three basic depth tools.

PUB ROADMAP
- The Black Dog's environmental and NPC copy should expand as the game progresses, especially around Dad, fishing progression, obsession, and later supernatural events. V1 intentionally stays sparse.

Update: 8-day seasons now run alongside a continuous 7-day weekday cycle; eight moon phases and a temporary moon debug override are included. Newspaper issues/forecast/archive/subscription are implemented. Pub/newspaper text links use #ff7777 with underline on hover. Cloudy and Rain now animate wider 2-3 cloud layouts; Heavy Rain spans the 44-character sky more fully.
