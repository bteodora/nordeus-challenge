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

  const handleEquipMove = (slot: number) => {
    if (newlyLearnedMove) {
      equipMove(newlyLearnedMove, slot)
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-y-auto p-4 flex items-start justify-center pt-4">
      {didWinBattle ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl border-2 border-green-500/50 p-6"
        >
          {/* Victory Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎉</div>
            <h1 className="text-3xl font-black text-green-400 mb-1">VICTORY!</h1>
            <p className="text-gray-400 text-sm">Defeated {monster.name}</p>
          </div>

          {/* Hero Progress */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 text-sm"
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-gray-400 text-xs uppercase">HP Restored</p>
                <p className="text-lg font-bold text-green-400">+{Math.max(0, hero.currentHp - (runStats.totalDamageReceived > 0 ? hero.currentHp - runStats.totalDamageReceived : 0))}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">XP Gained</p>
                <p className="text-lg font-bold text-yellow-400">+{monster.xp_reward}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Level</p>
                <p className="text-lg font-bold text-blue-400">{hero.level}</p>
              </div>
            </div>
          </motion.div>

          {/* New Move Section */}
          {newlyLearnedMove && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-4 mb-4 border-2 border-purple-500/50"
            >
              <h2 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">✨ New Move Learned!</h2>
              <div className="bg-gray-900 rounded-lg p-3 mb-3 border border-purple-500/30 text-sm">
                <h3 className="text-lg font-bold text-purple-300">{newlyLearnedMove.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-purple-400 font-bold capitalize">{newlyLearnedMove.type}</span> • {newlyLearnedMove.effect}
                </p>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Replace a move to add this to your arsenal:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {equippedMoves.map((move, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleEquipMove(idx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-all text-xs"
                  >
                    <p className="font-bold text-white truncate">{move.name}</p>
                    <p className="text-gray-400 text-xs">Slot {idx + 1}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Battle Stats - Compact */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 text-xs"
          >
            <p className="text-gray-400 font-bold mb-2 uppercase">Battle Stats</p>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-gray-500">Damage Dealt:</p><p className="text-red-400 font-bold">{runStats.totalDamageDealt}</p></div>
              <div><p className="text-gray-500">Turns Taken:</p><p className="text-blue-400 font-bold">{runStats.totalTurns}</p></div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={goToMap}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            Continue to Next Battle →
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-gradient-to-br from-red-900/30 to-gray-900 rounded-xl border-2 border-red-500/50 p-6"
        >
          {/* Defeat Screen */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">💀</div>
            <h1 className="text-3xl font-black text-red-400 mb-1">DEFEATED!</h1>
            <p className="text-gray-400 text-sm">You were defeated by {monster.name}</p>
          </div>

          {/* Defeat Summary */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 text-sm"
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-gray-400 text-xs uppercase">Damage Dealt</p>
                <p className="text-lg font-bold text-red-400">{runStats.totalDamageDealt}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Turns</p>
                <p className="text-lg font-bold text-blue-400">{runStats.totalTurns}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Level</p>
                <p className="text-lg font-bold text-yellow-400">{hero.level}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={goToMap}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            Return to Map
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
