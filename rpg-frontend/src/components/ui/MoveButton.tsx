import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Move } from '../../api/client'
import { Swords, Shield, Heart, Zap } from 'lucide-react'

interface MoveButtonProps {
  move: Move
  onClick: () => void
  disabled: boolean
}

const effectIcons: Record<string, ReactNode> = {
  damage: <Swords size={16} />,
  heal: <Heart size={16} />,
  buff: <Shield size={16} />,
  debuff: <Zap size={16} />,
}

export default function MoveButton({ move, onClick, disabled }: MoveButtonProps) {
  return (
    <motion.div className="relative group">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`w-full p-4 rounded-xl font-bold transition-all border-2 flex flex-col items-center justify-center text-center
          ${disabled 
            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-700 border-gray-600 text-gray-200 hover:border-red-500 hover:bg-gray-600'
          }`}
      >
        <div className="text-lg mb-2">{move.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {effectIcons[move.effect.split('_')[0]] || <Swords size={16} />}
          <span className={`capitalize ${move.type === 'physical' ? 'text-orange-400' : 'text-purple-400'}`}>{move.type}</span>
        </div>
      </motion.button>
      
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/4 left-1/4">
        <h4 className="font-bold text-red-400">{move.name}</h4>
        <p className="text-sm text-gray-300 mt-1">{move.description}</p>
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
          Base: {move.base_value} | Effect: {move.effect}
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
      </div>
    </motion.div>
  )
}