import BattleCharacter from './BattleCharacter'
import MoveButton from '../ui/MoveButton'
import { useGameStore } from '../../store/gamestore'

export default function EndlessHUD() {
  const { battleState, currentMonster, hero, equippedMoves, endlessWins, endlessUpcoming, isRaging } = useGameStore() as any

  if (!battleState || !currentMonster) return null

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black p-6 flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-sm text-yellow-300 font-bold">Endless Streak: {endlessWins}</div>
        <div className="text-sm text-gray-300">No breaks — next spawns instantly</div>
        <div className="text-sm text-green-300">HP: {hero.currentHp}/{hero.maxHp}</div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center gap-8">
        <div className="w-1/3 flex items-center justify-center">
          <BattleCharacter name={hero?.name || 'Hero'} spriteEmoji="🧙" hp={battleState.hero_hp} maxHp={battleState.hero_max_hp} isHero isHit={false} damageNumbers={[]} />
        </div>
        <div className="w-1/3 flex items-center justify-center">
          <BattleCharacter name={currentMonster.name} spriteEmoji="👹" hp={battleState.monster_hp} maxHp={battleState.monster_max_hp} isRaging={isRaging} isHit={false} damageNumbers={[]} />
        </div>
        <div className="w-1/4 hidden md:flex flex-col gap-2">
          <div className="text-xs text-gray-400">Upcoming</div>
          <div className="flex flex-col gap-2">
            {Array.isArray(endlessUpcoming) && endlessUpcoming.slice(0,4).map((u: any, i: number) => (
              <div key={i} className="p-2 bg-gray-700 rounded text-xs">
                {u.type === 'monster' ? <div className="font-bold">{u.monster.name}</div> : <div>Event: {u.event}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mt-6">
        <div className="text-center text-xs text-gray-300 mb-2">Select your move</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {equippedMoves.map((move: any, idx: number) => (
            <MoveButton key={idx} move={move} onClick={() => useGameStore.getState().selectMove(move)} disabled={false} />
          ))}
        </div>
      </div>
    </div>
  )
}
