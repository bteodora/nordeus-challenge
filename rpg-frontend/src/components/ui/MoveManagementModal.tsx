import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Move } from '../../api/client'
import { Swords, Shield, Heart, Zap, X } from 'lucide-react'

interface MoveManagementModalProps {
  isOpen: boolean
  onClose: () => void
  allMoves: Move[]
  equippedMoves: Move[]
  onEquipMove: (move: Move, slot: number) => void
}

const effectIcons: Record<string, ReactNode> = {
  damage:           <Swords size={10} />,
  heal:             <Heart  size={10} />,
  buff:             <Shield size={10} />,
  debuff:           <Zap    size={10} />,
  damage_debuff:    <Zap    size={10} />,
  buff_self_damage: <Shield size={10} />,
}

const typeColor = (t: string) => t === 'physical' ? '#fb923c' : '#c084fc'

function MoveRow({
  move, slot, onEquip, equipped, equippedSlot,
}: {
  move: Move
  slot?: number
  onEquip?: (slot: number) => void
  equipped?: boolean
  equippedSlot?: number
}) {
  const tc = typeColor(move.type)
  return (
    <div
      className="flex items-center justify-between gap-2 p-2 transition-colors"
      style={{
        background: equipped ? `rgba(${move.type === 'physical' ? '251,146,60' : '192,132,252'},0.07)` : 'rgba(0,0,0,0.25)',
        borderLeft: `2px solid ${tc}${equipped ? 'aa' : '33'}`,
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span style={{ color: tc, flexShrink: 0 }}>{effectIcons[move.effect.split('_')[0]] || <Swords size={10} />}</span>
        <div className="min-w-0">
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: equipped ? 'var(--ink-text)' : 'var(--dim-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {move.name}
          </p>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', marginTop: 2 }}>
            {move.type} · {move.effect} · {move.base_value}
          </p>
        </div>
      </div>

      {/* Slot buttons or equipped badge */}
      <div className="flex gap-1 flex-shrink-0">
        {equipped ? (
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: tc, background: `${tc}22`, padding: '3px 6px', border: `1px solid ${tc}44` }}>
            S{(equippedSlot ?? 0) + 1}
          </span>
        ) : onEquip ? (
          [0, 1, 2, 3].map(s => (
            <motion.button
              key={s}
              onClick={() => onEquip(s)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="pixel-button"
              style={{ padding: '3px 6px', fontSize: 6 }}
            >
              S{s + 1}
            </motion.button>
          ))
        ) : null}
      </div>
    </div>
  )
}

export function MoveManagementModal({ isOpen, onClose, allMoves, equippedMoves, onEquipMove }: MoveManagementModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-bg"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.18 }}
            onClick={e => e.stopPropagation()}
            className="panel panel-arcane w-full max-w-3xl overflow-hidden"
            style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--arcane-dk)', flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--arcane-lt)', letterSpacing: '0.25em', marginBottom: 4 }}>
                  ✦ ARCANE CODEX
                </p>
                <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: 'var(--ink-text)' }}>
                  Move Management
                </h2>
              </div>
              <button onClick={onClose} className="pixel-button p-2">
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex gap-0 flex-1 min-h-0 overflow-hidden">

              {/* Left — equipped */}
              <div className="flex flex-col overflow-y-auto"
                style={{ width: '44%', borderRight: '1px solid var(--rim)', padding: '12px' }}>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#4ade80', letterSpacing: '0.2em', marginBottom: 8 }}>
                  📍 Equipped (4 slots)
                </p>
                <div className="flex flex-col gap-1.5">
                  {equippedMoves.map((move, slot) => (
                    <MoveRow key={slot} move={move} equipped equippedSlot={slot} />
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 4 - equippedMoves.length) }).map((_, i) => (
                    <div key={i} className="p-2 flex items-center"
                      style={{ background: 'rgba(0,0,0,0.2)', borderLeft: '2px solid var(--rim)' }}>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)' }}>
                        Slot {equippedMoves.length + i + 1} — empty
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — all moves */}
              <div className="flex flex-col overflow-y-auto flex-1"
                style={{ padding: '12px' }}>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--arcane-lt)', letterSpacing: '0.2em', marginBottom: 8 }}>
                  📚 All Moves ({allMoves.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {allMoves.map(move => {
                    const eqIdx = equippedMoves.findIndex(m => m.id === move.id)
                    const isEq  = eqIdx !== -1
                    return (
                      <MoveRow
                        key={move.id}
                        move={move}
                        equipped={isEq}
                        equippedSlot={isEq ? eqIdx : undefined}
                        onEquip={isEq ? undefined : (slot) => onEquipMove(move, slot)}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--rim)' }}>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 pixel-button justify-center"
                style={{ color: 'var(--arcane-lt)', borderColor: 'var(--arcane-dk)', fontSize: 8, letterSpacing: '0.2em' }}
              >
                Close Codex
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}