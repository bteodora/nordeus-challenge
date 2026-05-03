import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { fetchEndlessMonster } from '../../api/endless'
import { Swords, Shield, Zap, Heart, Star, Crown } from 'lucide-react'
import { getSpriteForName } from '../sprites/sprites'

// Tiny inline sprite canvas for endless card
function MonsterPortrait({ name, scale = 3 }: { name: string; scale?: number }) {
  // Standardni hook pozivi - moraju biti na vrhu funkcije bez require/import
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const sprite = getSpriteForName(name);

  useEffect(() => {
    const canvas = canvasEl.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = sprite.idle;
    const rows = pixels.length;
    const cols = pixels[0]?.length || 0;

    canvas.width = cols * scale;
    canvas.height = rows * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Horizontalni flip (mirror)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = pixels[y][x];
        if (c === 0) continue;
        ctx.fillStyle = sprite.palette[c] ?? '#ff00ff';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    ctx.restore();
  }, [name, scale, sprite]);

  return (
    <canvas
      ref={canvasEl}
      style={{ 
        imageRendering: 'pixelated', 
        display: 'block',
        filter: `drop-shadow(0 0 8px ${sprite.color})` 
      }}
    />
  );
}

const DIFF_COLOR = ['', '#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc']
const DIFF_LABEL = ['', 'Weak', 'Common', 'Dangerous', 'Deadly', 'Legendary']

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 py-2"
      style={{ background: 'rgba(0,0,0,0.3)', borderTop: `2px solid ${color}22` }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', letterSpacing: '0.15em' }}>{label}</span>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color }}>{value}</span>
    </div>
  )
}

