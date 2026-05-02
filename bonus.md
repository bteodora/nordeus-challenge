## DONE ✅

- [x] Move descriptions — Hover shows `move.description` (MoveButton tooltip)
- [x] Battle log — Running battle log with turn-by-turn actions (BattleScreen)
- [x] Save & Exit — localStorage save/resume (MapScreen / PostBattle)
- [x] A shop — In-run shop with coins reward system (ShopModal)
- [x] Replay fight — Defeated monsters can be replayed (coins/XP, no move)
- [x] Battle turn counter — Shows current turn in battle header
- [x] Coins display — Shows coins in hero sidebar (MapScreen)
- [x] Smarter bot — Improved AI decision-making (PickMonsterMove: survival, aggression, buffing)
- [x] **BUGFIX: Replay progress** — Fixed: replaying a battle no longer resets progress of defeated monsters
- [x] **BUGFIX: Save & Exit** — Fixed: save properly loads `config` + added Resume button in main menu
- [x] Monster preview modal — Click Eye icon on map to see stats/moves before fighting (MonsterPreviewModal)
- [x] Resource costs foundation — Added `hp_cost`, `mana_cost` fields to Move model (backend + frontend types)
- [x] Hero stat gain tooltip — Shows +15 HP, +3 ATK on level-up in PostBattle UI
- [x] Battle action log timestamps — Added `timestamp` to LogEntry, displayed in battle log with time

## MEDIUM PRIORITY (5-15 min each)

- [ ] Attribute choice on level-up — Player selects which stats to boost when leveling (replaces random gains)
- [ ] Buff/Debuff UI clarity — Visual indicators for active buffs on hero and monster during battle

## HARDER (15+ min each)

- [ ] Hero classes — Class selection at run start (Knight/Rogue/Mage with different stats/moves)
- [ ] Better battle animations — Expand existing shake effects, add move-specific effects
- [ ] Status effects system — Implement bleed, poison, burn (new buff type architecture)

## COMPLEX (45+ min)

- [ ] Items & equipment — Drop system, inventory, equipping gear
- [ ] Non-linear map — Multiple paths, branching encounters
- [ ] Environmental effects — Map modifiers (rain reduces fire dmg, etc.)
- [ ] Endless mode — Infinite scaling difficulty with different rewards

## NOTES

**Why these are prioritized:**
1. Done items are polish + core features (99% complete)
2. Medium items add nice QoL (monster preview is useful, stats foundation is needed)
3. Harder items are new systems but require significant UI/logic
4. Complex items need architecture refactors (item drop system, map generation)