import { create } from 'zustand'
import { fetchMonsterMove, fetchRunConfig, fetchMonsterReward } from '../api/client'
import { fetchEndlessMonster } from '../api/endless'
import { postExperience } from '../api/endless'
import type {
  RunConfig,
  Monster,
  Move,
  BattleState,
  ActiveBuff,
  Stat,
} from '../api/client'

export interface Hero {
  level: number
  xp: number
  stats: Stat
  maxHp: number
  currentHp: number
}

export interface LogEntry {
  turn: number
  actor: 'hero' | 'monster'
  moveName: string
  damage?: number
  healing?: number
  buffDesc?: string
  timestamp?: number // Unix milliseconds when the action was taken
}

export interface DamageNumber {
  id: number
  value: number
  type: 'damage' | 'heal' | 'buff'
  target: 'hero' | 'monster'
}

export interface RunStats {
  totalDamageDealt: number
  totalDamageReceived: number
  biggestHit: { value: number; moveName: string }
  totalHealing: number
  totalTurns: number
  monstersDefeated: number
  timesLeveled: number
  movesLearned: string[]
  outcome: 'victory' | 'defeat' | null
  lastStatGains?: { health: number; attack: number; defense: number; magic: number }
}

const XP_TABLE = [0, 100, 250, 450, 700, 1000]
const STAT_GAINS = { health: 15, attack: 3, defense: 2, magic: 3 }

const DEFAULT_HERO: Hero = {
  level: 1,
  xp: 0,
  maxHp: 100,
  currentHp: 100,
  stats: { health: 100, attack: 10, defense: 8, magic: 8 },
}

interface GameStore {
  // State
  screen: 'menu' | 'map' | 'battle' | 'postbattle' | 'postendless' | 'summary' | 'endless'
  config: RunConfig | null
  hero: Hero
  learnedMoves: Move[]
  equippedMoves: Move[]
  coins: number
  currentEncounterIndex: number
  battleState: BattleState | null
  battleLog: LogEntry[]
  damageNumbers: DamageNumber[]
  monsterTell: Move | null
  isMonsterTurn: boolean
  isBattleOver: boolean
  didWinBattle: boolean
  newlyLearnedMove: Move | null
  runStats: RunStats
  isRaging: boolean
  isReplay: boolean
  replayEncounterIndex: number
  endlessMode: boolean
  // Shop actions
  buyMove: (move: Move, cost: number) => boolean
  buyStatUpgrade: (stat: 'health' | 'attack' | 'defense' | 'magic', amount: number, cost: number) => boolean

  // Actions
  startNewRun: () => Promise<void>
  loadRun: () => Promise<boolean>
  startEndless: () => Promise<void>
  enterBattle: (index: number, isReplay?: boolean) => void
  // Start a battle using a provided monster (used for endless mode temporary monsters)
  enterBattleWithMonster: (monster: Monster, upcoming?: any[]) => void
  selectMove: (move: Move) => Promise<void>
  equipMove: (move: Move, slot: number) => void
  continueAfterBattle: () => void
  goToMap: () => void
  applyRegen: (amount: number) => void
  saveRun: () => void
  exitToMenu: () => void
  // Navigation helper
  setScreen: (s: GameStore['screen']) => void
  // Endless mode state
  endlessWins: number
  currentMonster: Monster | null
  endlessUpcoming: any[]
}

const emptyStats = (): RunStats => ({
  totalDamageDealt: 0,
  totalDamageReceived: 0,
  biggestHit: { value: 0, moveName: '' },
  totalHealing: 0,
  totalTurns: 0,
  monstersDefeated: 0,
  timesLeveled: 0,
  movesLearned: [],
  outcome: null,
})

