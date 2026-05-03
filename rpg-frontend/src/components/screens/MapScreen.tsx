import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gamestore'
import { Swords, Shield, Eye, ShoppingBag, Scroll, LogOut, Heart, Zap } from 'lucide-react'
import { MoveManagementModal } from '../ui/MoveManagementModal'
import ShopModal from '../ui/ShopModal'
import { MonsterPreviewModal } from '../ui/MonsterPreviewModal'
import type { Monster } from '../../api/client'
import { KNIGHT, getSpriteForName } from '../sprites/sprites'

const DIFF_COLORS = ['', '#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc']
const DIFF_LABELS = ['', 'Weak', 'Common', 'Dangerous', 'Deadly', 'Legendary']

// ─── Inline canvas sprite for map nodes ──────────────────────────────────────
function MapSprite({ monsterName, scale = 2, defeated = false }: { monsterName?: string; scale?: number; defeated?: boolean }) {
  const ref    = useRef<HTMLCanvasElement>(null)
  const sprite = monsterName ? getSpriteForName(monsterName) : KNIGHT

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pixels = sprite.idle
    const rows = pixels.length
    const cols = pixels[0].length
    canvas.width  = cols * scale
    canvas.height = rows * scale
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const flip = !!monsterName
    if (flip) { ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = pixels[y][x]
        if (c === 0) continue
        ctx.fillStyle = defeated ? '#555' : (sprite.palette[c] ?? '#ff00ff')
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
    if (flip) ctx.restore()
  }, [sprite, scale, defeated, monsterName])

  return (
    <canvas ref={ref} style={{
      imageRendering: 'pixelated', display: 'block',
      opacity: defeated ? 0.4 : 1,
      filter: defeated ? 'grayscale(1)' : `drop-shadow(0 0 5px ${sprite.color}90)`,
    }} />
  )
}

