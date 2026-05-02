import { useEffect, useRef, useState } from 'react'
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
  const [showLog, setShowLog] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!logContainerRef.current) return
    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
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

  const renderLogDetails = (damage?: number, healing?: number, buffDesc?: string) => {
    const parts: string[] = []
    if (damage && damage > 0) parts.push(`-${damage} HP`)
    if (healing && healing > 0) parts.push(`+${healing} HP`)
    if (buffDesc) parts.push(buffDesc)
    if (parts.length === 0) return 'No direct effect'
    return parts.join(' • ')
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-4 md:p-8 flex flex-col justify-between">
      
      {/* Gornji deo: Turn Counter i MonsterTell */}
      <div className="h-1/6 flex justify-between items-start px-4">
        <div className="text-center p-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Battle Turn</p>
          <p className="text-3xl font-black text-cyan-400">{battleState.turn}</p>
        </div>
        <div className="flex-1 flex justify-center">
          {monsterTell ? (
            <MonsterTell monsterName={monster.name} move={monsterTell} />
          ) : (
            <div className="text-center p-3 text-gray-400 text-sm">Awaiting action...</div>
          )}
        </div>
        <div className="text-right p-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">HP Status</p>
          <p className="text-lg font-bold text-red-400">{battleState.monster_hp}/{battleState.monster_max_hp}</p>
        </div>
      </div>

      {/* Srednji deo: Arena + Battle Log */}
      <div className="h-3/6 flex flex-col md:flex-row gap-4 px-2 md:px-4 items-stretch">
        <div className="flex-1 flex justify-between items-end">
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

        <div className="w-full md:w-80 bg-gray-900/70 border border-gray-700 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">Battle Log</h4>
            <button
              onClick={() => setShowLog(s => !s)}
              className="text-xs text-gray-300 bg-gray-800/30 px-2 py-1 rounded hover:bg-gray-800/50"
            >
              {showLog ? 'Hide' : 'Show'}
            </button>
          </div>

          {showLog ? (
            <div
              ref={logContainerRef}
              className="flex-1 min-h-28 md:min-h-0 max-h-48 md:max-h-none overflow-y-auto pr-1 space-y-2"
            >
              {battleLog.length === 0 ? (
                <p className="text-xs text-gray-500">No moves played yet.</p>
              ) : (
                battleLog.map((entry, idx) => (
                  <div
                    key={`${entry.turn}-${entry.actor}-${idx}`}
                    className={`rounded-lg p-2 border text-xs ${entry.actor === 'hero'
                      ? 'bg-blue-900/20 border-blue-700/40'
                      : 'bg-red-900/20 border-red-700/40'
                    }`}
                  >
                    <p className="font-semibold text-gray-200">
                      Turn {entry.turn} • {entry.actor === 'hero' ? 'Hero' : monster.name}
                    </p>
                    <p className="text-gray-300">{entry.moveName}</p>
                    <p className="text-gray-400">
                      {renderLogDetails(entry.damage, entry.healing, entry.buffDesc)}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-2 text-xs text-gray-400">Log hidden • {battleLog.length} entries</div>
          )}
        </div>
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