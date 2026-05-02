import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'

export default function PostEndlessScreen() {
  const {
    hero,
    coins,
    runStats,
    endlessWins,
    exitToMenu,
  } = useGameStore()

  const handleReturnToMenu = () => {
    // Reset endless state and return to menu
    exitToMenu()
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-y-auto p-4 flex items-start justify-center pt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-gradient-to-br from-purple-900/40 to-gray-900 rounded-xl border-2 border-purple-500/50 p-8"
      >
        {/* Endless Run Summary */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚔️</div>
          <h1 className="text-4xl font-black text-purple-400 mb-2">ENDLESS RUN COMPLETE</h1>
          <p className="text-gray-300 text-lg">You lasted <span className="text-yellow-400 font-bold">{endlessWins}</span> rounds</p>
        </div>

        {/* Rewards Grid */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {/* Coins */}
          <div className="bg-gray-800/60 rounded-lg p-6 border border-yellow-500/30 text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-400 text-sm uppercase mb-1">Coins Earned</p>
            <p className="text-2xl font-bold text-yellow-400">{coins}</p>
          </div>

          {/* XP */}
          <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-500/30 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-gray-400 text-sm uppercase mb-1">XP Gained</p>
            <p className="text-2xl font-bold text-blue-400">{hero.xp}</p>
          </div>

          {/* Level */}
          <div className="bg-gray-800/60 rounded-lg p-6 border border-green-500/30 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-400 text-sm uppercase mb-1">Hero Level</p>
            <p className="text-2xl font-bold text-green-400">{hero.level}</p>
          </div>
        </motion.div>

        {/* Stat Summary */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700"
        >
          <h3 className="text-gray-400 font-bold uppercase text-sm mb-4">Current Stats</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase">Health</p>
              <p className="text-xl font-bold text-red-400">{hero.stats.health}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Attack</p>
              <p className="text-xl font-bold text-orange-400">{hero.stats.attack}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Defense</p>
              <p className="text-xl font-bold text-blue-400">{hero.stats.defense}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Magic</p>
              <p className="text-xl font-bold text-purple-400">{hero.stats.magic}</p>
            </div>
          </div>
        </motion.div>

        {/* Run Stats */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700 text-sm"
        >
          <h3 className="text-gray-400 font-bold uppercase text-sm mb-3">Battle Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-gray-500">Monsters Defeated:</p><p className="text-lg font-bold text-green-400">{runStats.monstersDefeated}</p></div>
            <div><p className="text-gray-500">Total Turns:</p><p className="text-lg font-bold text-cyan-400">{runStats.totalTurns}</p></div>
            <div><p className="text-gray-500">Damage Dealt:</p><p className="text-lg font-bold text-red-400">{runStats.totalDamageDealt}</p></div>
            <div><p className="text-gray-500">Total Healing:</p><p className="text-lg font-bold text-blue-400">{runStats.totalHealing}</p></div>
          </div>
        </motion.div>

        {/* Return Button */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleReturnToMenu}
          className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
        >
          Return to Main Menu
        </motion.button>
      </motion.div>
    </div>
  )
}