export default function EndlessScreen() {
  const { hero, enterBattleWithMonster, endlessWins, applyRegen } = useGameStore() as any
  const [payload, setPayload] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNext() }, [endlessWins])

  async function loadNext() {
    setLoading(true)
    try {
      const res = await fetchEndlessMonster(endlessWins)
      setPayload(res)
      if (endlessWins > 0 && res?.regen_every && res?.regen_amount_pct) {
        if (endlessWins % res.regen_every === 0) {
          applyRegen(Math.round((hero.maxHp || 100) * res.regen_amount_pct))
        }
      }
    } catch (e) {
      console.error('Failed to load endless monster', e)
    } finally {
      setLoading(false)
    }
  }

  const hpPct   = hero.currentHp / hero.maxHp
  const hpClass = hpPct > 0.5 ? 'hp-high' : hpPct > 0.25 ? 'hp-mid' : 'hp-low'
  const hpColor = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#facc15' : '#f87171'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(16,8,40,0.9), transparent), linear-gradient(180deg, var(--deep), var(--ink))' }}>

      {/* Arcane grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(94,46,144,0.15) 38px, rgba(94,46,144,0.15) 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(94,46,144,0.15) 38px, rgba(94,46,144,0.15) 39px)',
      }} />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-4">

        {/* ── Header: Streak + Crown ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Crown size={18} style={{ color: 'var(--arcane-lt)' }} />
            <div>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--arcane-lt)', letterSpacing: '0.25em' }}>ENDLESS GAUNTLET</p>
              <div className="flex items-center gap-2 mt-1">
                <Star size={12} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                <span className="streak-number" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: 'var(--gold)' }}>{endlessWins}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)' }}>wins</span>
              </div>
            </div>
          </div>

          {/* Hero HP */}
          <div className="text-right">
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)', letterSpacing: '0.15em', marginBottom: 4 }}>HERO HP</p>
            <div className="flex items-center gap-2 justify-end mb-1">
              <Heart size={10} style={{ color: hpColor }} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: hpColor }}>{hero.currentHp}/{hero.maxHp}</span>
            </div>
            <div className="hp-track w-32">
              <motion.div className={`hp-fill ${hpClass}`} animate={{ width: `${hpPct * 100}%` }} transition={{ duration: 0.5, type: 'spring' }} />
            </div>
            {payload?.regen_every && (
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: '#4ade80', marginTop: 4 }}>
                +{Math.round(payload.regen_amount_pct * 100)}% HP every {payload.regen_every} wins
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Hero stat strip ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="panel flex overflow-hidden" style={{ padding: 0 }}>
          {[
            { label: 'ATK', value: hero.stats?.attack,  color: '#fb923c' }, // Promenjeno val -> value
            { label: 'DEF', value: hero.stats?.defense, color: '#60a5fa' },
            { label: 'MAG', value: hero.stats?.magic,   color: '#c084fc' },
            { label: 'LVL', value: hero.level,          color: 'var(--gold)' },
          ].map((s) => (
            <StatPill key={s.label} {...s} />
          ))}
        </motion.div>

        {/* ── Monster card ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="panel panel-arcane flex flex-col items-center justify-center py-10 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{ fontSize: 28 }}
              >⚔</motion.div>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--arcane-lt)', letterSpacing: '0.15em', animation: 'mist-breathe 2s ease-in-out infinite alternate' }}>
                Summoning challenger…
              </p>
            </motion.div>
          ) : payload ? (
            <motion.div key={payload.monster?.id}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="panel panel-blood overflow-hidden"
              style={{ padding: 0 }}
            >
              {/* Monster header */}
              <div className="flex items-center justify-between p-4"
                style={{ background: 'linear-gradient(135deg, rgba(100,18,18,0.5), rgba(30,6,6,0.8))', borderBottom: '1px solid var(--blood)' }}>
                <div className="flex items-center gap-4">
                  {/* Portrait */}
                  <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MonsterPortrait name={payload.monster.name} scale={3} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: 'var(--ink-text)', marginBottom: 4 }}>
                      {payload.monster.name}
                    </h2>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: payload.monster.difficulty }).map((_,i) => (
                        <span key={i} style={{ fontSize: 8, color: DIFF_COLOR[payload.monster.difficulty] }}>⚔</span>
                      ))}
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DIFF_COLOR[payload.monster.difficulty], marginLeft: 4 }}>
                        {DIFF_LABEL[payload.monster.difficulty]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', marginBottom: 2 }}>REWARD</p>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: 'var(--gold)' }}>💰 {payload.coins}</p>
                </div>
              </div>

              {/* Monster stats grid */}
              <div className="grid grid-cols-4" style={{ borderBottom: '1px solid var(--rim)' }}>
                {[
                  { label: 'HP',  val: payload.monster.stats?.health,  color: '#f87171' },
                  { label: 'ATK', val: payload.monster.stats?.attack,  color: '#fb923c' },
                  { label: 'DEF', val: payload.monster.stats?.defense, color: '#60a5fa' },
                  { label: 'MAG', val: payload.monster.stats?.magic,   color: '#c084fc' },
                ].map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center py-2"
                    style={{ borderRight: i < 3 ? '1px solid var(--rim)' : 'none' }}>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)' }}>{s.label}</span>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Fight button */}
              <div className="p-3">
                <motion.button
                  onClick={() => enterBattleWithMonster(payload.monster, payload.upcoming)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(120,20,20,0.9), rgba(60,8,8,0.96))',
                    border: '1px solid var(--blood-lt)',
                    color: '#f87171',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    boxShadow: '0 0 24px rgba(138,24,24,0.3)',
                    clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
                    cursor: 'pointer',
                  }}
                >
                  <Swords size={16} /> FIGHT
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Upcoming encounters ── */}
        {payload?.upcoming?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rune-line mb-2" style={{ fontSize: 6 }}>upcoming</div>
            <div className="flex gap-2">
              {payload.upcoming.slice(0, 3).map((u: any, i: number) => (
                <div key={i} className="panel flex-1 p-2 text-center">
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', marginBottom: 2 }}>#{i + 2}</p>
                  {u.type === 'monster' ? (
                    <>
                      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--ink-text)' }}>{u.monster?.name?.slice(0, 7)}</p>
                      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: DIFF_COLOR[u.monster?.difficulty] || 'var(--mute-text)' }}>
                        {'⚔'.repeat(u.monster?.difficulty || 1)}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#4ade80' }}>
                      {u.event === 'heal' ? '♥ Heal' : '↑ Buff'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Exit ── */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => useGameStore.getState().exitToMenu()}
          className="text-center transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--mute-text)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--dim-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--mute-text)')}
        >
          ← Exit to Menu
        </motion.button>
      </div>
    </div>
  )
}