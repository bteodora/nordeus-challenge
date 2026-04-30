import { motion } from 'framer-motion'
import type { Move } from '../../api/client'

interface MonsterTellProps {
  monsterName: string
  move: Move
}

export function MonsterTell({ monsterName, move }: MonsterTellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800 border-2 border-red-500/50 p-3 rounded-lg shadow-lg shadow-red-900/20 text-center max-w-xs mx-auto mb-4"
    >
      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
        ⚠️ {monsterName} is preparing
      </div>
      <div className="font-bold text-red-400 text-lg">
        {move.name}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {move.type} • {move.effect}
      </div>
    </motion.div>
  )
}