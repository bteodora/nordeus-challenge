import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Swords, Shield } from 'lucide-react'
import { MoveManagementModal } from '../ui/MoveManagementModal'

export default function MapScreen() {
  const { config, currentEncounterIndex, enterBattle, hero, equippedMoves, learnedMoves, equipMove } = useGameStore()
  const [isManageMovesOpen, setIsManageMovesOpen] = useState(false)

  if (!config) return <div>Loading...</div>

  return (
    <>
      <div className="flex w-full h-full p-6 gap-6 bg-gray-900">
      
      {/* Sidebar: Hero Info */}
      <div className="w-1/4 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col">
        <h2 className="text-2xl font-bold mb-2">Knight</h2>
        <p className="text-gray-400 mb-6">Level {hero.level} • HP {hero.currentHp}/{hero.maxHp}</p>
        
        <h3 className="font-bold text-gray-300 mb-3 border-b border-gray-700 pb-2">Equipped Moves</h3>
        <div className="flex flex-col gap-2 flex-grow">
          {equippedMoves.map((move, idx) => (
            <div key={idx} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{move.name}</p>
                <p className="text-xs text-gray-400">{move.type}</p>
              </div>
              <Shield size={16} className={move.type === 'physical' ? 'text-orange-400' : 'text-purple-400'} />
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setIsManageMovesOpen(true)}
          className="mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors">
          Manage Moves (M)
        </button>
      </div>

      {/* Main Map Area */}
      <div className="w-3/4 bg-gray-800 rounded-2xl border border-gray-700 p-8 overflow-y-auto flex flex-col items-center">
        <h2 className="text-3xl font-black mb-10 text-gray-500">THE GAUNTLET</h2>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-md relative">
          {config.monsters.map((monster, index) => {
            const isCurrent = index === currentEncounterIndex
            const isPast = index < currentEncounterIndex
            const isLocked = index > currentEncounterIndex

            let cardClass = "w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all "
            if (isCurrent) cardClass += "bg-red-900/40 border-red-500 cursor-pointer hover:scale-105 hover:bg-red-800/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            else if (isPast) cardClass += "bg-gray-800 border-green-500/50 opacity-50 grayscale"
            else cardClass += "bg-gray-800 border-gray-700 opacity-70"

            return (
              <motion.div 
                key={monster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cardClass}
                onClick={() => isCurrent && enterBattle(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{isPast ? '💀' : '👹'}</div>
                  <div>
                    <h3 className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{monster.name}</h3>
                    <div className="text-xs text-red-400">
                       {'⚔️'.repeat(monster.difficulty)}
                    </div>
                  </div>
                </div>
                {isCurrent && (
                  <button className="px-4 py-2 bg-red-600 rounded-lg font-bold flex items-center gap-2">
                    <Swords size={16} /> FIGHT
                  </button>
                )}
                {isPast && <span className="text-green-500 font-bold">DEFEATED</span>}
                {isLocked && <span className="text-gray-600 font-bold">LOCKED</span>}
              </motion.div>
            )
          })}
          
          {/* Linija koja povezuje karte */}
          <div className="absolute left-1/2 top-10 bottom-10 w-1 bg-gray-700 -z-10 transform -translate-x-1/2"></div>
        </div>
      </div>

    </div>

    <MoveManagementModal
      isOpen={isManageMovesOpen}
      onClose={() => setIsManageMovesOpen(false)}
      allMoves={learnedMoves}
      equippedMoves={equippedMoves}
      onEquipMove={equipMove}
    />
    </>
  )
}