import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'

export default function PostBattleScreen() {
  const {
    config,
    currentEncounterIndex,
    didWinBattle,
    newlyLearnedMove,
    hero,
    learnedMoves,
    equippedMoves,
    runStats,
    goToMap,
    equipMove,
  } = useGameStore()

  if (!config) return <div>Loading...</div>

  const monster = config.monsters[currentEncounterIndex]

  const handleReturnToMap = () => {
    goToMap()
  }

  const handleEquipMove = (slot: number) => {
    if (newlyLearnedMove) {
      equipMove(newlyLearnedMove, slot)
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      {didWinBattle ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-gradient-to-br from-green-900/40 to-gray-900 rounded-2xl border-2 border-green-500/50 p-8 shadow-2xl shadow-green-900/30"
        >
          {/* Victory Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-black text-green-400 mb-2">VICTORY!</h1>
            <p className="text-gray-400 text-lg">Defeated {monster.name}</p>
          </motion.div>

          {/* Battle Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700"
          >
            <h2 className="font-bold text-white text-lg mb-4 uppercase tracking-wider">Battle Results</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Damage Dealt</p>
                <p className="text-xl font-bold text-red-400">{runStats.totalDamageDealt}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Damage Received</p>
                <p className="text-xl font-bold text-orange-400">{runStats.totalDamageReceived}</p>
              </div>
              <div>
                <p className="text-gray-400">Biggest Hit</p>
                <p className="text-xl font-bold text-yellow-400">{runStats.biggestHit.value} ({runStats.biggestHit.moveName})</p>
              </div>
              <div>
                <p className="text-gray-400">Total Turns</p>
                <p className="text-xl font-bold text-blue-400">{runStats.totalTurns}</p>
              </div>
            </div>
          </motion.div>

          {/* Learned Move */}
          {newlyLearnedMove && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-6 mb-8 border-2 border-purple-500/50"
            >
              <h2 className="font-bold text-white text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
                ✨ New Move Learned
              </h2>
              <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-purple-300 mb-2">{newlyLearnedMove.name}</h3>
                <div className="text-sm text-gray-400 mb-3">
                  <p className="mb-1">
                    <span className="text-purple-400 font-bold">{newlyLearnedMove.type}</span> •{' '}
                    <span className="text-indigo-400">{newlyLearnedMove.effect}</span>
                  </p>
                  <p>{newlyLearnedMove.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Base Value: {newlyLearnedMove.base_value} • Stat: {newlyLearnedMove.target_stat}
                </div>
              </div>

              {/* Equip Options */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm mb-3 font-bold uppercase tracking-wider">Equip in Slot</p>
                <div className="grid grid-cols-4 gap-2">
                  {equippedMoves.map((move, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleEquipMove(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all"
                    >
                      <div className="text-xs text-center">
                        <p className="font-bold text-white">{move.name}</p>
                        <p className="text-gray-400 text-xs mt-1">Slot {idx + 1}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button
              onClick={handleReturnToMap}
              className="flex-1 py-4 px-6 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Continue to Map
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-gradient-to-br from-red-900/40 to-gray-900 rounded-2xl border-2 border-red-500/50 p-8 shadow-2xl shadow-red-900/30"
        >
          {/* Defeat Screen */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-4xl font-black text-red-400 mb-2">DEFEATED!</h1>
            <p className="text-gray-400 text-lg mb-8">You were defeated by {monster.name}</p>
          </motion.div>

          {/* Defeat Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Damage Dealt</p>
                <p className="text-xl font-bold text-red-400">{runStats.totalDamageDealt}</p>
              </div>
              <div>
                <p className="text-gray-400">Damage Received</p>
                <p className="text-xl font-bold text-orange-400">{runStats.totalDamageReceived}</p>
              </div>
              <div>
                <p className="text-gray-400">Turns Survived</p>
                <p className="text-xl font-bold text-blue-400">{runStats.totalTurns}</p>
              </div>
              <div>
                <p className="text-gray-400">Level Reached</p>
                <p className="text-xl font-bold text-yellow-400">{hero.level}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleReturnToMap}
              className="flex-1 py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Return to Map
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