let dmgNumberId = 0

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu',
  config: null,
  hero: DEFAULT_HERO,
  learnedMoves: [],
  equippedMoves: [],
  currentEncounterIndex: 0,
  battleState: null,
  battleLog: [],
  damageNumbers: [],
  monsterTell: null,
  isMonsterTurn: false,
  isBattleOver: false,
  didWinBattle: false,
  newlyLearnedMove: null,
  runStats: emptyStats(),
  isRaging: false,
  isReplay: false,
  replayEncounterIndex: -1,
  coins: 0,
  endlessMode: false,
  endlessWins: 0,
  currentMonster: null,
  endlessUpcoming: [],
  
  saveRun: () => {
    const s = get()
    const payload = {
      hero: s.hero,
      learnedMoves: s.learnedMoves,
      equippedMoves: s.equippedMoves,
      currentEncounterIndex: s.currentEncounterIndex,
      coins: s.coins,
      runStats: s.runStats,
      endlessWins: s.endlessWins,
      screen: s.screen,
    }
    try {
      localStorage.setItem('rpg_save', JSON.stringify(payload))
    } catch (e) {
      console.warn('Failed to save:', e)
    }
  },
  setScreen: (s: any) => set({ screen: s }),
  loadRun: async () => {
    try {
      const raw = localStorage.getItem('rpg_save')
      if (!raw) return false
      const parsed = JSON.parse(raw)
      
      // Učitaj config sa servera
      const config = await fetchRunConfig()
      
      set({
        config,
        hero: parsed.hero || get().hero,
        learnedMoves: parsed.learnedMoves || get().learnedMoves,
        equippedMoves: parsed.equippedMoves || get().equippedMoves,
        currentEncounterIndex: parsed.currentEncounterIndex || get().currentEncounterIndex,
        coins: parsed.coins || get().coins,
        endlessWins: parsed.endlessWins || 0,
        runStats: parsed.runStats || get().runStats,
        screen: 'map',
      })
      return true
    } catch (e) {
      console.warn('Failed to load save:', e)
      return false
    }
  },
  exitToMenu: () => {
    set({ screen: 'menu' })
  },

  startNewRun: async () => {
    const config = await fetchRunConfig()
    const hero: Hero = {
      level: 1,
      xp: 0,
      maxHp: config.hero_start_stats.health,
      currentHp: config.hero_start_stats.health,
      stats: config.hero_start_stats,
    }
    set({
      config,
      hero,
      equippedMoves: config.hero_start_moves,
      learnedMoves: config.hero_start_moves,
      coins: 0,
      currentEncounterIndex: 0,
      // Reset endless-specific state
      endlessMode: false,
      currentMonster: null,
      endlessWins: 0,
      screen: 'map',
      runStats: emptyStats(),
    })
  },

  enterBattle: (index: number, isReplay?: boolean) => {
    const { config, hero, currentEncounterIndex } = get()
    if (!config) return
    const monster = config.monsters[index]

    const battleState: BattleState = {
      hero_hp: hero.currentHp,
      hero_max_hp: hero.maxHp,
      monster_hp: monster.stats.health,
      monster_max_hp: monster.stats.health,
      hero_stats: hero.stats,
      monster_stats: monster.stats,
      active_buffs: [],
      turn: 1,
      monster_id: monster.id,
    }

    set({
      currentEncounterIndex: isReplay ? currentEncounterIndex : index,
      replayEncounterIndex: isReplay ? index : -1,
      battleState,
      battleLog: [],
      damageNumbers: [],
      monsterTell: null,
      isBattleOver: false,
      didWinBattle: false,
      newlyLearnedMove: null,
      isReplay: isReplay || false,
      screen: 'battle',
    })
  },
  enterBattleWithMonster: (monster: Monster, upcoming?: any[]) => {
    ;(async () => {
      // Ensure run config exists and equipped moves are populated
      try {
        if (!get().config) {
          const cfg = await fetchRunConfig()
          set({ config: cfg })
        }
        const cfg = get().config
        const equipped = get().equippedMoves
        if (cfg && (!equipped || equipped.length === 0)) {
          set({ equippedMoves: cfg.hero_start_moves || [] })
        }
      } catch (e) {
        console.warn('Failed loading run config before endless battle', e)
      }

      const hero = get().hero
      const battleState: BattleState = {
        hero_hp: hero.currentHp,
        hero_max_hp: hero.maxHp,
        monster_hp: monster.stats.health,
        monster_max_hp: monster.stats.health,
        hero_stats: hero.stats,
        monster_stats: monster.stats,
        active_buffs: [],
        turn: 1,
        monster_id: monster.id,
      }

      set({
        currentMonster: monster,
        endlessMode: true,
        endlessUpcoming: upcoming || [],
        battleState,
        battleLog: [],
        damageNumbers: [],
        monsterTell: null,
        isBattleOver: false,
        didWinBattle: false,
        newlyLearnedMove: null,
        isReplay: false,
        replayEncounterIndex: -1,
        screen: 'battle',
      })
    })()
  },

  startEndless: async () => {
    try {
      // Reset hero HP to max when starting a new endless run
      const hero = get().hero
      if (hero.currentHp < hero.maxHp) {
        set({ hero: { ...hero, currentHp: hero.maxHp } })
      }
      const res = await fetchEndlessMonster(get().endlessWins)
      if (res && res.monster) {
        get().enterBattleWithMonster(res.monster, res.upcoming)
      }
    } catch (e) {
      console.warn('Failed to start endless:', e)
    }
  },

  applyRegen: (amount: number) => {
    const hero = get().hero
    const newHp = Math.min(hero.maxHp, hero.currentHp + amount)
    set({ hero: { ...hero, currentHp: newHp } })
  },

  selectMove: async (move: Move) => {
    const { battleState, config, currentEncounterIndex, replayEncounterIndex, isReplay, runStats, endlessMode, currentMonster } = get()
    if (!battleState) return

    const monster = (endlessMode && currentMonster) ? currentMonster : (config ? config.monsters[isReplay ? replayEncounterIndex : currentEncounterIndex] : null)
    let state = { ...battleState }
    const newLog: LogEntry[] = []
    let stats = { ...runStats }

    // Hero turn (client primenjuje svoj potez)
    const heroAtk = getEffectiveStat(state.hero_stats.attack, 'attack', state.active_buffs, 'hero')
    const heroMag = getEffectiveStat(state.hero_stats.magic, 'magic', state.active_buffs, 'hero')
    const monDef = getEffectiveStat(state.monster_stats.defense, 'defense', state.active_buffs, 'monster')

    let heroDamage = 0
    let heroHealing = 0
    const heroNewBuffs: ActiveBuff[] = []

    if (move.effect === 'damage') {
      heroDamage = move.type === 'physical'
        ? calcPhysical(heroAtk, monDef, move.base_value)
        : calcMagic(heroMag, move.base_value)
      state.monster_hp = Math.max(0, state.monster_hp - heroDamage)
      stats.totalDamageDealt += heroDamage
      if (heroDamage > stats.biggestHit.value) {
        stats.biggestHit = { value: heroDamage, moveName: move.name }
      }
    } else if (move.effect === 'heal') {
      heroHealing = calcHeal(heroMag, move.base_value)
      state.hero_hp = Math.min(state.hero_max_hp, state.hero_hp + heroHealing)
      stats.totalHealing += heroHealing
    } else if (move.effect === 'drain') {
      heroDamage = calcMagic(heroMag, move.base_value)
      heroHealing = heroDamage
      state.monster_hp = Math.max(0, state.monster_hp - heroDamage)
      state.hero_hp = Math.min(state.hero_max_hp, state.hero_hp + heroHealing)
      stats.totalDamageDealt += heroDamage
      stats.totalHealing += heroHealing
    } else if (move.effect === 'buff') {
      heroNewBuffs.push({ target_stat: move.target_stat, amount: move.buff_amount, turns_left: move.buff_turns, affects_who: 'hero' })
    } else if (move.effect === 'debuff') {
      heroNewBuffs.push({ target_stat: move.target_stat, amount: move.buff_amount, turns_left: move.buff_turns, affects_who: 'monster' })
    } else if (move.effect === 'damage_debuff') {
      heroDamage = move.type === 'physical'
        ? calcPhysical(heroAtk, monDef, move.base_value)
        : calcMagic(heroMag, move.base_value)
      state.monster_hp = Math.max(0, state.monster_hp - heroDamage)
      stats.totalDamageDealt += heroDamage
      heroNewBuffs.push({ target_stat: move.target_stat, amount: move.buff_amount, turns_left: move.buff_turns, affects_who: 'monster' })
    }

    state.active_buffs = [...state.active_buffs, ...heroNewBuffs]
    newLog.push({ turn: state.turn, actor: 'hero', moveName: move.name, damage: heroDamage || undefined, healing: heroHealing || undefined, timestamp: Date.now() })

    addDamageNumber(heroDamage, 'damage', 'monster')
    if (heroHealing > 0) addDamageNumber(heroHealing, 'heal', 'hero')

    if (get().endlessMode) {
      postExperience({
        state: state,
        action_id: move.id, 
        reward: heroDamage > 0 ? heroDamage : (heroHealing > 0 ? heroHealing * 0.5 : 0),
        outcome: 'ongoing'
      }).catch(() => {})
    }

    if (state.monster_hp <= 0) {
      stats.totalTurns += 1
      if (!monster) return
      return await handleVictory(state, monster, stats, newLog, set, get)
    }

    // Monster turn (server bira i racuna monster potez)
    let monsterResult
    try {
      monsterResult = await fetchMonsterMove(state)
    } catch (e) {
      console.error('Monster move fetch failed:', e)
      // Nastavi rundu bez monster poteza umesto da crashuješ
      set({
        battleState: state,
        battleLog: [...get().battleLog, ...newLog],
        runStats: stats,
      })
      return
    }

    if (monsterResult.damage > 0) {
      if (monsterResult.move.effect === 'buff_self_damage') {
        state.monster_hp = Math.max(0, state.monster_hp - monsterResult.damage)
        addDamageNumber(monsterResult.damage, 'damage', 'monster')
      } else {
        state.hero_hp = Math.max(0, state.hero_hp - monsterResult.damage)
        stats.totalDamageReceived += monsterResult.damage
        addDamageNumber(monsterResult.damage, 'damage', 'hero')
      }
    }
    if (monsterResult.healing > 0) {
      state.monster_hp = Math.min(state.monster_max_hp, state.monster_hp + monsterResult.healing)
      addDamageNumber(monsterResult.healing, 'heal', 'monster')
    }

    state.active_buffs = [...state.active_buffs, ...monsterResult.new_buffs]
    newLog.push({
      turn: state.turn,
      actor: 'monster',
      moveName: monsterResult.move.name,
      damage: monsterResult.damage || undefined,
      healing: monsterResult.healing || undefined,
      timestamp: Date.now(),
    })

    state.active_buffs = tickBuffs(state.active_buffs)
    state.turn += 1
    stats.totalTurns += 1

    if (state.hero_hp <= 0) {
      const endlessMode = get().endlessMode
      if (endlessMode) {
        postExperience({
          state: state,
          action_id: move.id,
          reward: -15,
          outcome: 'win'  // monster pobedio
        }).catch(() => {})
      }
      set({
        battleState: state,
        battleLog: [...get().battleLog, ...newLog],
        isBattleOver: true,
        didWinBattle: false,
        monsterTell: monsterResult.monster_tell || null,
        isRaging: monsterResult.is_raging,
        isReplay: false,
        replayEncounterIndex: -1,
        runStats: { ...stats, outcome: 'defeat' },
        screen: endlessMode ? 'postendless' : 'postbattle',
      })
      return
    }

    // Ažuriraj stanje nakon oba poteza
    set({
      battleState: state,
      battleLog: [...get().battleLog, ...newLog],
      monsterTell: monsterResult.monster_tell || null,
      isRaging: monsterResult.is_raging,
      runStats: stats,
    })
  },

  equipMove: (move: Move, slot: number) => {
    const equipped = [...get().equippedMoves]
    equipped[slot] = move
    set({ equippedMoves: equipped })
  },

  continueAfterBattle: () => {
    const { didWinBattle, currentEncounterIndex, endlessMode, endlessWins } = get()
    
    // Endless mode — nikad ne ide na map screen
    if (endlessMode) {
      if (didWinBattle) {
        set({ endlessWins: endlessWins + 1, screen: 'endless', currentMonster: null })
      } else {
        set({ screen: 'postendless', endlessMode: false })
      }
      return
    }

    // Normalni run
    if (didWinBattle && currentEncounterIndex < 4) {
      set({ screen: 'map', currentEncounterIndex: currentEncounterIndex + 1 })
    } else if (didWinBattle && currentEncounterIndex >= 4) {
      set({ screen: 'summary' })
    } else {
      set({ screen: 'map' })
    }
  },
  goToMap: () => {
    const { didWinBattle, currentEncounterIndex } = get()
    if (didWinBattle && currentEncounterIndex < 4) {
      // Unlock next monster after victory
      set({ screen: 'map', currentEncounterIndex: currentEncounterIndex + 1 })
    } else {
      set({ screen: 'map' })
    }
  },
  buyMove: (move: Move, cost: number) => {
    const { coins, learnedMoves } = get()
    if (coins < cost) return false
    // Deduct and add move
    set({ coins: coins - cost, learnedMoves: [...learnedMoves, move] })
    return true
  },
  buyStatUpgrade: (stat: 'health' | 'attack' | 'defense' | 'magic', amount: number, cost: number) => {
    const { coins, hero } = get()
    if (coins < cost) return false
    const newHero = { ...hero }
    newHero.stats = { ...newHero.stats }
    if (stat === 'health') {
      newHero.stats.health += amount
      newHero.maxHp = newHero.stats.health
      newHero.currentHp = Math.min(newHero.maxHp, newHero.currentHp + amount)
    } else if (stat === 'attack') newHero.stats.attack += amount
    else if (stat === 'defense') newHero.stats.defense += amount
    else if (stat === 'magic') newHero.stats.magic += amount

    set({ coins: coins - cost, hero: newHero })
    return true
  },
}))

