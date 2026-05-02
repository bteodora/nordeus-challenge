import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Swords, Shield, Eye } from 'lucide-react'
import { MoveManagementModal } from '../ui/MoveManagementModal'
import ShopModal from '../ui/ShopModal'
import { MonsterPreviewModal } from '../ui/MonsterPreviewModal'
import type { Monster } from '../../api/client'

export default function MapScreen() {
  const { config, currentEncounterIndex, enterBattle, hero, equippedMoves, learnedMoves, equipMove, coins } = useGameStore()
  const [isManageMovesOpen, setIsManageMovesOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)

  if (!config) return <div>Loading...</div>

  return (
    <>
      <div className="flex w-full h-full p-6 gap-6 bg-[radial-gradient(circle_at_50%_20%,rgba(70,52,26,0.26),transparent_20%),linear-gradient(180deg,#0d0f12_0%,#050506_100%)]">
      
      {/* Sidebar: Hero Info */}
      <div className="w-1/4 bg-[#0b0f0c]/90 rounded-2xl p-6 border border-[#302316] flex flex-col pixel-panel">
        <h2 className="text-2xl font-bold mb-2 text-amber-200">Knight</h2>
        <p className="text-gray-300 mb-1 text-sm">Level {hero.level} • HP {hero.currentHp}/{hero.maxHp}</p>
        <p className="text-amber-300 font-bold mb-6 text-sm">💰 {coins} Coins</p>
        
        <h3 className="font-bold text-gray-200 mb-3 border-b border-gray-700 pb-2 text-sm tracking-wide uppercase">Equipped Moves</h3>
        <div className="flex flex-col gap-2 flex-grow">
          {equippedMoves.map((move, idx) => (
            <div key={idx} className="bg-[#15130d] p-3 rounded-lg flex justify-between items-center border border-[#3a2b1a]">
              <div>
                <p className="font-bold text-sm">{move.name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{move.type}</p>
              </div>
              <Shield size={16} className={move.type === 'physical' ? 'text-orange-400' : 'text-purple-400'} />
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setIsManageMovesOpen(true)}
          className="mt-4 py-3 bg-[#2a2213] hover:bg-[#3b3019] rounded-xl font-bold transition-colors border border-[#4b3820] pixel-button">
          Manage Moves (M)
        </button>
        <button 
          onClick={() => setIsShopOpen(true)}
          className="mt-3 py-2 bg-[#402616] hover:bg-[#5d3420] rounded-xl font-bold transition-colors border border-[#6e4c2a] pixel-button">
          Shop
        </button>
        <button 
          onClick={() => { useGameStore.getState().saveRun(); useGameStore.getState().exitToMenu(); }}
          className="mt-3 py-2 bg-[#222120] hover:bg-[#2e2c28] rounded-xl font-bold transition-colors border border-[#3f3b35] pixel-button"
        >
          Save & Exit
        </button>
      </div>

      {/* Main Map Area */}
      <div className="w-3/4 bg-[#090b0a]/90 rounded-2xl border border-[#332417] p-8 overflow-y-auto flex flex-col items-center pixel-panel">
        <h2 className="text-3xl font-black mb-10 text-amber-100 tracking-[0.2em]">THE GAUNTLET</h2>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-md relative">
          {config.monsters.map((monster, index) => {
            const isCurrent = index === currentEncounterIndex
            const isPast = index < currentEncounterIndex
            const isLocked = index > currentEncounterIndex

            let cardClass = "w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all relative overflow-hidden "
            if (isCurrent) cardClass += "bg-[#331a12] border-[#e0a54a] cursor-pointer hover:scale-105 hover:bg-[#432116] shadow-[0_0_20px_rgba(224,165,74,0.15)]"
            else if (isPast) cardClass += "bg-[#121311] border-[#37553b] opacity-55 grayscale"
            else cardClass += "bg-[#0f100f] border-[#2d2d2d] opacity-75"

            return (
              <motion.div 
                key={monster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cardClass}
                onClick={() => isCurrent && enterBattle(index)}
              >
                <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{isPast ? '💀' : '👹'}</div>
                  <div>
                    <h3 className={`font-bold ${isCurrent ? 'text-amber-100' : 'text-gray-400'}`}>{monster.name}</h3>
                    <div className="text-[10px] text-amber-300 tracking-wider uppercase">
                       {'⚔️'.repeat(monster.difficulty)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMonster(monster); }}
                    className="p-2 bg-[#17323a] hover:bg-[#214952] rounded-lg transition-colors border border-[#33555d] pixel-button" 
                    title="Preview"
                  >
                    <Eye size={16} className="text-white" />
                  </button>
                  {isCurrent && (
                    <button className="px-4 py-2 bg-[#7c261d] rounded-lg font-bold flex items-center gap-2 border border-[#a34a39] pixel-button">
                      <Swords size={16} /> FIGHT
                    </button>
                  )}
                  {isPast && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-300 font-bold text-sm tracking-wide">DEFEATED</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); enterBattle(index, true); }}
                        className="px-3 py-1 bg-[#6d4d22] hover:bg-[#8b632a] rounded font-bold text-sm pixel-button"
                      >
                        Replay
                      </button>
                    </div>
                  )}
                  {isLocked && <span className="text-gray-500 font-bold text-sm tracking-wide">LOCKED</span>}
                </div>
              </motion.div>
            )
          })}
          
          {/* Linija koja povezuje karte */}
          <div className="absolute left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-[#4a3b22] via-[#274b2f] to-[#1b1f1a] -z-10 transform -translate-x-1/2"></div>
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
    <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    <MonsterPreviewModal isOpen={!!selectedMonster} onClose={() => setSelectedMonster(null)} monster={selectedMonster} />
    <MonsterPreviewModal isOpen={!!selectedMonster} onClose={() => setSelectedMonster(null)} monster={selectedMonster} />
    </>
  )
}