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
  damage: <Swords size={16} />,
  heal: <Heart size={16} />,
  buff: <Shield size={16} />,
  debuff: <Zap size={16} />,
  damage_debuff: <Zap size={16} />,
  buff_self_damage: <Shield size={16} />,
}

export function MoveManagementModal({
  isOpen,
  onClose,
  allMoves,
  equippedMoves,
  onEquipMove,
}: MoveManagementModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-indigo-500/50 p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-indigo-400">⚔️ MOVE MANAGEMENT</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Equipped Moves Section */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-green-500/30">
                <h2 className="font-bold text-green-400 mb-4 uppercase tracking-wider text-sm">
                  📍 Currently Equipped (4 slots)
                </h2>
                <div className="flex flex-col gap-3">
                  {equippedMoves.map((move, slot) => (
                    <motion.div
                      key={slot}
                      className="relative group"
                    >
                      <div className="bg-green-900/40 border-2 border-green-500/50 rounded-lg p-4 cursor-pointer hover:bg-green-900/60 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-green-300">{move.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              {effectIcons[move.effect.split('_')[0]] || <Swords size={14} />}
                              <span className={move.type === 'physical' ? 'text-orange-400' : 'text-purple-400'}>
                                {move.type}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-green-500 bg-green-900/60 px-2 py-1 rounded">
                            Slot {slot + 1}
                          </span>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs z-10 shadow-xl">
                        <p className="text-gray-300 mb-1">{move.description}</p>
                        <p className="text-gray-500">Base: {move.base_value} | Effect: {move.effect}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Available Moves Section */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-indigo-500/30">
                <h2 className="font-bold text-indigo-400 mb-4 uppercase tracking-wider text-sm">
                  📚 Available Moves ({allMoves.length})
                </h2>
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {allMoves.map((move) => {
                    const equippedSlot = equippedMoves.findIndex((m) => m.id === move.id)
                    const isCurrentlyEquipped = equippedSlot !== -1

                    return (
                      <motion.div
                        key={move.id}
                        className="relative group"
                      >
                        <div
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isCurrentlyEquipped
                              ? 'bg-indigo-900/60 border-indigo-500/80'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-sm text-white">{move.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs">
                                {effectIcons[move.effect.split('_')[0]] || <Swords size={12} />}
                                <span
                                  className={
                                    move.type === 'physical' ? 'text-orange-400' : 'text-purple-400'
                                  }
                                >
                                  {move.type}
                                </span>
                              </div>
                            </div>

                            {isCurrentlyEquipped ? (
                              <span className="text-xs font-bold text-indigo-300 bg-indigo-900/60 px-2 py-1 rounded">
                                Slot {equippedSlot + 1}
                              </span>
                            ) : (
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map((slot) => (
                                  <motion.button
                                    key={slot}
                                    onClick={() => onEquipMove(move, slot)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-xs px-2 py-1 rounded bg-indigo-600/50 hover:bg-indigo-600 text-indigo-200 transition-colors font-bold"
                                  >
                                    S{slot + 1}
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs z-10 shadow-xl">
                          <p className="text-gray-300 mb-1">{move.description}</p>
                          <p className="text-gray-500">Base: {move.base_value} | Effect: {move.effect}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
            >
              Done (Close)
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