// --- Helpers ---

async function handleVictory(state: BattleState, monster: Monster, stats: RunStats, log: LogEntry[], set: any, get: any) {
  const { currentEncounterIndex, config, isReplay } = get()
  const oldHero = get().hero;

  // XP i level up
  const newXP = oldHero.xp + monster.xp_reward
  let newHero = { ...oldHero, xp: newXP }
  let timesLeveled = 0
  let levelUpStats = { health: 0, attack: 0, defense: 0, magic: 0 }

  while (newHero.level < 5 && newXP >= XP_TABLE[newHero.level]) {
    newHero.level += 1
    newHero.stats = {
      health: newHero.stats.health + STAT_GAINS.health,
      attack: newHero.stats.attack + STAT_GAINS.attack,
      defense: newHero.stats.defense + STAT_GAINS.defense,
      magic: newHero.stats.magic + STAT_GAINS.magic,
    }
    levelUpStats.health += STAT_GAINS.health
    levelUpStats.attack += STAT_GAINS.attack
    levelUpStats.defense += STAT_GAINS.defense
    levelUpStats.magic += STAT_GAINS.magic
    newHero.maxHp = newHero.stats.health
    // Oporavi malo HP pri level up-u, ali ne puni do kraja
    newHero.currentHp = Math.min(newHero.maxHp, state.hero_hp + STAT_GAINS.health) 
    timesLeveled++
  }
  // Ako nije bilo level-up-a, heroj ostaje sa HP-om sa kraja borbe
  if (timesLeveled === 0) {
      newHero.currentHp = state.hero_hp
  }


  // Nauči random move od monstera (samo ako nije replay)
  let newLearnedMoves = get().learnedMoves
  let randomMove: Move | null = null
  if (!isReplay) {
    randomMove = monster.moves[Math.floor(Math.random() * monster.moves.length)]
    const alreadyLearned = get().learnedMoves.find((m: Move) => m.id === randomMove?.id)
    newLearnedMoves = alreadyLearned ? get().learnedMoves : [...get().learnedMoves, randomMove]
  }

  const isLastMonster = currentEncounterIndex === (config?.monsters.length ?? 5) - 1
  // Ask server for coins reward
  var coinsGained = 0
  if (monster && monster.id) {
    try {
      const res = await fetchMonsterReward(monster.id)
      coinsGained = res.coins || (monster.difficulty || 1) * 20
    } catch (e) {
      coinsGained = (monster.difficulty || 1) * 20
    }
  }

  // If this was an endless-mode run, post experience for RL training
  try {
    if (get().endlessMode) {
      // find last hero action from log
      const lastHero = [...log].reverse().find((l) => l.actor === 'hero')
      const actionId = lastHero ? lastHero.moveName : ''
      // best-effort post; don't block UX
      postExperience({ state, action_id: actionId, reward: coinsGained, outcome: 'win' }).catch(() => {})
    }
  } catch (e) {
    // ignore
  }

  const alreadyLearned = !isReplay && randomMove && get().learnedMoves.find((m: Move) => m.id === randomMove?.id)
  
  // If we're in endless mode, continue immediately into the next battle without showing postbattle
  const isEndless = get().endlessMode
  if (isEndless) {
  const newWins = get().endlessWins + 1
  const healPerBattle = Math.round(newHero.maxHp * 0.10)
  const heroAfterHealing = { 
    ...newHero, 
    currentHp: Math.min(newHero.maxHp, newHero.currentHp + healPerBattle) 
  }

  // Regen na svakih 5 pobeda
  let heroFinal = heroAfterHealing
  if (newWins > 0 && newWins % 5 === 0) {
    const regenAmount = Math.round(heroFinal.maxHp * 0.20)
    heroFinal = { ...heroFinal, currentHp: Math.min(heroFinal.maxHp, heroFinal.currentHp + regenAmount) }
  }

  // Ažuriraj stats i hero
  const newRunStats: RunStats = {
    ...stats,
    monstersDefeated: stats.monstersDefeated + 1,
    timesLeveled: stats.timesLeveled + timesLeveled,
    movesLearned: alreadyLearned ? stats.movesLearned : [...stats.movesLearned, randomMove?.name ?? ''],
    outcome: null,
    lastStatGains: timesLeveled > 0 ? levelUpStats : undefined,
  }

  set({
    hero: heroFinal,
    learnedMoves: newLearnedMoves,
    newlyLearnedMove: alreadyLearned ? null : randomMove,
    coins: get().coins + coinsGained,
    endlessWins: newWins,
    runStats: newRunStats,
    isReplay: false,
    replayEncounterIndex: -1,
  })

  // Fetch sledećeg monstrea — uvek sa servera, ne iz upcoming liste
  // (upcoming lista je samo za preview, ne za stvarnu borbu)
  try {
    const res = await fetchEndlessMonster(newWins)
    if (!res || !res.monster) throw new Error('No monster in response')
    
    const nm = res.monster as Monster
    
    // Validacija — mora imati stats
    if (!nm.stats || !nm.id) throw new Error('Invalid monster data')

    const nextBattleState: BattleState = {
      hero_hp: heroFinal.currentHp,
      hero_max_hp: heroFinal.maxHp,
      monster_hp: nm.stats.health,
      monster_max_hp: nm.stats.health,
      hero_stats: heroFinal.stats,
      monster_stats: nm.stats,
      active_buffs: [],
      turn: 1,
      monster_id: nm.id,
    }

    set({
      currentMonster: nm,
      endlessUpcoming: res.upcoming || [],
      battleState: nextBattleState,
      battleLog: [],
      damageNumbers: [],
      monsterTell: null,
      isBattleOver: false,
      didWinBattle: false,
      screen: 'battle', // ← direktno u sledeću borbu
    })
    return

  } catch (e) {
    console.warn('Failed fetching next endless monster, will retry/fallback:', e)

    // Try a few retries before giving up (best-effort UX)
    let fetched = null as any
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // small delay between attempts
        await new Promise((res) => setTimeout(res, attempt * 250))
        const r = await fetchEndlessMonster(newWins)
        if (r && r.monster) {
          fetched = r
          break
        }
      } catch (_err) {
        // ignore and loop
      }
    }

    // If retries succeeded, continue with that monster
    if (fetched && fetched.monster) {
      const nm = fetched.monster as Monster
      if (!nm.stats || !nm.id) {
        // treat invalid data as failure and fall through to fallback
      } else {
        const nextBattleState: BattleState = {
          hero_hp: heroFinal.currentHp,
          hero_max_hp: heroFinal.maxHp,
          monster_hp: nm.stats.health,
          monster_max_hp: nm.stats.health,
          hero_stats: heroFinal.stats,
          monster_stats: nm.stats,
          active_buffs: [],
          turn: 1,
          monster_id: nm.id,
        }

        set({
          currentMonster: nm,
          endlessUpcoming: fetched.upcoming || [],
          battleState: nextBattleState,
          battleLog: [],
          damageNumbers: [],
          monsterTell: null,
          isBattleOver: false,
          didWinBattle: false,
          screen: 'battle',
        })
        return
      }
    }

    // Fallback: if we have an upcoming preview list from previous state, try to use its first monster
    const fallbackUpcoming = get().endlessUpcoming || []
    if (fallbackUpcoming.length > 0 && fallbackUpcoming[0].monster) {
      try {
        const nm = fallbackUpcoming[0].monster as Monster
        if (nm && nm.id && nm.stats) {
          const nextBattleState: BattleState = {
            hero_hp: heroFinal.currentHp,
            hero_max_hp: heroFinal.maxHp,
            monster_hp: nm.stats.health,
            monster_max_hp: nm.stats.health,
            hero_stats: heroFinal.stats,
            monster_stats: nm.stats,
            active_buffs: [],
            turn: 1,
            monster_id: nm.id,
          }
          set({
            currentMonster: nm,
            endlessUpcoming: fallbackUpcoming.slice(1),
            battleState: nextBattleState,
            battleLog: [],
            damageNumbers: [],
            monsterTell: null,
            isBattleOver: false,
            didWinBattle: false,
            screen: 'battle',
          })
          return
        }
      } catch (_e) {
        // fall through to ending
      }
    }

    // If we reach here, all attempts failed — end the endless run (server-side error or bad data)
    console.error('All attempts to fetch next endless monster failed, ending endless run')
    set({
      battleState: state,
      battleLog: [...get().battleLog, ...log],
      isBattleOver: true,
      didWinBattle: true,
      runStats: { ...newRunStats, outcome: 'victory' },
      screen: 'postendless',
    })
    return
  }
}

  // --- Non-endless victory path ---
  set({
    hero: newHero,
    learnedMoves: newLearnedMoves,
    newlyLearnedMove: alreadyLearned ? null : randomMove,
    battleState: state,
    battleLog: [...get().battleLog, ...log],
    isBattleOver: true,
    didWinBattle: true,
    isReplay: false,
    replayEncounterIndex: -1,
    runStats: {
      ...stats,
      monstersDefeated: stats.monstersDefeated + 1,
      timesLeveled: stats.timesLeveled + timesLeveled,
      movesLearned: (isReplay || alreadyLearned) ? stats.movesLearned : [...stats.movesLearned, randomMove!.name],
      outcome: isLastMonster ? 'victory' : null,
      lastStatGains: timesLeveled > 0 ? levelUpStats : undefined,
    },
    coins: get().coins + coinsGained,
    screen: isLastMonster ? 'summary' : 'postbattle',
  })
}

function getEffectiveStat(base: number, stat: string, buffs: ActiveBuff[], who: string): number {
  return buffs
    .filter((b) => b.affects_who === who && b.target_stat === stat)
    .reduce((acc, b) => acc + b.amount, base)
}

function calcPhysical(atk: number, def: number, base: number): number {
  const damage = base * (atk / 10) * (100 / (100 + def))
  return Math.max(1, Math.round(damage))
}

function calcMagic(mag: number, base: number): number {
  const damage = base * (mag / 10)
  return Math.max(1, Math.round(damage))
}

function calcHeal(mag: number, base: number): number {
  return Math.round(base * (mag / 10))
}

function tickBuffs(buffs: ActiveBuff[]): ActiveBuff[] {
  return buffs
    .map((b) => ({ ...b, turns_left: b.turns_left - 1 }))
    .filter((b) => b.turns_left > 0)
}

function addDamageNumber(_value: number, _type: 'damage' | 'heal' | 'buff', _target: 'hero' | 'monster') {
  // Ova funkcija je ostavljena prazna jer se logika za prikaz brojeva
  // obično implementira direktno u React komponenti koja ih prikazuje.
  // Zustand state se može koristiti za čuvanje niza brojeva ako je potrebno.
  dmgNumberId++
}