import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NordeusIntroProps {
  onComplete: () => void
}

// ─── Canvas: stars + sparks ───────────────────────────────────────────────────
function StarField({
  spawnRef,
}: {
  spawnRef: React.MutableRefObject<((x: number, y: number) => void) | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0, raf = 0

    interface Spark {
      x: number; y: number; vx: number; vy: number
      life: number; size: number; hue: number
    }
    const sparks: Spark[] = []

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      base: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }))

    spawnRef.current = (x: number, y: number) => {
      for (let i = 0; i < 48; i++) {
        const angle = (Math.PI * 2 * i) / 48 + (Math.random() - 0.5) * 0.4
        const speed = 2 + Math.random() * 9
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          life: 1,
          size: 1.5 + Math.random() * 3.5,
          hue: Math.random() > 0.4 ? 44 : Math.random() > 0.5 ? 28 : 0,
        })
      }
    }

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      // Trailing fade instead of full clear gives motion blur feel
      ctx.fillStyle = 'rgba(2,1,9,0.2)'
      ctx.fillRect(0, 0, W, H)

      // Stars
      for (const s of stars) {
        s.phase += s.speed
        ctx.save()
        ctx.globalAlpha = s.base * (0.5 + 0.5 * Math.sin(s.phase))
        ctx.fillStyle = '#d8d0c0'
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Sparks — iterate backwards so splice is safe
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i]
        sp.x  += sp.vx;  sp.y  += sp.vy
        sp.vx *= 0.93;   sp.vy  = sp.vy * 0.93 + 0.2
        sp.life -= 0.024

        if (sp.life <= 0) { sparks.splice(i, 1); continue }

        // *** KEY FIX: clamp radius — never negative ***
        const radius = Math.max(0.5, sp.size * sp.life)
        const alpha  = Math.max(0, Math.min(1, sp.life * 0.95))
        const sat    = sp.hue === 0 ? '0%' : '100%'
        const lit    = sp.hue === 0 ? '95%' : '65%'

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle    = `hsl(${sp.hue},${sat},${lit})`
        ctx.shadowColor  = `hsl(${sp.hue},${sat},${lit})`
        ctx.shadowBlur   = 8
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    ctx.fillStyle = '#020109'
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [spawnRef])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    />
  )
}

// ─── Shockwave rings ──────────────────────────────────────────────────────────
function Shockwaves({ rings }: { rings: number[] }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {rings.map(id => (
          <motion.div
            key={id}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              border: '1.5px solid rgba(232,201,74,0.85)',
            }}
            initial={{ width: 4, height: 4, opacity: 0.9 }}
            animate={{ width: '280vmax', height: '280vmax', opacity: 0 }}
            exit={{}}
            transition={{ duration: 1.3, ease: [0.2, 1, 0.4, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Logo letters ─────────────────────────────────────────────────────────────
const LETTERS = 'NORDEUS'.split('')

function NordeusLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
      <AnimatePresence>
        {visible &&
          LETTERS.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -80, rotateX: 85, scale: 1.4 }}
              animate={{ opacity: 1, y: 0,  rotateX: 0,  scale: 1   }}
              transition={{
                delay: 0.06 * i,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                opacity: { delay: 0.06 * i, duration: 0.18 },
              }}
              style={{
                display: 'inline-block',
                fontFamily: '"Arial Black","Arial Bold",Impact,sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(52px, 11vw, 110px)',
                lineHeight: 1,
                background:
                  'linear-gradient(180deg, #ffffff 0%, #f5e070 16%, #e8c94a 40%, #c8841a 66%, #954f05 82%, #e8c94a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter:
                  'drop-shadow(0 0 22px rgba(232,201,74,0.7)) drop-shadow(0 3px 10px rgba(0,0,0,0.95))',
              }}
            >
              {ch}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function NordeusIntro({ onComplete }: NordeusIntroProps) {
  const spawnRef = useRef<((x: number, y: number) => void) | null>(null)

  const [rings,    setRings]    = useState<number[]>([])
  const [showLogo, setShowLogo] = useState(false)
  const [showLine, setShowLine] = useState(false)
  const [showSub,  setShowSub]  = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [exiting,  setExiting]  = useState(false)
  const doneRef = useRef(false)

  const doExit = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setExiting(true)
    setTimeout(onComplete, 680)
  }, [onComplete])

  const burst = useCallback(() => {
    const id = Date.now()
    setRings(r => [...r, id])
    setTimeout(() => setRings(r => r.filter(x => x !== id)), 1500)
    spawnRef.current?.(window.innerWidth / 2, window.innerHeight / 2)
  }, [])

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void) => { ts.push(setTimeout(fn, ms)) }

    at(620,  () => { setFlashing(true); setTimeout(() => setFlashing(false), 360); burst(); setShowLogo(true) })
    at(1350, () => setShowLine(true))
    at(1700, () => setShowSub(true))
    at(2150, () => setShowGame(true))
    at(3300, burst)
    at(4400, doExit)

    const onKey = () => doExit()
    window.addEventListener('keydown', onKey, { once: true })

    return () => { ts.forEach(clearTimeout); window.removeEventListener('keydown', onKey) }
  }, [burst, doExit])

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#020109',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 900,
        overflow: 'hidden',
      }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.68, ease: 'easeInOut' }}
    >
      <StarField spawnRef={spawnRef} />
      <Shockwaves rings={rings} />

      {/* White flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            key="flash"
            style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, pointerEvents: 'none' }}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Content stack */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* "PRESENTS" cap */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.55 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}
            >
              <div style={{ width: 44, height: 1, background: 'linear-gradient(90deg,transparent,rgba(232,201,74,0.55))' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.55em', color: 'rgba(232,201,74,0.55)', textTransform: 'uppercase' }}>
                PRESENTS
              </span>
              <div style={{ width: 44, height: 1, background: 'linear-gradient(90deg,rgba(232,201,74,0.55),transparent)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main logo */}
        <NordeusLogo visible={showLogo} />

        {/* Divider */}
        <AnimatePresence>
          {showLine && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 12, marginBottom: 12,
                height: 1,
                width: 'clamp(180px, 38vw, 420px)',
                background: 'linear-gradient(90deg,transparent,rgba(232,201,74,0.85),transparent)',
                transformOrigin: 'center',
              }}
            />
          )}
        </AnimatePresence>

        {/* CHALLENGE */}
        <AnimatePresence>
          {showSub && (
            <motion.p
              initial={{ opacity: 0, letterSpacing: '1em', y: 8 }}
              animate={{ opacity: 1, letterSpacing: '0.6em', y: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              style={{
                fontFamily: '"Arial Black",Impact,sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(10px, 2.2vw, 22px)',
                color: 'rgba(232,201,74,0.92)',
                textTransform: 'uppercase',
                textShadow: '0 0 30px rgba(232,201,74,0.45)',
              }}
            >
              CHALLENGE
            </motion.p>
          )}
        </AnimatePresence>

        {/* RPG Gauntlet subtitle */}
        <AnimatePresence>
          {showGame && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 32,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(7px, 1.3vw, 13px)',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.4)',
                textShadow: '0 0 14px rgba(255,255,255,0.12)',
              }}
            >
              ⚔&nbsp;&nbsp;RPG GAUNTLET&nbsp;&nbsp;⚔
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Skip */}
      <button
        onClick={doExit}
        style={{
          position: 'absolute', bottom: 22, right: 22, zIndex: 30,
          fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none',
          cursor: 'pointer', textTransform: 'uppercase',
        }}
      >
        PRESS ANY KEY TO SKIP
      </button>
    </motion.div>
  )
}