// c:/Projekti/nordeus-challenge/rpg-frontend/src/components/ui/MoveButton.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Move } from '../../api/client'
import { Swords, Shield, Heart, Zap } from 'lucide-react'

interface MoveButtonProps {
  move: Move
  onClick: () => void
  disabled: boolean
  className?: string; // IZMENA 1: Dodat opcioni className prop
}

const effectIcons: Record<string, ReactNode> = {
  damage: <Swords size={12} />,
  heal:   <Heart  size={12} />,
  buff:   <Shield size={12} />,
  debuff: <Zap    size={12} />,
}

const typeColor = {
  physical: { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)', text: '#fb923c', glow: 'rgba(251,146,60,0.2)' },
  magical:  { bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)', text: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
}

// IZMENA 2: Destrukturiramo className iz propova
export default function MoveButton({ move, onClick, disabled, className }: MoveButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const type = move.type === 'physical' ? typeColor.physical : typeColor.magical
  const icon = effectIcons[move.effect.split('_')[0]] || <Swords size={12} />

  return (
    // IZMENA 3: Primenjujemo prosleđeni className na glavni div kontejner
    <div
      className={`relative ${className || ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.96, y: 1 }}
        // IZMENA 4: Dodato "h-full" kako bi dugme popunilo visinu koju definiše spoljni kontejner
        className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-center transition-colors"
        style={{
          background: disabled
            ? 'rgba(10,10,18,0.5)'
            : `linear-gradient(180deg, rgba(20,15,35,0.9), rgba(12,9,22,0.95))`,
          border: `1px solid ${disabled ? 'var(--border)' : type.border}`,
          borderTop: `2px solid ${disabled ? 'var(--border)' : type.border}`,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : `0 4px 0 rgba(0,0,0,0.5), 0 0 12px ${type.glow}`,
          clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Icon */}
        <span style={{ color: disabled ? 'var(--text-muted)' : type.text }}>{icon}</span>

        {/* Move name */}
        <span
          className="text-[8px] leading-tight"
          style={{ color: disabled ? 'var(--text-muted)' : 'var(--text-primary)', letterSpacing: '0.05em' }}
        >
          {move.name}
        </span>

        {/* Type badge */}
        <span
          className="text-[6px] tracking-widest uppercase"
          style={{ color: disabled ? 'var(--text-muted)' : type.text }}
        >
          {move.type}
        </span>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 z-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(17,15,30,0.98), rgba(7,6,14,0.99))',
              border: `1px solid ${type.border}`,
              boxShadow: `0 0 20px ${type.glow}, 0 8px 24px rgba(0,0,0,0.8)`,
              padding: '10px 12px',
              clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            <p className="text-[9px] font-bold mb-1" style={{ color: type.text }}>{move.name}</p>
            <p className="text-[7px] mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {move.description}
            </p>
            <div
              className="flex justify-between text-[6px]"
              style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 6 }}
            >
              <span>Base: {move.base_value}</span>
              <span style={{ color: type.text }}>{move.effect}</span>
            </div>

            {/* Arrow */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: `5px solid ${type.border}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}