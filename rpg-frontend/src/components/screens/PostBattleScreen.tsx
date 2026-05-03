import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Swords, Shield, Zap, Heart, ChevronRight } from 'lucide-react'

export default function PostBattleScreen() {
  const {
    config, currentEncounterIndex, didWinBattle,
    newlyLearnedMove, hero, equippedMoves,
    runStats, continueAfterBattle, equipMove,
    currentMonster, endlessMode,
  } = useGameStore()

  if (!config) return null

  const monster = endlessMode && currentMonster
    ? currentMonster
    : config.monsters[currentEncounterIndex]

  const handleEquip = (slot: number) => {
    if (newlyLearnedMove) equipMove(newlyLearnedMove, slot)
  }

  const accentColor = didWinBattle ? 'var(--verdant)' : 'var(--crimson)'
  const panelClass  = didWinBattle ? 'panel-gold'    : 'panel-crimson'

  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 overflow-y-auto relative"
      style={{
        background: didWinBattle
          ? 'radial-gradient(ellipse at 50% 30%, rgba(20,60,30,0.5), transparent 60%), linear-gradient(180deg, var(--deep), var(--ink))'
          : 'radial-gradient(ellipse at 50% 30%, rgba(80,10,10,0.5), transparent 60%), linear-gradient(180deg, var(--deep), var(--ink))',
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: didWinBattle
            ? 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(30,94,48,0.15), transparent)'
            : 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(139,26,26,0.2), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`pixel-panel ${panelClass} w-full max-w-lg p-6 relative z-10 ${didWinBattle ? 'victory-shimmer' : ''}`}
      >
        {/* ── Header ── */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
            className="text-5xl mb-3"
          >
            {didWinBattle ? '⚔️' : '💀'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xl tracking-[0.3em] mb-1"
            style={{
              color: didWinBattle ? '#4ade80' : '#f87171',
              textShadow: `0 0 20px ${didWinBattle ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
            }}
          >
            {didWinBattle ? 'VICTORY!' : 'DEFEATED'}
          </motion.h1>

          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            {didWinBattle ? `Defeated ${monster.name}` : `Fallen before ${monster.name}`}
          </p>
        </div>

        {/* ── Rune divider ── */}
        <div className="rune-divider mb-5">✦</div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          {didWinBattle ? (
            <>
              <StatCard label="XP Gained"     value={`+${monster.xp_reward}`} color="#facc15" icon={<Zap size={12} />} />
              <StatCard label="Level"         value={hero.level}              color="#60a5fa" icon={<Shield size={12} />} />
              <StatCard label="Monsters"      value={runStats.monstersDefeated} color="#4ade80" icon={<Swords size={12} />} />
            </>
          ) : (
            <>
              <StatCard label="Dmg Dealt"  value={runStats.totalDamageDealt}   color="#f87171" icon={<Swords size={12} />} />
              <StatCard label="Turns"      value={runStats.totalTurns}          color="#60a5fa" icon={<Shield size={12} />} />
              <StatCard label="Level"      value={hero.level}                   color="#facc15" icon={<Zap size={12} />} />
            </>
          )}
        </motion.div>

        {/* ── Stat gains (victory) ── */}
        {didWinBattle && runStats.lastStatGains && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="pixel-panel p-3 mb-4"
          >
            <p className="text-[7px] tracking-[0.2em] mb-2" style={{ color: 'var(--text-secondary)' }}>
              ⭐ STATS IMPROVED
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'HP',  val: runStats.lastStatGains.health,  color: '#f87171' },
                { label: 'ATK', val: runStats.lastStatGains.attack,  color: '#fb923c' },
                { label: 'DEF', val: runStats.lastStatGains.defense, color: '#60a5fa' },
                { label: 'MAG', val: runStats.lastStatGains.magic,   color: '#c084fc' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-[10px] font-bold" style={{ color: s.color }}>+{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── New Move ── */}
        <AnimatePresence>
          {didWinBattle && newlyLearnedMove && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="pixel-panel panel-arcane p-4 mb-4"
            >
              <p className="text-[7px] tracking-[0.2em] mb-3" style={{ color: '#a78bfa' }}>
                ✨ NEW MOVE LEARNED
              </p>
              <div className="mb-3 p-2" style={{ background: 'rgba(107,63,160,0.15)', borderLeft: '2px solid #6b3fa0' }}>
                <p className="text-[10px] font-bold" style={{ color: '#c4b5fd' }}>{newlyLearnedMove.name}</p>
                <p className="text-[7px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {newlyLearnedMove.type} · {newlyLearnedMove.effect}
                </p>
              </div>
              <p className="text-[7px] mb-2" style={{ color: 'var(--text-muted)' }}>Replace a move:</p>
              <div className="grid grid-cols-2 gap-2">
                {equippedMoves.map((move, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleEquip(idx)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="pixel-button w-full justify-between"
                  >
                    <span className="text-[7px] truncate">{move.name}</span>
                    <span className="text-[7px] opacity-50">S{idx + 1}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action button ── */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={continueAfterBattle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 flex items-center justify-center gap-3 text-[10px] tracking-[0.25em] font-bold transition-all"
          style={{
            background: didWinBattle
              ? 'linear-gradient(135deg, rgba(20,83,45,0.9), rgba(10,50,25,0.95))'
              : 'linear-gradient(135deg, rgba(127,29,29,0.9), rgba(70,10,10,0.95))',
            border: `1px solid ${didWinBattle ? '#166534' : '#7f1d1d'}`,
            color: didWinBattle ? '#4ade80' : '#f87171',
            boxShadow: didWinBattle ? '0 0 20px rgba(74,222,128,0.15)' : '0 0 20px rgba(248,113,113,0.15)',
            clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
          }}
        >
          {didWinBattle ? 'Continue to Next' : 'Return to Map'}
          <ChevronRight size={14} />
        </motion.button>
      </motion.div>
    </div>
  )
}

function StatCard({
  label, value, color, icon,
}: {
  label: string; value: string | number; color: string; icon: React.ReactNode
}) {
  return (
    <div
      className="text-center p-2"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}
    >
      <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-[11px] font-bold" style={{ color }}>{value}</p>
    </div>
  )
}