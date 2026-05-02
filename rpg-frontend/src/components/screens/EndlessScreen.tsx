import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { fetchEndlessMonster } from '../../api/endless'
import { Swords, Heart, Zap, Shield, Star } from 'lucide-react'

const DIFFICULTY_COLORS = ['', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400']
const DIFFICULTY_LABELS = ['', 'Weak', 'Common', 'Dangerous', 'Deadly', 'Legendary']

export default function EndlessScreen() {
  const { hero, enterBattleWithMonster, endlessWins, applyRegen } = useGameStore() as any
  const [payload, setPayload] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNext()
  }, [endlessWins])

  async function loadNext() {
    setLoading(true)
    try {
      const res = await fetchEndlessMonster(endlessWins)
      setPayload(res)
      if (endlessWins > 0 && res?.regen_every && res?.regen_amount_pct) {
        if (endlessWins % res.regen_every === 0) {
          const amount = Math.round((hero.maxHp || 100) * res.regen_amount_pct)
          applyRegen(amount)
        }
      }
    } catch (e) {
      console.error('Failed to load endless monster', e)
    } finally {
      setLoading(false)
    }
  }

  function startBattle() {
    if (!payload) return
    enterBattleWithMonster(payload.monster, payload.upcoming)
  }

  const hpPercent = Math.round((hero.currentHp / hero.maxHp) * 100)
  const hpColor = hpPercent > 60 ? '#4ade80' : hpPercent > 30 ? '#facc15' : '#f87171'

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0a2e_0%,_#000_60%)]" />
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(139,92,246,0.1) 40px, rgba(139,92,246,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139,92,246,0.1) 40px, rgba(139,92,246,0.1) 41px)' }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-5">
        
        {/* Header — streak + hero HP */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-purple-400 text-xs uppercase tracking-[0.3em] font-bold">Endless Gauntlet</p>
            <div className="flex items-center gap-2 mt-1">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-black text-white">{endlessWins}</span>
              <span className="text-gray-500 text-sm">wins</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Hero HP</p>
            <div className="flex items-center gap-2 justify-end">
              <Heart size={14} style={{ color: hpColor }} />
              <span className="font-bold text-lg" style={{ color: hpColor }}>
                {hero.currentHp}/{hero.maxHp}
              </span>
            </div>
            {/* HP bar */}
            <div className="w-32 h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: hpColor }}
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {/* Regen info */}
            {payload && payload.regen_every && (
              <p className="text-xs text-green-500 mt-1">
                +{Math.round(payload.regen_amount_pct * 100)}% HP regen every {payload.regen_every} wins
              </p>
            )}
          </div>
        </motion.div>

        {/* Hero stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {[
            { icon: <Heart size={12} />, label: 'ATK', value: hero.stats?.attack, color: 'text-red-400' },
            { icon: <Shield size={12} />, label: 'DEF', value: hero.stats?.defense, color: 'text-blue-400' },
            { icon: <Zap size={12} />, label: 'MAG', value: hero.stats?.magic, color: 'text-purple-400' },
            { icon: <Star size={12} />, label: `LVL`, value: hero.level, color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-gray-900/80 border border-gray-800 rounded-lg p-2 text-center">
              <p className={`text-xs font-bold ${s.color}`}>{s.label}</p>
              <p className="text-white font-black text-lg">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Main monster card */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="text-4xl inline-block mb-3"
              >⚔️</motion.div>
              <p className="text-gray-400">Summoning next challenger...</p>
            </motion.div>
          ) : payload ? (
            <motion.div
              key={payload.monster?.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900/80 border border-gray-700 rounded-2xl overflow-hidden"
            >
              {/* Monster header */}
              <div className="bg-gradient-to-r from-red-950/60 to-gray-900/60 p-5 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">👹</div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{payload.monster.name}</h2>
                    <p className={`text-sm font-bold ${DIFFICULTY_COLORS[payload.monster.difficulty] || 'text-gray-400'}`}>
                      {'⚔️'.repeat(payload.monster.difficulty)} {DIFFICULTY_LABELS[payload.monster.difficulty] || ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Reward</p>
                  <p className="text-yellow-400 font-black text-xl">💰 {payload.coins}</p>
                </div>
              </div>

              {/* Monster stats */}
              <div className="grid grid-cols-4 gap-0 border-b border-gray-800">
                {[
                  { label: 'HP', value: payload.monster.stats?.health, color: 'text-red-400' },
                  { label: 'ATK', value: payload.monster.stats?.attack, color: 'text-orange-400' },
                  { label: 'DEF', value: payload.monster.stats?.defense, color: 'text-blue-400' },
                  { label: 'MAG', value: payload.monster.stats?.magic, color: 'text-purple-400' },
                ].map((s, i) => (
                  <div key={s.label} className={`p-3 text-center ${i < 3 ? 'border-r border-gray-800' : ''}`}>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                    <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Fight button */}
              <div className="p-4">
                <motion.button
                  onClick={startBattle}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                >
                  <Swords size={22} /> FIGHT
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Upcoming encounters */}
        {payload?.upcoming?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Upcoming</p>
            <div className="flex gap-2">
              {payload.upcoming.slice(0, 3).map((u: any, i: number) => (
                <div key={i} className="flex-1 bg-gray-900/60 border border-gray-800 rounded-xl p-3">
                  {u.type === 'monster' ? (
                    <>
                      <p className="text-xs text-gray-400 mb-0.5">#{i + 2}</p>
                      <p className="font-bold text-sm text-white truncate">{u.monster?.name}</p>
                      <p className={`text-xs ${DIFFICULTY_COLORS[u.monster?.difficulty] || 'text-gray-500'}`}>
                        {'⚔️'.repeat(u.monster?.difficulty || 1)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-0.5">Event</p>
                      <p className="font-bold text-sm text-green-400">
                        {u.event === 'heal' ? '💚 Heal' : '⬆️ Buff'}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Exit button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => useGameStore.getState().exitToMenu()}
          className="text-gray-600 hover:text-gray-400 text-sm transition-colors text-center"
        >
          ← Exit to Menu
        </motion.button>
      </div>
    </div>
  )
}