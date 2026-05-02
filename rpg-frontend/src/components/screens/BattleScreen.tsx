import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gamestore'
import type { Move } from '../../api/client'
import { MonsterTell } from '../ui/MonsterTell'
import BattleCharacter from '../battle/BattleCharacter'
import MoveButton from '../ui/MoveButton'
import BattleForestBackdrop from '../ui/BattleForestBackdrop'

export default function BattleScreen() {
  const {
    config, currentEncounterIndex, battleState, battleLog, monsterTell,
    selectMove, equippedMoves, damageNumbers, isRaging, endlessMode, endlessUpcoming, currentMonster
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
  const monster = endlessMode && currentMonster ? currentMonster : config.monsters[currentEncounterIndex]


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
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-4 md:p-8 flex flex-col justify-between relative overflow-hidden">
      <BattleForestBackdrop />
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_15%,rgba(180,160,90,0.14),transparent_22%),radial-gradient(circle_at_10%_80%,rgba(34,76,44,0.18),transparent_18%),radial-gradient(circle_at_90%_78%,rgba(34,76,44,0.18),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(4,6,5,0.9))]" />

      {/* Distant moonlight beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3/4 bg-[linear-gradient(115deg,rgba(255,255,255,0.0)_0%,rgba(188,180,255,0.06)_38%,rgba(255,255,255,0.0)_60%)] animate-pulse" />
      
      {/* Gornji deo: Turn Counter i MonsterTell */}
      <div className="relative z-10 h-1/6 flex justify-between items-start px-4">
        <div className="text-center p-2">
          <p className="text-xs text-amber-200 uppercase tracking-wider">Battle Turn</p>
          <p className="text-3xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(255,220,150,0.25)]">{battleState.turn}</p>
        </div>
        <div className="flex-1 flex justify-center">
          {monsterTell ? (
            <MonsterTell monsterName={monster.name} move={monsterTell} />
          ) : (
            <div className="text-center p-3 text-gray-300 text-sm tracking-[0.18em]">Awaiting action...</div>
          )}
        </div>
        <div className="text-right p-2">
          <p className="text-xs text-amber-200 uppercase tracking-wider">HP Status</p>
          <p className="text-lg font-bold text-red-300">{battleState.monster_hp}/{battleState.monster_max_hp}</p>
        </div>
      </div>

      {/* Srednji deo: Arena + Battle Log */}
      <div className="relative z-10 h-3/6 flex flex-col md:flex-row gap-4 px-2 md:px-4 items-stretch">
        {endlessMode && endlessUpcoming && endlessUpcoming.length > 0 && (
          <div className="w-full mb-2 flex gap-2 overflow-x-auto px-2">
            {endlessUpcoming.map((u: any, idx: number) => (
              <div key={idx} className="min-w-[120px] bg-[#0e120f]/80 border border-[#31412f] rounded p-2 text-xs backdrop-blur-sm">
                {u.type === 'monster' ? (
                  <div>
                    <div className="font-bold text-amber-100">{u.monster.name}</div>
                    <div className="text-green-200/70 text-xs uppercase tracking-wider">Diff: {u.monster.difficulty}</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-green-200">Event: {u.event}</div>
                    <div className="text-gray-300 text-xs">{u.desc || ''}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

        <div className="w-full md:w-80 bg-gray-900/70 border border-gray-700 rounded-xl p-3 flex flex-col pixel-panel backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-100">Battle Log</h4>
            <button
              onClick={() => setShowLog(s => !s)}
              className="text-xs text-amber-100 bg-black/20 px-2 py-1 rounded hover:bg-black/35"
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
                <p className="text-xs text-gray-400">No moves played yet.</p>
              ) : (
                battleLog.map((entry, idx) => (
                  <div
                    key={`${entry.turn}-${entry.actor}-${idx}`}
                    className={`rounded-lg p-2 border text-xs ${entry.actor === 'hero'
                      ? 'bg-blue-950/25 border-blue-700/40'
                      : 'bg-red-950/25 border-red-700/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-100">
                        Turn {entry.turn} • {entry.actor === 'hero' ? 'Hero' : monster.name}
                      </p>
                      {entry.timestamp && (
                        <p className="text-gray-400 text-xs">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <p className="text-amber-100">{entry.moveName}</p>
                    <p className="text-gray-300">
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
      <div className="relative z-10 h-2/6 flex justify-center items-center">
          <div className="w-full max-w-2xl bg-gray-800/70 rounded-2xl p-6 border border-gray-700 relative pixel-panel backdrop-blur-sm">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10 rounded-2xl">
              <span className="text-lg font-bold text-amber-100 animate-pulse tracking-[0.2em]">Processing...</span>
            </div>
          )}
          <h3 className="font-bold text-amber-100 mb-4 uppercase tracking-[0.25em] text-center">Select Your Move</h3>
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