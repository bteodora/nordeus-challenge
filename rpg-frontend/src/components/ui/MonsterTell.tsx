import { motion } from 'framer-motion'
import type { Move } from '../../api/client'

interface MonsterTellProps {
  monsterName: string
  move: Move
}

export function MonsterTell({ monsterName, move }: MonsterTellProps) {
  return (
    // Wrapper handles the outer animation (in BattleScreen)
    // This component just renders the content
    <div
      className="monster-tell px-4 py-2 w-full"
      style={{
        clipPath: 'polygon(0 5px, 5px 5px, 5px 0, calc(100% - 5px) 0, calc(100% - 5px) 5px, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 5px calc(100% - 5px), 0 calc(100% - 5px))',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <div className="flex items-center gap-2 justify-center">
        {/* Pulsing warning dot */}
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          style={{ color: '#f87171', fontSize: 10 }}
        >
          ⚠
        </motion.span>

        <div className="text-center">
          <p className="text-[6px] tracking-[0.25em] mb-0.5" style={{ color: 'rgba(248,113,113,0.6)' }}>
            {monsterName.toUpperCase()} PREPARES
          </p>
          <p className="text-[10px] font-bold" style={{ color: '#fca5a5' }}>
            {move.name}
          </p>
          <p className="text-[6px] mt-0.5" style={{ color: 'rgba(248,113,113,0.5)' }}>
            {move.type} · {move.effect}
          </p>
        </div>

        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: 0.35 }}
          style={{ color: '#f87171', fontSize: 10 }}
        >
          ⚠
        </motion.span>
      </div>
    </div>
  )
}