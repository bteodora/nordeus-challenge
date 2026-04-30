const BASE_URL = 'http://localhost:8081/api'

export interface Stat {
  health: number
  attack: number
  defense: number
  magic: number
}

export interface Move {
  id: string
  name: string
  type: 'physical' | 'magic'
  effect: string
  base_value: number
  target_stat: string
  buff_amount: number
  buff_turns: number
  description: string
}

export interface Monster {
  id: string
  name: string
  sprite: string
  stats: Stat
  moves: Move[]
  xp_reward: number
  difficulty: number
}

export interface ActiveBuff {
  target_stat: string
  amount: number
  turns_left: number
  affects_who: 'hero' | 'monster'
}

export interface BattleState {
  hero_hp: number
  hero_max_hp: number
  monster_hp: number
  monster_max_hp: number
  hero_stats: Stat
  monster_stats: Stat
  active_buffs: ActiveBuff[]
  turn: number
  monster_id: string
}

export interface MoveResult {
  move: Move
  damage: number
  healing: number
  buff_applied?: ActiveBuff
  new_buffs: ActiveBuff[]
  monster_tell?: Move
  is_raging: boolean
}

export interface RunConfig {
  monsters: Monster[]
  all_moves: Move[]
  hero_start_stats: Stat
  hero_start_moves: Move[]
}

export async function fetchRunConfig(): Promise<RunConfig> {
  const res = await fetch(`${BASE_URL}/run/config`)
  if (!res.ok) throw new Error('Failed to fetch run config')
  return res.json()
}

export async function fetchMonsterMove(state: BattleState): Promise<MoveResult> {
  const res = await fetch(`${BASE_URL}/monster/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error('Failed to fetch monster move')
  return res.json()
}