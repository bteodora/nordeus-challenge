import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import type { Monster, Move } from '../../api/client'
import { Sword, Shield, Zap, Heart, X } from 'lucide-react'
import { getSpriteForName } from '../sprites/sprites'

// Full-size monster sprite canvas
function MonsterSprite({ name, scale = 5 }: { name: string; scale?: number }) {
  const ref  = useRef<HTMLCanvasElement>(null)
  const sprite = getSpriteForName(name)

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
    ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = pixels[y][x]
        if (c === 0) continue
        ctx.fillStyle = sprite.palette[c] ?? '#ff00ff'
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
    ctx.restore()
  }, [name, scale])

  return (
    <canvas ref={ref}
      style={{ imageRendering: 'pixelated', display: 'block',
        filter: `drop-shadow(0 0 12px ${sprite.color}) drop-shadow(0 0 4px ${sprite.color})` }}
    />
  )
}

const DIFF_COLOR = ['', '#4ade80', '#facc15', '#fb923c', '#f87171', '#c084fc']
const DIFF_LABEL = ['', 'Weak', 'Common', 'Dangerous', 'Deadly', 'Legendary']

const statDef = [
  { key: 'health',  label: 'HP',  icon: <Heart  size={12} />, color: '#f87171' },
  { key: 'attack',  label: 'ATK', icon: <Sword  size={12} />, color: '#fb923c' },
  { key: 'defense', label: 'DEF', icon: <Shield size={12} />, color: '#60a5fa' },
  { key: 'magic',   label: 'MAG', icon: <Zap    size={12} />, color: '#c084fc' },
]

function MoveEntry({ move }: { move: Move }) {
  const tc = move.type === 'physical' ? '#fb923c' : '#c084fc'
  return (
    <div className="p-2" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `2px solid ${tc}44` }}>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--ink-text)' }}>{move.name}</span>
        <div className="flex gap-1">
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: tc, background: `${tc}22`, padding: '2px 5px' }}>{move.type.slice(0,4).toUpperCase()}</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--dim-text)', background: 'rgba(255,255,255,0.05)', padding: '2px 5px' }}>{move.effect.slice(0,4).toUpperCase()}</span>
        </div>
      </div>
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', lineHeight: 1.7 }}>{move.description}</p>
    </div>
  )
}

export function MonsterPreviewModal({ isOpen, onClose, monster }: {
  isOpen: boolean; onClose: () => void; monster: Monster | null
}) {
  const sprite = monster ? getSpriteForName(monster.name) : null

  return (
    <AnimatePresence>
      {isOpen && monster && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-bg"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="panel panel-blood w-full max-w-lg overflow-hidden"
            style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4"
              style={{
                background: `linear-gradient(135deg, rgba(100,18,18,0.4), rgba(20,5,5,0.8))`,
                borderBottom: '1px solid var(--blood)',
                flexShrink: 0,
              }}>
              <div className="flex items-start gap-4">
                {/* Animated sprite */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                >
                  <MonsterSprite name={monster.name} scale={5} />
                </motion.div>

                <div>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: DIFF_COLOR[monster.difficulty], letterSpacing: '0.2em', marginBottom: 4 }}>
                    {'⚔'.repeat(monster.difficulty)} {DIFF_LABEL[monster.difficulty]}
                  </p>
                  <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: 'var(--ink-text)', marginBottom: 6 }}>
                    {monster.name}
                  </h2>
                  <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'var(--gold)' }}>
                    XP: {monster.xp_reward}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="pixel-button p-2 flex-shrink-0"><X size={12} /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

              {/* Stats */}
              <div>
                <p className="rune-line mb-2" style={{ fontSize: 6 }}>stats</p>
                <div className="grid grid-cols-4 gap-1">
                  {statDef.map(s => (
                    <div key={s.key} className="flex flex-col items-center py-2"
                      style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${s.color}22`, borderTop: `2px solid ${s.color}55` }}>
                      <span style={{ color: s.color, marginBottom: 2 }}>{s.icon}</span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'var(--mute-text)', marginBottom: 1 }}>{s.label}</span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: s.color }}>
                        {(monster.stats as any)[s.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moveset */}
              {monster.moves?.length > 0 && (
                <div>
                  <p className="rune-line mb-2" style={{ fontSize: 6 }}>moveset</p>
                  <div className="flex flex-col gap-1.5">
                    {monster.moves.map((move: Move) => (
                      <MoveEntry key={move.id} move={move} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--blood)' }}>
              <button onClick={onClose} className="w-full pixel-button justify-center"
                style={{ color: '#f87171', borderColor: 'var(--blood)', fontSize: 8, letterSpacing: '0.15em' }}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}