export default function MapScreen() {
  const { config, currentEncounterIndex, enterBattle, hero, equippedMoves, learnedMoves, equipMove, coins } = useGameStore()
  const [isManageMovesOpen, setIsManageMovesOpen] = useState(false)
  const [isShopOpen, setIsShopOpen]               = useState(false)
  const [selectedMonster, setSelectedMonster]     = useState<Monster | null>(null)

  if (!config) return (
    <div className="flex items-center justify-center h-full"
      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--mute-text)' }}>
      Loading…
    </div>
  )

  const hpPct = hero.currentHp / hero.maxHp
  const hpCls = hpPct > 0.5 ? 'hp-high' : hpPct > 0.25 ? 'hp-mid' : 'hp-low'
  const hpColor = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#facc15' : '#f87171'

  return (
    <>
      <div className="flex w-full h-full overflow-hidden"
        style={{ background: 'linear-gradient(165deg, rgba(10,8,20,0.98), rgba(4,4,10,1))' }}>

        {/* ═══ SIDEBAR ═══ */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto"
          style={{ borderRight: '1px solid var(--rim)', background: 'rgba(2,1,9,0.65)' }}>

          {/* Hero card */}
          <div className="panel panel-gold p-4">
            {/* Hero sprite + name row */}
            <div className="flex items-center gap-3 mb-3">
              <MapSprite scale={2} />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--gold)', marginBottom: 2 }}>Knight</p>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)' }}>Level {hero.level}</p>
              </div>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--gold)' }}>💰{coins}</p>
            </div>

            {/* HP bar */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Heart size={8} /> HP
                </span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: hpColor }}>
                  {hero.currentHp}/{hero.maxHp}
                </span>
              </div>
              <div className="hp-track">
                <motion.div className={`hp-fill ${hpCls}`} animate={{ width: `${hpPct * 100}%` }} transition={{ duration: 0.5, type: 'spring' }} />
              </div>
            </div>

            {/* Stats 2×2 */}
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: <Swords size={7} />, label: 'ATK', val: hero.stats?.attack,  color: '#fb923c' },
                { icon: <Shield size={7} />, label: 'DEF', val: hero.stats?.defense, color: '#60a5fa' },
                { icon: <Zap    size={7} />, label: 'MAG', val: hero.stats?.magic,   color: '#c084fc' },
                { icon: <Heart  size={7} />, label: 'HP',  val: hero.stats?.health,  color: '#f87171' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--dim-text)' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  {s.label} <span style={{ color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipped moves */}
          <div className="panel p-3">
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--mute-text)', letterSpacing: '0.2em', marginBottom: 8 }}>
              EQUIPPED
            </p>
            <div className="flex flex-col gap-1">
              {equippedMoves.map((move, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1.5"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderLeft: `2px solid ${move.type === 'physical' ? '#fb923c33' : '#c084fc33'}`,
                  }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--ink-text)' }}>{move.name}</span>
                  <span style={{ fontSize: 9, color: move.type === 'physical' ? '#fb923c' : '#c084fc' }}>
                    {move.type === 'physical' ? '⚔' : '✦'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            <button onClick={() => setIsManageMovesOpen(true)} className="pixel-button w-full justify-center gap-2" style={{ fontSize: 8 }}>
              <Scroll size={10} /> Manage Moves
            </button>
            <button onClick={() => setIsShopOpen(true)} className="pixel-button w-full justify-center gap-2" style={{ fontSize: 8 }}>
              <ShoppingBag size={10} /> Shop
            </button>
            <button
              onClick={() => { useGameStore.getState().saveRun(); useGameStore.getState().exitToMenu() }}
              className="pixel-button w-full justify-center gap-2"
              style={{ fontSize: 7, color: 'var(--mute-text)', borderColor: 'var(--rim)' }}
            >
              <LogOut size={10} /> Save & Exit
            </button>
          </div>
        </div>

        {/* ═══ MAIN MAP ═══ */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto py-8 px-6 relative">

          {/* Atmospheric top glow */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-48"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(207,168,72,0.04), transparent)' }} />

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: 'var(--gold)',
              textShadow: '0 0 20px rgba(207,168,72,0.35)', letterSpacing: '0.2em' }}>
              THE GAUNTLET
            </h2>
          </motion.div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--mute-text)', marginBottom: 32, letterSpacing: '0.2em' }}>
            {currentEncounterIndex} / {config.monsters.length} defeated
          </p>

          {/* Path + nodes */}
          <div className="relative w-full max-w-md flex flex-col items-center gap-2.5">
            {/* Vertical path line */}
            <div className="absolute top-8 bottom-8 pointer-events-none"
              style={{ left: '50%', width: 1, transform: 'translateX(-50%)',
                background: 'linear-gradient(180deg, var(--gold-dk) 0%, var(--moss) 50%, var(--rim) 100%)', opacity: 0.25 }} />

            {config.monsters.map((monster, index) => {
              const isCurrent = index === currentEncounterIndex
              const isPast    = index < currentEncounterIndex
              const isLocked  = index > currentEncounterIndex
              const sprite    = getSpriteForName(monster.name)

              return (
                <motion.div
                  key={monster.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.055, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => isCurrent && enterBattle(index)}
                  className={`map-node w-full flex items-center justify-between p-3 ${
                    isCurrent ? 'map-node-active' : isPast ? 'map-node-done' : 'map-node-locked'
                  }`}
                  style={{ boxShadow: isCurrent ? `0 0 18px ${sprite.glow}` : undefined }}
                >
                  {/* Left: sprite + info */}
                  <div className="flex items-center gap-3">
                    <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapSprite monsterName={monster.name} scale={2} defeated={isPast} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                        color: isCurrent ? 'var(--gold)' : isPast ? 'var(--mute-text)' : 'var(--dim-text)',
                        marginBottom: 3 }}>
                        {monster.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: monster.difficulty }).map((_, i) => (
                          <span key={i} style={{ fontSize: 7, color: DIFF_COLORS[monster.difficulty] }}>⚔</span>
                        ))}
                        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                          color: DIFF_COLORS[monster.difficulty], marginLeft: 3 }}>
                          {DIFF_LABELS[monster.difficulty]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedMonster(monster) }}
                      className="pixel-button p-1.5" title="Preview"
                    >
                      <Eye size={10} />
                    </button>

                    {isCurrent && (
                      <button
                        onClick={e => { e.stopPropagation(); enterBattle(index) }}
                        className="pixel-button py-1.5 px-3 flex items-center gap-1"
                        style={{ color: '#f87171', borderColor: 'var(--blood)', background: 'rgba(138,24,24,0.25)', fontSize: 8 }}
                      >
                        <Swords size={10} /> FIGHT
                      </button>
                    )}

                    {isPast && (
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--moss-lt)' }}>✓</span>
                        <button
                          onClick={e => { e.stopPropagation(); enterBattle(index, true) }}
                          className="pixel-button py-1 px-2"
                          style={{ fontSize: 7 }}
                        >Replay</button>
                      </div>
                    )}

                    {isLocked && (
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'var(--mute-text)' }}>🔒</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <MoveManagementModal
        isOpen={isManageMovesOpen}
        onClose={() => setIsManageMovesOpen(false)}
        allMoves={learnedMoves}
        equippedMoves={equippedMoves}
        onEquipMove={equipMove}
      />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <MonsterPreviewModal isOpen={!!selectedMonster} onClose={() => setSelectedMonster(null)} monster={selectedMonster} />
    </>
  )
}