import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import type { Move } from '../../api/client'
import { MonsterTell } from '../ui/MonsterTell'
import BattleCharacter from '../battle/BattleCharacter'
import MoveButton from '../ui/MoveButton'

export default function BattleScreen() {
  const {
    config, currentEncounterIndex, battleState, battleLog, monsterTell,
    selectMove, equippedMoves, damageNumbers, isRaging
  } = useGameStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [heroIsHit, setHeroIsHit] = useState(false)
  const [monsterIsHit, setMonsterIsHit] = useState(false)

  // Efekat za "shake" animaciju kad neko primi udarac
  useEffect(() => {
    const lastLog = battleLog[battleLog.length - 1]
    if (!lastLog || !lastLog.damage) return

    if (lastLog.actor === 'hero') { // Hero je napao -> Monster je udaren
      setMonsterIsHit(true)
      setTimeout(() => setMonsterIsHit(false), 300)
    } else { // Monster je napao -> Hero je udaren
      setHeroIsHit(true)
      setTimeout(() => setHeroIsHit(false), 300)
    }
  }, [battleLog])

  if (!config || !battleState) return <div className="flex items-center justify-center h-full">Loading Battle...</div>

  const monster = config.monsters[currentEncounterIndex]

  const handleSelectMove = async (move: Move) => {
    if (isProcessing) return
    setIsProcessing(true)
    await selectMove(move)
    setIsProcessing(false)
  }

  // Filtriraj damage brojeve za svakog lika
  const heroDamageNumbers = damageNumbers.filter(d => d.target === 'hero')
  const monsterDamageNumbers = damageNumbers.filter(d => d.target === 'monster')

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-4 md:p-8 flex flex-col justify-between">
      
      {/* Gornji deo: Turn Counter i MonsterTell */}
      <div className="h-1/6 flex justify-center items-start">
        {monsterTell ? (
          <MonsterTell monsterName={monster.name} move={monsterTell} />
        ) : (
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-400">Turn {battleState.turn}</h2>
          </div>
        )}
      </div>

      {/* Srednji deo: Arena */}
      <div className="h-3/6 flex justify-between items-end px-4">
        <BattleCharacter 
          name="Knight"
          spriteEmoji="🧙" // Zameni sa sprajtom
          hp={battleState.hero_hp}
          maxHp={battleState.hero_max_hp}
          isHero
          isHit={heroIsHit}
          damageNumbers={heroDamageNumbers}
        />
        <BattleCharacter 
          name={monster.name}
          spriteEmoji="👹" // Zameni sa sprajtom
          hp={battleState.monster_hp}
          maxHp={battleState.monster_max_hp}
          isRaging={isRaging}
          isHit={monsterIsHit}
          damageNumbers={monsterDamageNumbers}
        />
      </div>

      {/* Donji deo: Akcije */}
      <div className="h-2/6 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-gray-800/70 rounded-2xl p-6 border border-gray-700 relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl">
              <span className="text-lg font-bold text-white animate-pulse">Processing...</span>
            </div>
          )}
          <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-center">Select Your Move</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {equippedMoves.map((move, idx) => (
              <MoveButton 
                key={idx}
                move={move}
                onClick={() => handleSelectMove(move)}
                disabled={isProcessing}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}