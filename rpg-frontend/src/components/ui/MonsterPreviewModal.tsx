import { motion } from 'framer-motion'
import type { Monster, Move } from '../../api/client'
import { Sword, Shield, Zap, Heart } from 'lucide-react'

export function MonsterPreviewModal({ 
  isOpen, 
  onClose, 
  monster 
}: { 
  isOpen: boolean
  onClose: () => void
  monster: Monster | null 
}) {
  if (!isOpen || !monster) return null

  const statIcons: { [key: string]: React.ReactNode } = {
    health: <Heart size={16} className="text-red-400" />,
    attack: <Sword size={16} className="text-orange-400" />,
    defense: <Shield size={16} className="text-blue-400" />,
    magic: <Zap size={16} className="text-purple-400" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black rounded-xl border-2 border-gray-700 p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-white mb-1">{monster.name}</h2>
            <p className="text-sm text-gray-400">
              Difficulty: {'⚔️'.repeat(monster.difficulty)} | XP: {monster.xp_reward}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Stats Grid */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
          <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Stats</p>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(monster.stats).map(([key, value]) => (
              <div key={key} className="bg-gray-900 rounded-lg p-3 flex items-center gap-2">
                {statIcons[key]}
                <div>
                  <p className="text-xs text-gray-500 capitalize">{key}</p>
                  <p className="text-lg font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moves */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Moveset</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {monster.moves.map((move: Move) => (
              <div key={move.id} className="bg-gray-900 rounded-lg p-2.5 text-sm border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-white">{move.name}</p>
                    <p className="text-xs text-gray-400">{move.description}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500 capitalize">{move.type}</p>
                    <p className="text-purple-400 font-bold">{move.effect}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
