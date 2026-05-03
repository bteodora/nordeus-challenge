import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SpriteData } from '../sprites/sprites'
import { KNIGHT, getSpriteForName } from '../sprites/sprites'

// ─── Canvas pixel renderer ────────────────────────────────────────────────────
interface PixelSpriteCanvasProps {
  sprite: SpriteData
  frame: 'idle' | 'attack' | 'hurt'
  scale?: number
  flip?: boolean
}

// IZMENA: Podrazumevani scale je sada 9, za mnogo veće sprajtove
function PixelSpriteCanvas({ sprite, frame, scale = 9, flip = false }: PixelSpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixels = sprite[frame]
    const rows = pixels.length
    const cols = pixels[0].length
    canvas.width  = cols * scale
    canvas.height = rows * scale
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (flip) { ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = pixels[y][x]
        if (c === 0) continue
        ctx.fillStyle = sprite.palette[c] ?? '#ff00ff'
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }

    if (flip) ctx.restore()
  }, [sprite, frame, scale, flip])

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}

// ─── Hit flash overlay ────────────────────────────────────────────────────────
function HitFlash({ active, color = '#ff4444' }: { active: boolean; color?: string }) {
  if (!active) return null
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded"
      style={{
        background: color,
        mixBlendMode: 'screen',
        opacity: 0.7,
        animation: 'hit-flash 0.32s ease-out forwards',
      }}
    />
  )
}

// ─── Damage number popup ──────────────────────────────────────────────────────
interface DmgNum { id: string; value: number; type: 'damage' | 'heal' }

function DamageNumbers({ numbers }: { numbers: DmgNum[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <AnimatePresence>
        {numbers.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.4 }} // IZMENA: Jača animacija
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-1/2 top-0 -translate-x-1/2 font-bold pointer-events-none"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 18, // IZMENA: Značajno veći font
              color: n.type === 'heal' ? '#4ade80' : '#f87171',
              textShadow: `0 0 10px ${n.type === 'heal' ? '#4ade80' : '#f87171'}, 0 3px 0 #000`, // IZMENA: Jači shadow
              zIndex: 99,
            }}
          >
            {n.type === 'heal' ? '+' : '−'}{n.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Attack slash VFX ─────────────────────────────────────────────────────────
function SlashVFX({ active, color }: { active: boolean; color: string }) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.3, x: -15 }}
      animate={{ opacity: [0, 1, 0.8, 0], scaleX: [0.3, 1.1, 1, 0] }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
    >
      {/* IZMENA: Povećani Slash efekti */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute"
          style={{
            width: 5,
            height: 50 + i * 12,
            background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
            transform: `rotate(${-30 + i * 15}deg) translateX(${(i - 1) * 12}px)`,
            boxShadow: `0 0 8px ${color}`,
            opacity: 0.9,
          }}
        />
      ))}
    </motion.div>
  )
}

// ─── Magic orb VFX ────────────────────────────────────────────────────────────
function MagicVFX({ active, color }: { active: boolean; color: string }) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.4, 1.1, 0] }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
    >
      {/* IZMENA: Povećan Magic efekat */}
      <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}ff 0%, ${color}40 60%, transparent 100%)`,
        boxShadow: `0 0 25px ${color}, 0 0 50px ${color}60`,
      }} />
    </motion.div>
  )
}

// ─── MAIN BATTLE CHARACTER ────────────────────────────────────────────────────
interface BattleCharacterProps {
  monsterName?: string
  isHero?: boolean
  isHit?: boolean
  isAttacking?: boolean
  isRaging?: boolean
  damageNumbers?: Array<{ id: string; value: number; type: 'damage' | 'heal' }>
  scale?: number
  showVFX?: 'slash' | 'magic' | null
}

export default function BattleCharacter({
  monsterName,
  isHero = false,
  isHit = false,
  isAttacking = false,
  isRaging = false,
  damageNumbers = [],
  scale = 9, // IZMENA: Podrazumevani scale je 9
  showVFX = null,
}: BattleCharacterProps) {
  const sprite = isHero ? KNIGHT : getSpriteForName(monsterName ?? '')

  const frame: 'idle' | 'attack' | 'hurt' =
    isHit ? 'hurt' : isAttacking ? 'attack' : 'idle'

  const [bob, setBob] = useState(false)
  useEffect(() => {
    if (isHit || isAttacking) return
    const t = setInterval(() => {
      setBob(b => !b)
    }, 600)
    return () => clearInterval(t)
  }, [isHit, isAttacking])

  // IZMENA: Jače animacije pomeranja
  const translateX = isAttacking ? (isHero ? 12 : -12) : 0
  const translateY = isHit ? 6 : bob ? -5 : 0
  const rageFilter = isRaging
    ? `drop-shadow(0 0 12px #ff2200) drop-shadow(0 0 24px #ff440060)`
    : `drop-shadow(0 0 10px ${sprite.color}80)`

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative"
        style={{
          transform: `translateX(${translateX}px) translateY(${translateY}px)`,
          transition: isHit || isAttacking ? 'transform 0.08s ease' : 'transform 0.4s ease-in-out',
        }}
      >
        {/* IZMENA: Povećana senka ispod karaktera */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 80, height: 10,
            background: `radial-gradient(ellipse, ${sprite.color}60 0%, transparent 70%)`,
            filter: 'blur(6px)',
            bottom: -8,
          }}
        />

        <div className="relative" style={{ filter: rageFilter }}>
          <PixelSpriteCanvas
            sprite={sprite}
            frame={frame}
            scale={scale}
            flip={!isHero}
          />
          {isHit && <HitFlash active={isHit} color={isHero ? '#4488ff' : '#ff4444'} />}
          <SlashVFX active={showVFX === 'slash'} color={sprite.color} />
          <MagicVFX active={showVFX === 'magic'} color={sprite.color} />
          <DamageNumbers numbers={damageNumbers} />
        </div>
      </div>
    </div>
  )
}