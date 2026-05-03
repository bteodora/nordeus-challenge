import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Crown, Swords, Heart, Shield, Zap, ChevronRight } from 'lucide-react'

function StatRow({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px solid var(--rim)' }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--dim-text)' }}>{label}</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color }}>{value}</span>
    </div>
  )
}

export default function PostEndlessScreen() {
  const { hero, coins, runStats, endlessWins, exitToMenu } = useGameStore()

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 + i * 0.08 } })

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto relative"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(60,20,90,0.4), transparent), linear-gradient(180deg, var(--deep), var(--ink))' }}>

      {/* Arcane grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.08,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(94,46,144,0.3) 38px, rgba(94,46,144,0.3) 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(94,46,144,0.3) 38px, rgba(94,46,144,0.3) 39px)',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="panel panel-arcane w-full max-w-lg relative z-10"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* ── Hero banner ── */}
        <div className="flex flex-col items-center py-8 px-6"
          style={{ background: 'linear-gradient(180deg, rgba(60,20,90,0.5), rgba(20,8,35,0.8))', borderBottom: '1px solid var(--arcane-dk)' }}>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
          >
            <Crown size={40} style={{ color: 'var(--gold)' }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: 'var(--arcane-lt)',
              textShadow: '0 0 20px rgba(155,110,224,0.6)', marginTop: 12, marginBottom: 6, letterSpacing: '0.1em' }}
          >
            RUN COMPLETE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--dim-text)' }}
          >
            You survived{' '}
            <span className="streak-number" style={{ color: 'var(--gold)', fontSize: 13 }}>{endlessWins}</span>
            {' '}rounds
          </motion.p>
        </div>

        {/* ── Rewards ── */}
        <div className="p-5 flex flex-col gap-4">

          {/* Big 3 */}
          <motion.div {...stagger(0)} className="grid grid-cols-3 gap-2">
            {[
              { emoji: '💰', label: 'Coins', value: coins,      color: 'var(--gold)' },
              { emoji: '⭐', label: 'XP',    value: hero.xp,    color: '#60a5fa' },
              { emoji: '🏆', label: 'Level', value: hero.level, color: '#4ade80' },
            ].map(r => (
              <div key={r.label} className="panel flex flex-col items-center py-3 gap-1">
                <span style={{ fontSize: 20 }}>{r.emoji}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)' }}>{r.label}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Final stats */}
          <motion.div {...stagger(1)} className="panel p-3">
            <p className="rune-line mb-3" style={{ fontSize: 6 }}>final stats</p>
            <div className="flex gap-1">
              {[
                { icon: <Heart  size={10} />, label: 'HP',  val: hero.stats.health,  color: '#f87171' },
                { icon: <Swords size={10} />, label: 'ATK', val: hero.stats.attack,  color: '#fb923c' },
                { icon: <Shield size={10} />, label: 'DEF', val: hero.stats.defense, color: '#60a5fa' },
                { icon: <Zap    size={10} />, label: 'MAG', val: hero.stats.magic,   color: '#c084fc' },
              ].map(s => (
                <div key={s.label} className="flex-1 flex flex-col items-center py-2"
                  style={{ borderTop: `2px solid ${s.color}44`, background: 'rgba(0,0,0,0.3)' }}>
                  <span style={{ color: s.color, marginBottom: 2 }}>{s.icon}</span>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)' }}>{s.label}</span>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Battle stats */}
          <motion.div {...stagger(2)} className="panel p-3">
            <p className="rune-line mb-2" style={{ fontSize: 6 }}>battle record</p>
            <StatRow label="Monsters Defeated" value={runStats.monstersDefeated} color="#4ade80" />
            <StatRow label="Total Turns"       value={runStats.totalTurns}       color="#60a5fa" />
            <StatRow label="Damage Dealt"      value={runStats.totalDamageDealt} color="#f87171" />
            <StatRow label="Total Healed"      value={runStats.totalHealing}     color="#4ade80" />
          </motion.div>

          {/* Return button */}
          <motion.button
            {...stagger(3)}
            onClick={exitToMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(60,20,90,0.85), rgba(25,8,45,0.96))',
              border: '1px solid var(--arcane-lt)',
              color: 'var(--arcane-lt)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              boxShadow: '0 0 24px rgba(94,46,144,0.25)',
              clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
              cursor: 'pointer',
            }}
          >
            Return to Menu <ChevronRight size={14} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}